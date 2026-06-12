package main

import (
	"database/sql"
	"log"
	"net/http"

	"bluearchiveapi/go-api/internal/config"
	"bluearchiveapi/go-api/internal/server"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	cfg := config.Load()
	addr := ":" + cfg.Port

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database open error: %v", err)
	}
	defer db.Close()

	router, err := server.NewRouter(db, cfg)
	if err != nil {
		log.Fatalf("router init error: %v", err)
	}

	log.Printf("Go API server listening on %s", addr)
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
