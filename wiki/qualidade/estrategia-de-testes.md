---
id: QA-ESTRATEGIA
title: Estratégia de testes
type: page
status: ativo
owner: qa
updated: 2026-11-03
related: [PEN-31, PEN-51]
---

# Estratégia de testes

## Hoje

| Camada | O que existe | Comando |
| --- | --- | --- |
| Regressão do protótipo | 12 cenários em Node `vm` com DOM simulado, sem navegador nem rede (`tests/legacy/03_TESTES.cjs`, hash conferido com o manifesto de 09/10) | `npm test` |
| Servidor (Railway) | 6 testes de `server.mjs`: index, tipos, healthcheck, travessia, métodos, Basic Auth (`tests/server.test.mjs`) | `npm run test:server` |
| Documentação | Frontmatter, IDs, links e referências | `npm run wiki:validate` |

Quatro cenários (CT-09 a CT-12) **reproduzem defeitos**: "PASS" ali significa que o defeito continua presente. Quando a [SPEC-0002](../specs/SPEC-0002-reserva-persistente.md) corrigir esses comportamentos no produto novo, os cenários equivalentes passam a afirmar o comportamento correto.

## Alvo (pirâmide)

1. **Unitários** das regras de domínio (RN-0001 a RN-0006), na stack definida em PEN-40.
2. **Integração** com banco e concorrência (bloqueio atômico, idempotência).
3. **Contrato** com Shell/Nexus ([integracoes.md](../arquitetura/integracoes.md)).
4. **E2E** dos cenários críticos do [TC-0001](TC-0001-ciclo-de-locacao-prototipo.md) em navegador, mobile e desktop.
5. **Acessibilidade** (WCAG 2.2 AA) e QA visual (PEN-51).

O gate antes de PR roda os cenários críticos (`trinca-toolbox:regression-gate`).
