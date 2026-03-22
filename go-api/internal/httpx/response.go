package httpx

import (
	"encoding/json"
	"net/http"

	"bluearchiveapi/go-api/internal/apperror"
)

func JSON(w http.ResponseWriter, status int, payload any, headers map[string]string) {
	for k, v := range headers {
		w.Header().Set(k, v)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	_ = enc.Encode(payload)
}

func Error(w http.ResponseWriter, err error, fallback map[string]any) {
	if apiErr, ok := err.(apperror.APIError); ok {
		JSON(w, apiErr.Status, apiErr.Body, nil)
		return
	}
	JSON(w, http.StatusInternalServerError, fallback, nil)
}
