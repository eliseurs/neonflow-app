---
description: Cria uma especificação (SPEC-NNNN) ligada a RNs, ADRs e pendências
argument-hint: "<funcionalidade>"
---

Crie uma SPEC para: $ARGUMENTS

1. Leia `wiki/gestao/pendencias.md` e as RNs relacionadas. Se houver pendência **Bloqueante** que afete a SPEC, o status inicial é `bloqueada` e ela lista essas pendências.
2. Copie `wiki/templates/spec.md` para `wiki/specs/SPEC-NNNN-<slug>.md`.
3. Faça o deep-dive no código atual (`dist/`) e classifique cada diferença como **gap**, **divergência** ou **inconsistência**.
4. Critérios de aceite em Gherkin. Cada critério referencia uma RN.
5. Atualize `wiki/specs/README.md` e rode `npm run wiki:validate`.

Para o fluxo completo da cadeia Trinca (PRD → Spec → Tech Tasks → Test Contract), use `trinca-toolbox:flow`.
