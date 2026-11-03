---
description: Cria um ADR (formato MADR) em wiki/arquitetura/adr a partir do template
argument-hint: "<título da decisão>"
---

Crie um novo ADR para: $ARGUMENTS

1. Descubra o próximo número livre em `wiki/arquitetura/adr/` (formato `ADR-NNNN`).
2. Copie `wiki/templates/adr.md` para `wiki/arquitetura/adr/ADR-NNNN-<slug-kebab>.md`.
3. Preencha contexto, opções e consequências **só com fatos da wiki, do código ou do que o usuário disser**. Cite a fonte de cada fato.
4. Status inicial: `proposta`. Só o responsável marca `aceita`.
5. Ligue as pendências relacionadas (`PEN-NN`) em `related`.
6. Adicione a linha no índice `wiki/arquitetura/adr/README.md` e rode `npm run wiki:validate`.

Se for uma decisão estrutural relevante, considere também a skill `trinca-toolbox:adr-writer` para a entrevista guiada.
