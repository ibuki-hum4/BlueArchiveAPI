package handler

import (
	"fmt"
	"image/color"
	"image/png"
	"net/http"
	"os"
	"strconv"
	"strings"

	"bluearchiveapi/go-api/internal/service"

	"github.com/fogleman/gg"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/gobold"
	"golang.org/x/image/font/gofont/goregular"
	"golang.org/x/image/font/opentype"
)

const (
	ogWidth  = 1200
	ogHeight = 630
)

var (
	subtitleFace  = loadPreferredFontFace(36, false)
	titleFace     = loadPreferredFontFace(72, true)
	footerFace    = loadPreferredFontFace(28, false)
	chipFace      = loadPreferredFontFace(24, true)
	pillFace      = loadPreferredFontFace(34, true)
	pillLabelFace = loadPreferredFontFace(22, false)
)

type OGHandler struct {
	service *service.StudentsService
}

func NewOGHandler(svc *service.StudentsService) *OGHandler {
	return &OGHandler{service: svc}
}

func (h *OGHandler) OG(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	title := limitRunes(strings.TrimSpace(r.URL.Query().Get("title")), 42)
	subtitle := limitRunes(strings.TrimSpace(r.URL.Query().Get("subtitle")), 72)
	studentID := strings.TrimSpace(r.URL.Query().Get("id"))

	rarityLabel := "★?"
	weaponType := "-"
	city := "-"
	outdoor := "-"
	indoor := "-"

	if studentID != "" && h.service != nil {
		if st, err := h.service.GetByID(studentID); err == nil && st != nil {
			if title == "" {
				title = limitRunes(strings.TrimSpace(st.Name), 42)
			}
			if subtitle == "" {
				subtitle = limitRunes(strings.TrimSpace(st.School), 72)
			}
			rarityLabel = fmt.Sprintf("★%d", st.Rarity)
			weaponType = limitRunes(strings.TrimSpace(st.Weapon.Type), 8)
			city = normalizeGrade(st.TerrainAdaptation.City)
			outdoor = normalizeGrade(st.TerrainAdaptation.Outdoor)
			indoor = normalizeGrade(st.TerrainAdaptation.Indoor)
		}
	}

	if title == "" {
		title = "Blue Archive API"
	}
	if subtitle == "" {
		subtitle = "ブルーアーカイブの生徒データベース"
	}

	dc := gg.NewContext(ogWidth, ogHeight)

	// Outer background
	dc.SetColor(mustHexColor("#F1F5F9"))
	dc.DrawRectangle(0, 0, ogWidth, ogHeight)
	dc.Fill()

	margin := 40.0
	cardW := float64(ogWidth) - margin*2
	cardH := float64(ogHeight) - margin*2
	radius := 26.0

	// Main card
	dc.DrawRoundedRectangle(margin, margin, cardW, cardH, radius)
	dc.SetColor(mustHexColor("#FFFFFF"))
	dc.Fill()
	dc.DrawRoundedRectangle(margin, margin, cardW, cardH, radius)
	dc.SetColor(mustHexColor("#CBD5E1"))
	dc.SetLineWidth(2)
	dc.Stroke()

	// 3-block layout (header / center / footer), equivalent to column flex + space-between.
	padX := 56.0
	padY := 34.0
	innerX := margin + padX
	innerY := margin + padY
	innerW := cardW - padX*2
	innerH := cardH - padY*2

	headerH := 48.0
	footerH := 104.0
	centerTop := innerY + headerH + 26
	footerY := innerY + innerH - footerH
	centerH := footerY - centerTop - 16
	if centerH < 120 {
		centerH = 120
	}

	// Header row
	drawChip(dc, innerX, innerY, rarityLabel, "#A855F7", "#FFFFFF")
	weaponChipW := 96.0
	drawChip(dc, innerX+innerW-weaponChipW, innerY, weaponType, "#E2E8F0", "#475569")

	// Center row
	titleMaxW := innerW * 0.78
	titleX := innerX
	titleY := centerTop

	dc.SetColor(mustHexColor("#0F172A"))
	dc.SetFontFace(titleFace)
	titleLines := wrapTextLines(dc, title, titleMaxW, 2)
	lineH := 74.0
	for i, line := range titleLines {
		dc.DrawStringAnchored(line, titleX, titleY+float64(i)*lineH, 0, 0)
	}

	subY := titleY + lineH*float64(len(titleLines)) + 14
	if subY > centerTop+centerH-34 {
		subY = centerTop + centerH - 34
	}
	dc.SetColor(mustHexColor("#64748B"))
	dc.SetFontFace(loadPreferredFontFace(32, false))
	subLine := ellipsizeToWidth(dc, subtitle, titleMaxW)
	dc.DrawStringAnchored(subLine, titleX, subY, 0, 0)

	// Footer row
	cardY := footerY + 8
	statW := 190.0
	gap := 18.0
	drawStatPill(dc, innerX, cardY, statW, 88, "市街地", city, terrainAccent(city))
	drawStatPill(dc, innerX+statW+gap, cardY, statW, 88, "屋外", outdoor, terrainAccent(outdoor))
	drawStatPill(dc, innerX+(statW+gap)*2, cardY, statW, 88, "屋内", indoor, terrainAccent(indoor))

	urlAreaX := innerX + (statW+gap)*3 + 28
	urlAreaW := innerX + innerW - urlAreaX
	if urlAreaW > 80 {
		dc.SetColor(mustHexColor("#64748B"))
		dc.SetFontFace(footerFace)
		urlText := ellipsizeToWidth(dc, "bluearchive-api.skyia.jp", urlAreaW)
		dc.DrawStringAnchored(urlText, urlAreaX, footerY+footerH/2+8, 0, 0.5)
	}

	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("Surrogate-Control", "no-store")
	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)
	_ = png.Encode(w, dc.Image())
}

