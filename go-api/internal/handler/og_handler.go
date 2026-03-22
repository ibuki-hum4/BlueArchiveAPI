package handler

import (
	"fmt"
	"image/color"
	"image/png"
	"net/http"
	"strconv"
	"strings"

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
	subtitleFace = mustLoadFontFace(goregular.TTF, 36)
	titleFace    = mustLoadFontFace(gobold.TTF, 88)
	footerFace   = mustLoadFontFace(goregular.TTF, 28)
	chipFace     = mustLoadFontFace(gobold.TTF, 24)
	pillFace     = mustLoadFontFace(gobold.TTF, 34)
	pillLabelFace = mustLoadFontFace(goregular.TTF, 22)
)

type OGHandler struct{}

func NewOGHandler() *OGHandler {
	return &OGHandler{}
}

func (h *OGHandler) OG(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	title := limitRunes(strings.TrimSpace(r.URL.Query().Get("title")), 60)
	subtitle := limitRunes(strings.TrimSpace(r.URL.Query().Get("subtitle")), 120)

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

	contentX := margin + 56

	// Header chips inspired by in-app student card visual language
	drawChip(dc, contentX, margin+34, "★2", "#A855F7", "#FFFFFF")
	drawChip(dc, contentX+760, margin+34, "SMG", "#E2E8F0", "#475569")

	// Main title and subtitle
	dc.SetColor(mustHexColor("#0F172A"))
	dc.SetFontFace(titleFace)
	dc.DrawStringWrapped(title, contentX, margin+125, 0, 0, cardW-112, 1.12, gg.AlignLeft)

	dc.SetColor(mustHexColor("#64748B"))
	dc.SetFontFace(subtitleFace)
	dc.DrawStringWrapped(subtitle, contentX, margin+235, 0, 0, cardW-112, 1.2, gg.AlignLeft)

	// Bottom stat pills for clear visual change
	pillY := margin + cardH - 122
	drawStatPill(dc, contentX, pillY, 190, 88, "市街地", "A", "#3B82F6")
	drawStatPill(dc, contentX+220, pillY, 190, 88, "屋外", "D", "#EF4444")
	drawStatPill(dc, contentX+440, pillY, 190, 88, "屋内", "A", "#3B82F6")

	drawFooter(dc)

	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("Surrogate-Control", "no-store")
	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)
	_ = png.Encode(w, dc.Image())
}

func drawFooter(dc *gg.Context) {
	const (
		circleX = 110.0
		circleY = 560.0
		radius  = 24.0
	)

	dc.SetColor(mustHexColor("#F1F5F9"))
	dc.DrawCircle(circleX, circleY, radius)
	dc.Fill()

	dc.SetColor(mustHexColor("#3B82F6")) // Vivid blue matching the button accents in the UI
	dc.SetLineWidth(3)
	dc.DrawCircle(circleX-2, circleY-2, 10)
	dc.Stroke()
	dc.DrawLine(circleX+6, circleY+6, circleX+14, circleY+14)
	dc.Stroke()

	dc.SetColor(mustHexColor("#64748B"))
	dc.SetFontFace(footerFace)
	dc.DrawStringAnchored("bluearchive-api.skyia.jp", circleX+40, circleY, 0, 0.5)
}

func drawChip(dc *gg.Context, x, y float64, text, bg, fg string) {
	dc.DrawRoundedRectangle(x, y, 96, 48, 12)
	dc.SetColor(mustHexColor(bg))
	dc.Fill()
	dc.SetColor(mustHexColor(fg))
	dc.SetFontFace(chipFace)
	dc.DrawStringAnchored(text, x+48, y+25, 0.5, 0.5)
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
