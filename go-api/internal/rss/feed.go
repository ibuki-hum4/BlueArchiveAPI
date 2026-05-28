package rss

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"bluearchiveapi/go-api/internal/domain"
	"bluearchiveapi/go-api/internal/storage"
)

const (
	defaultSiteOrigin   = "https://bluearchive-api.skyia.jp"
	defaultRefreshEvery = 5 * time.Second
	defaultOGVersion    = "20260322a"
)

type FeedService struct {
	repo *storage.StudentsRepository

	refreshEvery time.Duration
	siteOrigin   string
	statePath    string

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

type feedState struct {
	SeenIDs []string `json:"seen_ids"`
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

	statePath := strings.TrimSpace(os.Getenv("RSS_STATE_PATH"))
	if statePath == "" {
		statePath = filepath.Join(os.TempDir(), "bluearchive-rss-seen-ids.json")
	}

	seenIDs := map[string]struct{}{}
	if loaded, err := loadSeenIDs(statePath); err == nil {
		seenIDs = loaded
	}

	return &FeedService{
		repo:         repo,
		refreshEvery: refreshEvery,
		siteOrigin:   strings.TrimRight(siteOrigin, "/"),
		statePath:    statePath,
		seenIDs:      seenIDs,
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

	// If we have no previous seen IDs, treat this as initial baseline:
	// record current IDs but emit an empty feed (no items).
	if len(previous) == 0 {
		nextSeen := make(map[string]struct{}, len(students))
		for _, student := range students {
			nextSeen[student.ID] = struct{}{}
		}
		// empty snapshots => empty feed
		emptySnapshots := make([]itemSnapshot, 0)
		rssBytes, err := buildRSS(emptySnapshots, s.siteOrigin, now)
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

		_ = saveSeenIDs(s.statePath, nextSeen)

		return append([]byte(nil), rssBytes...), nil
	}

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

	_ = saveSeenIDs(s.statePath, nextSeen)

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

func loadSeenIDs(path string) (map[string]struct{}, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return map[string]struct{}{}, err
	}

	var state feedState
	if err := json.Unmarshal(b, &state); err != nil {
		return map[string]struct{}{}, err
	}

	seen := make(map[string]struct{}, len(state.SeenIDs))
	for _, id := range state.SeenIDs {
		if strings.TrimSpace(id) == "" {
			continue
		}
		seen[id] = struct{}{}
	}

	return seen, nil
}

func saveSeenIDs(path string, seen map[string]struct{}) error {
	if strings.TrimSpace(path) == "" {
		return nil
	}

	ids := make([]string, 0, len(seen))
	for id := range seen {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	state := feedState{SeenIDs: ids}
	b, err := json.Marshal(state)
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}

	return os.WriteFile(path, b, 0o644)
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
		ogImageURL := studentOGImageURL(siteOrigin, snapshot.student)
		items = append(items, rssItem{
			Title:       snapshot.student.Name,
			Link:        studentURL(siteOrigin, snapshot.student.ID),
			GUID:        studentURL(siteOrigin, snapshot.student.ID),
			PubDate:     snapshot.publishedAt.Format(time.RFC1123Z),
			Description: studentDescription(snapshot.student),
			Enclosure:   rssEnclosure{URL: ogImageURL, Type: "image/png", Length: 0},
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

func studentOGImageURL(siteOrigin string, student domain.Student) string {
	params := url.Values{}
	params.Set("id", student.ID)
	params.Set("title", student.Name)
	params.Set("subtitle", fmt.Sprintf("%s / レア度★%d", student.School, student.Rarity))
	params.Set("v", defaultOGVersion)

	return strings.TrimRight(siteOrigin, "/") + "/api/og?" + params.Encode()
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
	Title       string       `xml:"title"`
	Link        string       `xml:"link"`
	GUID        string       `xml:"guid"`
	PubDate     string       `xml:"pubDate"`
	Description string       `xml:"description"`
	Enclosure   rssEnclosure `xml:"enclosure"`
}

type rssEnclosure struct {
	URL    string `xml:"url,attr"`
	Type   string `xml:"type,attr"`
	Length int64  `xml:"length,attr"`
}
