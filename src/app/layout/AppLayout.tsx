import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Car, LayoutDashboard, LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { cn } from "@/shared/lib/cn";

const NAV = [
  { to: "/", label: "Central", icon: LayoutDashboard },
  { to: "/frota", label: "Frota", icon: Car },
  { to: "/reservas", label: "Reservas", icon: CalendarDays },
];

export function AppLayout() {
  const navigate = useNavigate();
  const { user, setUser, clear } = useAuthStore();

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

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-line bg-ink-soft p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display font-bold text-mint">N</span>
          <span className="font-display text-lg font-bold">
            neon<span className="text-mint">flow</span>
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Navegação principal">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5",
                  isActive && "bg-mint/10 text-mint",
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-line pt-4">
          <p className="truncate px-2 text-sm">{user?.name ?? "—"}</p>
          <p className="truncate px-2 text-xs text-slate-400">{user?.role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
