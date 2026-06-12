// Command seed_students performs a one-time, idempotent seed of the
// students table from a students.json file. Existing rows are left
// untouched (ON CONFLICT DO NOTHING) since the database is the source of
// truth once seeded.
package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	"bluearchiveapi/go-api/internal/domain"
	"bluearchiveapi/go-api/internal/storage"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	databaseURL := flag.String("database-url", os.Getenv("DATABASE_URL"), "PostgreSQL connection string")
	jsonPath := flag.String("json", "data/students.json", "path to students.json")
	dryRun := flag.Bool("dry-run", false, "list students without writing to the database")
	flag.Parse()

	if *databaseURL == "" {
		log.Fatal("DATABASE_URL is required (set the env var or pass -database-url)")
	}

	data, err := os.ReadFile(*jsonPath)
	if err != nil {
		log.Fatalf("read %s: %v", *jsonPath, err)
	}

	var students []domain.Student
	if err := json.Unmarshal(data, &students); err != nil {
		log.Fatalf("parse %s: %v", *jsonPath, err)
	}

	if *dryRun {
		for _, student := range students {
			fmt.Printf("would seed (if missing): %s (%s)\n", student.ID, student.Name)
		}
		fmt.Printf("dry run: %d students in %s\n", len(students), *jsonPath)
		return
	}

	db, err := sql.Open("pgx", *databaseURL)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	if _, err := storage.NewStudentsRepository(db); err != nil {
		log.Fatalf("ensure schema: %v", err)
	}

	inserted, skipped := 0, 0
	for _, student := range students {
		res, err := db.Exec(
			`INSERT INTO students (id, name, rarity, weapon_type, weapon_cover, role_type, role_class, role_position, school, combat_attack_type, combat_defense_type, terrain_city, terrain_outdoor, terrain_indoor, updated_at)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now())
			 ON CONFLICT (id) DO NOTHING`,
			student.ID, student.Name, student.Rarity,
			student.Weapon.Type, student.Weapon.Cover,
			student.Role.Type, student.Role.Class, student.Role.Position,
			student.School,
			student.Combat.AttackType, student.Combat.DefenseType,
			student.TerrainAdaptation.City, student.TerrainAdaptation.Outdoor, student.TerrainAdaptation.Indoor,
		)
		if err != nil {
			log.Fatalf("insert %s: %v", student.ID, err)
		}

		affected, err := res.RowsAffected()
		if err != nil {
			log.Fatalf("insert %s: %v", student.ID, err)
		}
		if affected > 0 {
			inserted++
		} else {
			skipped++
		}
	}

	fmt.Printf("seed complete: %d inserted, %d already existed (skipped)\n", inserted, skipped)
}
