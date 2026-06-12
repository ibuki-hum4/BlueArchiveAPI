package middleware

import (
	"compress/gzip"
	"net/http"
	"strings"
)

// gzipResponseWriter wraps http.ResponseWriter, transparently compressing the
// response body unless the handler responds with a status that must not
// carry a body (e.g. 304 Not Modified), in which case it is bypassed.
type gzipResponseWriter struct {
	http.ResponseWriter
	gz          *gzip.Writer
	wroteHeader bool
	bypass      bool
}

func (w *gzipResponseWriter) WriteHeader(status int) {
	if status == http.StatusNotModified || status == http.StatusNoContent {
		w.bypass = true
		w.wroteHeader = true
		w.ResponseWriter.WriteHeader(status)
		return
	}

	w.Header().Del("Content-Length")
	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Add("Vary", "Accept-Encoding")
	w.wroteHeader = true
	w.ResponseWriter.WriteHeader(status)
}

func (w *gzipResponseWriter) Write(b []byte) (int, error) {
	if !w.wroteHeader {
		w.WriteHeader(http.StatusOK)
	}
	if w.bypass {
		return w.ResponseWriter.Write(b)
	}
	return w.gz.Write(b)
}

// Gzip compresses JSON/XML responses for clients that advertise support via
// Accept-Encoding. Responses without a body (304/204) are passed through
// untouched.
func Gzip(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next(w, r)
			return
		}

		gz := gzip.NewWriter(w)
		gzw := &gzipResponseWriter{ResponseWriter: w, gz: gz}
		next(gzw, r)
		if !gzw.bypass {
			gz.Close()
		}
	}
}
