---
id: RN-0003
title: Requisitos para confirmar a reserva
type: rn
status: prototipo
owner: fundador
updated: 2026-11-03
sources: [Base v1.1 §3 (09/10/2025), Dossiê F, dist/app.js:45]
related: [PEN-03, PEN-05]
---

# RN-0003 — Requisitos para confirmar a reserva

**Regra:** uma reserva só passa de "preparação" para "confirmada" com CNH conferida, contrato, caução e pagamento.

**Status:** `prototipo`. Os requisitos (CNH, contrato/assinatura, condutor, caução) foram aceitos no histórico de 09/10/2025. A **ordem** entre eles e o provedor de assinatura não estão definidos (PEN-05).

## Detalhes e exceções

- No protótipo são checkboxes e um botão "Simular recebimento". Nenhum documento é verificado.
- Requisitos do condutor, valor da caução e cobertura estão em aberto (PEN-03).

## Onde está hoje

- Código: `advance` (`dist/app.js:45`) e `bookingModal` (`dist/app.js:44`).
- Testes: [TC-0001](../../qualidade/TC-0001-ciclo-de-locacao-prototipo.md), cenário CT-05.
