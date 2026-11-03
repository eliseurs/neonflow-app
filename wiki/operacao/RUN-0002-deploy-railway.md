---
id: RUN-0002
title: Deploy da demonstração no Railway
type: runbook
status: ativo
owner: engenharia
updated: 2026-11-03
related: [ADR-0008]
---

# RUN-0002 — Deploy da demonstração no Railway

## Quando usar

Para publicar ou atualizar a demonstração no Railway ([ADR-0008](../arquitetura/adr/ADR-0008-hospedar-demo-no-railway.md)).

## Pré-requisitos

- Conta no Railway com acesso ao projeto.
- `npm run check` verde.

## Passos

### Opção A — pelo GitHub (recomendada)

1. No Railway: **New Project → Deploy from GitHub repo → `eliseurs/neonflow-app`**.
2. Em **Variables**, defina `BASIC_AUTH_USER` e `BASIC_AUTH_PASSWORD` (recomendado, ver ADR-0008).
3. Em **Settings → Networking**, clique em **Generate Domain**.
4. Cada push na `main` gera um novo deploy.

### Opção B — pela CLI

1. `railway login`
2. `railway init` (cria o projeto) ou `railway link` (usa um existente)
3. `railway variables --set BASIC_AUTH_USER=<usuario> --set BASIC_AUTH_PASSWORD=<senha>`
4. `railway up`
5. `railway domain` para gerar a URL pública.

O Railway lê o `railway.json`: build com Railpack, `node server.mjs`, healthcheck em `/healthz` e reinício em caso de falha.

## Como verificar

- `GET /healthz` responde `ok`.
- A página inicial pede usuário e senha (se as variáveis estiverem definidas) e mostra o selo "Demonstração".
- `GET /.env` e `GET /../package.json` respondem 404.

## Como desfazer

No Railway: **Deployments → deploy anterior → Redeploy**. Para tirar do ar: **Settings → Delete Service** ou remova o domínio.

## Variáveis

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `PORT` | Definida pelo Railway | Porta HTTP |
| `BASIC_AUTH_USER` | Recomendada | Usuário do Basic Auth |
| `BASIC_AUTH_PASSWORD` | Recomendada | Senha do Basic Auth. Nunca commitar |
