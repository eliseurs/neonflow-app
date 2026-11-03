---
id: WIKI-INDEX
title: Wiki do Neon Flow
type: page
status: ativo
owner: engenharia
updated: 2026-11-03
---

# Wiki do Neon Flow

Base de conhecimento docs-as-code da vertical de aluguel e mobilidade do Nexus OS. Fica versionada junto com o código, é revisada em PR e é validada por `npm run wiki:validate`.

> **Estado atual (03/11/2026):** protótipo estático de demonstração (`dist/`, commit `fdf114ef`). Nenhuma regra comercial foi aprovada. Antes de operar com clientes reais é preciso resolver 15 pendências bloqueantes: veja [gestao/pendencias.md](gestao/pendencias.md).

## Mapa

| Área | O que tem | Comece por |
| --- | --- | --- |
| Produto | Visão, fronteiras, perfis, jornada, roadmap, métricas | [produto/visao.md](produto/visao.md) |
| Negócio | Glossário e regras de negócio (`RN-NNNN`) | [negocio/regras/README.md](negocio/regras/README.md) |
| Especificações | SPECs com critérios de aceite (`SPEC-NNNN`) | [specs/README.md](specs/README.md) |
| Arquitetura | Visão C4, integrações e ADRs (`ADR-NNNN`) | [arquitetura/README.md](arquitetura/README.md) |
| Qualidade | Estratégia de testes, test contracts (`TC-NNNN`), segurança e LGPD | [qualidade/estrategia-de-testes.md](qualidade/estrategia-de-testes.md) |
| Operação | Runbooks (`RUN-NNNN`): demo local e deploy no Railway | [operacao/RUN-0002-deploy-railway.md](operacao/RUN-0002-deploy-railway.md) |
| Gestão | Pendências (`PEN-NN`) e changelog | [gestao/pendencias.md](gestao/pendencias.md) |
| Fontes | De onde veio cada informação | [fontes/inventario.md](fontes/inventario.md) |

## Padrões adotados

- **Docs-as-code:** Markdown + frontmatter YAML no mesmo repositório do código, revisados em PR.
- **ADR no formato [MADR](https://adr.github.io/madr/):** uma decisão por arquivo, imutável depois de aceita. Mudança vira um novo ADR que substitui o anterior.
- **Arquitetura com [C4](https://c4model.com/)** (contexto e containers) em Mermaid, e seções inspiradas no [arc42](https://arc42.org/).
- **Regras de negócio atômicas** (`RN-NNNN`), cada uma com fonte e status explícito.
- **Critérios de aceite em Gherkin**, rastreáveis até a RN.
- **Rastreabilidade por ID:** o validador quebra o build se um documento citar um ID que não existe.

Convenções e fluxo de contribuição: [CONTRIBUTING.md](CONTRIBUTING.md).
