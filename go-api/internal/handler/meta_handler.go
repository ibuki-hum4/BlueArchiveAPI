package handler

import (
	"net/http"
	"time"

	"bluearchiveapi/go-api/internal/httpx"
)

type MetaHandler struct{}

func NewMetaHandler() *MetaHandler {
	return &MetaHandler{}
}

func (h *MetaHandler) API(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{
		"status":    "success",
		"message":   "ブルーアーカイブAPIサーバー稼働中（Go版）",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"endpoints": map[string]string{"students": "/api/students"},
	}, nil)
}

func (h *MetaHandler) Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{
		"status":    "ok",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}, nil)
}
