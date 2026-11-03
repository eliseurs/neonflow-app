---
id: RN-0001
title: Sem sobreposição de reservas no mesmo veículo
type: rn
status: prototipo
owner: fundador
updated: 2026-11-03
sources: [Dossiê F, dist/app.js:41, Base v1.1 §5]
related: [PEN-04, PEN-24, PEN-29]
---

# RN-0001 — Sem sobreposição de reservas no mesmo veículo

**Regra:** um veículo não pode ter duas reservas ativas (etapas 0 a 3) cujos períodos se cruzem. Há interseção quando `início_novo < fim_existente` e `fim_novo > início_existente`.

**Status:** `prototipo`. Existe no código, e o "bloqueio contra sobreposição" aparece como proposta recuperada na Base v1.1 §5. Não foi aprovado como política.

## Detalhes e exceções

- Datas adjacentes são permitidas: a retirada pode ser no mesmo dia da devolução anterior.
- Não há intervalo de limpeza ou entrega nem horário de devolução (PEN-29).
- O período fica bloqueado já na criação (etapa 0). A Base v1.1 sugeria bloquear só na confirmação. A escolha está em [ADR-0006](../../arquitetura/adr/ADR-0006-momento-do-bloqueio-de-reserva.md) e PEN-04.
- A checagem roda no navegador. Duas sessões podem reservar o mesmo período (PEN-24).

## Onde está hoje

- Código: `createBooking` em `dist/app.js:41`.
- Testes: [TC-0001](../../qualidade/TC-0001-ciclo-de-locacao-prototipo.md), cenário CT-03.
