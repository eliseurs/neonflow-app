// Espelha internal/domain/booking/entity.go da API (RN-02.3, RN-02.4, RN-02.5).
import type { Tone } from "@/shared/ui/Badge";

export type Stage = "preparacao" | "confirmada" | "em_locacao" | "devolvida" | "encerrada" | "cancelada";

export interface Booking {
  id: string;
  vehicle_id: string;
  client_name: string;
  /** Retirada e devolução combinadas, ISO com fuso (RN-02.23). */
  start_at: string;
  end_at: string;
  /** Dia da retirada e da devolução em Gramado (compatibilidade). */
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
  /** Data e hora de Gramado, como o campo datetime-local (AAAA-MM-DDTHH:MM). */
  start_at: string;
  end_at: string;
  place: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Diárias entre dois valores de datetime-local: blocos de 24 horas a partir da retirada,
 * arredondando para cima (RN-02.24), mínimo 1. Devolve 0 se o período for inválido.
 */
export function rentalDays(start: string, end: string): number {
  const diff = Date.parse(end) - Date.parse(start);
  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / DAY_MS));
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

export interface CheckItem {
  key: string;
  label: string;
}

/** Conferências da etapa: as fixas e, em "devolvida", os itens ativos do checklist de devolução (RN-01.6). */
export function stageChecks(stage: Stage, returnChecklist: CheckItem[] = []): CheckItem[] {
  const fixed = STAGE_CHECKS[stage] ?? [];
  return stage === "devolvida" ? [...fixed, ...returnChecklist] : fixed;
}

export function pendingChecks(b: Pick<Booking, "stage" | "checks">, returnChecklist: CheckItem[] = []): string[] {
  return stageChecks(b.stage, returnChecklist).filter((c) => !b.checks?.[c.key]).map((c) => c.label);
}

export function isCancelable(stage: Stage): boolean {
  return stage === "preparacao" || stage === "confirmada";
}

export function isActive(stage: Stage): boolean {
  return stage !== "encerrada" && stage !== "cancelada";
}
