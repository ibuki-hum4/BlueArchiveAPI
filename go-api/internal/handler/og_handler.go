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

	outerMargin       = 40.0
	cardCornerRadius  = 26.0
	contentPadX       = 64.0
	contentPadY       = 44.0
	sectionGapY       = 24.0
	headerHeight      = 52.0
	footerHeight      = 112.0
	chipWidth         = 96.0
	chipHeight        = 48.0
	statCardWidth     = 190.0
	statCardHeight    = 88.0
	statCardGap       = 18.0
	footerRightGap    = 28.0
	minFooterURLWidth = 120.0
)

var (
	subtitleFace   = loadPreferredFontFace(36, false)
	subtitleFaceSm = loadPreferredFontFace(32, false)
	titleFace      = loadPreferredFontFace(72, true)
	footerFace     = loadPreferredFontFace(24, false)
	chipFace       = loadPreferredFontFace(24, true)
	pillFace       = loadPreferredFontFace(34, true)
	pillLabelFace  = loadPreferredFontFace(22, false)
)

type OGHandler struct {
	service *service.StudentsService
}

type Box struct {
	X      float64
	Y      float64
	Width  float64
	Height float64
}

func (b Box) Inset(px, py float64) Box {
	return Box{
		X:      b.X + px,
		Y:      b.Y + py,
		Width:  maxFloat(0, b.Width-px*2),
		Height: maxFloat(0, b.Height-py*2),
	}
}

func (b Box) Right() float64 {
	return b.X + b.Width
}

func (b Box) Bottom() float64 {
	return b.Y + b.Height
}

func NewOGHandler(svc *service.StudentsService) *OGHandler {
	return &OGHandler{service: svc}
}

func (h *OGHandler) OG(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	title := limitRunes(strings.TrimSpace(r.URL.Query().Get("title")), 72)
	subtitle := limitRunes(strings.TrimSpace(r.URL.Query().Get("subtitle")), 120)
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
	title = strings.TrimSpace(title)
	subtitle = strings.TrimSpace(subtitle)

	dc := gg.NewContext(ogWidth, ogHeight)

	// Outer background
	dc.SetColor(mustHexColor("#F1F5F9"))
	dc.DrawRectangle(0, 0, ogWidth, ogHeight)
	dc.Fill()

	root := Box{X: 0, Y: 0, Width: ogWidth, Height: ogHeight}
	card := root.Inset(outerMargin, outerMargin)
	content := card.Inset(contentPadX, contentPadY)

	// Main card
	dc.DrawRoundedRectangle(card.X, card.Y, card.Width, card.Height, cardCornerRadius)
	dc.SetColor(mustHexColor("#FFFFFF"))
	dc.Fill()
	dc.DrawRoundedRectangle(card.X, card.Y, card.Width, card.Height, cardCornerRadius)
	dc.SetColor(mustHexColor("#CBD5E1"))
	dc.SetLineWidth(2)
	dc.Stroke()

	centerHeight := maxFloat(120, content.Height-headerHeight-footerHeight-sectionGapY*2)
	sections := columnLayout(content, sectionGapY, []float64{headerHeight, centerHeight, footerHeight})

	drawHeaderRow(dc, sections[0], rarityLabel, weaponType)
	drawCenterRow(dc, sections[1], title, subtitle)
	drawFooterRow(dc, sections[2], city, outdoor, indoor)

	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("Surrogate-Control", "no-store")
	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)
	_ = png.Encode(w, dc.Image())
}

func drawHeaderRow(dc *gg.Context, box Box, rarityLabel, weaponType string) {
	gap := maxFloat(0, box.Width-chipWidth*2)
	chips := rowLayout(box, gap, []float64{chipWidth, chipWidth})
	left := alignMiddle(chips[0], chipHeight)
	right := alignMiddle(chips[1], chipHeight)

	drawChip(dc, left, rarityLabel, "#A855F7", "#FFFFFF")
	drawChip(dc, right, weaponType, "#E2E8F0", "#475569")
}

func drawCenterRow(dc *gg.Context, box Box, title, subtitle string) {
	if box.Height <= 0 || box.Width <= 0 {
		return
	}

	// Clip center block to guarantee no overflow regardless of content length.
	dc.Push()
	dc.DrawRectangle(box.X, box.Y, box.Width, box.Height)
	dc.Clip()

	titleMaxW := box.Width * 0.75
	titleBlockH := 74.0 * 2
	subtitleBlockH := 44.0
	stackGap := 20.0
	stackH := titleBlockH + stackGap + subtitleBlockH
	stackTop := box.Y + maxFloat(0, (box.Height-stackH)/2) + 4
	if stackTop+stackH > box.Bottom() {
		stackTop = box.Bottom() - stackH
	}
	titleBox := Box{X: box.X, Y: stackTop, Width: titleMaxW, Height: titleBlockH}
	subtitleBox := Box{X: box.X, Y: titleBox.Bottom() + stackGap, Width: titleMaxW, Height: subtitleBlockH}

	dc.SetColor(mustHexColor("#0F172A"))
	dc.SetFontFace(titleFace)
	titleLines := wrapTextLines(dc, title, titleBox.Width, 2)
	lineH := 80.0
	for i, line := range titleLines {
		lineBox := Box{X: titleBox.X, Y: titleBox.Y + float64(i)*lineH, Width: titleBox.Width, Height: lineH}
		DrawCenteredText(dc, lineBox, line, titleFace, mustHexColor("#0F172A"))
	}

	subLine := ellipsizeToWidth(dc, subtitle, subtitleBox.Width)
	if subtitleBox.Bottom() <= box.Bottom() {
		DrawCenteredText(dc, subtitleBox, subLine, subtitleFaceSm, mustHexColor("#6B7280"))
	}

	dc.Pop()
}

