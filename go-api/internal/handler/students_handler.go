package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"bluearchiveapi/go-api/internal/apperror"
	"bluearchiveapi/go-api/internal/domain"
	"bluearchiveapi/go-api/internal/httpx"
	"bluearchiveapi/go-api/internal/middleware"
	"bluearchiveapi/go-api/internal/service"
)

const (
	defaultPageLimit = 100
	maxPageLimit     = 1000
)

type StudentsHandler struct {
	service *service.StudentsService
	limiter *middleware.RateLimiter
}

func NewStudentsHandler(svc *service.StudentsService) *StudentsHandler {
	return &StudentsHandler{
		service: svc,
		limiter: middleware.NewRateLimiter(60*time.Second, 100),
	}
}

func (h *StudentsHandler) Students(w http.ResponseWriter, r *http.Request) {
	ip := middleware.ClientIP(r)
	if !h.limiter.Allow(ip) {
		httpx.JSON(w, http.StatusTooManyRequests, map[string]string{
			"message": "error",
			"error":   "Too Many Requests",
		}, nil)
		return
	}

	if r.Method != http.MethodGet {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	h.getStudents(w, r)
}

func (h *StudentsHandler) StudentByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/students/")
	if id == "" {
		httpx.JSON(w, http.StatusBadRequest, map[string]string{
			"message": "error",
			"error":   "ID is required",
		}, nil)
		return
	}

	if r.Method != http.MethodGet {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	h.getStudentByID(w, r, id)
}

func (h *StudentsHandler) getStudents(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	limit := parseInt(q.Get("limit"), defaultPageLimit)
	if limit < 1 {
		limit = 1
	}
	if limit > maxPageLimit {
		limit = maxPageLimit
	}

	page := parseInt(q.Get("page"), 1)
	if page < 1 {
		page = 1
	}

	var rarity *int
	if raw := strings.TrimSpace(q.Get("rarity")); raw != "" {
		if rv, err := strconv.Atoi(raw); err == nil {
			rarity = &rv
		}
	}

	var etag string
	if fp, err := h.service.DataFingerprint(); err == nil {
		etag = weakETag(fp, r.URL.RawQuery)
		if etagMatches(r, etag) {
			w.Header().Set("ETag", etag)
			w.Header().Set("Cache-Control", "public, max-age=60")
			w.WriteHeader(http.StatusNotModified)
			return
		}
	}

	result, err := h.service.List(service.StudentsQuery{
		Limit:  limit,
		Page:   page,
		School: strings.TrimSpace(q.Get("school")),
		Rarity: rarity,
	})
	if err != nil {
		httpx.Error(w, apperror.APIError{
			Status: http.StatusInternalServerError,
			Body: map[string]any{
				"message": "error",
				"total":   0,
				"count":   0,
				"data":    []domain.Student{},
			},
		}, map[string]any{
			"message": "error",
			"total":   0,
			"count":   0,
			"data":    []domain.Student{},
		})
		return
	}

	headers := map[string]string{
		"Cache-Control": "public, max-age=60",
	}
	if etag != "" {
		headers["ETag"] = etag
	}

	httpx.JSON(w, http.StatusOK, map[string]any{
		"message": "success",
		"total":   result.Total,
		"count":   result.Count,
		"data":    result.Data,
	}, headers)
}

func (h *StudentsHandler) getStudentByID(w http.ResponseWriter, r *http.Request, id string) {
	var etag string
	if fp, err := h.service.DataFingerprint(); err == nil {
		etag = weakETag(fp, id)
		if etagMatches(r, etag) {
			w.Header().Set("ETag", etag)
			w.Header().Set("Cache-Control", "public, max-age=60")
			w.WriteHeader(http.StatusNotModified)
			return
		}
	}

	student, err := h.service.GetByID(id)
	if err != nil {
		httpx.Error(w, err, map[string]any{
			"message": "error",
			"error":   "Failed to read students data",
		})
		return
	}
	if student == nil {
		httpx.JSON(w, http.StatusNotFound, map[string]string{
			"message": "error",
			"error":   "Student not found",
		}, nil)
		return
	}

	headers := map[string]string{
		"Cache-Control": "public, max-age=60",
	}
	if etag != "" {
		headers["ETag"] = etag
	}

	httpx.JSON(w, http.StatusOK, map[string]any{
		"message": "success",
		"data":    student,
	}, headers)
}

// weakETag builds a weak ETag value from the given parts.
func weakETag(parts ...string) string {
	return `W/"` + strings.Join(parts, "-") + `"`
}

// etagMatches reports whether the request's If-None-Match header contains
// the given ETag.
func etagMatches(r *http.Request, etag string) bool {
	inm := r.Header.Get("If-None-Match")
	if inm == "" {
		return false
	}
	for _, candidate := range strings.Split(inm, ",") {
		if strings.TrimSpace(candidate) == etag {
			return true
		}
	}
	return false
}

func parseInt(raw string, fallback int) int {
	if raw == "" {
		return fallback
	}
	v, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return v
}
