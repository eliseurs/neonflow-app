import { CalendarDays, Car, Contact, FileText, Handshake, LayoutDashboard, Plane, ScrollText, Users, Wallet, type LucideIcon } from "lucide-react";

type Role = "admin" | "central" | "legal_reviewer";
const OPS: Role[] = ["admin", "central"];

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

// Abas por assunto; cada papel vê só o que pode abrir (a API decide, o menu acompanha).
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "", items: [{ to: "/central", label: "Visão geral", icon: LayoutDashboard, roles: OPS }] },
  {
    title: "Operação",
    items: [
      { to: "/reservas", label: "Reservas", icon: CalendarDays, roles: OPS },
      { to: "/transfers", label: "Transfer", icon: Plane, roles: OPS },
      { to: "/frota", label: "Frota", icon: Car, roles: OPS },
    ],
  },
  {
    title: "Relacionamento",
    items: [
      { to: "/clientes", label: "Clientes", icon: Contact, roles: OPS },
      { to: "/parceiros", label: "Parceiros", icon: Handshake, roles: OPS },
    ],
  },
  { title: "Financeiro", items: [{ to: "/repasses", label: "Repasses", icon: Wallet, roles: OPS }] },
  {
    title: "Documentos",
    items: [
      { to: "/contratos", label: "Contratos", icon: ScrollText, roles: ["admin", "legal_reviewer"] },
      { to: "/termos", label: "Termos", icon: FileText, roles: ["admin"] },
    ],
  },
  { title: "Administração", items: [{ to: "/usuarios", label: "Usuários", icon: Users, roles: ["admin"] }] },
];

/** Grupos visíveis para o papel, sem grupos vazios. */
export function navFor(role: string | undefined): { title: string; items: NavItem[] }[] {
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => role !== undefined && i.roles.includes(role as Role)) })).filter(
    (g) => g.items.length > 0,
  );
}

/** Tela inicial do papel: a primeira aba que ele pode abrir. */
export function homeFor(role: string | undefined): string {
  return navFor(role)[0]?.items[0]?.to ?? "/central";
}

/** Atalhos da barra inferior no celular: as primeiras telas do papel, até `max`. */
export function primaryFor(role: string | undefined, max = 4): NavItem[] {
  return navFor(role)
    .flatMap((g) => g.items)
    .slice(0, max);
}

/** O item do menu que corresponde à rota atual (também nas telas de detalhe). */
export function isActiveRoute(item: Pick<NavItem, "to">, path: string): boolean {
  return path === item.to || path.startsWith(`${item.to}/`);
}
