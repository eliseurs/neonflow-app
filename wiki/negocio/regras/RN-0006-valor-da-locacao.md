---
id: RN-0006
title: Valor da locação
type: rn
status: prototipo
owner: fundador
updated: 2026-11-03
sources: [Dossiê F, dist/app.js:19]
related: [PEN-02, PEN-27]
---

# RN-0006 — Valor da locação

**Regra:** valor = número de diárias × tarifa do veículo.

**Status:** `prototipo`. As tarifas do protótipo (R$150–320) são inventadas (Dossiê D).

## Detalhes e exceções

- O valor não é gravado na reserva e é recalculado com a tarifa atual. Mudar a tarifa altera reservas já feitas (PEN-27).
- Tarifas, período mínimo, km, combustível, atraso e extensão estão em aberto (PEN-02).

## Onde está hoje

- Código: `total` em `dist/app.js:19`.
- Testes: [TC-0001](../../qualidade/TC-0001-ciclo-de-locacao-prototipo.md), cenários CT-02 e CT-11.
