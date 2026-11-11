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
import { MobileNav } from "./MobileNav";
import { NavGroups } from "./NavGroups";
import { homeFor } from "./nav";

const ROLE_LABEL: Record<string, string> = { admin: "Administração", central: "Central", legal_reviewer: "Jurídico" };

const footerAction = "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:text-gold";

export function AppLayout() {
  const navigate = useNavigate();
  const { user, setUser, clear } = useAuthStore();
  const [changingPassword, setChangingPassword] = useState(false);

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
  const roleLabel = user ? ROLE_LABEL[user.role] ?? user.role : "";
  // Ajuda no contexto: o artigo do fluxo desta tela, se houver.
  const help = articleForPath(useLocation().pathname, role);

  return (
    <div className="flex min-h-screen bg-noir font-sans text-bone">
      {/* Desktop: menu compacto em acordeão; cabe numa tela de notebook sem rolagem. */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.08] px-4 py-5 md:flex">
        <Link to={homeFor(role)} aria-label="Neon Flow — início" className="px-2">
          <Wordmark />
        </Link>
        <p className="mt-1.5 px-2 text-[9px] uppercase tracking-[0.24em] text-gold/70">Central de mobilidade</p>
        <nav className="mt-5 min-h-0 flex-1 overflow-y-auto" aria-label="Navegação principal">
          <NavGroups role={role} size="compact" />
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
          <Link to={homeFor(role)} aria-label="Neon Flow — início">
            <Wordmark size="sm" />
          </Link>
          <Link to={help ? `/ajuda/${help.slug}` : "/ajuda"} aria-label="Ajuda desta tela" className="p-2 text-bone/60 hover:text-gold">
            <HelpCircle className="h-5 w-5" aria-hidden />
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-10 md:py-12">
          {help && (
            <div className="mb-4 hidden justify-end md:flex">
              <Link to={`/ajuda/${help.slug}`} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/55 hover:text-gold">
                <HelpCircle className="h-4 w-4" aria-hidden /> Ajuda desta tela
              </Link>
            </div>
          )}
          <Outlet />
        </main>
        <MobileNav role={role} name={user?.name ?? "—"} roleLabel={roleLabel} onChangePassword={() => setChangingPassword(true)} onLogout={logout} />
        {changingPassword && (
          <Dialog title="Trocar senha" onClose={() => setChangingPassword(false)}>
            <ChangePasswordForm onDone={() => setChangingPassword(false)} />
          </Dialog>
        )}
      </div>
    </div>
  );
}
