# CLAUDE.md — neonflow-app

Neon Flow: vertical de aluguel de veículos, frota, reservas e transfer do Nexus OS (Serra Gaúcha).
Hoje o repositório tem um **protótipo estático de demonstração** e a wiki do projeto. Não há backend.

## Knowledge base (soberana)

@wiki/CLAUDE.md

A wiki vence o conhecimento genérico e as skills do toolbox em identidade, glossário, regras de negócio e decisões.
Pendências abertas: `wiki/gestao/pendencias.md` (52, sendo 15 bloqueantes).

## Estrutura

```
dist/            protótipo estático (commit fdf114ef). Evidência congelada: não editar (ADR-0003)
tests/legacy/    12 cenários de 09/10/2026, hash conferido. Não editar
wiki/            docs-as-code: produto, negócio (RN), specs, arquitetura (ADR), qualidade (TC), gestão (PEN)
tests/           server.test.mjs (testes do servidor)
scripts/         validate-wiki.mjs
server.mjs       servidor estático sem dependências (Railway e local). Serve só dist/ (ADR-0008)
railway.json     build Railpack, start, healthcheck /healthz
.openai/         identidade do site publicado (Sites). Não alterar
.claude/         settings e comandos do projeto
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm test` | 12 cenários legados (4 reproduzem defeitos conhecidos: PASS = defeito presente) + 6 testes do servidor |
| `npm run wiki:validate` | Valida frontmatter, IDs, links e referências cruzadas da wiki |
| `npm run check` | Os dois acima |
| `npm start` / `npm run demo` | Serve `dist/` em http://localhost:8080 (`PORT` configurável) |

Deploy no Railway: `wiki/operacao/RUN-0002-deploy-railway.md`. Defina `BASIC_AUTH_USER` e `BASIC_AUTH_PASSWORD` no Railway para não deixar a demo pública. Nunca commite esses valores.

Comandos do Claude Code: `/pendencias`, `/nova-adr`, `/nova-rn`, `/nova-spec`, `/demo`.

## Regras do projeto

- **Não implemente funcionalidade de produto sem autorização** (PEN-52) e sem uma SPEC fora do status `bloqueada`.
- **Não invente** tarifa, percentual, prazo, regra ou termo. Sem fonte, registre uma pendência.
- Toda mudança de comportamento cita a RN ou a SPEC. Toda decisão estrutural vira ADR.
- Depois de editar `wiki/`, rode `npm run wiki:validate`. Antes de concluir qualquer tarefa, rode `npm run check`.
- Dados de exemplo são sempre fictícios. Nunca coloque CNH, documento ou contato real em código, teste ou wiki.
- Commits em português, no formato Conventional Commits (`docs(wiki): ...`, `test: ...`).
- Sem push, deploy ou publicação no site sem confirmação explícita.
