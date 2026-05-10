package main

import (
	"log"
	"net/http"

	"bluearchiveapi/go-api/internal/config"
	"bluearchiveapi/go-api/internal/server"
	"bluearchiveapi/go-api/internal/studentssync"
)

func main() {
	cfg := config.Load()
	addr := ":" + cfg.Port

	db, err := studentssync.OpenDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database open error: %v", err)
	}
	if db != nil {
		defer db.Close()
	}

	log.Printf("Go API server listening on %s", addr)
	if err := http.ListenAndServe(addr, server.NewRouter(db, cfg.StudentsSyncInterval)); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
