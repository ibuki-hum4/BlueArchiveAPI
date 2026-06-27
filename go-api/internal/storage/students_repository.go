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

	"bluearchiveapi/go-api/internal/domain"
)

type StudentsRepository struct{}

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
	path, err := resolveStudentsFilePath()
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

func resolveStudentsFilePath() (string, error) {
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

	return filepath.Join(candidateDirs[0], "students.json"), nil
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

func fingerprintBytes(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}
