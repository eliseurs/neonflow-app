# ── Stage 1: build (Vite) ─────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL é embutido no bundle em tempo de build (import.meta.env).
# No Railway, defina como variável do serviço apontando para a URL pública da API + /api.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# WhatsApp da central (só dígitos, com DDI). Vazio desativa os botões de WhatsApp da landing.
ARG VITE_WHATSAPP_NUMBER=""
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

RUN npm run build

# ── Stage 2: serve (Caddy, com fallback SPA) ──────────────────────────────────
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
