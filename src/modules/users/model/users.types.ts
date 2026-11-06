// Espelha internal/domain/user da API: gestão de usuários do painel (RN-05.6).
import type { Role } from "@/modules/auth/model/auth.types";

export interface PanelUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserRequest {
  name: string;
  role: Role;
  active?: boolean;
}

export const ROLE_LABEL: Record<Role, string> = { admin: "Administração", central: "Central" };

/** Mesma regra da API (authentication.MinPasswordLength). */
export const MIN_PASSWORD_LENGTH = 10;
