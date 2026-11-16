// Espelha internal/domain/user da API: gestão de usuários do painel (RN-05.6).
import type { StaffRole } from "@/modules/auth/model/auth.types";

export interface PanelUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

export interface UpdateUserRequest {
  name: string;
  role: StaffRole;
  active?: boolean;
}

/** Papéis que o admin pode dar, com o nome do perfil (RN-05.3). */
export { ROLE_LABEL } from "@/app/layout/profiles";

/** Mesma regra da API (authentication.MinPasswordLength). */
export const MIN_PASSWORD_LENGTH = 10;
