---
id: RN-0004
title: Etapas do ciclo de locação
type: rn
status: prototipo
owner: fundador
updated: 2026-11-03
sources: [Base v1.1 §5, Dossiê F, dist/app.js:44-45]
related: [PEN-18, PEN-26]
---

# RN-0004 — Etapas do ciclo de locação

**Regra:** a locação passa por cinco etapas, em ordem, e cada avanço exige a conferência da etapa atual.

```mermaid
stateDiagram-v2
  [*] --> Preparacao
  Preparacao --> Confirmada: CNH + contrato + caução + pagamento
  Confirmada --> EmLocacao: checklist de entrega
  EmLocacao --> Devolvida: checklist de devolução
  Devolvida --> Encerrada: ocorrências conferidas
  Preparacao --> Cancelada
  Confirmada --> Cancelada
  Encerrada --> [*]
  Cancelada --> [*]
```

**Status:** `prototipo`. A sequência é uma síntese operacional da Base v1.1 §5, e a ordem exata precisa ser definida com a operação.

## Detalhes e exceções

- A proteção contra pular etapas está só na interface. `advance` chamado direto passa da etapa 4 para 5 (PEN-26).
- O checklist real (fotos, combustível, km, avarias) não foi especificado (PEN-18).

## Onde está hoje

- Código: `bookingModal` e `advance` (`dist/app.js:44-45`).
- Testes: [TC-0001](../../qualidade/TC-0001-ciclo-de-locacao-prototipo.md), cenários CT-05 e CT-12.