func normalizeGrade(v string) string {
	v = strings.ToUpper(strings.TrimSpace(v))
	if v == "" {
		return "-"
	}
	return v
}

func terrainAccent(grade string) string {
	switch strings.ToUpper(strings.TrimSpace(grade)) {
	case "S":
		return "#10B981"
	case "A":
		return "#3B82F6"
	case "B":
		return "#F59E0B"
	case "C":
		return "#F97316"
	case "D":
		return "#EF4444"
	default:
		return "#94A3B8"
	}
}

func drawChip(dc *gg.Context, x, y float64, text, bg, fg string) {
	dc.DrawRoundedRectangle(x, y, 96, 48, 12)
	dc.SetColor(mustHexColor(bg))
	dc.Fill()
	dc.SetColor(mustHexColor(fg))
	dc.SetFontFace(chipFace)
	dc.DrawStringAnchored(ellipsizeToWidth(dc, text, 78), x+48, y+25, 0.5, 0.5)
}

func drawStatPill(dc *gg.Context, x, y, w, h float64, label, value, accent string) {
	dc.DrawRoundedRectangle(x, y, w, h, 12)
	dc.SetColor(mustHexColor("#F1F5F9"))
	dc.Fill()
	dc.DrawRoundedRectangle(x, y, w, h, 12)
	dc.SetColor(mustHexColor("#CBD5E1"))
	dc.SetLineWidth(1.5)
	dc.Stroke()

	dc.SetColor(mustHexColor("#64748B"))
	dc.SetFontFace(pillLabelFace)
	dc.DrawStringAnchored(label, x+w/2, y+25, 0.5, 0.5)

	dc.DrawRoundedRectangle(x+w/2-26, y+40, 52, 38, 10)
	dc.SetColor(mustHexColor(accent))
	dc.Fill()

	dc.SetColor(mustHexColor("#FFFFFF"))
	dc.SetFontFace(pillFace)
	dc.DrawStringAnchored(value, x+w/2, y+60, 0.5, 0.5)
}

