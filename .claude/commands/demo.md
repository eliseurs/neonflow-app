---
description: Sobe o protótipo estático localmente e confere os testes legados
---

1. Rode `npm test` e confirme que os 12 cenários legados passam. Lembre que 4 deles **reproduzem defeitos** (PEN-25 a PEN-28): passar significa que o defeito continua lá.
2. Suba o protótipo com `npm run demo` em background e informe a URL `http://localhost:8080`.
3. Lembre o usuário de que todos os dados são fictícios e somem ao recarregar a página (PEN-21).
