/** Papéis da equipe, criados pelo admin em Usuários. */
export type StaffRole = "admin" | "central" | "legal_reviewer";
/** Parceiro entra por convite da central e cliente pelo cadastro no site (API RN-05.11 a 05.14). */
export type Role = StaffRole | "parceiro" | "cliente";

/** Permissões da API (neonflow-api `internal/pkg/authz`, RN-05.10). */
export type Permission =
  | "operacao"
  | "contratos"
  | "clientes.anonimizar"
  | "termos.publicar"
  | "usuarios"
  | "auditoria"
  | "area.parceiro"
  | "area.cliente";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** O que o papel pode abrir. Sessões gravadas antes de 16/11/2026 não têm: o painel espera o /auth/me. */
  permissions?: Permission[];
  /** Conta de parceiro ou de cliente: o cadastro a que ela pertence. */
  partner_id?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: User;
}
