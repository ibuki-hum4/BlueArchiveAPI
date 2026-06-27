package storage

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"bluearchiveapi/go-api/internal/domain"
)

type StudentsRepository struct {
	mu sync.RWMutex
}

func NewStudentsRepository() *StudentsRepository {
	return &StudentsRepository{}
}

// Fingerprint returns a cheap fingerprint of the underlying data file.
func (r *StudentsRepository) Fingerprint() (string, error) {
	_, fingerprint, err := r.ReadSnapshot()
	return fingerprint, err
}

func (r *StudentsRepository) ReadAll() ([]domain.Student, error) {
	students, _, err := r.ReadSnapshot()
	return students, err
}

func (r *StudentsRepository) ReadSnapshot() ([]domain.Student, string, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.readSnapshotLocked()
}

func (r *StudentsRepository) readSnapshotLocked() ([]domain.Student, string, error) {
	path, err := resolveStudentsFilePath(false)
	if err != nil {
		return nil, "", err
	}

	b, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return []domain.Student{}, "", nil
		}
		return nil, "", err
	}
	if len(bytes.TrimSpace(b)) == 0 {
		return []domain.Student{}, fingerprintBytes(b), nil
	}

	var students []domain.Student
	if err := json.Unmarshal(b, &students); err != nil {
		return nil, "", err
	}
	return students, fingerprintBytes(b), nil
}

// WriteAll replaces the entire dataset with the given students.
func (r *StudentsRepository) WriteAll(students []domain.Student) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.writeAllLocked(students)
}

func (r *StudentsRepository) Append(student domain.Student) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	students, _, err := r.readSnapshotLocked()
	if err != nil {
		return err
	}
	students = append(students, student)
	return r.writeAllLocked(students)
}

// Update replaces the student with a matching ID. It returns false if no
// student with that ID exists.
func (r *StudentsRepository) Update(student domain.Student) (bool, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	students, _, err := r.readSnapshotLocked()
	if err != nil {
		return false, err
	}

	found := false
	for i, st := range students {
		if st.ID == student.ID {
			students[i] = student
			found = true
			break
		}
	}
	if !found {
		return false, nil
	}
	return true, r.writeAllLocked(students)
}

// Delete removes the student with the given ID. It returns false if no
// student with that ID exists.
func (r *StudentsRepository) Delete(id string) (bool, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	students, _, err := r.readSnapshotLocked()
	if err != nil {
		return false, err
	}

	idx := -1
	for i, st := range students {
		if st.ID == id {
			idx = i
			break
		}
	}
	if idx == -1 {
		return false, nil
	}
	students = append(students[:idx], students[idx+1:]...)
	return true, r.writeAllLocked(students)
}

func (r *StudentsRepository) writeAllLocked(students []domain.Student) error {
	path, err := resolveStudentsFilePath(true)
	if err != nil {
		return err
	}

	b, err := json.MarshalIndent(students, "", "    ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, b, 0o644)
}

func resolveStudentsFilePath(ensureForWrite bool) (string, error) {
	if explicit := strings.TrimSpace(os.Getenv("STUDENTS_DATA_PATH")); explicit != "" {
		return explicit, nil
	}

	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}

	candidateDirs := []string{
		filepath.Join("/app", "data"),
		filepath.Join(cwd, "data"),
		filepath.Join(cwd, "..", "data"),
		filepath.Join(cwd, "..", "frontend", "src", "data"),
		filepath.Join(cwd, "..", "manifests", "data"),
		filepath.Join(cwd, ".vercel", "project", "data"),
	}

	for _, dir := range candidateDirs {
		candidate := filepath.Join(dir, "students.json")
		if fileExists(candidate) {
			return candidate, nil
		}
	}

	if ensureForWrite {
		for _, dir := range candidateDirs {
			if dirExists(dir) {
				return filepath.Join(dir, "students.json"), nil
			}
		}

		fallbackDir := filepath.Join(cwd, "data")
		if err := os.MkdirAll(fallbackDir, 0o755); err != nil {
			return "", err
		}
		return filepath.Join(fallbackDir, "students.json"), nil
	}

	return filepath.Join(candidateDirs[0], "students.json"), nil
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

func dirExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.IsDir()
}

func fingerprintBytes(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}
