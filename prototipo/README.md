# Neon Flow — protótipo estático

Protótipo de demonstração do commit `fdf114ef` (Sites v2, 29/09/2026). É **evidência congelada**: não evolui aqui. O produto real é construído no frontend deste repositório (raiz) e na API `eliseurs/neonflow-api` ([ADR-0003](https://github.com/eliseurs/neonflow-api/blob/main/docs/adr/ADR-0003-prototipo-estatico-e-evidencia.md)).

Todos os dados são fictícios e ficam só na memória do navegador. Recarregar a página volta ao estado inicial.

## Rodar

```bash
npm test        # 12 cenários legados + 6 testes do servidor
npm run demo    # http://localhost:8080 (mesmo server.mjs do Railway)
BASIC_AUTH_USER=demo BASIC_AUTH_PASSWORD=teste npm run demo   # com senha
```

Requer Node 20 ou superior. Deploy no Railway: [docs/deploy-railway.md](../docs/deploy-railway.md).

## Conteúdo

| Caminho | Papel |
| --- | --- |
| `dist/index.html` | Página. Carrega `data.js`, `strategy.js` e `app.js` |
| `dist/app.js` | Navegação por hash, 9 áreas, regras e WebMCP opcional |
| `dist/data.js` | 12 capítulos da Base funcional v1.1 |
| `dist/strategy.js` | Capítulos 13–16 da revisão de 29/09 |
| `dist/*.md` | Base funcional v1.1 e revisão estratégica |
| `server.mjs` | Servidor estático sem dependências (Railway e local) |
| `tests/legacy/03_TESTES.cjs` | 12 cenários de auditoria de 09/10/2026 (hash conferido com o manifesto) |
| `tests/server.test.mjs` | 6 testes do servidor |
| `.openai/hosting.json` | Identidade do site no Sites |

Áreas por hash: `#estrategia` (padrão), `#central`, `#frota`, `#reservas`, `#transfer`, `#financeiro`, `#mapa`, `#base`, `#evolucao`.

## Regras implementadas

| Função | Regra | RN |
| --- | --- | --- |
| `createBooking` (`app.js:41`) | Veículo existe e fora de manutenção. Nome até 60 caracteres. Datas ISO com duração positiva. Sem sobreposição | RN-01.1, RN-02.1, RN-02.2 |
| `advance` (`app.js:45`) | 0→1 exige CNH, contrato, caução e pagamento. 1→2 entrega, 2→3 devolução, 3→4 ocorrências | RN-02.3, RN-02.4 |
| `confirmcancel` (`app.js:46`) | Etapa −1, libera o período | RN-02.5 |
| `total` (`app.js:19`) | Diárias × tarifa atual | RN-02.6 |
| `vehicleState` (`app.js:20`) | Manutenção > "Em locação" (etapa 2) > "Livre" | RN-01.1 |

As regras estão em [`.claude/business-rules/`](https://github.com/eliseurs/neonflow-api/blob/main/.claude/business-rules/README.md).

## Defeitos conhecidos (reproduzidos em 09/10/2026)

Os testes "PASS" desses cenários significam que **o defeito continua presente**. A correção acontece no produto novo, não aqui.

| Defeito | Pendência | Cenário |
| --- | --- | --- |
| Data inexistente (30/02) aceita | PEN-25 | CT-09 |
| `advance` vai além da etapa 4 | PEN-26 | CT-12 |
| Total recalculado com a tarifa atual | PEN-27 | CT-11 |
| "Livre" com reserva futura confirmada | PEN-28 | CT-10 |

---

## README original (Sites, 27/09/2026)

### Neon Flow — Central de mobilidade

Site privado da vertical Neon Flow / Nexus OS. Primeira versão: 27/09/2026.

#### Fonte e continuidade

O conteúdo publicável está em `dist/`. Identidade persistente em `.openai/hosting.json`.
A base documental v1.1 está incorporada em `data.js` e disponível em Markdown.
Preservar o mesmo project_id nas futuras alterações. Nome correto: Neon Flow.

#### Escopo

Oito áreas: central, frota, reservas, transfer, financeiro, mapa funcional, base e evolução.
Dados operacionais são fictícios e duram somente na sessão em memória. A base e o código
persistem no Site. Não há autenticação própria, banco de reservas, assinatura, cobrança,
IA em runtime ou conexão operacional ao Nexus.

#### Verificação

Sintaxe dos scripts verificada. Oito renderizações e fluxo criar/calcular/bloquear sobreposição/
confirmar/entregar/devolver testados em ambiente DOM simulado. Preview visual não disponível
para este caminho de assets estáticos. WebMCP é detectado por capacidade; validação em
contexto WebMCP suportado não esteve disponível. Nenhuma integração real alegada.
