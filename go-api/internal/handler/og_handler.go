package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"bluearchiveapi/go-api/internal/service"
)

const (
	defaultRendererURL = "http://localhost:8787/render"
	// レンダラーは1件ずつ直列に描画するため、同時アクセス時の待ち時間も含めて余裕を持たせる
	renderTimeout = 6 * time.Second
	// 生成済みPNGを保持する件数の上限（1枚あたり数十KB）
	ogCacheMaxEntries = 256
)

type OGHandler struct {
	service     *service.StudentsService
	httpClient  *http.Client
	rendererURL string
	cache       *pngCache
}

// 生徒情報のフィールドは、生徒を指定しないサイト全体のOGPでは空文字になる
type ogRenderRequest struct {
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Rarity   string `json:"rarity"`
	Weapon   string `json:"weapon"`
	City     string `json:"city"`
	Outdoor  string `json:"outdoor"`
	Indoor   string `json:"indoor"`
}

// pngCache は描画結果を件数上限付きで保持する。
// キーは描画内容そのものなので、生徒データが更新されれば自然に別エントリになる。
type pngCache struct {
	mu      sync.Mutex
	entries map[ogRenderRequest][]byte
	order   []ogRenderRequest
	max     int
}

func newPNGCache(max int) *pngCache {
	return &pngCache{entries: make(map[ogRenderRequest][]byte, max), max: max}
}

func (c *pngCache) get(key ogRenderRequest) ([]byte, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	png, ok := c.entries[key]
	return png, ok
}

func (c *pngCache) put(key ogRenderRequest, png []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if _, ok := c.entries[key]; ok {
		return
	}
	// 古いものから捨てる
	if len(c.order) >= c.max {
		oldest := c.order[0]
		c.order = c.order[1:]
		delete(c.entries, oldest)
	}
	c.entries[key] = png
	c.order = append(c.order, key)
}

func NewOGHandler(svc *service.StudentsService) *OGHandler {
	rendererURL := strings.TrimSpace(os.Getenv("OGP_RENDERER_URL"))
	if rendererURL == "" {
		rendererURL = defaultRendererURL
	}

	return &OGHandler{
		service: svc,
		httpClient: &http.Client{
			Timeout: renderTimeout,
		},
		rendererURL: rendererURL,
		cache:       newPNGCache(ogCacheMaxEntries),
	}
}

func (h *OGHandler) OG(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	payload := h.buildPayload(r)
	png, ok := h.cache.get(payload)
	if !ok {
		var err error
		png, err = h.render(r.Context(), payload)
		if err != nil {
			log.Printf("og render failed: %v", err)
			http.Error(w, "render failed", http.StatusInternalServerError)
			return
		}
		h.cache.put(payload, png)
	}

	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("Surrogate-Control", "no-store")
	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(png)
}

func (h *OGHandler) buildPayload(r *http.Request) ogRenderRequest {
	title := limitRunes(strings.TrimSpace(r.URL.Query().Get("title")), 72)
	subtitle := limitRunes(strings.TrimSpace(r.URL.Query().Get("subtitle")), 120)
	studentID := strings.TrimSpace(r.URL.Query().Get("id"))

	var rarityLabel, weaponType, city, outdoor, indoor string

	if studentID != "" && h.service != nil {
		if st, err := h.service.GetByID(studentID); err == nil && st != nil {
			if title == "" {
				title = limitRunes(strings.TrimSpace(st.Name), 42)
			}
			if subtitle == "" {
				subtitle = limitRunes(strings.TrimSpace(st.School), 72)
			}
			rarityLabel = fmt.Sprintf("★%d", st.Rarity)
			weaponType = limitRunes(strings.TrimSpace(st.Weapon.Type), 8)
			city = normalizeGrade(st.TerrainAdaptation.City)
			outdoor = normalizeGrade(st.TerrainAdaptation.Outdoor)
			indoor = normalizeGrade(st.TerrainAdaptation.Indoor)
		}
	}

	if title == "" {
		title = "Blue Archive API"
	}
	if subtitle == "" {
		subtitle = "ブルーアーカイブの生徒データベース"
	}

	return ogRenderRequest{
		Title:    strings.TrimSpace(title),
		Subtitle: strings.TrimSpace(subtitle),
		Rarity:   rarityLabel,
		Weapon:   weaponType,
		City:     city,
		Outdoor:  outdoor,
		Indoor:   indoor,
	}
}

func (h *OGHandler) render(parent context.Context, payload ogRenderRequest) ([]byte, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(parent, http.MethodPost, h.rendererURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := h.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call renderer: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return nil, fmt.Errorf("renderer status=%d body=%s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	png, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read renderer response: %w", err)
	}
	if len(png) == 0 {
		return nil, fmt.Errorf("renderer returned empty PNG")
	}

	return png, nil
}

func normalizeGrade(v string) string {
	return strings.ToUpper(strings.TrimSpace(v))
}

func limitRunes(s string, max int) string {
	if max <= 0 {
		return ""
	}
	runes := []rune(s)
	if len(runes) <= max {
		return s
	}
	return string(runes[:max])
}
