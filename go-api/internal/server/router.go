package server

import (
	"context"
	"database/sql"
	"net/http"

	"bluearchiveapi/go-api/internal/adminauth"
	"bluearchiveapi/go-api/internal/config"
	"bluearchiveapi/go-api/internal/handler"
	"bluearchiveapi/go-api/internal/middleware"
	"bluearchiveapi/go-api/internal/rss"
	"bluearchiveapi/go-api/internal/service"
	"bluearchiveapi/go-api/internal/storage"
)

func NewRouter(db *sql.DB, cfg config.Config) (http.Handler, error) {
	repo, err := storage.NewStudentsRepository(db)
	if err != nil {
		return nil, err
	}
	svc := service.NewStudentsService(repo)
	rssService := rss.NewFeedService(repo)
	go rssService.Start(context.Background())

	adminAuth := adminauth.New(cfg.AdminPassword, cfg.AdminSessionSecret)

	metaHandler := handler.NewMetaHandler()
	ogHandler := handler.NewOGHandler(svc)
	studentsHandler := handler.NewStudentsHandler(svc, adminAuth)
	rssHandler := handler.NewRSSHandler(rssService)
	adminHandler := handler.NewAdminHandler(adminAuth)

	mux := http.NewServeMux()
	mux.HandleFunc("/api", middleware.Gzip(metaHandler.API))
	mux.HandleFunc("/api/og", ogHandler.OG)
	mux.HandleFunc("/api/health", middleware.Gzip(metaHandler.Health))
	mux.HandleFunc("/og", ogHandler.OG)
	mux.HandleFunc("/rss.xml", middleware.Gzip(rssHandler.Feed))
	mux.HandleFunc("/api/rss", middleware.Gzip(rssHandler.Feed))
	mux.HandleFunc("/api/students", middleware.Gzip(studentsHandler.Students))
	mux.HandleFunc("/api/students/", middleware.Gzip(studentsHandler.StudentByID))
	mux.HandleFunc("/api/admin/login", middleware.Gzip(adminHandler.Login))
	mux.HandleFunc("/api/admin/logout", middleware.Gzip(adminHandler.Logout))
	mux.HandleFunc("/api/admin/session", middleware.Gzip(adminHandler.Session))

	return mux, nil
}
