---
id: ARQ-INDEX
title: Arquitetura
type: page
status: ativo
owner: engenharia
updated: 2026-11-03
sources: [Dossiê G–J, Revisão 29/09 §15]
---

# Arquitetura

A arquitetura de hoje é um site estático sem backend. A arquitetura-alvo **não está decidida**: depende de localizar os donos existentes no Nexus OS (PEN-35) e auditar o Replit (PEN-36). Os diagramas "alvo" abaixo mostram responsabilidades propostas, não tecnologia.

## Contexto (C4 nível 1) — alvo proposto

```mermaid
flowchart TB
  cliente([Cliente / turista])
  central([Central / gestor])
  motorista([Motorista parceiro])
  indicador([Hotel / comércio indicador])
  subgraph Nexus OS
    shell[Shell<br/>entrada e continuidade do cliente]
    core[Nexus Core<br/>identidade, CTX, eventos, governança]
    palmo[PALMO<br/>observa, audita, alerta]
  end
  nf[Neon Flow<br/>oferta, frota, locação, transfer]
  neo360[Neo360]
  neoauto[NeoAuto]
  pagamentos[(Provedor de pagamento<br/>a definir PEN-05)]
  assinatura[(Assinatura digital<br/>a definir PEN-05)]

  cliente --> shell
  indicador --> shell
  shell --> nf
  central --> nf
  motorista --> nf
  nf <--> core
  palmo -.observa.-> nf
  nf -.intenção autorizada.-> core
  core -.-> neo360
  core -.-> neoauto
  nf -.-> pagamentos
  nf -.-> assinatura
```

## Containers (C4 nível 2) — estado atual

```mermaid
flowchart LR
  browser[Navegador] --> site[Site estático<br/>dist/index.html + app.js<br/>Sites v2, commit fdf114ef]
  site --> mem[(Arrays em memória<br/>vehicles, bookings, transfers)]
  site --> fonts[Google Fonts]
  site -.WebMCP opcional.-> agent[Agente no navegador<br/>read_demo_reservations<br/>navigate_neon_flow]
```

Sem backend, banco, autenticação, API, fila ou integração. Ver [SPEC-0001](../specs/SPEC-0001-prototipo-as-built.md).

## Requisitos de qualidade do alvo

Tirados dos critérios propostos no Dossiê K. Nenhum foi implementado.

| Atributo | Critério |
| --- | --- |
| Consistência | Concorrência não permite overbooking (PEN-24) |
| Idempotência | Repetir uma operação não duplica efeitos financeiros nem oportunidades |
| Isolamento | Outro tenant não acessa reservas ou documentos (PEN-49) |
| Rastreabilidade | Pagamento reconciliado e estorno preservam o histórico |
| Durabilidade | Dados sobrevivem a recarga e falhas (PEN-21) |
| Autoridade | Mudança material exige novo aceite. A IA não executa fora da sua autoridade |
| Acessibilidade | Mobile e teclado verificados (PEN-51) |

## Documentos

- [integracoes.md](integracoes.md): contratos propostos com Shell, Nexus e outras verticais.
- [adr/README.md](adr/README.md): decisões registradas.
