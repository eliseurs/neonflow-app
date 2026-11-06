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
  /** Quando a central marcou o pagamento; nulo = não pago. */
  paid_at: string | null;
  /** Diárias extras do atraso na devolução e o valor delas (RN-02.19). */
            /** Minutos de atraso na devolução, cobrados a diária ÷ 1440 (RN-02.19). */
    extra_minutes: number;
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
    /** Parceiro que indicou o cliente (RN-07.5). */
  referred_by_partner_id: string | null;
  /** Cliente cadastrado; client_name é o nome no dia da reserva. */
  customer_id: string | null;
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
    /** Parceiro que indicou; vazio = sem indicação. */
  referred_by_partner_id?: string;
  customer_id?: string;
}

export type KmPlan = "livre" | "limitado";

/** Km acima da franquia: limite por dia × diárias contratadas; atraso não traz franquia (q90). Espelha a API. */
export function excessKm(limitPerDay: number, contractedDays: number, driven: number): number {
  return Math.max(driven - limitPerDay * contractedDays, 0);
}

/** Cobranças além da reserva: atraso (RN-02.19) e km excedente (RN-02.18). */
export function extrasCents(b: Pick<Booking, "extra_cents" | "excess_km_cents">): number {
  return b.extra_cents + b.excess_km_cents;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const MINUTES_PER_DAY = 24 * 60;
/** Tolerância na devolução: até 1 hora depois do combinado não cobra (RN-02.19). */
export const LATE_TOLERANCE_MS = 60 * 60 * 1000;

/** Minutos de atraso: nada até 1 hora; depois, os minutos exatos desde o combinado. Espelha a API. */
export function lateMinutes(endAt: string, returnedMs: number): number {
  const late = returnedMs - Date.parse(endAt);
  if (!Number.isFinite(late) || late <= LATE_TOLERANCE_MS) return 0;
  return Math.floor(late / MINUTE_MS);
}

/** Valor do atraso: diária ÷ 1440 por minuto, arredondado ao centavo. Espelha a API. */
export function lateCents(minutes: number, dailyRateCents: number): number {
  return Math.floor((minutes * dailyRateCents + MINUTES_PER_DAY / 2) / MINUTES_PER_DAY);
}

/** "65 min" → "1 h 05 min"; "1 dia 6 h 00 min". */
export function formatMinutes(minutes: number): string {
  const days = Math.floor(minutes / MINUTES_PER_DAY);
  const hours = Math.floor((minutes % MINUTES_PER_DAY) / 60);
  const mins = minutes % 60;
  const time = hours === 0 && days === 0 ? `${mins} min` : `${hours} h ${String(mins).padStart(2, "0")} min`;
  if (days === 0) return time;
  return `${days === 1 ? "1 dia" : `${days} dias`} ${time}`;
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
