import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import { MIN_PASSWORD_LENGTH } from "../model/users.types";
import { usersService } from "../services/users.service";

/** Troca da própria senha, com a senha atual. */
export function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: () => usersService.changeOwnPassword(current, next),
    onSuccess: () => {
      toast.success("Senha alterada.");
      onDone();
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (next.length < MIN_PASSWORD_LENGTH) return setProblem(`A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    if (next !== confirm) return setProblem("A confirmação não confere com a nova senha.");
    setProblem(null);
    change.mutate();
  };

  const error = problem ?? (change.isError ? apiErrorMessage(change.error, "Não foi possível alterar a senha.") : null);

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field id="current-password" label="Senha atual">
        <input id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
      </Field>
      <Field id="new-password" label="Nova senha" hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}>
        <input id="new-password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
      </Field>
      <Field id="confirm-password" label="Confirmar nova senha">
        <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
      </Field>
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button type="submit" disabled={change.isPending || !current || !next || !confirm}>
        {change.isPending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
