import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { isActiveRoute, navFor, type NavItem } from "./nav";

const STORAGE_KEY = "neonflow-nav-fechados";

// Grupos fechados ficam guardados só neste navegador; sem acesso ao storage, todos abrem.
function readClosed(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeClosed(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Sem storage: o acordeão funciona, só não lembra.
  }
}

interface Props {
  role: string | undefined;
  /** "compact" no menu lateral do desktop; "touch" no painel do celular (alvos maiores). */
  size: "compact" | "touch";
  onNavigate?: () => void;
}

/** Abas por assunto em acordeão. O grupo da tela atual fica sempre aberto. */
export function NavGroups({ role, size, onNavigate }: Props) {
  const path = useLocation().pathname;
  const [closed, setClosed] = useState<string[]>(readClosed);
  const touch = size === "touch";

  const toggle = (title: string) => {
    const next = closed.includes(title) ? closed.filter((t) => t !== title) : [...closed, title];
    setClosed(next);
    writeClosed(next);
  };

  const link = ({ to, label, icon: Icon }: NavItem) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/central"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-full font-semibold uppercase transition",
          touch ? "px-4 py-3 text-xs tracking-[0.16em]" : "px-3 py-1.5 text-[11px] tracking-[0.16em]",
          isActive ? "bg-gold/10 text-gold" : "text-bone/60 hover:text-bone",
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </NavLink>
  );

  return (
    <div className={cn("flex flex-col", touch ? "gap-4" : "gap-2")}>
      {navFor(role).map((g) => {
        if (!g.title) return <div key="inicio" className="flex flex-col gap-0.5">{g.items.map(link)}</div>;
        const current = g.items.some((i) => isActiveRoute(i, path));
        const open = current || !closed.includes(g.title);
        const id = `nav-grupo-${g.title.toLowerCase()}`;
        return (
          <div key={g.title} className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => toggle(g.title)}
              disabled={current}
              aria-expanded={open}
              aria-controls={id}
              className={cn(
                "flex items-center justify-between rounded-full text-left font-semibold uppercase text-bone/40 transition enabled:hover:text-bone/70 disabled:cursor-default",
                touch ? "px-4 py-2 text-[11px] tracking-[0.22em]" : "px-3 py-1 text-[10px] tracking-[0.22em]",
              )}
            >
              {g.title}
              {!current && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open ? "rotate-180" : "")} aria-hidden />}
            </button>
            {open && (
              <div id={id} className="flex flex-col gap-0.5">
                {g.items.map(link)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
