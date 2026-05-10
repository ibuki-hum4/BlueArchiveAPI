package config

import (
	"os"
	"time"
)

type Config struct {
	Port                 string
	DatabaseURL          string
	StudentsSyncInterval time.Duration
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	syncInterval := 5 * time.Second
	if raw := os.Getenv("STUDENTS_SYNC_INTERVAL"); raw != "" {
		if parsed, err := time.ParseDuration(raw); err == nil && parsed > 0 {
			syncInterval = parsed
		}
	}

	return Config{
		Port:                 port,
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		StudentsSyncInterval: syncInterval,
	}
}
