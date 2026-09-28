package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync/atomic"
	"testing"

	"bluearchiveapi/go-api/internal/service"
	"bluearchiveapi/go-api/internal/storage"
)

const testStudentsJSON = `[{
	"id": "TEST0001",
	"name": "テスト",
	"rarity": 3,
	"weapon": {"type": "HG", "cover": false},
	"role": {"type": "STRIKER", "class": "アタッカー", "position": "BACK"},
	"school": "テスト学園",
	"combat": {"attackType": "神秘", "defenseType": "軽装備"},
	"terrainAdaptation": {"city": "a", "outdoor": "B", "indoor": "S"}
}]`

// newTestOGHandler はテスト用の生徒データとダミーのレンダラーで OGHandler を作る。
// 返り値の received にはレンダラーが受け取ったリクエスト、calls には呼び出し回数が入る。
func newTestOGHandler(t *testing.T) (h *OGHandler, received *[]ogRenderRequest, calls *atomic.Int32) {
	t.Helper()

	dataPath := filepath.Join(t.TempDir(), "students.json")
	if err := os.WriteFile(dataPath, []byte(testStudentsJSON), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("STUDENTS_DATA_PATH", dataPath)

	var reqs []ogRenderRequest
	var count atomic.Int32
	renderer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		count.Add(1)
		var body ogRenderRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Errorf("decode renderer request: %v", err)
		}
		reqs = append(reqs, body)
		w.Header().Set("Content-Type", "image/png")
		_, _ = w.Write([]byte("png"))
	}))
	t.Cleanup(renderer.Close)
	t.Setenv("OGP_RENDERER_URL", renderer.URL)

	svc := service.NewStudentsService(storage.NewStudentsRepository())
	return NewOGHandler(svc), &reqs, &count
}

func serveOG(t *testing.T, h *OGHandler, target string) *httptest.ResponseRecorder {
	t.Helper()
	rec := httptest.NewRecorder()
	h.OG(rec, httptest.NewRequest(http.MethodGet, target, nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("GET %s: status = %d, body = %q", target, rec.Code, rec.Body.String())
	}
	return rec
}

func TestOGSiteImageHasNoStudentPlaceholders(t *testing.T) {
	h, received, _ := newTestOGHandler(t)

	serveOG(t, h, "/api/og?v=1")

	got := (*received)[0]
	if got.Title != "Blue Archive API" {
		t.Errorf("Title = %q, want default site title", got.Title)
	}
	// 以前は "★?" や "-" が入り、画像にプレースホルダーが描かれていた
	for name, v := range map[string]string{
		"Rarity": got.Rarity, "Weapon": got.Weapon,
		"City": got.City, "Outdoor": got.Outdoor, "Indoor": got.Indoor,
	} {
		if v != "" {
			t.Errorf("%s = %q, want empty for site-wide image", name, v)
		}
	}
}

func TestOGStudentImageUsesStudentData(t *testing.T) {
	h, received, _ := newTestOGHandler(t)

	serveOG(t, h, "/api/og?id=TEST0001")

	want := ogRenderRequest{
		Title:    "テスト",
		Subtitle: "テスト学園",
		Rarity:   "★3",
		Weapon:   "HG",
		City:     "A",
		Outdoor:  "B",
		Indoor:   "S",
	}
	if got := (*received)[0]; got != want {
		t.Errorf("render request = %+v, want %+v", got, want)
	}
}

func TestOGCachesRenderedImage(t *testing.T) {
	h, _, calls := newTestOGHandler(t)

	serveOG(t, h, "/api/og?id=TEST0001")
	rec := serveOG(t, h, "/api/og?id=TEST0001")
	if rec.Body.String() != "png" {
		t.Errorf("cached body = %q, want %q", rec.Body.String(), "png")
	}
	if n := calls.Load(); n != 1 {
		t.Errorf("renderer called %d times, want 1 (second request should hit cache)", n)
	}

	serveOG(t, h, "/api/og?v=1")
	if n := calls.Load(); n != 2 {
		t.Errorf("renderer called %d times, want 2 (different payload should render)", n)
	}
}

func TestPNGCacheEvictsOldest(t *testing.T) {
	c := newPNGCache(2)
	a, b, d := ogRenderRequest{Title: "a"}, ogRenderRequest{Title: "b"}, ogRenderRequest{Title: "d"}
	c.put(a, []byte("a"))
	c.put(b, []byte("b"))
	c.put(d, []byte("d"))

	if _, ok := c.get(a); ok {
		t.Error("oldest entry should be evicted")
	}
	for _, key := range []ogRenderRequest{b, d} {
		if _, ok := c.get(key); !ok {
			t.Errorf("entry %q should remain", key.Title)
		}
	}
}
