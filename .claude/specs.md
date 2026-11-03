# Specs — Changelog de Alterações

---

## [2026-11-03] — Railway na arquitetura de dois repositórios

- `neonflow-app` (este repo, raiz) passou a publicar o **frontend React**: https://neonflow-app-production.up.railway.app. Variável `VITE_API_BASE_URL` aponta para a API.
- Protótipo movido para o serviço novo `neonflow-prototipo` (upload de `prototipo/`): https://neonflow-prototipo-production.up.railway.app. A URL antiga da demo agora serve o frontend.
- API (`neonflow-api`) e `Postgres` criados no mesmo projeto Railway (`neonflow`).


## [2026-11-03] — Frontend React e separação em dois repositórios

Este repositório (`eliseurs/neonflow-app`) passa a ser o **frontend**; o backend foi para `eliseurs/neonflow-api` (pasta irmã `../neonflow-api`). Padrão do cognia-app/finder-app (ADR-0009) e formato `.claude/` (ADR-0010).

- **Scaffold**: Vite 5 + React 18 + TS + Tailwind 3 + Zustand 5 + React Query 5 + axios + React Router 6 + sonner.
- **Auth**: `LoginPage`, `auth.service` (`/auth/login`, `/auth/me`), `auth.store` (persistido, checa expiração), `ProtectedRoute`, interceptor JWT que limpa a sessão em 401.
- **Layout**: sidebar com Central, Frota e Reservas (placeholders que apontam as pendências).
- **Testes**: 17 testes Vitest (store, interceptors, rotas, login, logout).
- **Deploy**: Dockerfile (Node 22 → Caddy 2), `Caddyfile` com SPA fallback e headers de segurança, `railway.json` (Dockerfile, `watchPatterns`).
- **Protótipo**: movido para `prototipo/` com `dist/`, `server.mjs`, testes e `.openai/`; `README.md` reúne o as-built.
- **Docs**: wiki removida; regras de negócio, ADRs e pendências agora no repo da API. Aqui ficam `docs/deploy-railway.md` e `docs/qualidade/`.

## [2026-11-03] — Demo no Railway

Protótipo publicado em https://neonflow-app-production.up.railway.app (projeto Railway `nexus-os`), com `server.mjs` sem dependências. Basic Auth ativado e depois removido a pedido do time: acesso público.

## [2026-11-03] — Importação do protótipo

Código do commit `fdf114ef` trazido do Drive com hashes conferidos contra o manifesto de 09/10/2026, mais os 12 testes de auditoria.
