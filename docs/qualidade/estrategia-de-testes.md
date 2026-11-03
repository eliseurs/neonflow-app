# Estratégia de testes

## Hoje

| Camada | Onde | O que cobre | Comando |
|---|---|---|---|
| Frontend | `src/**/*.test.{ts,tsx}` | 17 testes: sessão, interceptors, rotas protegidas, login, logout | `npm test` |
| Protótipo — regressão | `prototipo/tests/legacy/03_TESTES.cjs` | 12 cenários de 09/10/2026 em Node `vm` (hash conferido com o manifesto) | `make test-prototipo` |
| Protótipo — servidor | `prototipo/tests/server.test.mjs` | 6 testes do `server.mjs` (index, tipos, healthcheck, travessia, métodos, Basic Auth) | `make test-prototipo` |
| API | `../neonflow-api` | unitários + integração (build tag `integration`) | `make test`, `make test-integration` |

Quatro cenários do protótipo (CT-09 a CT-12) **reproduzem defeitos**: "PASS" significa que o defeito continua presente. A correção acontece na API, não no protótipo ([TC-0001](TC-0001-ciclo-de-locacao-prototipo.md)).

## Alvo

1. **Unitários** das regras de domínio na API (RN-01 e RN-02), meta de 80% em `internal/`.
2. **Integração** com banco: bloqueio atômico de período (PEN-24) e idempotência.
3. **Componentes** do frontend com Vitest + Testing Library.
4. **E2E** dos cenários críticos do TC-0001 em navegador, mobile e desktop.
5. **Acessibilidade** (WCAG 2.2 AA) e QA visual (PEN-51).

Antes de PR: `make check` aqui e `make lint test` na API. Gate de regressão: `trinca-toolbox:regression-gate`.
