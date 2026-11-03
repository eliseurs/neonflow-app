---
id: WIKI-AGENTS
title: Instruções para agentes de IA
type: page
status: ativo
owner: engenharia
updated: 2026-11-03
---

# Neon Flow — instruções para agentes

Este arquivo é importado pelo `CLAUDE.md` da raiz. A wiki é a fonte soberana de identidade, glossário, regras de negócio e decisões deste projeto. Ela vence o conhecimento genérico e as skills do toolbox quando houver conflito.

## O que é o projeto

- Neon Flow é a vertical de **aluguel de veículos, frota, reservas, transfer e motoristas parceiros** do Nexus OS, na Serra Gaúcha (Gramado/Canela). Ver [produto/visao.md](produto/visao.md).
- O código em `dist/` é um **protótipo estático de demonstração** e evidência original do commit `fdf114ef` ([ADR-0003](arquitetura/adr/ADR-0003-prototipo-estatico-e-evidencia.md)). Não é a arquitetura-alvo.
- O nome é **Neon Flow** ([ADR-0002](arquitetura/adr/ADR-0002-nome-neon-flow-vertical-unica.md)). Não renomeie namespaces (`neoflow`) sem decisão (PEN-37).

## Regras de trabalho

1. **Não invente regra de negócio, tarifa, percentual ou termo.** Números históricos (R$400, 15%, 20%/15%, SLA 60s, R$1.500/dia) não são vigentes. Ver PEN-43.
2. **Toda regra cita a fonte.** Se não houver fonte, registre como pendência ou pergunte.
3. **Distinga sempre** o que é `aprovada`, `prototipo` (existe no código, não aprovado) e `proposta`.
4. **Antes de criar serviço novo**, procure o dono existente no Nexus OS ([ADR-0004](arquitetura/adr/ADR-0004-reutilizar-capacidades-nexus.md), PEN-35).
5. **Não altere `dist/` nem `tests/legacy/` silenciosamente.** Correção dos defeitos conhecidos (PEN-25 a PEN-28) vem de uma SPEC aprovada.
6. Ao resolver algo, **atualize a pendência** em [gestao/pendencias.md](gestao/pendencias.md) e registre a decisão (ADR ou RN).
7. Depois de editar a wiki, rode `npm run wiki:validate`.

## Onde registrar cada coisa

| Tipo | Pasta | ID | Template |
| --- | --- | --- | --- |
| Decisão de arquitetura | `arquitetura/adr/` | `ADR-NNNN` | [templates/adr.md](templates/adr.md) |
| Regra de negócio | `negocio/regras/` | `RN-NNNN` | [templates/rn.md](templates/rn.md) |
| Especificação | `specs/` | `SPEC-NNNN` | [templates/spec.md](templates/spec.md) |
| Contrato de teste | `qualidade/` | `TC-NNNN` | [templates/test-contract.md](templates/test-contract.md) |
| Runbook | `operacao/` | `RUN-NNNN` | [templates/runbook.md](templates/runbook.md) |
| Pendência | `gestao/pendencias.md` | `PEN-NN` | linha na tabela |

## Skills úteis

- `trinca-toolbox:flow`: decide a rota (implementação direta, Spec ágil ou cadeia formal).
- `trinca-toolbox:spec-writer`, `tech-task-decomposer`, `implement-tech-task`, `test-contract-writer`: a cadeia de entrega.
- `trinca-toolbox:adr-writer` e `adr-auditor`: registrar decisões e conferir se o código as respeita.
- Comandos do projeto: `/pendencias`, `/nova-adr`, `/nova-rn`, `/nova-spec`, `/demo`.

## Idioma e voz

Português do Brasil, frases curtas e factuais. Datas no formato DD/MM/AAAA no texto e AAAA-MM-DD no frontmatter. Fuso America/Sao_Paulo.
