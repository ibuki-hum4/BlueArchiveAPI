package config

import (
	"os"
)

type Config struct {
	Port               string
	DatabaseURL        string
	AdminPassword      string
	AdminSessionSecret string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return Config{
		Port:               port,
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		AdminPassword:      os.Getenv("ADMIN_PASSWORD"),
		AdminSessionSecret: os.Getenv("ADMIN_SESSION_SECRET"),
	}
}
