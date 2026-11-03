---
id: RN-0005
title: Cancelamento libera o período
type: rn
status: prototipo
owner: fundador
updated: 2026-11-03
sources: [Dossiê F, dist/app.js:46]
related: [PEN-06, PEN-30]
---

# RN-0005 — Cancelamento libera o período

**Regra:** uma reserva em "preparação" ou "confirmada" pode ser cancelada, e o período volta a ficar disponível.

**Status:** `prototipo`.

## Detalhes e exceções

- Não há multa, estorno nem prazo (PEN-06).
- O financeiro do protótipo remove a reserva cancelada mesmo se já foi paga, o que apaga o recebimento (PEN-30).

## Onde está hoje

- Código: ação `confirmcancel` em `dist/app.js:46`.
- Testes: [TC-0001](../../qualidade/TC-0001-ciclo-de-locacao-prototipo.md), cenário CT-06.
