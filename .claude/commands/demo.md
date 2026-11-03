---
description: Sobe o protótipo congelado localmente e confere os testes dele
---

1. Rode `make test-prototipo`. Confirme os 12 cenários legados e os 6 testes do servidor. Lembre que 4 cenários legados **reproduzem defeitos** (PEN-25 a PEN-28): passar significa que o defeito continua lá.
2. Suba com `make demo` em background e informe a URL `http://localhost:8080`.
3. Lembre o usuário de que os dados são fictícios e somem ao recarregar a página (PEN-21).
4. Para publicar, siga `docs/deploy-railway.md`. Não faça deploy sem confirmação explícita.
