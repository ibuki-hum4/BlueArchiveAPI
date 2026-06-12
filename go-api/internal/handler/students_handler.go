package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"bluearchiveapi/go-api/internal/adminauth"
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
	service   *service.StudentsService
	adminAuth *adminauth.Service
	limiter   *middleware.RateLimiter
}

func NewStudentsHandler(svc *service.StudentsService, adminAuth *adminauth.Service) *StudentsHandler {
	return &StudentsHandler{
		service:   svc,
		adminAuth: adminAuth,
		limiter:   middleware.NewRateLimiter(60*time.Second, 100),
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

	switch r.Method {
	case http.MethodGet:
		h.getStudents(w, r)
	case http.MethodPost:
		h.adminAuth.RequireAdmin(h.createStudent)(w, r)
	default:
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
	}
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

	switch r.Method {
	case http.MethodGet:
		h.getStudentByID(w, r, id)
	case http.MethodPut:
		h.adminAuth.RequireAdmin(func(w http.ResponseWriter, r *http.Request) {
			h.updateStudent(w, r, id)
		})(w, r)
	case http.MethodDelete:
		h.adminAuth.RequireAdmin(func(w http.ResponseWriter, r *http.Request) {
			h.deleteStudent(w, r, id)
		})(w, r)
	default:
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
	}
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

func (h *StudentsHandler) createStudent(w http.ResponseWriter, r *http.Request) {
	var input domain.Student
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.JSON(w, http.StatusBadRequest, map[string]string{
			"message": "error",
			"error":   "Invalid request body",
		}, nil)
		return
	}

	created, err := h.service.Create(input)
	if err != nil {
		httpx.Error(w, err, map[string]any{
			"message": "error",
			"error":   "Failed to create student",
		})
		return
	}

	httpx.JSON(w, http.StatusCreated, map[string]any{
		"message": "success",
		"data":    created,
	}, nil)
}

func (h *StudentsHandler) updateStudent(w http.ResponseWriter, r *http.Request, id string) {
	var input domain.Student
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.JSON(w, http.StatusBadRequest, map[string]string{
			"message": "error",
			"error":   "Invalid request body",
		}, nil)
		return
	}

	updated, err := h.service.Update(id, input)
	if err != nil {
		httpx.Error(w, err, map[string]any{
			"message": "error",
			"error":   "Failed to update student",
		})
		return
	}
	if updated == nil {
		httpx.JSON(w, http.StatusNotFound, map[string]string{
			"message": "error",
			"error":   "Student not found",
		}, nil)
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{
		"message": "success",
		"data":    updated,
	}, nil)
}

func (h *StudentsHandler) deleteStudent(w http.ResponseWriter, r *http.Request, id string) {
	ok, err := h.service.Delete(id)
	if err != nil {
		httpx.Error(w, err, map[string]any{
			"message": "error",
			"error":   "Failed to delete student",
		})
		return
	}
	if !ok {
		httpx.JSON(w, http.StatusNotFound, map[string]string{
			"message": "error",
			"error":   "Student not found",
		}, nil)
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{
		"message": "success",
	}, nil)
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
