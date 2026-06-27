package server

import (
	"context"
	"net/http"

	"bluearchiveapi/go-api/internal/handler"
	"bluearchiveapi/go-api/internal/middleware"
	"bluearchiveapi/go-api/internal/rss"
	"bluearchiveapi/go-api/internal/service"
	"bluearchiveapi/go-api/internal/storage"
)

func NewRouter() http.Handler {
	repo := storage.NewStudentsRepository()
	svc := service.NewStudentsService(repo)
	rssService := rss.NewFeedService(repo)
	go rssService.Start(context.Background())

	metaHandler := handler.NewMetaHandler()
	ogHandler := handler.NewOGHandler(svc)
	studentsHandler := handler.NewStudentsHandler(svc)
	rssHandler := handler.NewRSSHandler(rssService)

	mux := http.NewServeMux()
	mux.HandleFunc("/api", middleware.Gzip(metaHandler.API))
	mux.HandleFunc("/api/og", ogHandler.OG)
	mux.HandleFunc("/api/health", middleware.Gzip(metaHandler.Health))
	mux.HandleFunc("/og", ogHandler.OG)
	mux.HandleFunc("/rss.xml", middleware.Gzip(rssHandler.Feed))
	mux.HandleFunc("/api/rss", middleware.Gzip(rssHandler.Feed))
	mux.HandleFunc("/api/students", middleware.Gzip(studentsHandler.Students))
	mux.HandleFunc("/api/students/", middleware.Gzip(studentsHandler.StudentByID))

	return mux
}
