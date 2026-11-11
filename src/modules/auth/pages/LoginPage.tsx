import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { Accent, Overline } from "@/shared/ui/Heading";
import { ErrorNote } from "@/shared/ui/Panel";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { homeFor } from "@/app/layout/nav";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      setSession(res.token, res.expires_at, res.user);
      const from = (location.state as { from?: string } | null)?.from ?? homeFor(res.user.role);
      navigate(from, { replace: true });
    },
  });

  if (isAuthenticated()) {
    return <Navigate to={homeFor(user?.role)} replace />;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-noir px-4 py-12 font-sans text-bone">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(201,168,106,0.14),transparent_55%)]" />
      <img src="/brand/neonflow-simbolo.svg" alt="" aria-hidden className="pointer-events-none absolute -right-32 top-1/2 hidden w-[520px] -translate-y-1/2 opacity-[0.08] md:block" />

      <div className="relative w-full max-w-md">
        <Link to="/" aria-label="Neon Flow — início" className="mx-auto block w-fit">
          <img src="/brand/neonflow-icone-app.svg" alt="Neon Flow" className="h-28 w-auto md:h-32" />
        </Link>
        <form onSubmit={submit} className="mt-10 rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-8 md:p-10" noValidate>
          <Overline>Central de mobilidade</Overline>
          <h1 className="mt-4 font-serif text-4xl font-light leading-tight">
            Acesso <Accent>da equipe.</Accent>
          </h1>

          <div className="mt-8 space-y-5">
            <Field id="email" label="E-mail">
              <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>
            <Field id="password" label="Senha">
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </Field>
          </div>

          {login.isError && <div className="mt-5"><ErrorNote>{apiErrorMessage(login.error, "Não foi possível entrar.")}</ErrorNote></div>}

          <Button type="submit" className="mt-8 w-full" disabled={login.isPending || !email || !password}>
            {login.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <Link to="/" className="mt-6 inline-block text-sm text-bone/50 hover:text-gold">← Voltar ao site</Link>
      </div>
    </main>
  );
}
