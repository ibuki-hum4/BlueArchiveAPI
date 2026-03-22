package apperror

type APIError struct {
	Status int
	Body   map[string]any
}

func (e APIError) Error() string {
	if msg, ok := e.Body["message"].(string); ok {
		return msg
	}
	return "api error"
}
