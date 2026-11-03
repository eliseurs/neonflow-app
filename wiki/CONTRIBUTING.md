---
id: WIKI-CONTRIBUTING
title: Como contribuir com a wiki
type: page
status: ativo
owner: engenharia
updated: 2026-11-03
---

# Como contribuir com a wiki

## Frontmatter obrigatório

```yaml
---
id: RN-0001            # ID único; nos tipos numerados, o arquivo começa com ele
title: Título curto
type: rn               # page | register | adr | rn | spec | test-contract | runbook
status: prototipo      # ver tabela abaixo
owner: fundador        # papel responsável: fundador | produto | engenharia | qa | juridico
updated: 2026-11-03    # AAAA-MM-DD
sources: [Dossiê F]    # opcional, recomendado
related: [PEN-04]      # opcional: IDs relacionados
---
```

## Status por tipo

| Tipo | Status permitidos | Quem muda para o status final |
| --- | --- | --- |
| `adr` | proposta, aceita, rejeitada, substituida, obsoleta | Responsável pela decisão |
| `rn` | proposta, prototipo, aprovada, revogada | Fundador / negócio |
| `spec` | rascunho, bloqueada, em-revisao, aprovada, as-built, obsoleta | Produto + engenharia |
| `test-contract` | rascunho, ativo, obsoleto | QA |
| `runbook` | rascunho, ativo | Engenharia |
| `page`, `register` | ativo, rascunho | Owner da página |

`prototipo` significa que o comportamento existe em `dist/` mas **não** foi aprovado como regra de produto.

## Fluxo

1. Crie o documento a partir de `templates/` (ou use `/nova-adr`, `/nova-rn`, `/nova-spec` no Claude Code).
2. Cite a fonte de cada fato. Sem fonte, abra uma pendência.
3. Atualize o índice da pasta.
4. Rode `npm run wiki:validate`. Ele falha com frontmatter inválido, ID duplicado, link quebrado ou referência a ID inexistente.
5. Abra PR. ADR aceito não é editado: crie outro que o substitua e marque o antigo como `substituida`.

## Nomes de arquivo

`kebab-case`, sem acento. Tipos numerados: `<ID>-<slug>.md`, por exemplo `ADR-0006-momento-do-bloqueio-de-reserva.md`.
