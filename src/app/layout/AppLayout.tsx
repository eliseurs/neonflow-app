import { useQuery } from "@tanstack/react-query";
import { HelpCircle, KeyRound, LifeBuoy, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/modules/auth/services/auth.service";
import { articleForPath } from "@/modules/help/content";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { cn } from "@/shared/lib/cn";
import { ChangePasswordForm } from "@/modules/users/components/ChangePasswordForm";
import { Wordmark } from "@/shared/ui/Brand";
import { Dialog } from "@/shared/ui/Dialog";
import { Loading } from "@/shared/ui/Panel";
import { MobileNav } from "./MobileNav";
import { NavGroups } from "./NavGroups";
import { homeFor, navFor } from "./nav";
import { profileFor } from "./profiles";

const footerAction = "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:text-gold";

/** Painel com o layout do perfil logado (RN-05.10): "completo" para a operação, "foco" para a revisão jurídica. */
export function AppLayout() {
  const navigate = useNavigate();
  const { user, setUser, clear } = useAuthStore();
  const [changingPassword, setChangingPassword] = useState(false);

  // Também atualiza papel e permissões: uma troca feita pelo admin vale sem novo login (RN-05.8).
  useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const me = await authService.me();
      setUser(me);
      return me;
    },
  });

  const logout = () => {
    clear();
    navigate("/login", { replace: true });
  };

  const role = user?.role;
  const permissions = user?.permissions;
  const profile = profileFor(role);
  const roleLabel = user ? profile.label || user.role : "";
  // Ajuda no contexto: o artigo do fluxo desta tela, se houver.
  const help = articleForPath(useLocation().pathname, role);
  // Sessão gravada antes das permissões: espera o /auth/me para não mostrar tela restrita por engano.
  const content = permissions ? <Outlet /> : <Loading />;
  const passwordDialog = changingPassword && (
    <Dialog title="Trocar senha" onClose={() => setChangingPassword(false)}>
      <ChangePasswordForm onDone={() => setChangingPassword(false)} />
    </Dialog>
  );
  const helpLink = (className: string) =>
    help && (
      <Link to={`/ajuda/${help.slug}`} className={className}>
        <HelpCircle className="h-4 w-4" aria-hidden /> Ajuda desta tela
      </Link>
    );

  if (profile.variant === "foco") {
    const items = navFor(permissions).flatMap((g) => g.items);
    const action = "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/55 transition hover:text-gold";
    return (
      <div className="min-h-screen bg-noir font-sans text-bone" data-layout="foco">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-noir/85 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 md:px-8">
            <Link to={homeFor(permissions)} aria-label="Neon Flow — início" className="flex flex-col">
              <Wordmark size="sm" />
              <span className="mt-1 text-[9px] uppercase tracking-[0.24em] text-gold/70">{profile.tagline}</span>
            </Link>
            <nav aria-label="Navegação principal" className="flex flex-1 gap-1">
              {items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
                      isActive ? "bg-gold/10 text-gold" : "text-bone/60 hover:text-bone",
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <div className="min-w-0 text-right">
                <p className="truncate font-serif text-base font-light">{user?.name ?? "—"}</p>
                <p className="truncate text-[9px] uppercase tracking-[0.2em] text-bone/45">{roleLabel}</p>
              </div>
              <NavLink to="/ajuda" className={action}>
                <LifeBuoy className="h-4 w-4" aria-hidden /> Ajuda
              </NavLink>
              <button type="button" onClick={() => setChangingPassword(true)} className={action} aria-label="Trocar senha">
                <KeyRound className="h-4 w-4" aria-hidden /> Senha
              </button>
              <button type="button" onClick={logout} className={action}>
                <LogOut className="h-4 w-4" aria-hidden /> Sair
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-12">
          {help && <div className="mb-4 flex justify-end">{helpLink("inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/55 hover:text-gold")}</div>}
          {content}
        </main>
        {passwordDialog}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-noir font-sans text-bone" data-layout="completo">
      {/* Desktop: menu compacto em acordeão; cabe numa tela de notebook sem rolagem. */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.08] px-4 py-5 md:flex">
        <Link to={homeFor(permissions)} aria-label="Neon Flow — início" className="px-2">
          <Wordmark />
        </Link>
        <p className="mt-1.5 px-2 text-[9px] uppercase tracking-[0.24em] text-gold/70">{profile.tagline}</p>
        <nav className="mt-5 min-h-0 flex-1 overflow-y-auto" aria-label="Navegação principal">
          <NavGroups permissions={permissions} size="compact" />
        </nav>
        <div className="border-t border-white/[0.08] pt-3">
          <p className="truncate px-2 font-serif text-base font-light">{user?.name ?? "—"}</p>
          <p className="truncate px-2 text-[9px] uppercase tracking-[0.2em] text-bone/45">{roleLabel}</p>
          <div className="mt-2 flex gap-1">
            <NavLink to="/ajuda" className={({ isActive }) => cn(footerAction, isActive ? "text-gold" : "text-bone/55")}>
              <LifeBuoy className="h-4 w-4" aria-hidden /> Ajuda
            </NavLink>
            <button type="button" onClick={() => setChangingPassword(true)} className={cn(footerAction, "text-bone/55")} aria-label="Trocar senha">
              <KeyRound className="h-4 w-4" aria-hidden /> Senha
            </button>
            <button type="button" onClick={logout} className={cn(footerAction, "text-bone/55")}>
              <LogOut className="h-4 w-4" aria-hidden /> Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Celular: topo só com o logo e a ajuda desta tela; a navegação fica na barra de baixo. */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.08] bg-noir/85 px-4 py-3 backdrop-blur md:hidden">
          <Link to={homeFor(permissions)} aria-label="Neon Flow — início">
            <Wordmark size="sm" />
          </Link>
          <Link to={help ? `/ajuda/${help.slug}` : "/ajuda"} aria-label="Ajuda desta tela" className="p-2 text-bone/60 hover:text-gold">
            <HelpCircle className="h-5 w-5" aria-hidden />
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-10 md:py-12">
          {help && (
            <div className="mb-4 hidden justify-end md:flex">
              {helpLink("inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/55 hover:text-gold")}
            </div>
          )}
          {content}
        </main>
        <MobileNav permissions={permissions} name={user?.name ?? "—"} roleLabel={roleLabel} onChangePassword={() => setChangingPassword(true)} onLogout={logout} />
        {passwordDialog}
      </div>
    </div>
  );
}
