import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import type { Role } from "@/modules/auth/model/auth.types";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { Field, inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { MIN_PASSWORD_LENGTH, ROLE_LABEL, type PanelUser } from "../model/users.types";
import { usersService } from "../services/users.service";

function RoleSelect({ id, value, onChange, disabled }: { id: string; value: Role; onChange: (r: Role) => void; disabled?: boolean }) {
  return (
    <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as Role)} className={inputClass}>
      {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
        <option key={r} value={r} className="bg-noir">{ROLE_LABEL[r]}</option>
      ))}
    </select>
  );
}

function UserForm({ user, isSelf, onDone }: { user?: PanelUser; isSelf: boolean; onDone: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "central");
  const [active, setActive] = useState(user?.active ?? true);
  const [problem, setProblem] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      user
        ? usersService.update(user.id, { name: name.trim(), role, active })
        : usersService.create({ name: name.trim(), email: email.trim(), password, role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(user ? "Usuário atualizado." : "Usuário criado. Passe a senha para a pessoa por um canal seguro.");
      onDone();
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!user && password.length < MIN_PASSWORD_LENGTH) return setProblem(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    setProblem(null);
    save.mutate();
  };

  const error = problem ?? (save.isError ? apiErrorMessage(save.error, "Não foi possível salvar o usuário.") : null);

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field id="user-name" label="Nome">
        <input id="user-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </Field>
      <Field id="user-email" label="E-mail" hint={user ? "O e-mail é o login e não muda." : undefined}>
        <input id="user-email" type="email" disabled={Boolean(user)} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </Field>
      {!user && (
        <Field id="user-password" label="Senha inicial" hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres. A pessoa troca depois em "Trocar senha".`}>
          <input id="user-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
      )}
      <Field id="user-role" label="Papel" hint={isSelf ? "Você não pode tirar o seu próprio papel de admin." : undefined}>
        <RoleSelect id="user-role" value={role} onChange={setRole} disabled={isSelf} />
      </Field>
      {user && (
        <label className="flex items-center gap-3 text-sm text-bone/80">
          <input type="checkbox" checked={active} disabled={isSelf} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#C9A86A]" />
          Ativo (pode entrar no painel)
        </label>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex gap-3">
        <Button type="submit" disabled={save.isPending || !name.trim() || (!user && !email.trim())}>
          {save.isPending ? "Salvando..." : user ? "Salvar" : "Criar usuário"}
        </Button>
        <Button variant="ghost" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}

function ResetPasswordForm({ user, onDone }: { user: PanelUser; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const reset = useMutation({
    mutationFn: () => usersService.resetPassword(user.id, password),
    onSuccess: () => {
      toast.success("Senha redefinida. Passe a nova senha para a pessoa por um canal seguro.");
      onDone();
    },
  });
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        reset.mutate();
      }}
      className="space-y-5"
      noValidate
    >
      <p className="text-sm text-bone/60">Nova senha para {user.name} ({user.email}).</p>
      <Field id="reset-password" label="Nova senha" hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}>
        <input id="reset-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </Field>
      {reset.isError && <ErrorNote>{apiErrorMessage(reset.error, "Não foi possível redefinir a senha.")}</ErrorNote>}
      <Button type="submit" disabled={reset.isPending || password.length < MIN_PASSWORD_LENGTH}>Redefinir senha</Button>
      {tooShort && <p className="text-sm text-amber-200">Ainda curta.</p>}
    </form>
  );
}

export function UsersPage() {
  const me = useAuthStore((s) => s.user);
  const isAdmin = me?.role === "admin";
  const users = useQuery({ queryKey: ["users"], queryFn: usersService.list, enabled: isAdmin });
  const [editing, setEditing] = useState<PanelUser | "new" | null>(null);
  const [resetting, setResetting] = useState<PanelUser | null>(null);

  if (!isAdmin) {
    return (
      <section className="space-y-8">
        <PageHeader overline="Usuários" title="Acesso" accent="restrito." />
        <EmptyState title="Só para administração" text="A gestão de usuários do painel é feita pelo administrador." />
      </section>
    );
  }

  const add = (
    <Button onClick={() => setEditing("new")}>
      <Plus className="h-4 w-4" aria-hidden /> Novo usuário
    </Button>
  );

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Usuários"
        title="Quem usa"
        accent="o painel."
        description="Por enquanto, só administração e central (RN-05.6). Usuário desativado não entra mais no painel."
        actions={add}
      />

      {users.isPending && <Loading />}
      {users.isError && <ErrorNote>{apiErrorMessage(users.error, "Não foi possível carregar os usuários.")}</ErrorNote>}

      {users.data && (
        <Panel className="divide-y divide-white/[0.08]">
          {users.data.map((u) => (
            <div key={u.id} className={cn("flex flex-wrap items-center gap-4 p-5", !u.active && "opacity-50")}>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-light">
                  {u.name}
                  {u.id === me?.id && <span className="ml-2 text-xs text-gold">você</span>}
                </p>
                <p className="truncate text-sm text-bone/55">{u.email}</p>
              </div>
              <Badge tone={u.role === "admin" ? "gold" : "neutral"}>{ROLE_LABEL[u.role]}</Badge>
              <Badge tone={u.active ? "ok" : "muted"}>{u.active ? "Ativo" : "Desativado"}</Badge>
              <div className="flex gap-2">
                <Button variant="outline" className="px-4 py-2" onClick={() => setEditing(u)} aria-label={`Editar ${u.name}`}>Editar</Button>
                {u.id !== me?.id && (
                  <Button variant="ghost" onClick={() => setResetting(u)} aria-label={`Redefinir senha de ${u.name}`}>
                    <KeyRound className="h-4 w-4" aria-hidden /> Senha
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Panel>
      )}

      {editing && (
        <Dialog title={editing === "new" ? "Novo usuário" : "Editar usuário"} onClose={() => setEditing(null)}>
          <UserForm
            user={editing === "new" ? undefined : editing}
            isSelf={editing !== "new" && editing.id === me?.id}
            onDone={() => setEditing(null)}
          />
        </Dialog>
      )}
      {resetting && (
        <Dialog title="Redefinir senha" onClose={() => setResetting(null)}>
          <ResetPasswordForm user={resetting} onDone={() => setResetting(null)} />
        </Dialog>
      )}
    </section>
  );
}