func drawFooterRow(dc *gg.Context, box Box, city, outdoor, indoor string) {
	if box.Height <= 0 || box.Width <= 0 {
		return
	}

	cardsWidth := statCardWidth*3 + statCardGap*2
	footerCols := rowLayout(box, footerRightGap, []float64{cardsWidth, maxFloat(0, box.Width-cardsWidth-footerRightGap)})

	cardBoxes := rowLayout(footerCols[0], statCardGap, []float64{statCardWidth, statCardWidth, statCardWidth})
	for i := range cardBoxes {
		cardBoxes[i] = alignBottom(cardBoxes[i], statCardHeight)
	}

	drawStatPill(dc, cardBoxes[0], "市街地", city, terrainAccent(city))
	drawStatPill(dc, cardBoxes[1], "屋外", outdoor, terrainAccent(outdoor))
	drawStatPill(dc, cardBoxes[2], "屋内", indoor, terrainAccent(indoor))

	if footerCols[1].Width < minFooterURLWidth {
		return
	}

	urlText := ellipsizeToWidth(dc, "bluearchive-api.skyia.jp", footerCols[1].Width)
	DrawRightText(dc, alignBottom(footerCols[1], statCardHeight), urlText, footerFace, mustHexColor("#94A3B8"), 4)
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

func drawChip(dc *gg.Context, box Box, text, bg, fg string) {
	dc.DrawRoundedRectangle(box.X, box.Y, box.Width, box.Height, 12)
	dc.SetColor(mustHexColor(bg))
	dc.Fill()
	DrawCenteredText(dc, box, ellipsizeToWidth(dc, text, box.Width-18), chipFace, mustHexColor(fg))
}

func drawStatPill(dc *gg.Context, box Box, label, value, accent string) {
	dc.DrawRoundedRectangle(box.X, box.Y, box.Width, box.Height, 12)
	dc.SetColor(mustHexColor("#F1F5F9"))
	dc.Fill()
	dc.DrawRoundedRectangle(box.X, box.Y, box.Width, box.Height, 12)
	dc.SetColor(mustHexColor("#CBD5E1"))
	dc.SetLineWidth(1.5)
	dc.Stroke()

	labelBox := Box{X: box.X, Y: box.Y + 4, Width: box.Width, Height: 28}
	DrawCenteredText(dc, labelBox, label, pillLabelFace, mustHexColor("#64748B"))

	vW := 52.0
	vH := 38.0
	vBox := Box{X: box.X + (box.Width-vW)/2, Y: box.Y + 40, Width: vW, Height: vH}
	dc.DrawRoundedRectangle(vBox.X, vBox.Y, vBox.Width, vBox.Height, 10)
	dc.SetColor(mustHexColor(accent))
	dc.Fill()

	DrawCenteredText(dc, vBox, value, pillFace, mustHexColor("#FFFFFF"))
}

func columnLayout(parent Box, gap float64, heights []float64) []Box {
	boxes := make([]Box, len(heights))
	y := parent.Y
	for i, h := range heights {
		hh := maxFloat(0, h)
		boxes[i] = Box{X: parent.X, Y: y, Width: maxFloat(0, parent.Width), Height: hh}
		y += hh + gap
	}
	return boxes
}

func rowLayout(parent Box, gap float64, widths []float64) []Box {
	boxes := make([]Box, len(widths))
	x := parent.X
	for i, w := range widths {
		ww := maxFloat(0, w)
		boxes[i] = Box{X: x, Y: parent.Y, Width: ww, Height: maxFloat(0, parent.Height)}
		x += ww + gap
	}
	return boxes
}

func alignBottom(box Box, h float64) Box {
	hh := maxFloat(0, h)
	if hh > box.Height {
		hh = box.Height
	}
	return Box{X: box.X, Y: box.Bottom() - hh, Width: box.Width, Height: hh}
}

func alignMiddle(box Box, h float64) Box {
	hh := maxFloat(0, h)
	if hh > box.Height {
		hh = box.Height
	}
	return Box{X: box.X, Y: box.Y + (box.Height-hh)/2, Width: box.Width, Height: hh}
}

func DrawCenteredText(dc *gg.Context, box Box, text string, face font.Face, clr color.Color) {
	dc.SetColor(clr)
	dc.SetFontFace(face)
	dc.DrawStringAnchored(text, box.X+box.Width/2, box.Y+box.Height/2, 0.5, 0.5)
}

func DrawLeftText(dc *gg.Context, box Box, text string, face font.Face, clr color.Color, padding float64) {
	dc.SetColor(clr)
	dc.SetFontFace(face)
	dc.DrawStringAnchored(text, box.X+padding, box.Y+box.Height/2, 0, 0.5)
}

func DrawRightText(dc *gg.Context, box Box, text string, face font.Face, clr color.Color, padding float64) {
	dc.SetColor(clr)
	dc.SetFontFace(face)
	dc.DrawStringAnchored(text, box.Right()-padding, box.Y+box.Height/2, 1, 0.5)
}

func maxFloat(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
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
