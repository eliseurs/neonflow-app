---
id: ADR-0006
title: Momento do bloqueio de disponibilidade
type: adr
status: proposta
owner: fundador
updated: 2026-11-03
deciders: [fundador, engenharia]
related: [PEN-04, PEN-24]
---

# ADR-0006 — Momento do bloqueio de disponibilidade

## Contexto e problema

O protótipo bloqueia o período ao **criar** a reserva (etapa 0), sem expiração. A Base v1.1 sugeria bloquear na **confirmação**. O Dossiê F pede que essa diferença seja decidida e não normalizada em silêncio.

## Opções consideradas

1. **Bloquear na criação, sem prazo** (protótipo atual). Simples, mas reservas abandonadas prendem a frota.
2. **Bloquear só na confirmação.** Libera a frota, mas permite que dois clientes avancem na documentação para o mesmo carro.
3. **Pré-reserva com prazo de validade (TTL)**, que vira bloqueio firme na confirmação. Padrão de mercado em locadoras e hotelaria. O prazo precisa ser definido pelo negócio.

## Decisão

**Não decidida** (PEN-04). Recomendação técnica: opção 3, com o bloqueio feito de forma atômica no servidor (PEN-24).
