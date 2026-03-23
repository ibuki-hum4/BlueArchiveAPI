# syntax=docker/dockerfile:1.7

FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile

FROM base AS runner
ENV NODE_ENV=production \
    PORT=8787

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json server.tsx ./
COPY fonts ./fonts

EXPOSE 8787

CMD ["bun", "run", "start"]
