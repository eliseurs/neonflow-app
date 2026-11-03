---
id: SPEC-0001
title: Protótipo de demonstração (as-built)
type: spec
status: as-built
owner: engenharia
updated: 2026-11-03
sources: [Dossiê F, H, I, dist/ commit fdf114ef]
related: [TC-0001]
---

# SPEC-0001 — Protótipo de demonstração (as-built)

Descreve o que `dist/` faz hoje. Não é especificação de produto.

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `dist/index.html` | Shell da página, carrega `data.js`, `strategy.js` e `app.js` |
| `dist/app.js` | Navegação por hash, render das 9 áreas, regras e WebMCP opcional |
| `dist/data.js` | 12 capítulos da Base v1.1 (`CHAPTERS`) |
| `dist/strategy.js` | 4 capítulos da revisão de 29/09 (13–16) |
| `dist/style.css` | Estilos com media queries. Importa fontes do Google Fonts |

Áreas por hash: `#estrategia` (padrão), `#central`, `#frota`, `#reservas`, `#transfer`, `#financeiro`, `#mapa`, `#base`, `#evolucao`. O README cita 8 áreas e está desatualizado (PEN-33).

## Dados

6 veículos, 3 reservas e 2 transfers, todos fictícios, em arrays na memória. Recarregar a página volta ao estado inicial (PEN-21).

## Regras implementadas

| Função | Regra | RN |
| --- | --- | --- |
| `createBooking` (`app.js:41`) | Veículo existe e não está em manutenção. Nome não vazio, até 60 caracteres. Datas ISO, duração positiva. Sem sobreposição | [RN-0001](../negocio/regras/RN-0001-sem-sobreposicao-de-reservas.md), [RN-0002](../negocio/regras/RN-0002-veiculo-em-manutencao-nao-reservavel.md) |
| `advance` (`app.js:45`) | Etapa 0→1 exige CNH, contrato, caução e pagamento. 1→2 entrega, 2→3 devolução, 3→4 ocorrências | [RN-0003](../negocio/regras/RN-0003-requisitos-para-confirmar-reserva.md), [RN-0004](../negocio/regras/RN-0004-etapas-do-ciclo-de-locacao.md) |
| `confirmcancel` (`app.js:46`) | Etapa −1, libera o período | [RN-0005](../negocio/regras/RN-0005-cancelamento-libera-periodo.md) |
| `total` (`app.js:19`) | Diárias × tarifa atual | [RN-0006](../negocio/regras/RN-0006-valor-da-locacao.md) |
| `vehicleState` (`app.js:20`) | Manutenção > "Em locação" (etapa 2) > "Livre" | [RN-0002](../negocio/regras/RN-0002-veiculo-em-manutencao-nao-reservavel.md) |
| handler `transfer` (`app.js:46`) | Aguardando aceite → Confirmado → Concluído, sem condição | — |

## Defeitos conhecidos (reproduzidos em 09/10/2026)

| Defeito | Pendência | Cenário |
| --- | --- | --- |
| Data inexistente (30/02) aceita | PEN-25 | CT-09 |
| `advance` vai além da etapa 4 | PEN-26 | CT-12 |
| Total recalculado com tarifa atual | PEN-27 | CT-11 |
| "Livre" mesmo com reserva futura confirmada | PEN-28 | CT-10 |

## WebMCP

Se o navegador expõe `document.modelContext.registerTool`, o site registra `read_demo_reservations` (só leitura) e `navigate_neon_flow`. Nunca foi testado num navegador compatível (PEN-34).
