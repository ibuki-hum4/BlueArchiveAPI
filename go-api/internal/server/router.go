package server

import (
	"net/http"

	"bluearchiveapi/go-api/internal/handler"
	"bluearchiveapi/go-api/internal/service"
	"bluearchiveapi/go-api/internal/storage"
)

func NewRouter() http.Handler {
	repo := storage.NewStudentsRepository()
	svc := service.NewStudentsService(repo)

	metaHandler := handler.NewMetaHandler()
	ogHandler := handler.NewOGHandler()
	studentsHandler := handler.NewStudentsHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("/api", metaHandler.API)
	mux.HandleFunc("/api/og", ogHandler.OG)
	mux.HandleFunc("/api/health", metaHandler.Health)
	mux.HandleFunc("/og", ogHandler.OG)
	mux.HandleFunc("/api/students", studentsHandler.Students)
	mux.HandleFunc("/api/students/", studentsHandler.StudentByID)

	return mux
}
