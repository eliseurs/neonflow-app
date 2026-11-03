# Neonflow App

Frontend da central de mobilidade do **Neon Flow** (aluguel de veículos, frota, reservas e transfer na Serra Gaúcha).

React 18 · TypeScript · Vite · Tailwind · Zustand · React Query. API: [`eliseurs/neonflow-api`](https://github.com/eliseurs/neonflow-api).

## Rodar local

```bash
npm install
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:8080/api
npm run dev             # http://localhost:5173
```

A API precisa estar rodando (`make up` no `neonflow-api`).

## Qualidade

```bash
make check              # typecheck + ESLint + Vitest + testes do protótipo
npm run build           # build de produção (Dockerfile serve com Caddy)
```

## Protótipo

[`prototipo/`](prototipo/README.md) guarda a demo estática original (commit `fdf114ef`), congelada como evidência e publicada em https://neonflow-prototipo-production.up.railway.app. `make demo` sobe localmente.

## Documentação

- Para agentes e devs: [`CLAUDE.md`](CLAUDE.md) e [`.claude/`](.claude/CLAUDE.md)
- Deploy: [docs/deploy-railway.md](docs/deploy-railway.md) — frontend em https://neonflow-app-production.up.railway.app
- Regras de negócio, ADRs e pendências ficam no repositório da API
