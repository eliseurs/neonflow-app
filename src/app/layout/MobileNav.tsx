import { KeyRound, LifeBuoy, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { NavGroups } from "./NavGroups";
import { isActiveRoute, primaryFor } from "./nav";

interface Props {
  role: string | undefined;
  name: string;
  roleLabel: string;
  onChangePassword: () => void;
  onLogout: () => void;
}

/**
 * Celular: barra fixa embaixo com as telas principais do papel e o botão Menu, que abre um painel
 * com todos os grupos, a ajuda e a conta. O painel fecha ao trocar de tela, ao tocar fora e no Esc.
 */
export function MobileNav({ role, name, roleLabel, onChangePassword, onLogout }: Props) {
  const path = useLocation().pathname;
  const [open, setOpen] = useState(false);
  const primary = primaryFor(role);
  // A tela atual está fora da barra? Então o botão Menu fica destacado.
  const elsewhere = !primary.some((i) => isActiveRoute(i, path));

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const item = "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]";

  return (
    <>
      <nav
        aria-label="Navegação"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/[0.08] bg-noir/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {primary.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/central"} className={({ isActive }) => cn(item, isActive ? "text-gold" : "text-bone/55")}>
            <Icon className="h-5 w-5" aria-hidden />
            <span className="max-w-full truncate px-1">{label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} className={cn(item, open || elsewhere ? "text-gold" : "text-bone/55")}>
          <Menu className="h-5 w-5" aria-hidden />
          Menu
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-white/[0.08] bg-noir pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <div className="min-w-0">
                <p className="truncate font-serif text-lg font-light">{name}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.2em] text-bone/45">{roleLabel}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2 text-bone/60 hover:text-gold">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto px-3 pb-4">
              <NavGroups role={role} size="touch" onNavigate={() => setOpen(false)} />
            </div>
            <div className="grid grid-cols-3 border-t border-white/[0.08]">
              <Link to="/ajuda" className="flex flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/60">
                <LifeBuoy className="h-5 w-5" aria-hidden /> Ajuda
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onChangePassword();
                }}
                className="flex flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/60"
              >
                <KeyRound className="h-5 w-5" aria-hidden /> Senha
              </button>
              <button type="button" onClick={onLogout} className="flex flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/60">
                <LogOut className="h-5 w-5" aria-hidden /> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
