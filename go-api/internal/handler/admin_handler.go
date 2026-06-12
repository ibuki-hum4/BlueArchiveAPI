package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"bluearchiveapi/go-api/internal/adminauth"
	"bluearchiveapi/go-api/internal/httpx"
	"bluearchiveapi/go-api/internal/middleware"
)

type AdminHandler struct {
	auth    *adminauth.Service
	limiter *middleware.RateLimiter
}

func NewAdminHandler(auth *adminauth.Service) *AdminHandler {
	return &AdminHandler{
		auth:    auth,
		limiter: middleware.NewRateLimiter(60*time.Second, 10),
	}
}

type loginRequest struct {
	Password string `json:"password"`
}

func (h *AdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	if !h.auth.Enabled() {
		httpx.JSON(w, http.StatusServiceUnavailable, map[string]string{
			"message": "error",
			"error":   "Admin features are not configured",
		}, nil)
		return
	}

	ip := middleware.ClientIP(r)
	if !h.limiter.Allow(ip) {
		httpx.JSON(w, http.StatusTooManyRequests, map[string]string{
			"message": "error",
			"error":   "Too Many Requests",
		}, nil)
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.JSON(w, http.StatusBadRequest, map[string]string{
			"message": "error",
			"error":   "Invalid request body",
		}, nil)
		return
	}

	if !h.auth.CheckPassword(req.Password) {
		httpx.JSON(w, http.StatusUnauthorized, map[string]string{
			"message": "error",
			"error":   "Invalid password",
		}, nil)
		return
	}

	h.auth.SetSessionCookie(w, r)
	httpx.JSON(w, http.StatusOK, map[string]any{
		"message":       "success",
		"authenticated": true,
	}, nil)
}

func (h *AdminHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	h.auth.ClearSessionCookie(w, r)
	httpx.JSON(w, http.StatusOK, map[string]any{
		"message": "success",
	}, nil)
}

func (h *AdminHandler) Session(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.JSON(w, http.StatusMethodNotAllowed, map[string]string{
			"message": "error",
			"error":   "Method Not Allowed",
		}, nil)
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{
		"message":       "success",
		"authenticated": h.auth.IsAuthenticated(r),
	}, nil)
}
