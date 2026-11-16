import type { Role, StaffRole } from "@/modules/auth/model/auth.types";

/**
 * Layout de cada perfil (RN-05.10). "completo" é o painel da operação: menu lateral por grupos e barra
 * inferior no celular. "foco" é para quem usa poucas telas, como a revisora jurídica: barra no topo com as
 * telas dela e área de leitura mais estreita, sem a operação à vista. Parceiro e cliente também usam o "foco".
 */
export type LayoutVariant = "completo" | "foco";

export interface Profile {
  label: string;
  /** Linha abaixo do logo. */
  tagline: string;
  variant: LayoutVariant;
}

const PROFILES: Record<Role, Profile> = {
  admin: { label: "Administração", tagline: "Central de mobilidade", variant: "completo" },
  central: { label: "Central", tagline: "Central de mobilidade", variant: "completo" },
  legal_reviewer: { label: "Jurídico", tagline: "Revisão jurídica", variant: "foco" },
  parceiro: { label: "Parceiro", tagline: "Área do parceiro", variant: "foco" },
  cliente: { label: "Cliente", tagline: "Minha conta", variant: "foco" },
};

const FALLBACK: Profile = { label: "", tagline: "Central de mobilidade", variant: "completo" };

export function profileFor(role: string | undefined): Profile {
  return (role && PROFILES[role as Role]) || FALLBACK;
}

/** Papéis que o admin pode dar em Usuários; parceiro e cliente têm conta pelo próprio cadastro. */
export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: PROFILES.admin.label,
  central: PROFILES.central.label,
  legal_reviewer: PROFILES.legal_reviewer.label,
};
