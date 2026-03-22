package storage

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"bluearchiveapi/go-api/internal/domain"
)

type StudentsRepository struct {
	mu sync.Mutex
}

func NewStudentsRepository() *StudentsRepository {
	return &StudentsRepository{}
}

func (r *StudentsRepository) ReadAll() ([]domain.Student, error) {
	path, err := resolveStudentsFilePath(false)
	if err != nil {
		return nil, err
	}

	b, err := os.ReadFile(path)
	if err != nil {
		return []domain.Student{}, nil
	}
	if len(bytes.TrimSpace(b)) == 0 {
		return []domain.Student{}, nil
	}

	var students []domain.Student
	if err := json.Unmarshal(b, &students); err != nil {
		return nil, err
	}
	return students, nil
}

func (r *StudentsRepository) Append(student domain.Student) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	students, err := r.ReadAll()
	if err != nil {
		return err
	}
	students = append(students, student)

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
