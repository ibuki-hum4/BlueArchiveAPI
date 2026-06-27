package domain

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
