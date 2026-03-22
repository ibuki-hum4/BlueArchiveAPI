package main

import (
	"log"
	"net/http"

	"bluearchiveapi/go-api/internal/config"
	"bluearchiveapi/go-api/internal/server"
)

func main() {
	cfg := config.Load()
	addr := ":" + cfg.Port

	log.Printf("Go API server listening on %s", addr)
	if err := http.ListenAndServe(addr, server.NewRouter()); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
