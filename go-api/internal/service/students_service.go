package service

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"bluearchiveapi/go-api/internal/domain"
	"bluearchiveapi/go-api/internal/storage"
	"bluearchiveapi/go-api/internal/util"
)

const (
	cacheTTL = 60 * time.Second
)

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

	cacheMu sync.RWMutex
	cacheTS time.Time
	cache   []domain.Student
	cacheID map[string]domain.Student
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
	now := time.Now()

	s.cacheMu.RLock()
	if len(s.cache) > 0 && now.Sub(s.cacheTS) < cacheTTL {
		if st, ok := s.cacheID[id]; ok {
			copySt := st
			s.cacheMu.RUnlock()
			return &copySt, nil
		}
		s.cacheMu.RUnlock()
		return nil, nil
	}
	s.cacheMu.RUnlock()

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

func (s *StudentsService) Create(input domain.Student) (string, error) {
	student := input
	student.Name = strings.TrimSpace(student.Name)
	student.School = strings.TrimSpace(student.School)
	student.ID = util.GenerateID(8)

	if err := s.repo.Append(student); err != nil {
		return "", err
	}

	s.invalidateCache()
	return student.ID, nil
}

func (s *StudentsService) ValidateCreateInput(input domain.Student) error {
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.School) == "" {
		return fmt.Errorf("required fields are missing")
	}
	return nil
}

func (s *StudentsService) getCachedStudents() ([]domain.Student, error) {
	now := time.Now()

	s.cacheMu.RLock()
	if len(s.cache) > 0 && now.Sub(s.cacheTS) < cacheTTL {
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
	s.cacheTS = now
	s.cacheMu.Unlock()

	return students, nil
}

func (s *StudentsService) invalidateCache() {
	s.cacheMu.Lock()
	s.cache = nil
	s.cacheID = nil
	s.cacheTS = time.Time{}
	s.cacheMu.Unlock()
}
