# OGP Renderer Service

Satori + Resvg を使って OGP 画像を生成する Bun + TypeScript (TSX) マイクロサービスです。

## 1) フォント配置

`fonts/` に以下を配置してください。

- `BIZUDPGothic-Regular.ttf` または `BIZUDPGothicR.ttf` または `BIZ-UDPGothicR.ttc`
- `BIZUDPGothic-Bold.ttf` または `BIZUDPGothicB.ttf` または `BIZ-UDPGothicB.ttc`

## 2) 起動

```bash
cd og-renderer
bun install
bun run start
```

既定で `http://localhost:8787` で起動します。

開発時は以下を使用できます。

```bash
bun run dev
```

## 2.1) Docker で起動

```bash
cd og-renderer
docker build -t bluearchive-og-renderer:latest .
docker run --rm -p 8787:8787 \
	-e OGP_FONT_REGULAR_PATH=/app/fonts/BIZUDPGothic-Regular.ttf \
	-e OGP_FONT_BOLD_PATH=/app/fonts/BIZUDPGothic-Bold.ttf \
	-v $(pwd)/fonts:/app/fonts:ro \
	bluearchive-og-renderer:latest
```

Windows PowerShell では次を使用できます。

```powershell
cd og-renderer
docker build -t bluearchive-og-renderer:latest .
docker run --rm -p 8787:8787 `
	-e OGP_FONT_REGULAR_PATH=/app/fonts/BIZUDPGothic-Regular.ttf `
	-e OGP_FONT_BOLD_PATH=/app/fonts/BIZUDPGothic-Bold.ttf `
	-v "${PWD}/fonts:/app/fonts:ro" `
	bluearchive-og-renderer:latest
```

## 3) API

`POST /render` に JSON を渡すと `image/png` を返します。

## 4) 環境変数

- `PORT` (default: `8787`)
- `OGP_FOOTER_URL` (default: `bluearchive-api.skyia.jp`)
- `OGP_FONT_REGULAR_PATH` (任意: BIZ UDPGothic Regular の絶対パス)
- `OGP_FONT_BOLD_PATH` (任意: BIZ UDPGothic Bold の絶対パス)
