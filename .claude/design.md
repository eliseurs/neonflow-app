# Design & Arquitetura — Neonflow App

## Visão Geral

Painel da **central de mobilidade** do Neon Flow: frota, reservas e ciclo de locação. Usuários atuais: papéis `admin` e `central` (RN-05.3). Perfis de cliente, motorista e parceiro dependem de PEN-14.

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18, TypeScript, Tailwind CSS 3, lucide-react, sonner |
| Estado | Zustand 5 (sessão), React Query 5 (servidor) |
| HTTP | axios com interceptors JWT |
| Rotas | React Router 6 |
| Build | Vite 5 (SWC) |
| Testes | Vitest + Testing Library (jsdom) |
| Produção | Caddy 2 (SPA fallback, `$PORT`, headers de segurança) |

Decisão: ADR-0009 (em `../neonflow-api/docs/adr/`). Mesma stack do cognia-app e finder-app.

---

## Estrutura

```
src/
  main.tsx
  index.css                     # Tailwind + fontes
  app/
    App.tsx                     # QueryClient + Router + Toaster
    routes/                     # AppRoutes, ProtectedRoute
    providers/api/client.ts     # axiosInstance, apiClient, apiErrorMessage
    layout/AppLayout.tsx        # sidebar + carrega /auth/me
  modules/
    auth/                       # LoginPage, auth.service, auth.store, auth.types
    dashboard/pages/            # Central (placeholder)
    fleet/pages/                # Frota (placeholder)
    bookings/pages/             # Reservas (placeholder)
  shared/
    ui/PlaceholderPage.tsx
    lib/cn.ts                   # clsx + tailwind-merge
  test/setup.ts
prototipo/                      # demo estática congelada (ver prototipo/README.md)
docs/                           # deploy, qualidade
```

---

## Rotas

| Rota | Página | Proteção |
|---|---|---|
| `/` | LandingPage | pública (PT/EN) |
| `/login` | LoginPage | pública (redireciona para `/central` se já autenticado) |
| `/central` | DashboardPage | `ProtectedRoute` |
| `/frota` | FleetPage | `ProtectedRoute` |
| `/reservas` | BookingsPage | `ProtectedRoute` |
| `*` | → `/` (landing) | — |

---

## Identidade visual

Herdada do protótipo: fundo `ink` `#101b25`, superfícies `ink-soft` `#16232f`, linhas `ink-line` `#22313e`, destaque `mint` `#6cedc4`. Fontes DM Sans (texto) e Manrope (títulos). Tokens em `tailwind.config.ts`.

A landing pública segue a linha LuxuryBus: `noir` `#060606`, `bone`, `gold` `#C9A86A` (o dourado do logo), Fraunces 300 nos títulos (segunda metade em itálico dourado) e Inter no texto.

---

## Variáveis

| Variável | Uso |
|---|---|
| `VITE_API_BASE_URL` | URL da API com `/api`. Embutida no build. Default `http://localhost:8080/api` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp da central (só dígitos, com DDI). Vazio desativa os botões de WhatsApp da landing |

---

## Railway

| Serviço | Origem | Build | Healthcheck / URL |
|---|---|---|---|
| `neonflow-app` (frontend) | `/` (GitHub) | Dockerfile (Caddy) | `/` — https://neonflow-app-hml.up.railway.app |
| `neonflow-prototipo` | upload de `prototipo/` | Railpack (`node server.mjs`) | `/healthz` — https://neonflow-prototipo-production.up.railway.app |

Runbook: `docs/deploy-railway.md`.
