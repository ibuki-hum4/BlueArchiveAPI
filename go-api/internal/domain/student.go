package domain

import "strings"

type Weapon struct {
	Type  string `json:"type"`
	Cover bool   `json:"cover"`
}

type Role struct {
	Type     string `json:"type"`
	Class    string `json:"class"`
	Position string `json:"position"`
}

type Combat struct {
	AttackType  string `json:"attackType"`
	DefenseType string `json:"defenseType"`
}

type TerrainAdaptation struct {
	City    string `json:"city"`
	Outdoor string `json:"outdoor"`
	Indoor  string `json:"indoor"`
}

type Student struct {
	ID                string            `json:"id"`
	Name              string            `json:"name"`
	Rarity            int               `json:"rarity"`
	Weapon            Weapon            `json:"weapon"`
	Role              Role              `json:"role"`
	School            string            `json:"school"`
	Combat            Combat            `json:"combat"`
	TerrainAdaptation TerrainAdaptation `json:"terrainAdaptation"`
}

// ValidationError indicates that one or more required fields are missing or
// invalid.
type ValidationError struct {
	Fields []string
}

func (e *ValidationError) Error() string {
	return "validation failed: missing or invalid fields: " + strings.Join(e.Fields, ", ")
}

// Validate checks that the student has all required fields populated.
func (s Student) Validate() error {
	var missing []string

	if strings.TrimSpace(s.Name) == "" {
		missing = append(missing, "name")
	}
	if s.Rarity < 1 || s.Rarity > 3 {
		missing = append(missing, "rarity")
	}
	if strings.TrimSpace(s.School) == "" {
		missing = append(missing, "school")
	}
	if strings.TrimSpace(s.Weapon.Type) == "" {
		missing = append(missing, "weapon.type")
	}
	if strings.TrimSpace(s.Role.Type) == "" {
		missing = append(missing, "role.type")
	}
	if strings.TrimSpace(s.Role.Class) == "" {
		missing = append(missing, "role.class")
	}
	if strings.TrimSpace(s.Role.Position) == "" {
		missing = append(missing, "role.position")
	}
	if strings.TrimSpace(s.Combat.AttackType) == "" {
		missing = append(missing, "combat.attackType")
	}
	if strings.TrimSpace(s.Combat.DefenseType) == "" {
		missing = append(missing, "combat.defenseType")
	}

	if len(missing) > 0 {
		return &ValidationError{Fields: missing}
	}
	return nil
}
