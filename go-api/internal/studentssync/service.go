package studentssync

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"bluearchiveapi/go-api/internal/domain"
	"bluearchiveapi/go-api/internal/storage"

	_ "github.com/jackc/pgx/v5/stdlib"
)

const defaultSyncInterval = 5 * time.Second

type Service struct {
	db          *sql.DB
	repo        *storage.StudentsRepository
	interval    time.Duration
	mu          sync.Mutex
	fingerprint string
}

func OpenDatabase(databaseURL string) (*sql.DB, error) {
	databaseURL = strings.TrimSpace(databaseURL)
	if databaseURL == "" {
		return nil, nil
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func New(db *sql.DB, repo *storage.StudentsRepository, interval time.Duration) *Service {
	if interval <= 0 {
		interval = defaultSyncInterval
	}
	return &Service{
		db:       db,
		repo:     repo,
		interval: interval,
	}
}

func (s *Service) Start(ctx context.Context) {
	if s == nil || s.db == nil || s.repo == nil {
		return
	}

	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	s.syncAndLog(ctx)

	for {
		select {
		case <-ticker.C:
			s.syncAndLog(ctx)
		case <-ctx.Done():
			return
		}
	}
}

func (s *Service) syncAndLog(ctx context.Context) {
	if err := s.SyncIfChanged(ctx); err != nil {
		log.Printf("student sync skipped: %v", err)
	}
}

func (s *Service) SyncIfChanged(ctx context.Context) error {
	if s == nil || s.db == nil || s.repo == nil {
		return errors.New("student sync service is not configured")
	}

	students, fingerprint, err := s.repo.ReadSnapshot()
	if err != nil {
		return err
	}

	s.mu.Lock()
	if fingerprint == s.fingerprint {
		s.mu.Unlock()
		return nil
	}
	s.mu.Unlock()

	if err := syncStudents(ctx, s.db, students); err != nil {
		return err
	}

	s.mu.Lock()
	s.fingerprint = fingerprint
	s.mu.Unlock()

	return nil
}

func syncStudents(ctx context.Context, db *sql.DB, students []domain.Student) error {
	if db == nil {
		return errors.New("database is nil")
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, generateDDL()); err != nil {
		return err
	}

	ids := make([]string, 0, len(students))
	for _, student := range students {
		if _, err := tx.ExecContext(ctx, generateUpsert(student)); err != nil {
			return err
		}
		ids = append(ids, student.ID)
	}

	deleteSQL := generateDeleteMissing(ids)
	if deleteSQL != "" {
		if _, err := tx.ExecContext(ctx, deleteSQL); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func generateDDL() string {
	return `CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rarity INTEGER,
  weapon_type TEXT,
  weapon_cover BOOLEAN,
  role_type TEXT,
  role_class TEXT,
  role_position TEXT,
  school TEXT,
  combat_attack_type TEXT,
  combat_defense_type TEXT,
  terrain_city TEXT,
  terrain_outdoor TEXT,
  terrain_indoor TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);`
}

func generateDeleteMissing(ids []string) string {
	if len(ids) == 0 {
		return "TRUNCATE TABLE students;"
	}

	quoted := make([]string, 0, len(ids))
	for _, id := range ids {
		quoted = append(quoted, quoteString(id))
	}

	return fmt.Sprintf("DELETE FROM students WHERE id NOT IN (%s);", strings.Join(quoted, ","))
}

func quoteString(s string) string {
	s = strings.ReplaceAll(s, "'", "''")
	return "'" + s + "'"
}

func generateUpsert(student domain.Student) string {
	return fmt.Sprintf(
		"INSERT INTO students (id,name,rarity,weapon_type,weapon_cover,role_type,role_class,role_position,school,combat_attack_type,combat_defense_type,terrain_city,terrain_outdoor,terrain_indoor,updated_at) VALUES (%s,%s,%d,%s,%t,%s,%s,%s,%s,%s,%s,%s,%s,%s,now()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, rarity=EXCLUDED.rarity, weapon_type=EXCLUDED.weapon_type, weapon_cover=EXCLUDED.weapon_cover, role_type=EXCLUDED.role_type, role_class=EXCLUDED.role_class, role_position=EXCLUDED.role_position, school=EXCLUDED.school, combat_attack_type=EXCLUDED.combat_attack_type, combat_defense_type=EXCLUDED.combat_defense_type, terrain_city=EXCLUDED.terrain_city, terrain_outdoor=EXCLUDED.terrain_outdoor, terrain_indoor=EXCLUDED.terrain_indoor, updated_at=now();",
		quoteString(student.ID),
		quoteString(student.Name),
		student.Rarity,
		quoteString(student.Weapon.Type),
		student.Weapon.Cover,
		quoteString(student.Role.Type),
		quoteString(student.Role.Class),
		quoteString(student.Role.Position),
		quoteString(student.School),
		quoteString(student.Combat.AttackType),
		quoteString(student.Combat.DefenseType),
		quoteString(student.TerrainAdaptation.City),
		quoteString(student.TerrainAdaptation.Outdoor),
		quoteString(student.TerrainAdaptation.Indoor),
	)
}

func studentHash(student domain.Student) string {
	b, _ := json.Marshal(student)
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}
