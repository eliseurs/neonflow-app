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
    dashboard/pages/            # Central: contadores do dia, agenda, faturamento do mês e ocupação
    fleet/                      # model (tipos, placa), services, VehicleForm, FleetPage
    bookings/                   # model (etapas, conferências), services, NewBookingForm, StageBadge, páginas de lista e detalhe
    checklist/                  # checklist de devolução configurável: model, service, ChecklistManager
        users/                      # gestão de usuários (admin) e troca da própria senha
    partners/                   # parceiros, link e QR de indicação (RN-07; pacote qrcode, gerado no navegador)
    payouts/                    # repasses aos donos, motoristas e comissões dos indicadores (RN-03.12 a 03.14)
    transfers/                  # transfer operado pela central: oferta, aceite, conclusão (RN-02.9 a 02.31)
  shared/
    ui/                         # Brand, Heading (Overline, Accent, SectionHeading, PageHeader), Button, buttonClass, Field, Panel, Badge, Dialog, Reveal
    lib/cn.ts                   # clsx + tailwind-merge
    lib/format.ts               # reais ↔ centavos, datas sem fuso
    lib/useReveal.ts            # revelação ao rolar
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
| `/usuarios` | UsersPage | `ProtectedRoute` (conteúdo só para admin) |
| `*` | → `/` (landing) | — |

---

## Identidade visual

Landing e painel seguem a linha da LuxuryBus (luxurybus.ch/transfer-privato): fundo `noir` `#060606`, texto `bone` `#F9F9F9`, destaque `gold` `#C9A86A` (`gold-light` `#E8CF9E`, `gold-deep` `#8A6F3F`). Fraunces 300 nos títulos com letter-spacing negativo e a segunda metade em itálico com degradê dourado (`.text-gold-grad`, componente `Accent`); Inter no texto. Tokens em `tailwind.config.ts`, utilitários em `src/index.css`.

**Logo** (referência: `nepo/resources/logo.jpg`): anel aberto com a estrada e a seta saindo, e "neon flow" em minúsculas, Poppins 500, dourado `#D4AC62`. Os SVGs foram redesenhados a partir de uma captura de baixa resolução; trocar pelo vetor original quando o fundador enviar. Arquivos em `public/brand/` (símbolo, símbolo para fundo claro, ícone de app), `public/favicon.svg` e `public/apple-touch-icon.png`. O nome é montado em HTML (`Wordmark`), não está no SVG do símbolo.

**Movimento e cliques** (como na referência):

- Cabeçalho fixo, transparente no topo; ao rolar vira cápsula com vidro fosco e largura menor (500 ms, `ease-silk` `cubic-bezier(0.2,0.8,0.2,1)`).
- Menu em painel lateral pela direita, fundo escurecido e desfocado, links grandes em Fraunces entrando em cascata (`animate-rise`), Esc e o fundo fecham.
- Seções e cartões aparecem ao rolar (`Reveal`: opacidade e 18 px, uma vez só, com atraso escalonado); `prefers-reduced-motion` desliga.
- Botão principal `.btn-gold`: degradê, brilho interno, sombra dourada e reflexo que atravessa no hover; sobe 1 px e encolhe ao clicar.
- Links de ação em caixa alta com seta ↗ que abrem espaço no hover (`hover:gap-3`).
- Seletores em segmento (serviço) com a opção ativa em dourado; formulário com ícones nos campos, foco com anel dourado e barra de progresso.
- WhatsApp flutuante verde com pulso, `hover:scale-110`, `active:scale-95`.

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
