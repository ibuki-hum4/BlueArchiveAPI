// Command export_students exports the students table to a JSON file,
// matching the formatting of the hand-maintained data/students.json.
package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"log"
	"os"

	"bluearchiveapi/go-api/internal/storage"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	databaseURL := flag.String("database-url", os.Getenv("DATABASE_URL"), "PostgreSQL connection string")
	outPath := flag.String("out", "data/students.json", "path to write students.json")
	flag.Parse()

	if *databaseURL == "" {
		log.Fatal("DATABASE_URL is required (set the env var or pass -database-url)")
	}

	db, err := sql.Open("pgx", *databaseURL)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	repo, err := storage.NewStudentsRepository(db)
	if err != nil {
		log.Fatalf("ensure schema: %v", err)
	}

	students, err := repo.ReadAll()
	if err != nil {
		log.Fatalf("read students: %v", err)
	}

	data, err := json.MarshalIndent(students, "", "    ")
	if err != nil {
		log.Fatalf("marshal students: %v", err)
	}
	data = append(data, '\n')

	if err := os.WriteFile(*outPath, data, 0o644); err != nil {
		log.Fatalf("write %s: %v", *outPath, err)
	}

	log.Printf("exported %d students to %s", len(students), *outPath)
}
