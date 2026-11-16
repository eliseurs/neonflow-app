import { CalendarDays, Car, CircleUser, Contact, Inbox, FileText, Handshake, LayoutDashboard, Plane, ScrollText, ShieldCheck, Users, Wallet, type LucideIcon } from "lucide-react";
import type { Permission } from "@/modules/auth/model/auth.types";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Permissão da API que a tela exige; a mesma protege a rota (AppRoutes). */
  permission: Permission;
}

type Perms = readonly string[] | undefined;

// Abas por assunto; cada perfil vê só o que pode abrir (a API decide, o menu acompanha).
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  // Parceiro e cliente: um item para cada um, na mesma tela.
  {
    title: "",
    items: [
      { to: "/minha-conta", label: "Minha conta", icon: CircleUser, permission: "area.parceiro" },
      { to: "/minha-conta", label: "Minha conta", icon: CircleUser, permission: "area.cliente" },
    ],
  },
  { title: "", items: [{ to: "/central", label: "Visão geral", icon: LayoutDashboard, permission: "operacao" }] },
  {
    title: "Operação",
    items: [
      { to: "/reservas", label: "Reservas", icon: CalendarDays, permission: "operacao" },
      { to: "/transfers", label: "Transfer", icon: Plane, permission: "operacao" },
      { to: "/frota", label: "Frota", icon: Car, permission: "operacao" },
      { to: "/pedidos", label: "Pedidos do site", icon: Inbox, permission: "operacao" },
    ],
  },
  {
    title: "Relacionamento",
    items: [
      { to: "/clientes", label: "Clientes", icon: Contact, permission: "operacao" },
      { to: "/parceiros", label: "Parceiros", icon: Handshake, permission: "operacao" },
    ],
  },
  { title: "Financeiro", items: [{ to: "/repasses", label: "Repasses", icon: Wallet, permission: "operacao" }] },
  {
    title: "Documentos",
    items: [
      { to: "/contratos", label: "Contratos", icon: ScrollText, permission: "contratos" },
      { to: "/termos", label: "Termos", icon: FileText, permission: "termos.publicar" },
    ],
  },
  {
    title: "Administração",
    items: [
      { to: "/usuarios", label: "Usuários", icon: Users, permission: "usuarios" },
      { to: "/auditoria", label: "Auditoria", icon: ShieldCheck, permission: "auditoria" },
    ],
  },
];

/** Grupos visíveis para as permissões, sem grupos vazios. */
export function navFor(permissions: Perms): { title: string; items: NavItem[] }[] {
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => permissions?.includes(i.permission) ?? false) })).filter(
    (g) => g.items.length > 0,
  );
}

/** Tela inicial do perfil: a primeira aba que ele pode abrir. */
export function homeFor(permissions: Perms): string {
  return navFor(permissions)[0]?.items[0]?.to ?? "/ajuda";
}

/** Atalhos da barra inferior no celular: as primeiras telas do perfil, até `max`. */
export function primaryFor(permissions: Perms, max = 4): NavItem[] {
  return navFor(permissions)
    .flatMap((g) => g.items)
    .slice(0, max);
}

/** O item do menu que corresponde à rota atual (também nas telas de detalhe). */
export function isActiveRoute(item: Pick<NavItem, "to">, path: string): boolean {
  return path === item.to || path.startsWith(`${item.to}/`);
}
