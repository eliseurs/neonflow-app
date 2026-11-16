import { useState, type FormEvent } from "react";
import { MIN_PASSWORD_LENGTH } from "@/modules/users/model/users.types";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";

interface NewPasswordFormProps {
  submitLabel: string;
  pending: boolean;
  /** Mensagem de erro da API, se houver. */
  error: string | null;
  onSubmit: (password: string) => void;
}

/** Senha nova com confirmação, para o convite do parceiro e o link de nova senha. */
export function NewPasswordForm({ submitLabel, pending, error, onSubmit }: NewPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) return setProblem(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    if (password !== confirm) return setProblem("A confirmação não confere com a senha.");
    setProblem(null);
    onSubmit(password);
  };

  const shown = problem ?? error;
  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field id="new-password" label="Senha" hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}>
        <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </Field>
      <Field id="confirm-password" label="Confirmar senha">
        <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
      </Field>
      {shown && <ErrorNote>{shown}</ErrorNote>}
      <Button type="submit" className="w-full" disabled={pending || !password || !confirm}>
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
