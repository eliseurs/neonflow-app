import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { MIN_PASSWORD_LENGTH } from "@/modules/users/model/users.types";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import { AccountShell } from "../components/AccountShell";
import { accountService, type SignupRequest } from "../services/account.service";

/** Cadastro do cliente no site: só entra depois de confirmar o e-mail (API RN-05.13). */
export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const signup = useMutation({ mutationFn: (req: SignupRequest) => accountService.signup(req) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) return setProblem(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    if (password !== confirm) return setProblem("A confirmação não confere com a senha.");
    setProblem(null);
    signup.mutate({ name, email, password });
  };

  const footer = (
    <>
      <Link to="/login" className="hover:text-gold">Já tenho conta</Link>
      <Link to="/" className="hover:text-gold">← Voltar ao site</Link>
    </>
  );

  if (signup.isSuccess) {
    return (
      <AccountShell title="Confira o" accent="seu e-mail." footer={footer}>
        <p role="status" className="text-sm leading-relaxed text-bone/80">
          Se o endereço <strong className="text-bone">{email.trim()}</strong> puder ser usado, enviamos para ele um link para ativar a conta. O link vale
          por 24 horas. Não chegou? Veja a caixa de spam ou cadastre de novo para receber outro.
        </p>
      </AccountShell>
    );
  }

  const error = problem ?? (signup.isError ? apiErrorMessage(signup.error, "Não foi possível criar a conta.") : null);
  return (
    <AccountShell title="Crie a" accent="sua conta." footer={footer}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field id="signup-name" label="Nome">
          <input id="signup-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field id="signup-email" label="E-mail">
          <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field id="signup-password" label="Senha" hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}>
          <input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field id="signup-confirm" label="Confirmar senha">
          <input id="signup-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </Field>
        {error && <ErrorNote>{error}</ErrorNote>}
        <Button type="submit" className="w-full" disabled={signup.isPending || !name.trim() || !email.trim() || !password || !confirm}>
          {signup.isPending ? "Criando..." : "Criar conta"}
        </Button>
      </form>
    </AccountShell>
  );
}
