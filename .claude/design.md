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
    landing/                    # landing pública PT/EN
    dashboard/pages/            # Central: contadores do dia e agenda
    fleet/                      # model (tipos, placa), services, VehicleForm, FleetPage
    bookings/                   # model (etapas, conferências), services, NewBookingForm, StageBadge, páginas de lista e detalhe
  shared/
    ui/                         # Brand, Heading (Overline, SectionHeading, PageHeader), Button, Field, Panel, Badge, Dialog
    lib/cn.ts                   # clsx + tailwind-merge
    lib/format.ts               # reais ↔ centavos, datas sem fuso
  test/                         # setup, render (renderPage), fixtures fictícias
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
| `/reservas/:id` | BookingDetailPage | `ProtectedRoute` |
| `*` | → `/` (landing) | — |

---

## Identidade visual

Landing e painel seguem a linha LuxuryBus: fundo `noir` `#060606`, texto `bone` `#F9F9F9`, destaque `gold` `#C9A86A` (o dourado do logo) e `gold-soft` `#DCC596`. Fraunces 300 nos títulos, com a segunda metade em itálico dourado; Inter no texto. Tokens em `tailwind.config.ts`; as cores do protótipo (`ink`, `mint`) saíram do app.

Padrões do painel (componentes em `src/shared/ui`):

- Cabeçalho de tela: `PageHeader` (overline dourada com travessão, título serif, acento opcional, ações à direita).
- Superfícies: `Panel` (borda `white/8%`, fundo `white/3%`, raio 14 px).
- Botões em pílula, rótulos em caixa alta com espaçamento largo: `primary` (dourado), `outline`, `ghost`, `danger`.
- Formulários em `Dialog` lateral; campos com `Field` + `inputClass`.
- Etapas da reserva em `Badge` por tom (preparação âmbar, confirmada dourada, em locação verde, finais apagadas).

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
