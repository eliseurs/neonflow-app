# Style Guide — Neonflow App

---

## Nomenclatura

- Componentes e páginas: PascalCase (`LoginPage.tsx`, `AppLayout.tsx`), export nomeado
- Hooks: `useAlgo.ts`
- Services: `{domain}.service.ts` · stores: `{domain}.store.ts` · tipos: `{domain}.types.ts`
- Testes ao lado do arquivo: `{nome}.test.ts(x)`
- Alias `@/` aponta para `src/`

## Componentes

```tsx
interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Panel className="p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-bone/55">{label}</p>
      <p className="mt-4 font-serif text-5xl font-light text-gold">{value}</p>
    </Panel>
  );
}
```

- Function components; Tailwind para estilo (sem CSS-in-JS); `cn()` para classes condicionais
- Textos da interface em português do Brasil
- Acessibilidade: `label` com `htmlFor` em inputs, `role="alert"` em erros, ícones decorativos com `aria-hidden`

## Dados do servidor

```ts
const { data, isLoading } = useQuery({
  queryKey: ["vehicles"],
  queryFn: fleetService.list,
});

const create = useMutation({
  mutationFn: fleetService.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  onError: (err) => toast.error(apiErrorMessage(err)),
});
```

## Services

```ts
export const fleetService = {
  list: async () => (await apiClient.get<ApiResponse<Vehicle[]>>("/vehicles")).data,
};
```

## Testes

```tsx
vi.mock("@/modules/auth/services/auth.service", () => ({
  authService: { login: vi.fn(), me: vi.fn() },
}));
```
- Renderize com `QueryClientProvider` (retry desligado) + `MemoryRouter`
- Prefira queries por papel/label (`getByRole`, `getByLabelText`)

## Datas e valores

- Datas da API em ISO; exibir com `toLocaleDateString("pt-BR")`
- Valores chegam em centavos (`*_cents`); formatar com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`
