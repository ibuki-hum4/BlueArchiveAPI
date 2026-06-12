package storage

import (
	"database/sql"
	"fmt"

	"bluearchiveapi/go-api/internal/domain"
)

const schemaDDL = `CREATE TABLE IF NOT EXISTS students (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    rarity              INTEGER NOT NULL,
    weapon_type         TEXT NOT NULL,
    weapon_cover        BOOLEAN NOT NULL DEFAULT false,
    role_type           TEXT NOT NULL,
    role_class          TEXT NOT NULL,
    role_position       TEXT NOT NULL,
    school              TEXT NOT NULL,
    combat_attack_type  TEXT NOT NULL,
    combat_defense_type TEXT NOT NULL,
    terrain_city        TEXT NOT NULL,
    terrain_outdoor     TEXT NOT NULL,
    terrain_indoor      TEXT NOT NULL,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);`

const selectColumns = `id, name, rarity, weapon_type, weapon_cover, role_type, role_class, role_position, school, combat_attack_type, combat_defense_type, terrain_city, terrain_outdoor, terrain_indoor`

type StudentsRepository struct {
	db *sql.DB
}

// NewStudentsRepository creates the students table if it does not already
// exist and returns a repository backed by db.
func NewStudentsRepository(db *sql.DB) (*StudentsRepository, error) {
	if _, err := db.Exec(schemaDDL); err != nil {
		return nil, fmt.Errorf("ensure students schema: %w", err)
	}
	return &StudentsRepository{db: db}, nil
}

// Fingerprint returns a cheap fingerprint derived from the row count and the
// most recent update time, without reading the full dataset. Callers can use
// it to detect changes before paying for a full read.
func (r *StudentsRepository) Fingerprint() (string, error) {
	var count int64
	var maxUpdatedAt sql.NullTime
	if err := r.db.QueryRow(`SELECT COUNT(*), MAX(updated_at) FROM students`).Scan(&count, &maxUpdatedAt); err != nil {
		return "", err
	}

	if !maxUpdatedAt.Valid {
		return fmt.Sprintf("%d-0", count), nil
	}
	return fmt.Sprintf("%d-%d", count, maxUpdatedAt.Time.UnixNano()), nil
}

// ReadAll reads and returns all students from the database.
func (r *StudentsRepository) ReadAll() ([]domain.Student, error) {
	rows, err := r.db.Query(`SELECT ` + selectColumns + ` FROM students ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	students := []domain.Student{}
	for rows.Next() {
		var s domain.Student
		if err := rows.Scan(
			&s.ID, &s.Name, &s.Rarity,
			&s.Weapon.Type, &s.Weapon.Cover,
			&s.Role.Type, &s.Role.Class, &s.Role.Position,
			&s.School,
			&s.Combat.AttackType, &s.Combat.DefenseType,
			&s.TerrainAdaptation.City, &s.TerrainAdaptation.Outdoor, &s.TerrainAdaptation.Indoor,
		); err != nil {
			return nil, err
		}
		students = append(students, s)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return students, nil
}

// ReadSnapshot reads the students data along with a fingerprint that changes
// whenever the underlying data is modified.
func (r *StudentsRepository) ReadSnapshot() ([]domain.Student, string, error) {
	fingerprint, err := r.Fingerprint()
	if err != nil {
		return nil, "", err
	}

	students, err := r.ReadAll()
	if err != nil {
		return nil, "", err
	}

	return students, fingerprint, nil
}

// WriteAll replaces the entire dataset with the given students, upserting
// each row in a single transaction.
func (r *StudentsRepository) WriteAll(students []domain.Student) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, student := range students {
		if err := upsertStudent(tx, student); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// Append adds a new student to the dataset.
func (r *StudentsRepository) Append(student domain.Student) error {
	_, err := r.db.Exec(
		`INSERT INTO students (`+selectColumns+`, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now())`,
		student.ID, student.Name, student.Rarity,
		student.Weapon.Type, student.Weapon.Cover,
		student.Role.Type, student.Role.Class, student.Role.Position,
		student.School,
		student.Combat.AttackType, student.Combat.DefenseType,
		student.TerrainAdaptation.City, student.TerrainAdaptation.Outdoor, student.TerrainAdaptation.Indoor,
	)
	return err
}

// Update replaces the student with a matching ID. It returns false if no
// student with that ID exists.
func (r *StudentsRepository) Update(student domain.Student) (bool, error) {
	res, err := r.db.Exec(
		`UPDATE students SET name=$2, rarity=$3, weapon_type=$4, weapon_cover=$5, role_type=$6, role_class=$7, role_position=$8, school=$9, combat_attack_type=$10, combat_defense_type=$11, terrain_city=$12, terrain_outdoor=$13, terrain_indoor=$14, updated_at=now() WHERE id=$1`,
		student.ID, student.Name, student.Rarity,
		student.Weapon.Type, student.Weapon.Cover,
		student.Role.Type, student.Role.Class, student.Role.Position,
		student.School,
		student.Combat.AttackType, student.Combat.DefenseType,
		student.TerrainAdaptation.City, student.TerrainAdaptation.Outdoor, student.TerrainAdaptation.Indoor,
	)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

// Delete removes the student with the given ID. It returns false if no
// student with that ID exists.
func (r *StudentsRepository) Delete(id string) (bool, error) {
	res, err := r.db.Exec(`DELETE FROM students WHERE id=$1`, id)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func upsertStudent(tx *sql.Tx, student domain.Student) error {
	_, err := tx.Exec(
		`INSERT INTO students (`+selectColumns+`, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now())
		 ON CONFLICT (id) DO UPDATE SET
		   name=EXCLUDED.name, rarity=EXCLUDED.rarity,
		   weapon_type=EXCLUDED.weapon_type, weapon_cover=EXCLUDED.weapon_cover,
		   role_type=EXCLUDED.role_type, role_class=EXCLUDED.role_class, role_position=EXCLUDED.role_position,
		   school=EXCLUDED.school,
		   combat_attack_type=EXCLUDED.combat_attack_type, combat_defense_type=EXCLUDED.combat_defense_type,
		   terrain_city=EXCLUDED.terrain_city, terrain_outdoor=EXCLUDED.terrain_outdoor, terrain_indoor=EXCLUDED.terrain_indoor,
		   updated_at=now()`,
		student.ID, student.Name, student.Rarity,
		student.Weapon.Type, student.Weapon.Cover,
		student.Role.Type, student.Role.Class, student.Role.Position,
		student.School,
		student.Combat.AttackType, student.Combat.DefenseType,
		student.TerrainAdaptation.City, student.TerrainAdaptation.Outdoor, student.TerrainAdaptation.Indoor,
	)
	return err
}
