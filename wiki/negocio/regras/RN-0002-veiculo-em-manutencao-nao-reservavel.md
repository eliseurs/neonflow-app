---
id: RN-0002
title: Veículo em manutenção não é reservável
type: rn
status: prototipo
owner: fundador
updated: 2026-11-03
sources: [Dossiê F, dist/app.js:41]
related: [PEN-01]
---

# RN-0002 — Veículo em manutenção não é reservável

**Regra:** um veículo com estado "Manutenção" não aceita reservas, e esse estado prevalece sobre qualquer outro na exibição.

**Status:** `prototipo`.

## Detalhes e exceções

- Não existe bloqueio emergencial por período, só o estado global do veículo. O tratamento de clientes afetados por manutenção inesperada não está definido (Dossiê F).
- A frota real ainda não foi inventariada (PEN-01).

## Onde está hoje

- Código: `createBooking` (`dist/app.js:41`) e `vehicleState` (`dist/app.js:20`).
- Testes: [TC-0001](../../qualidade/TC-0001-ciclo-de-locacao-prototipo.md), cenário CT-04.
