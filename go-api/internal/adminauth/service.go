package adminauth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"net/http"
	"strconv"
	"strings"
	"time"

	"bluearchiveapi/go-api/internal/httpx"
)

const (
	// CookieName is the name of the cookie that carries the admin session
	// token.
	CookieName = "ba_admin_session"
	sessionTTL = 24 * time.Hour
)

// Service provides simple, dependency-free admin authentication backed by a
// single shared password (ADMIN_PASSWORD) and HMAC-signed session tokens.
type Service struct {
	password string
	secret   []byte
	enabled  bool
}

// New creates an admin auth service. If password is empty, admin features
// are disabled. If secret is empty, a random secret is generated for the
// lifetime of the process (existing sessions are invalidated on restart).
func New(password, secret string) *Service {
	password = strings.TrimSpace(password)
	enabled := password != ""

	secretBytes := []byte(secret)
	if len(secretBytes) == 0 {
		secretBytes = make([]byte, 32)
		if _, err := rand.Read(secretBytes); err != nil {
			secretBytes = []byte("bluearchiveapi-admin-session-secret")
		}
	}

	return &Service{password: password, secret: secretBytes, enabled: enabled}
}

// Enabled reports whether admin features are configured.
func (s *Service) Enabled() bool {
	return s.enabled
}

// CheckPassword compares the supplied password against the configured admin
// password using a constant-time comparison.
func (s *Service) CheckPassword(input string) bool {
	if !s.enabled {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(input), []byte(s.password)) == 1
}

func (s *Service) sign(payload string) string {
	mac := hmac.New(sha256.New, s.secret)
	mac.Write([]byte(payload))
	return hex.EncodeToString(mac.Sum(nil))
}

// IssueToken creates a signed session token valid for sessionTTL.
func (s *Service) IssueToken() string {
	expiry := time.Now().Add(sessionTTL).Unix()
	payload := strconv.FormatInt(expiry, 10)
	return payload + "." + s.sign(payload)
}

// ValidateToken reports whether token is well-formed, correctly signed, and
// not expired.
func (s *Service) ValidateToken(token string) bool {
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 {
		return false
	}

	expected := s.sign(parts[0])
	if !hmac.Equal([]byte(expected), []byte(parts[1])) {
		return false
	}

	expiry, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return false
	}
	return time.Now().Unix() < expiry
}

// IsAuthenticated reports whether the request carries a valid admin session
// cookie.
func (s *Service) IsAuthenticated(r *http.Request) bool {
	if !s.enabled {
		return false
	}
	cookie, err := r.Cookie(CookieName)
	if err != nil {
		return false
	}
	return s.ValidateToken(cookie.Value)
}

// SetSessionCookie issues a fresh session cookie on the response.
func (s *Service) SetSessionCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    s.IssueToken(),
		Path:     "/api",
		HttpOnly: true,
		Secure:   isHTTPS(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(sessionTTL.Seconds()),
	})
}

// ClearSessionCookie removes the admin session cookie.
func (s *Service) ClearSessionCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/api",
		HttpOnly: true,
		Secure:   isHTTPS(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

// RequireAdmin wraps a handler so it only runs for authenticated admin
// sessions. If admin features are not configured, it responds with 503; if
// the caller is not authenticated, it responds with 401.
func (s *Service) RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !s.enabled {
			httpx.JSON(w, http.StatusServiceUnavailable, map[string]string{
				"message": "error",
				"error":   "Admin features are not configured",
			}, nil)
			return
		}
		if !s.IsAuthenticated(r) {
			httpx.JSON(w, http.StatusUnauthorized, map[string]string{
				"message": "error",
				"error":   "Unauthorized",
			}, nil)
			return
		}
		next(w, r)
	}
}

func isHTTPS(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}
	return strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
}
