# syntax=docker/dockerfile:1.7

# ==========================================================
# 🧱 Base: Bun 環境
# ==========================================================
FROM oven/bun:latest AS base
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# ==========================================================
# 📦 Dependencies: パッケージインストール専用
# ==========================================================
FROM base AS deps
WORKDIR /app
# package-lock.json may not exist in this repo; copy only package.json
COPY frontend/package.json ./
# Use Bun to install dependencies from package.json
RUN bun install

# ==========================================================
# 🏗️ Build: Next.js プロジェクトをビルド
# ==========================================================
FROM deps AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY frontend/ ./
COPY data ./data

# Next.js ビルド
RUN bun run build && bun prune --omit=dev

# ==========================================================
# 🚀 Runtime: 実行ステージ（最小構成）
# ==========================================================
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# 生成物と必要ファイルのみコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["bun", "run", "start"]