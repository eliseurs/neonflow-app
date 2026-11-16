import type { Permission, Role } from "@/modules/auth/model/auth.types";

/** Cópia da matriz da API (neonflow-api `internal/pkg/authz`) só para os testes: no painel, a lista vem do login. */
export const PERMS: Record<Role, Permission[]> = {
  admin: ["operacao", "clientes.anonimizar", "termos.publicar", "contratos", "usuarios", "auditoria"],
  central: ["operacao"],
  legal_reviewer: ["contratos"],
};
