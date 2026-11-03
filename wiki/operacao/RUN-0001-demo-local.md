---
id: RUN-0001
title: Rodar o protótipo localmente
type: runbook
status: ativo
owner: engenharia
updated: 2026-11-03
---

# RUN-0001 — Rodar o protótipo localmente

## Quando usar

Para mostrar a demonstração ou conferir o protótipo depois de mudanças na wiki ou nos testes.

## Pré-requisitos

Node 18 ou superior e Python 3 (para o servidor estático).

## Passos

1. `npm test`: confirma os 12 cenários legados.
2. `npm run demo`: serve `dist/` em `http://localhost:8080`.
3. Abra a URL. A área inicial é `#estrategia`.

## Como verificar

A página mostra o selo "Demonstração", e a reserva criada aparece em `#reservas`.

## Como desfazer

Encerre o servidor com Ctrl+C. Não há estado persistido.

## Publicação

O site publicado fica em `https://neon-flow-nexus.y22c2cfgsd.chatgpt.site` (Sites v2, projeto em `.openai/hosting.json`). Este repositório não publica nada. Qualquer novo deploy exige autorização (PEN-52).
