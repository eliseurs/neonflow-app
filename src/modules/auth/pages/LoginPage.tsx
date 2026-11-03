import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      setSession(res.token, res.expires_at, res.user);
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    },
  });

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-ink-line bg-ink-soft p-8" noValidate>
        <h1 className="font-display text-2xl font-bold">
          neon<span className="text-mint">flow</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">Central de mobilidade</p>

        <label className="mt-8 block text-sm" htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-3 py-2 outline-none focus:border-mint"
        />

        <label className="mt-4 block text-sm" htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-3 py-2 outline-none focus:border-mint"
        />

        {login.isError && (
          <p role="alert" className="mt-4 text-sm text-rose-400">
            {apiErrorMessage(login.error, "Não foi possível entrar.")}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending || !email || !password}
          className="mt-6 w-full rounded-lg bg-mint py-2 font-semibold text-ink transition hover:bg-mint-dark disabled:opacity-50"
        >
          {login.isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
