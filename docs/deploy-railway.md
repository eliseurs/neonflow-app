# Deploy no Railway

Projeto Railway: **neonflow** (`58da0777-4fc0-4891-98bd-554ca078557e`), ambiente `production`.

## Serviços (03/11/2026)

| Serviço | Origem | Build | URL |
|---|---|---|---|
| `neonflow-app` | GitHub `eliseurs/neonflow-app` (`main`, raiz) | `Dockerfile` (Vite → Caddy) | https://neonflow-app-production.up.railway.app |
| `neonflow-api` | GitHub `eliseurs/neonflow-api` (`main`) | `Dockerfile` (Go) | https://neonflow-api-production.up.railway.app |
| `neonflow-prototipo` | upload da pasta `prototipo/` (`railway up`) | Railpack (`node server.mjs`) | https://neonflow-prototipo-production.up.railway.app |
| `Postgres` | plugin PostgreSQL | — | interno |

Cada push na `main` deste repo publica o frontend. Os `watchPatterns` do `railway.json` evitam rebuild quando só `prototipo/`, `docs/` ou `.claude/` mudam.

O protótipo **não** está ligado ao GitHub: a CLI do Railway não define Root Directory, então ele sobe por upload da pasta. Como é evidência congelada, isso raramente é necessário:

```bash
railway up prototipo --path-as-root --service neonflow-prototipo --detach
```

Até 03/11/2026 a demo morava em `neonflow-app-production.up.railway.app`. Desde a separação, esse domínio serve o frontend React.

## Variáveis

| Serviço | Variável | Valor |
|---|---|---|
| `neonflow-app` | `VITE_API_BASE_URL` | `https://neonflow-api-production.up.railway.app/api` (embutida no build: mudar exige redeploy) |
| `neonflow-prototipo` | `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` | não definidas: demo pública. Defina para proteger |
| `neonflow-api` | ver `neonflow-api/docs/deploy-railway.md` | |

## Verificar

- Frontend: `/` abre a tela de login. O login funciona com um usuário criado por `create-admin` na API.
- Protótipo: `/healthz` responde `ok`.

## Rollback

**Deployments → deploy anterior → Redeploy.** Para tirar do ar: remova o domínio ou o serviço.

## Prazo

`railway.json` (config as code) foi descontinuado pelo Railway e para de funcionar em **01/12/2026**. Migrar com `railway config migrate` (gera `.railway/railway.ts`).
