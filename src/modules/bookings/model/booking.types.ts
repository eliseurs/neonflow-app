// Espelha internal/domain/booking/entity.go da API (RN-02.3, RN-02.4, RN-02.5).
import type { Tone } from "@/shared/ui/Badge";

export type Stage = "preparacao" | "confirmada" | "em_locacao" | "devolvida" | "encerrada" | "cancelada";

export interface Booking {
  id: string;
  vehicle_id: string;
  client_name: string;
  start_date: string;
  end_date: string;
  place: string;
  stage: Stage;
  days: number;
  daily_rate_cents: number;
  total_cents: number;
  checks: Record<string, boolean>;
  expires_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingEvent {
  from_stage: Stage | null;
  to_stage: Stage;
  user_id: string | null;
  created_at: string;
}

export interface CreateBookingRequest {
  vehicle_id: string;
  client_name: string;
  start_date: string;
  end_date: string;
  place: string;
}

export const FLOW: Stage[] = ["preparacao", "confirmada", "em_locacao", "devolvida", "encerrada"];

export const STAGE: Record<Stage, { label: string; tone: Tone }> = {
  preparacao: { label: "Preparação", tone: "warn" },
  confirmada: { label: "Confirmada", tone: "gold" },
  em_locacao: { label: "Em locação", tone: "ok" },
  devolvida: { label: "Devolvida", tone: "neutral" },
  encerrada: { label: "Encerrada", tone: "muted" },
  cancelada: { label: "Cancelada", tone: "muted" },
};

/** Conferências exigidas para sair de cada etapa, na ordem da API. */
export const STAGE_CHECKS: Partial<Record<Stage, { key: string; label: string }[]>> = {
  preparacao: [
    { key: "cnh", label: "CNH conferida" },
    { key: "terms", label: "Aceite dos termos" },
    { key: "deposit", label: "Caução pré-autorizada" },
    { key: "payment", label: "Pagamento integral confirmado" },
  ],
  confirmada: [{ key: "delivery", label: "Veículo entregue ao cliente" }],
  em_locacao: [{ key: "return", label: "Veículo devolvido" }],
  devolvida: [{ key: "issues", label: "Ocorrências conferidas" }],
};

export function nextStage(stage: Stage): Stage | null {
  const i = FLOW.indexOf(stage);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
}

export function pendingChecks(b: Pick<Booking, "stage" | "checks">): string[] {
  return (STAGE_CHECKS[b.stage] ?? []).filter((c) => !b.checks?.[c.key]).map((c) => c.label);
}

export function isCancelable(stage: Stage): boolean {
  return stage === "preparacao" || stage === "confirmada";
}

export function isActive(stage: Stage): boolean {
  return stage !== "encerrada" && stage !== "cancelada";
}
