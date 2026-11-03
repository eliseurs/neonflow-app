---
description: Registra uma regra de negócio (RN-NNNN) a partir de uma fonte verificável
argument-hint: "<descrição da regra>"
---

Registre a regra de negócio: $ARGUMENTS

1. **Pergunte a fonte** se ela não estiver clara: fala do fundador, documento ou código. Regra sem fonte não entra na wiki.
2. Descubra o próximo número livre em `wiki/negocio/regras/` e copie `wiki/templates/rn.md`.
3. Status:
   - `aprovada`: só com decisão explícita do fundador/negócio registrada.
   - `prototipo`: comportamento que existe em `dist/` mas não foi aprovado como regra de produto.
   - `proposta`: sugestão ainda sem aprovação.
4. Ligue as pendências (`PEN-NN`) e SPECs afetadas. Atualize o índice `wiki/negocio/regras/README.md`.
5. Rode `npm run wiki:validate`.
