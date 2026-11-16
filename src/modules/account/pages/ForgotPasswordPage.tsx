import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import { AccountShell } from "../components/AccountShell";
import { accountService } from "../services/account.service";

/** Pede o link de nova senha. A resposta é a mesma com ou sem conta para o e-mail (API RN-05.14). */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const forgot = useMutation({ mutationFn: (email: string) => accountService.forgotPassword(email) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    forgot.mutate(email);
  };
  const footer = (
    <>
      <Link to="/login" className="hover:text-gold">← Voltar para entrar</Link>
    </>
  );

  return (
    <AccountShell title="Esqueci" accent="a senha." footer={footer}>
      {forgot.isSuccess ? (
        <p role="status" className="text-sm leading-relaxed text-bone/80">
          Se houver uma conta com <strong className="text-bone">{email.trim()}</strong>, enviamos para ele um link para criar uma senha nova. O link vale por
          1 hora.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Field id="forgot-email" label="E-mail da conta">
            <input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          {forgot.isError && <ErrorNote>{apiErrorMessage(forgot.error, "Não foi possível enviar o link.")}</ErrorNote>}
          <Button type="submit" className="w-full" disabled={forgot.isPending || !email.trim()}>
            {forgot.isPending ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}
    </AccountShell>
  );
}
