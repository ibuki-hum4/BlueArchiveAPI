package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type rateRecord struct {
	count     int
	resetTime time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	window  time.Duration
	max     int
	records map[string]rateRecord
}

func NewRateLimiter(window time.Duration, max int) *RateLimiter {
	return &RateLimiter{
		window:  window,
		max:     max,
		records: make(map[string]rateRecord),
	}
}

func (r *RateLimiter) Allow(ip string) bool {
	now := time.Now()

	r.mu.Lock()
	defer r.mu.Unlock()

	rec, ok := r.records[ip]
	if !ok || now.After(rec.resetTime) {
		r.records[ip] = rateRecord{count: 1, resetTime: now.Add(r.window)}
		return true
	}

	if rec.count >= r.max {
		return false
	}

	rec.count++
	r.records[ip] = rec
	return true
}

func ClientIP(req *http.Request) string {
	if xff := req.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			return strings.TrimSpace(parts[0])
		}
	}

	if rip := strings.TrimSpace(req.Header.Get("X-Real-IP")); rip != "" {
		return rip
	}

	host, _, err := net.SplitHostPort(strings.TrimSpace(req.RemoteAddr))
	if err == nil && host != "" {
		return host
	}

	if req.RemoteAddr == "" {
		return "unknown"
	}
	return strings.TrimSpace(req.RemoteAddr)
}
