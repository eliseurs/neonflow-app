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
  /** Hora real da entrega e da devolução, informadas pela central (RN-02.19). */
  delivered_at: string | null;
  returned_at: string | null;
  /** Diárias extras do atraso na devolução e o valor delas (RN-02.19). */
    extra_days: number;
  extra_cents: number;
  /** Caução e plano de km copiados do veículo na criação (RN-06.4, RN-02.18). km_limit_per_day null = km livre. */
  deposit_cents: number | null;
  km_limit_per_day: number | null;
  extra_km_cents: number | null;
  /** Odômetro na entrega e na devolução e o excedente cobrado (RN-02.18). */
  delivered_km: number | null;
  returned_km: number | null;
  excess_km: number;
  excess_km_cents: number;
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
  /** "livre" ou "limitado"; vazio: limitado se o veículo tiver limite (RN-02.18). */
  km_plan?: KmPlan;
}

export type KmPlan = "livre" | "limitado";

/** Km acima da franquia: limite por dia × diárias cobradas (reserva + atraso). Espelha a API. */
export function excessKm(limitPerDay: number, chargedDays: number, driven: number): number {
  return Math.max(driven - limitPerDay * chargedDays, 0);
}

/** Cobranças além da reserva: atraso (RN-02.19) e km excedente (RN-02.18). */
export function extrasCents(b: Pick<Booking, "extra_cents" | "excess_km_cents">): number {
  return b.extra_cents + b.excess_km_cents;
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** Tolerância na devolução: até 1 hora depois do combinado não cobra (RN-02.19). */
export const LATE_TOLERANCE_MS = 60 * 60 * 1000;

/** Diárias extras de uma devolução: 1 por bloco de 24 horas iniciado depois da tolerância. Espelha a API. */
export function lateDays(endAt: string, returnedMs: number): number {
  const late = returnedMs - Date.parse(endAt) - LATE_TOLERANCE_MS;
  if (!Number.isFinite(late) || late <= 0) return 0;
  return Math.ceil(late / DAY_MS);
}

/** Em locação e já passou da devolução combinada mais a tolerância. */
export function isOverdue(b: Pick<Booking, "stage" | "end_at">, now: number = Date.now()): boolean {
  return b.stage === "em_locacao" && now > Date.parse(b.end_at) + LATE_TOLERANCE_MS;
}

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
