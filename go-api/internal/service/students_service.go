package service

import (
	"net/http"
	"strings"
	"sync"

	"bluearchiveapi/go-api/internal/apperror"
	"bluearchiveapi/go-api/internal/domain"
	"bluearchiveapi/go-api/internal/storage"
	"bluearchiveapi/go-api/internal/util"
)

const generatedIDLength = 8

type StudentsQuery struct {
	Limit  int
	Page   int
	School string
	Rarity *int
}

type StudentsPage struct {
	Total int
	Count int
	Data  []domain.Student
}

type StudentsService struct {
	repo *storage.StudentsRepository

	cacheMu     sync.RWMutex
	cacheFP     string
	cacheLoaded bool
	cache       []domain.Student
	cacheID     map[string]domain.Student
}

func NewStudentsService(repo *storage.StudentsRepository) *StudentsService {
	return &StudentsService{repo: repo}
}

func (s *StudentsService) List(query StudentsQuery) (StudentsPage, error) {
	all, err := s.getCachedStudents()
	if err != nil {
		return StudentsPage{}, err
	}

	filtered := make([]domain.Student, 0, len(all))
	for _, st := range all {
		if query.School != "" && st.School != query.School {
			continue
		}
		if query.Rarity != nil && st.Rarity != *query.Rarity {
			continue
		}
		filtered = append(filtered, st)
	}

	total := len(filtered)
	start := (query.Page - 1) * query.Limit
	if start > total {
		start = total
	}
	end := start + query.Limit
	if end > total {
		end = total
	}

	pageData := filtered[start:end]
	return StudentsPage{Total: total, Count: len(pageData), Data: pageData}, nil
}

func (s *StudentsService) GetByID(id string) (*domain.Student, error) {
	if _, err := s.getCachedStudents(); err != nil {
		return nil, err
	}

	s.cacheMu.RLock()
	defer s.cacheMu.RUnlock()
	if st, ok := s.cacheID[id]; ok {
		copySt := st
		return &copySt, nil
	}
	return nil, nil
}

// DataFingerprint returns a cheap fingerprint of the underlying data file,
// suitable for use as an HTTP ETag.
func (s *StudentsService) DataFingerprint() (string, error) {
	return s.repo.Fingerprint()
}

// Create adds a new student. If input.ID is empty, a new unique ID is
// generated.
func (s *StudentsService) Create(input domain.Student) (domain.Student, error) {
	if err := input.Validate(); err != nil {
		return domain.Student{}, validationError(err)
	}

	all, err := s.getCachedStudents()
	if err != nil {
		return domain.Student{}, err
	}

	existing := make(map[string]bool, len(all))
	for _, st := range all {
		existing[st.ID] = true
	}

	id := strings.TrimSpace(input.ID)
	if id == "" {
		for {
			candidate := util.GenerateID(generatedIDLength)
			if !existing[candidate] {
				id = candidate
				break
			}
		}
	} else if existing[id] {
		return domain.Student{}, apperror.APIError{
			Status: http.StatusConflict,
			Body: map[string]any{
				"message": "error",
				"error":   "Student ID already exists",
			},
		}
	}
	input.ID = id

	if err := s.repo.Append(input); err != nil {
		return domain.Student{}, err
	}
	s.invalidateCache()
	return input, nil
}

// Update replaces the student with the given ID, preserving that ID. It
// returns nil, nil if no student with that ID exists.
func (s *StudentsService) Update(id string, input domain.Student) (*domain.Student, error) {
	input.ID = id
	if err := input.Validate(); err != nil {
		return nil, validationError(err)
	}

	ok, err := s.repo.Update(input)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, nil
	}
	s.invalidateCache()
	return &input, nil
}

// Delete removes the student with the given ID. It returns false if no
// student with that ID exists.
func (s *StudentsService) Delete(id string) (bool, error) {
	ok, err := s.repo.Delete(id)
	if err != nil {
		return false, err
	}
	if ok {
		s.invalidateCache()
	}
	return ok, nil
}

func validationError(err error) error {
	return apperror.APIError{
		Status: http.StatusBadRequest,
		Body: map[string]any{
			"message": "error",
			"error":   err.Error(),
		},
	}
}

func (s *StudentsService) getCachedStudents() ([]domain.Student, error) {
	fingerprint, err := s.repo.Fingerprint()
	if err != nil {
		return nil, err
	}

	s.cacheMu.RLock()
	if s.cacheLoaded && fingerprint == s.cacheFP {
		cached := s.cache
		s.cacheMu.RUnlock()
		return cached, nil
	}
	s.cacheMu.RUnlock()

	students, err := s.repo.ReadAll()
	if err != nil {
		return nil, err
	}

	indexByID := make(map[string]domain.Student, len(students))
	for _, st := range students {
		indexByID[st.ID] = st
	}

	s.cacheMu.Lock()
	s.cache = students
	s.cacheID = indexByID
	s.cacheFP = fingerprint
	s.cacheLoaded = true
	s.cacheMu.Unlock()

	return students, nil
}

func (s *StudentsService) invalidateCache() {
	s.cacheMu.Lock()
	s.cache = nil
	s.cacheID = nil
	s.cacheFP = ""
	s.cacheLoaded = false
	s.cacheMu.Unlock()
}
