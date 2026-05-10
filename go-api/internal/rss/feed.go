package rss

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/xml"
	"fmt"
	"net/url"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"bluearchiveapi/go-api/internal/domain"
	"bluearchiveapi/go-api/internal/storage"
)

const (
	defaultSiteOrigin   = "http://localhost:3000"
	defaultRefreshEvery = 5 * time.Second
)

type FeedService struct {
	repo *storage.StudentsRepository

	refreshEvery time.Duration
	siteOrigin   string

	mu          sync.RWMutex
	fingerprint string
	seenIDs     map[string]struct{}
	xml         []byte
	etag        string
	updatedAt   time.Time
}

type feedRevision struct {
	Hash        string
	PublishedAt time.Time
}

type FeedMeta struct {
	ETag        string
	UpdatedAt   time.Time
	Fingerprint string
}

type itemSnapshot struct {
	student     domain.Student
	hash        string
	publishedAt time.Time
}

func NewFeedService(repo *storage.StudentsRepository) *FeedService {
	refreshEvery := defaultRefreshEvery
	if raw := strings.TrimSpace(os.Getenv("RSS_REFRESH_INTERVAL")); raw != "" {
		if d, err := time.ParseDuration(raw); err == nil && d > 0 {
			refreshEvery = d
		}
	}

	siteOrigin := strings.TrimSpace(os.Getenv("SITE_ORIGIN"))
	if siteOrigin == "" {
		siteOrigin = defaultSiteOrigin
	}

	return &FeedService{
		repo:         repo,
		refreshEvery: refreshEvery,
		siteOrigin:   strings.TrimRight(siteOrigin, "/"),
		seenIDs:      map[string]struct{}{},
	}
}

func (s *FeedService) Start(ctx context.Context) {
	ticker := time.NewTicker(s.refreshEvery)
	defer ticker.Stop()

	_, _ = s.Refresh()

	for {
		select {
		case <-ticker.C:
			_, _ = s.Refresh()
		case <-ctx.Done():
			return
		}
	}
}

func (s *FeedService) Refresh() ([]byte, error) {
	students, fingerprint, err := s.repo.ReadSnapshot()
	if err != nil {
		return nil, err
	}

	s.mu.RLock()
	if fingerprint == s.fingerprint && len(s.xml) > 0 {
		cached := append([]byte(nil), s.xml...)
		s.mu.RUnlock()
		return cached, nil
	}
	previous := cloneSeenIDs(s.seenIDs)
	s.mu.RUnlock()

	now := time.Now().UTC()
	nextSeen := make(map[string]struct{}, len(students))
	snapshots := make([]itemSnapshot, 0, len(students))

	for _, student := range students {
		nextSeen[student.ID] = struct{}{}
		if _, ok := previous[student.ID]; ok {
			continue
		}
		snapshots = append(snapshots, itemSnapshot{
			student:     student,
			publishedAt: now,
		})
	}

	rssBytes, err := buildRSS(snapshots, s.siteOrigin, now)
	if err != nil {
		return nil, err
	}

	feedHash := sha256.Sum256(rssBytes)
	etag := fmt.Sprintf("\"%s\"", hex.EncodeToString(feedHash[:]))

	s.mu.Lock()
	s.fingerprint = fingerprint
	s.seenIDs = nextSeen
	s.xml = append([]byte(nil), rssBytes...)
	s.etag = etag
	s.updatedAt = now
	s.mu.Unlock()

	return append([]byte(nil), rssBytes...), nil
}

func (s *FeedService) Snapshot() ([]byte, FeedMeta, error) {
	if _, err := s.Refresh(); err != nil {
		return nil, FeedMeta{}, err
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	return append([]byte(nil), s.xml...), FeedMeta{
		ETag:        s.etag,
		UpdatedAt:   s.updatedAt,
		Fingerprint: s.fingerprint,
	}, nil
}

func cloneSeenIDs(src map[string]struct{}) map[string]struct{} {
	dup := make(map[string]struct{}, len(src))
	for k, v := range src {
		dup[k] = v
	}
	return dup
}

func buildRSS(snapshots []itemSnapshot, siteOrigin string, updatedAt time.Time) ([]byte, error) {
	sort.Slice(snapshots, func(i, j int) bool {
		if snapshots[i].publishedAt.Equal(snapshots[j].publishedAt) {
			return snapshots[i].student.ID < snapshots[j].student.ID
		}
		return snapshots[i].publishedAt.After(snapshots[j].publishedAt)
	})

	items := make([]rssItem, 0, len(snapshots))
	for _, snapshot := range snapshots {
		items = append(items, rssItem{
			Title:       snapshot.student.Name,
			Link:        studentURL(siteOrigin, snapshot.student.ID),
			GUID:        studentURL(siteOrigin, snapshot.student.ID),
			PubDate:     snapshot.publishedAt.Format(time.RFC1123Z),
			Description: studentDescription(snapshot.student),
		})
	}

	doc := rssDocument{
		XMLName:   xml.Name{Local: "rss"},
		Version:   "2.0",
		XmlnsAtom: "http://www.w3.org/2005/Atom",
		Channel: rssChannel{
			Title:         "Blue Archive Students RSS",
			Link:          strings.TrimRight(siteOrigin, "/"),
			Description:   "学生データの更新フィード",
			Language:      "ja-jp",
			LastBuildDate: updatedAt.Format(time.RFC1123Z),
			AtomLink:      atomLink{Href: strings.TrimRight(siteOrigin, "/") + "/rss.xml", Rel: "self", Type: "application/rss+xml"},
			Items:         items,
		},
	}

	return xml.MarshalIndent(doc, "", "  ")
}

func studentDescription(student domain.Student) string {
	parts := []string{
		fmt.Sprintf("学校:%s", student.School),
		fmt.Sprintf("レアリティ:%d", student.Rarity),
		fmt.Sprintf("武器:%s", student.Weapon.Type),
		fmt.Sprintf("役割:%s", student.Role.Class),
		fmt.Sprintf("地形:%s/%s/%s", student.TerrainAdaptation.City, student.TerrainAdaptation.Outdoor, student.TerrainAdaptation.Indoor),
	}
	return strings.Join(parts, " / ")
}

func studentURL(siteOrigin, id string) string {
	return strings.TrimRight(siteOrigin, "/") + "/" + url.PathEscape(id)
}

type rssDocument struct {
	XMLName   xml.Name   `xml:"rss"`
	Version   string     `xml:"version,attr"`
	XmlnsAtom string     `xml:"xmlns:atom,attr"`
	Channel   rssChannel `xml:"channel"`
}

type rssChannel struct {
	Title         string    `xml:"title"`
	Link          string    `xml:"link"`
	Description   string    `xml:"description"`
	Language      string    `xml:"language"`
	LastBuildDate string    `xml:"lastBuildDate"`
	AtomLink      atomLink  `xml:"atom:link"`
	Items         []rssItem `xml:"item"`
}

type atomLink struct {
	Href string `xml:"href,attr"`
	Rel  string `xml:"rel,attr"`
	Type string `xml:"type,attr"`
}

type rssItem struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	GUID        string `xml:"guid"`
	PubDate     string `xml:"pubDate"`
	Description string `xml:"description"`
}
