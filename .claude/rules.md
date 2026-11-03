# Rules — Neonflow App (Frontend)

> Leia este arquivo antes de qualquer alteração de código.
> Após cada alteração, atualize `specs.md` com o que foi mudado.

---

## Regras Gerais

1. **Nunca salte hooks de git** (`--no-verify`) sem autorização explícita.
2. **Nunca faça `git push --force` para main/master** sem confirmação do usuário.
3. **Commits somente quando solicitado** — nunca comitar espontaneamente.
4. **Não adicione dependências externas** sem aprovação — verifique `package.json` antes.
5. **Não refatore código não relacionado** à tarefa em andamento.
6. **Não adicione comentários, docstrings ou type annotations** em código que não foi alterado.
7. **Não edite `prototipo/`** — evidência congelada (ADR-0003). Exceção: `prototipo/server.mjs` e seus testes, que só servem a demo.

---

## Regras de Negócio na Interface

- Regras vivem na API (`../neonflow-api/.claude/business-rules/`). A interface **exibe** e **valida para UX**, mas a decisão é sempre do servidor.
- Nunca fixe tarifa, caução, multa, prazo ou comissão no frontend. Números históricos (R$400, 15%, R$1.500/dia) não são vigentes.
- Dados de exemplo, mocks e fixtures são sempre fictícios (`@neonflow.test`).

---

## Regras de API Client

- **`apiClient`** (`src/app/providers/api/client.ts`) — retorna o envelope `{ status, data }`; acesse o payload via `.data`
- **`axiosInstance`** — só para casos especiais (uploads multipart, com `headers: { 'Content-Type': undefined }`)
- Token JWT injetado pelo interceptor a partir de `useAuthStore`; 401 com sessão limpa a sessão
- Mensagem de erro para o usuário: `apiErrorMessage(error, fallback)`

```ts
const res = await apiClient.get<ApiResponse<User>>('/auth/me');
const user = res.data;
```

---

## Regras de Estado

- Zustand para sessão/UI (`src/modules/auth/store/auth.store.ts`, persistido em `localStorage` como `neonflow-auth`)
- React Query para dados do servidor — não duplicar estado do servidor em store
- `useAuthStore().isAuthenticated()` considera a expiração do token

---

## Regras de Componentes e Módulos

```
src/modules/{domain}/
  pages/        # páginas roteadas
  components/   # componentes do domínio
  services/     # chamadas à API ({domain}.service.ts)
  model/        # tipos ({domain}.types.ts)
  store/        # zustand (se necessário)
  hooks/
```
- Props interface definida antes do componente no mesmo arquivo
- Componentes de apresentação não chamam serviços — use hooks/React Query
- Componentes compartilhados em `src/shared/ui/`

---

## Regras de Roteamento

- React Router v6; rotas privadas sempre dentro de `ProtectedRoute` (em `src/app/routes/AppRoutes.tsx`)
- Rotas desconhecidas redirecionam para `/`

---

## Regras de Teste

- Toda feature ou componente com lógica tem teste (Vitest + Testing Library)
- Serviços de API mockados com `vi.mock`; nunca chamar a API real
- Testes só em `src/**/*.test.{ts,tsx}` — os testes do protótipo rodam com `make test-prototipo`
- Não altere `prototipo/tests/legacy/` — CT-09 a CT-12 **reproduzem defeitos** de propósito

---

## Regras de Segurança

- Nunca logar token ou dados pessoais no console (o build remove `console`, mas não dependa disso)
- Nunca commitar `.env` — só `.env.example`
- `VITE_*` é público (vai no bundle): nunca coloque segredo em variável `VITE_`
