---
description: Sobe o protótipo localmente com o mesmo servidor usado no Railway e confere os testes
---

1. Rode `npm test`. Confirme os 12 cenários legados e os 6 testes do servidor. Lembre que 4 cenários legados **reproduzem defeitos** (PEN-25 a PEN-28): passar significa que o defeito continua lá.
2. Suba com `npm run demo` em background e informe a URL `http://localhost:8080`.
3. Lembre o usuário de que todos os dados são fictícios e somem ao recarregar a página (PEN-21).
4. Para publicar, siga `wiki/operacao/RUN-0002-deploy-railway.md`. Não faça deploy sem confirmação explícita.
