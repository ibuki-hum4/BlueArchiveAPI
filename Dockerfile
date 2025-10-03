# syntax=docker/dockerfile:1.7

## ベースイメージはDebianベースの node:22-slim を利用（Next.jsのバイナリ互換性を確保）
FROM node:22-slim AS base
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

## 依存関係インストール用ステージ
FROM base AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

## ビルドステージ
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .
COPY data ./data
RUN npm run build \
    && npm prune --omit=dev

## ランタイムステージ
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# 生成物と必要ファイルのみコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# APIで使用するデータファイルを含める
COPY data ./data

EXPOSE 3000

CMD ["npm", "run", "start"]