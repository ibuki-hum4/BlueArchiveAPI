package server

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"bluearchiveapi/go-api/internal/handler"
	"bluearchiveapi/go-api/internal/rss"
	"bluearchiveapi/go-api/internal/service"
	"bluearchiveapi/go-api/internal/storage"
	"bluearchiveapi/go-api/internal/studentssync"
)

func NewRouter(db *sql.DB, syncInterval time.Duration) http.Handler {
	repo := storage.NewStudentsRepository()
	svc := service.NewStudentsService(repo)
	rssService := rss.NewFeedService(repo)
	go rssService.Start(context.Background())
	if db != nil {
		syncService := studentssync.New(db, repo, syncInterval)
		go syncService.Start(context.Background())
	}

	metaHandler := handler.NewMetaHandler()
	ogHandler := handler.NewOGHandler(svc)
	studentsHandler := handler.NewStudentsHandler(svc)
	rssHandler := handler.NewRSSHandler(rssService)

	mux := http.NewServeMux()
	mux.HandleFunc("/api", metaHandler.API)
	mux.HandleFunc("/api/og", ogHandler.OG)
	mux.HandleFunc("/api/health", metaHandler.Health)
	mux.HandleFunc("/og", ogHandler.OG)
	mux.HandleFunc("/rss.xml", rssHandler.Feed)
	mux.HandleFunc("/api/rss", rssHandler.Feed)
	mux.HandleFunc("/api/students", studentsHandler.Students)
	mux.HandleFunc("/api/students/", studentsHandler.StudentByID)

	return mux
}
