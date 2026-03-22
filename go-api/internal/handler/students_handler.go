package handler

import (
	"encoding/json"
	"fmt"
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
		if r.Method == http.MethodGet {
			httpx.JSON(w, http.StatusTooManyRequests, map[string]string{
				"message": "error",
				"error":   "Too Many Requests",
			}, nil)
			return
		}
		if r.Method == http.MethodPost {
			httpx.JSON(w, http.StatusTooManyRequests, map[string]string{
				"status":  "error",
				"message": "Too Many Requests",
			}, nil)
			return
		}
	}

	switch r.Method {
	case http.MethodGet:
		h.getStudents(w, r)
	case http.MethodPost:
		h.postStudent(w, r)
	default:
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
	}
}

func (h *StudentsHandler) StudentByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/students/")
	if id == "" {
		httpx.JSON(w, http.StatusBadRequest, map[string]string{
			"message": "error",
			"error":   "ID is required",
		}, nil)
		return
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

	httpx.JSON(w, http.StatusOK, map[string]any{
		"message": "success",
		"data":    student,
	}, nil)
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

	httpx.JSON(w, http.StatusOK, map[string]any{
		"message": "success",
		"total":   result.Total,
		"count":   result.Count,
		"data":    result.Data,
	}, map[string]string{
		"Cache-Control": fmt.Sprintf("public, max-age=%d", 60),
	})
}

func (h *StudentsHandler) postStudent(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var input domain.Student
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		httpx.JSON(w, http.StatusBadRequest, map[string]string{
			"status":  "error",
			"message": "不正なJSON形式です",
		}, nil)
		return
	}

	if err := h.service.ValidateCreateInput(input); err != nil {
		httpx.Error(w, apperror.APIError{
			Status: http.StatusBadRequest,
			Body: map[string]any{
				"status":  "error",
				"message": "必須フィールドが不足しています",
			},
		}, map[string]any{
			"status":  "error",
			"message": "必須フィールドが不足しています",
		})
		return
	}

	id, err := h.service.Create(input)
	if err != nil {
		httpx.Error(w, apperror.APIError{
			Status: http.StatusInternalServerError,
			Body: map[string]any{
				"status":  "error",
				"message": "生徒データの保存に失敗しました",
			},
		}, map[string]any{
			"status":  "error",
			"message": "生徒データの保存に失敗しました",
		})
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]string{
		"status":  "success",
		"message": "生徒データを保存しました",
		"id":      id,
	}, nil)
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
