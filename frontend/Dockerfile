# ── Stage 1: Install dependencies ──
FROM node:18-bullseye-slim AS deps
WORKDIR /usr/app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build the Next.js app ──
FROM node:18-bullseye-slim AS builder
WORKDIR /usr/app
RUN npm install -g pnpm

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

COPY --from=deps /usr/app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ── Stage 3: Production runner (minimal) ──
FROM node:18-bullseye-slim AS runner
WORKDIR /usr/app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copy standalone server + static/public assets from builder
COPY --from=builder /usr/app/.next/standalone ./
COPY --from=builder /usr/app/.next/static ./.next/static
COPY --from=builder /usr/app/public ./public

EXPOSE 3000
USER node
CMD ["node", "server.js"]