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
	gradient := gg.NewLinearGradient(0, 0, ogWidth, ogHeight)
	gradient.AddColorStop(0.0, mustHexColor("#2563EB"))
	gradient.AddColorStop(0.6, mustHexColor("#7C3AED"))
	gradient.AddColorStop(1.0, mustHexColor("#F43F5E"))
	dc.SetFillStyle(gradient)
	dc.DrawRectangle(0, 0, ogWidth, ogHeight)
	dc.Fill()

	dc.SetRGBA(1, 1, 1, 0.85)
	dc.SetFontFace(subtitleFace)
	dc.DrawStringAnchored(subtitle, 80, 135, 0, 0.5)

	dc.SetRGB(1, 1, 1)
	dc.SetFontFace(titleFace)
	dc.DrawStringWrapped(title, 80, 260, 0, 0, 1040, 1.1, gg.AlignLeft)

	drawFooter(dc)

	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)
	_ = png.Encode(w, dc.Image())
}

func drawFooter(dc *gg.Context) {
	const (
		circleX = 104.0
		circleY = 560.0
		radius  = 24.0
	)

	dc.SetRGBA(1, 1, 1, 0.16)
	dc.DrawCircle(circleX, circleY, radius)
	dc.Fill()

	dc.SetRGBA(1, 1, 1, 0.95)
	dc.SetLineWidth(3)
	dc.DrawCircle(circleX-2, circleY-2, 10)
	dc.Stroke()
	dc.DrawLine(circleX+6, circleY+6, circleX+14, circleY+14)
	dc.Stroke()

	dc.SetRGBA(1, 1, 1, 0.9)
	dc.SetFontFace(footerFace)
	dc.DrawStringAnchored("bluearchive-api.skyia.jp", 140, 568, 0, 0.5)
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
