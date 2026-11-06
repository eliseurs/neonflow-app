# Neonflow App — Guia para Claude Code

> Antes de qualquer alteração, leia os arquivos abaixo em ordem.
> Após cada alteração, atualize `.claude/specs.md`.

## Arquivos de referência obrigatórios

| Arquivo | Quando ler |
|---|---|
| `.claude/rules.md` | **Sempre** — regras técnicas e restrições |
| `.claude/design.md` | Ao criar features, rotas, stores ou serviços novos |
| `.claude/style.md` | Ao escrever qualquer código (TS, TSX, CSS) |
| `.claude/specs.md` | Para entender o histórico de mudanças recentes |
| `../neonflow-api/.claude/business-rules/` | Antes de qualquer tela de frota, reservas ou financeiro |
| `../neonflow-api/docs/pendencias.md` | Antes de implementar regra de negócio — 52 itens, 15 bloqueantes |

## Resumo do projeto

**Neonflow App** — frontend React da central de mobilidade do Neon Flow (aluguel de veículos, frota, reservas e transfer na Serra Gaúcha).

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS 3, Zustand 5, React Query 5, axios, React Router 6, sonner
- **Testes**: Vitest + Testing Library (jsdom)
- **API**: `neonflow-api` (Go) em `http://localhost:8080/api` por padrão — repo irmão `../neonflow-api`
- **Produção**: Docker (build Vite + Caddy), Railway
- **Protótipo**: `prototipo/` — demo estática congelada do commit `fdf114ef`, **não editar** (ADR-0003)

### Estado atual

Landing pública em `/` (PT/EN, `src/modules/landing`). Painel da central no mesmo visual da landing: login (`POST /auth/login`), sessão com expiração em Zustand persistido, `ProtectedRoute`, layout com sidebar (abas no celular). Central com contadores do dia; frota (lista, cadastro e edição com diária); reservas (lista por etapa, nova pré-reserva pela disponibilidade, detalhe com conferências, avanço de etapa, cancelamento e histórico), parceiros (proprietário, motorista, indicador) com link e QR de indicação; tudo sobre a API (`/api/vehicles`, `/api/bookings`, `/api/availability`, `/api/partners`). A landing guarda `?ref=CÓDIGO` na visita e manda "Indicação: CÓDIGO" no WhatsApp.

## Comandos úteis

```bash
make help            # lista os comandos
npm run dev          # Vite em http://localhost:5173
npm run build        # typecheck + build de produção
npm test             # Vitest
npm run typecheck    # tsc sem emitir
npm run lint         # ESLint
make check           # typecheck + lint + testes + testes do protótipo
make demo            # protótipo em http://localhost:8080
```

Para rodar com a API local: `cd ../neonflow-api && make up`, depois `npm run dev` aqui.

## Protocolo de alteração

1. Ler `.claude/rules.md` e `.claude/style.md`
2. Fazer as alterações seguindo os padrões
3. Rodar `make check` (o CI do GitHub roda o mesmo, mais o build, em todo PR: `.github/workflows/ci.yml`)
4. Atualizar `.claude/specs.md` com o que foi alterado
