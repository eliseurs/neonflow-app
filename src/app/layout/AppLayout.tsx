import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Car, Handshake, KeyRound, LayoutDashboard, LogOut, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { cn } from "@/shared/lib/cn";
import { ChangePasswordForm } from "@/modules/users/components/ChangePasswordForm";
import { Wordmark } from "@/shared/ui/Brand";
import { Dialog } from "@/shared/ui/Dialog";

const NAV = [
  { to: "/central", label: "Central", icon: LayoutDashboard },
  { to: "/reservas", label: "Reservas", icon: CalendarDays },
      { to: "/frota", label: "Frota", icon: Car },
    { to: "/parceiros", label: "Parceiros", icon: Handshake },
  { to: "/repasses", label: "Repasses", icon: Wallet },
  { to: "/usuarios", label: "Usuários", icon: Users, adminOnly: true },
];

const ROLE_LABEL: Record<string, string> = { admin: "Administração", central: "Central" };

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-3 rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition",
    isActive ? "bg-gold/10 text-gold" : "text-bone/60 hover:text-bone",
  );
}

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

    const links = NAV.filter((n) => !n.adminOnly || user?.role === "admin").map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} end={to === "/central"} className={navClass}>
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </NavLink>
  ));

  return (
    <div className="flex min-h-screen bg-noir font-sans text-bone">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.08] px-5 py-8 md:flex">
        <Link to="/central" aria-label="Neon Flow — Central" className="px-2">
          <Wordmark />
        </Link>
        <p className="mt-2 px-2 text-[10px] uppercase tracking-[0.24em] text-gold/80">Central de mobilidade</p>
        <nav className="mt-12 flex flex-1 flex-col gap-1" aria-label="Navegação principal">
          {links}
        </nav>
        <div className="border-t border-white/[0.08] pt-6">
          <p className="truncate px-2 font-serif text-lg font-light">{user?.name ?? "—"}</p>
          <p className="truncate px-2 text-[10px] uppercase tracking-[0.2em] text-bone/45">{user ? ROLE_LABEL[user.role] ?? user.role : ""}</p>
                    <button
            type="button"
            onClick={() => setChangingPassword(true)}
            className="mt-4 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/60 hover:text-gold"
          >
            <KeyRound className="h-4 w-4" aria-hidden /> Trocar senha
          </button>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/60 hover:text-gold"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-noir/85 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/central" aria-label="Neon Flow — Central">
              <Wordmark />
            </Link>
                        <div className="flex items-center">
              <button type="button" onClick={() => setChangingPassword(true)} aria-label="Trocar senha" className="p-2 text-bone/60 hover:text-gold">
                <KeyRound className="h-5 w-5" aria-hidden />
              </button>
              <button type="button" onClick={logout} aria-label="Sair" className="p-2 text-bone/60 hover:text-gold">
                <LogOut className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3" aria-label="Navegação">
            {links}
          </nav>
        </header>
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10 md:py-12">
          <Outlet />
        </main>
        {changingPassword && (
          <Dialog title="Trocar senha" onClose={() => setChangingPassword(false)}>
            <ChangePasswordForm onDone={() => setChangingPassword(false)} />
          </Dialog>
        )}
      </div>
    </div>
  );
}
