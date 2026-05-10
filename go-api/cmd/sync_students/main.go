package main

import (
    "database/sql"
    "encoding/json"
    "errors"
    "flag"
    "fmt"
    "io/ioutil"
    "os"
    "strings"

    _ "github.com/jackc/pgx/v5/stdlib"
)

type Student struct {
    ID                string            `json:"id"`
    Name              string            `json:"name"`
    Rarity            int               `json:"rarity"`
    Weapon            Weapon            `json:"weapon"`
    Role              Role              `json:"role"`
    School            string            `json:"school"`
    Combat            Combat            `json:"combat"`
    TerrainAdaptation map[string]string `json:"terrainAdaptation"`
}

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

func main() {
    var jsonPath string
    var dryRun bool
    var apply bool

    flag.StringVar(&jsonPath, "json", "manifests/data/students.json", "path to students.json")
    flag.BoolVar(&dryRun, "dry-run", true, "print SQL instead of applying")
    flag.BoolVar(&apply, "apply", false, "apply to database (requires DATABASE_URL env)")
    flag.Parse()

    if apply && dryRun {
        fmt.Fprintln(os.Stderr, "--apply overrides --dry-run")
        dryRun = false
    }

    data, err := ioutil.ReadFile(jsonPath)
    if err != nil {
        fatal(err)
    }

    var students []Student
    if err := json.Unmarshal(data, &students); err != nil {
        fatal(err)
    }

    ddl := generateDDL()

    var b strings.Builder
    b.WriteString(ddl)
    b.WriteString("\n")

    for _, s := range students {
        b.WriteString(generateUpsert(s))
        b.WriteString("\n")
    }

    sqlAll := b.String()

    if dryRun && !apply {
        fmt.Println(sqlAll)
        return
    }

    if apply {
        dbURL := os.Getenv("DATABASE_URL")
        if dbURL == "" {
            fatal(errors.New("DATABASE_URL not set"))
        }
        db, err := sql.Open("pgx", dbURL)
        if err != nil {
            fatal(err)
        }
        defer db.Close()

        if _, err := db.Exec(sqlAll); err != nil {
            fatal(err)
        }
        fmt.Println("Applied SQL to database")
        return
    }
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
);
`
}

func quoteString(s string) string {
    s = strings.ReplaceAll(s, "'", "''")
    return "'" + s + "'"
}

func generateUpsert(s Student) string {
    // normalize terrain
    city := s.TerrainAdaptation["city"]
    outdoor := s.TerrainAdaptation["outdoor"]
    indoor := s.TerrainAdaptation["indoor"]

    return fmt.Sprintf(
        "INSERT INTO students (id,name,rarity,weapon_type,weapon_cover,role_type,role_class,role_position,school,combat_attack_type,combat_defense_type,terrain_city,terrain_outdoor,terrain_indoor,updated_at) VALUES (%s,%s,%d,%s,%t,%s,%s,%s,%s,%s,%s,%s,%s,%s,now()) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, rarity=EXCLUDED.rarity, weapon_type=EXCLUDED.weapon_type, weapon_cover=EXCLUDED.weapon_cover, role_type=EXCLUDED.role_type, role_class=EXCLUDED.role_class, role_position=EXCLUDED.role_position, school=EXCLUDED.school, combat_attack_type=EXCLUDED.combat_attack_type, combat_defense_type=EXCLUDED.combat_defense_type, terrain_city=EXCLUDED.terrain_city, terrain_outdoor=EXCLUDED.terrain_outdoor, terrain_indoor=EXCLUDED.terrain_indoor, updated_at=now();",
        quoteString(s.ID),
        quoteString(s.Name),
        s.Rarity,
        quoteString(s.Weapon.Type),
        s.Weapon.Cover,
        quoteString(s.Role.Type),
        quoteString(s.Role.Class),
        quoteString(s.Role.Position),
        quoteString(s.School),
        quoteString(s.Combat.AttackType),
        quoteString(s.Combat.DefenseType),
        quoteString(city),
        quoteString(outdoor),
        quoteString(indoor),
    )
}

func fatal(err error) {
    fmt.Fprintln(os.Stderr, "error:", err)
    os.Exit(1)
}
