---
id: TC-0001
title: Ciclo de locação do protótipo
type: test-contract
status: ativo
owner: qa
updated: 2026-11-03
sources: [02_CENARIOS_E_EVIDENCIAS.md, tests/legacy/03_TESTES.cjs]
related: [SPEC-0001]
---

# TC-0001 — Ciclo de locação do protótipo

Todos os dados são fictícios. Execução: `npm test`. Último resultado: 12/12 PASS em 03/11/2026 (o mesmo de 09/10/2026).

## Executados

| ID | Cenário | RN | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| CT-01 | 9 áreas e 16 capítulos renderizam | — | comportamento | PASS |
| CT-02 | Reserva NF-001, 10–13/10, R$180/dia = R$540, etapa 0, não paga | RN-0006 | comportamento | PASS |
| CT-03 | Sobreposição rejeitada; início no dia da devolução anterior aceito | RN-0001 | comportamento | PASS |
| CT-04 | Manutenção, nome vazio e período invertido rejeitados | RN-0002 | comportamento | PASS |
| CT-05 | Etapas só avançam com conferência e pagamento, de 0 a 4 | RN-0003, RN-0004 | comportamento | PASS |
| CT-06 | Cancelamento leva à etapa −1 e libera o período | RN-0005 | comportamento | PASS |
| CT-07 | Transfer TR-01: Confirmado, depois Concluído | — | comportamento | PASS |
| CT-08 | Novo runtime volta às 3 reservas iniciais | — | comportamento | PASS |
| CT-09 | Data 30/02 aceita | — | lacuna reproduzida (PEN-25) | PASS = defeito presente |
| CT-10 | Veículo "Livre" com reserva confirmada | — | lacuna reproduzida (PEN-28) | PASS = defeito presente |
| CT-11 | Tarifa alterada para 999 muda o total para 2997 | RN-0006 | lacuna reproduzida (PEN-27) | PASS = defeito presente |
| CT-12 | `advance` na etapa 4 vai para 5 | RN-0004 | lacuna reproduzida (PEN-26) | PASS = defeito presente |

## Propostos, não executados (alvo da SPEC-0002)

| ID | Cenário | Crítico |
| --- | --- | --- |
| CT-13 | Duas sessões reais no mesmo período: só uma confirma | Sim |
| CT-14 | Cancelamento pago preserva o recebimento e rastreia o estorno | Sim |
| CT-15 | Motorista recusa ou atrasa: a central reatribui com histórico | Não |
| CT-16 | Cliente muda de aluguel para transfer: requalifica e libera o bloqueio conforme a política | Não |
| CT-17 | Interesse imobiliário sem autorização não é encaminhado | Sim |
| CT-18 | Outro tenant pede CNH ou reserva: acesso negado | Sim |
| CT-19 | Evento ou pagamento repetido não duplica efeito | Sim |
| CT-20 | Mudança de preço, ativo ou período exige novo aceite | Sim |
