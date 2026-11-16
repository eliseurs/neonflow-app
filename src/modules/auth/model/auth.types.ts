export type Role = "admin" | "central" | "legal_reviewer";

/** Permissões da API (neonflow-api `internal/pkg/authz`, RN-05.10). */
export type Permission = "operacao" | "contratos" | "clientes.anonimizar" | "termos.publicar" | "usuarios" | "auditoria";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** O que o papel pode abrir. Sessões gravadas antes de 16/11/2026 não têm: o painel espera o /auth/me. */
  permissions?: Permission[];
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
