package handler

import (
	"net/http"
	"strings"

	"bluearchiveapi/go-api/internal/rss"
)

type RSSHandler struct {
	service *rss.FeedService
}

func NewRSSHandler(service *rss.FeedService) *RSSHandler {
	return &RSSHandler{service: service}
}

func (h *RSSHandler) Feed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	feed, meta, err := h.service.Snapshot()
	if err != nil {
		http.Error(w, "failed to build rss feed", http.StatusInternalServerError)
		return
	}

	if match := strings.TrimSpace(r.Header.Get("If-None-Match")); match != "" && match == meta.ETag {
		w.WriteHeader(http.StatusNotModified)
		return
	}

	w.Header().Set("Content-Type", "application/rss+xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=30, must-revalidate")
	w.Header().Set("ETag", meta.ETag)
	if !meta.UpdatedAt.IsZero() {
		w.Header().Set("Last-Modified", meta.UpdatedAt.UTC().Format(http.TimeFormat))
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(feed)
}