func wrapTextLines(dc *gg.Context, text string, maxWidth float64, maxLines int) []string {
	if maxLines <= 0 {
		return []string{}
	}
	runes := []rune(strings.TrimSpace(text))
	if len(runes) == 0 {
		return []string{""}
	}

	lines := make([]string, 0, maxLines)
	current := make([]rune, 0, len(runes))

	for _, r := range runes {
		if r == '\n' {
			if len(current) == 0 {
				continue
			}
			lines = append(lines, string(current))
			current = current[:0]
			continue
		}

		candidate := append(current, r)
		w, _ := dc.MeasureString(string(candidate))
		if w <= maxWidth || len(current) == 0 {
			current = candidate
			continue
		}

		lines = append(lines, string(current))
		current = []rune{r}
	}

	if len(current) > 0 {
		lines = append(lines, string(current))
	}

	if len(lines) <= maxLines {
		return lines
	}

	trimmed := make([]string, 0, maxLines)
	trimmed = append(trimmed, lines[:maxLines]...)
	trimmed[maxLines-1] = ellipsizeToWidth(dc, trimmed[maxLines-1], maxWidth)
	return trimmed
}

func ellipsizeToWidth(dc *gg.Context, text string, maxWidth float64) string {
	t := strings.TrimSpace(text)
	if t == "" {
		return ""
	}
	if w, _ := dc.MeasureString(t); w <= maxWidth {
		return t
	}
	base := []rune(t)
	for len(base) > 0 {
		base = base[:len(base)-1]
		candidate := strings.TrimSpace(string(base)) + "…"
		if w, _ := dc.MeasureString(candidate); w <= maxWidth {
			return candidate
		}
	}
	return "…"
}

func limitRunes(s string, max int) string {
	if max <= 0 {
		return ""
	}
	runes := []rune(s)
	if len(runes) <= max {
		return s
	}
	return string(runes[:max])
}

func mustLoadFontFace(ttf []byte, size float64) font.Face {
	parsed, err := opentype.Parse(ttf)
	if err != nil {
		panic(err)
	}
	face, err := opentype.NewFace(parsed, &opentype.FaceOptions{
		Size:    size,
		DPI:     72,
		Hinting: font.HintingFull,
	})
	if err != nil {
		panic(err)
	}
	return face
}

func loadPreferredFontFace(size float64, bold bool) font.Face {
	regularCandidates := []string{
		"/usr/share/fonts/noto/NotoSansJP-Regular.ttf",
		"/usr/share/fonts/noto/NotoSansCJK-Regular.ttc",
		"/usr/share/fonts/truetype/noto/NotoSansJP-Regular.ttf",
		"/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
		"/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
	}
	boldCandidates := []string{
		"/usr/share/fonts/noto/NotoSansJP-Bold.ttf",
		"/usr/share/fonts/noto/NotoSansCJK-Bold.ttc",
		"/usr/share/fonts/truetype/noto/NotoSansJP-Bold.ttf",
		"/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
		"/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
	}

	candidates := regularCandidates
	if bold {
		candidates = boldCandidates
	}

	for _, path := range candidates {
		face, err := loadFontFaceFromFile(path, size)
		if err == nil {
			return face
		}
	}

	if bold {
		return mustLoadFontFace(gobold.TTF, size)
	}
	return mustLoadFontFace(goregular.TTF, size)
}

func loadFontFaceFromFile(path string, size float64) (font.Face, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	parsed, err := opentype.Parse(b)
	if err != nil {
		return nil, err
	}
	return opentype.NewFace(parsed, &opentype.FaceOptions{
		Size:    size,
		DPI:     72,
		Hinting: font.HintingFull,
	})
}

func mustHexColor(hex string) color.Color {
	c, err := parseHexColor(hex)
	if err != nil {
		panic(err)
	}
	return c
}

func parseHexColor(hex string) (color.Color, error) {
	s := strings.TrimPrefix(strings.TrimSpace(hex), "#")
	if len(s) != 6 {
		return nil, fmt.Errorf("invalid hex color: %s", hex)
	}

	r, err := strconv.ParseUint(s[0:2], 16, 8)
	if err != nil {
		return nil, err
	}
	g, err := strconv.ParseUint(s[2:4], 16, 8)
	if err != nil {
		return nil, err
	}
	b, err := strconv.ParseUint(s[4:6], 16, 8)
	if err != nil {
		return nil, err
	}

	return color.RGBA{R: uint8(r), G: uint8(g), B: uint8(b), A: 255}, nil
}
