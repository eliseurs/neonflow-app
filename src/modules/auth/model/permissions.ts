import { useAuthStore } from "../store/auth.store";
import type { Permission, User } from "./auth.types";

/** O usuário tem a permissão? A API decide e devolve a lista; o painel só segue (RN-05.10). */
export function can(user: Pick<User, "permissions"> | null | undefined, permission: Permission): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

export function useCan(permission: Permission): boolean {
  return useAuthStore((s) => can(s.user, permission));
}
