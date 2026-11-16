// Espelha internal/domain/audit da API: trilha das rotas (RN-05.9).
export interface AuditEntry {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  method: string;
  route: string;
  path: string;
  status: number;
  created_at: string;
}

export interface AuditFilter {
  userId?: string;
  denied?: boolean;
}

const ACTION: Record<string, string> = { POST: "Criou ou executou", PUT: "Alterou", PATCH: "Alterou", DELETE: "Apagou", GET: "Tentou abrir" };

/** Frase curta do que aconteceu; o login aparece como entrada no painel. */
export function describe(e: Pick<AuditEntry, "method" | "route" | "status">): string {
  if (e.route === "/api/auth/login") return "Entrou no painel";
  const what = e.route.replace(/^\/api/, "");
  if (e.status === 403) return `Acesso negado: ${what}`;
  return `${ACTION[e.method] ?? e.method} ${what}`;
}

export function outcome(status: number): { label: string; tone: "ok" | "muted" | "warn" } {
  if (status === 403) return { label: "Negado", tone: "warn" };
  if (status >= 200 && status < 300) return { label: "Feito", tone: "ok" };
  return { label: `Recusado (${status})`, tone: "muted" };
}
