// Espelha internal/domain/transfer da API (RN-02.9 a 02.31).
import type { Tone } from "@/shared/ui/Badge";
import { formatCents, formatDateTime } from "@/shared/lib/format";

export type TransferStage = "aguardando_motorista" | "com_motorista" | "em_andamento" | "concluido" | "cancelado";

export interface Transfer {
  id: string;
  client_name: string;
  pickup_at: string;
  origin: string;
  destination: string;
  flight: string;
  passengers: number;
  notes: string;
  price_cents: number;
  stage: TransferStage;
  offer_cents: number | null;
  offer_expires_at: string | null;
  driver_partner_id: string | null;
  driver_name: string | null;
  driver_cents: number | null;
  paid_at: string | null;
  extra_wait_cents: number;
  cancel_fee_cents: number;
  flight_cancelled: boolean;
  referred_by_partner_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransferEvent {
  action: string;
  detail: string;
  user_name: string | null;
  created_at: string;
}

export interface CreateTransferRequest {
  client_name: string;
  pickup_at: string;
  origin: string;
  destination: string;
  flight: string;
  passengers: number;
  notes: string;
  price_cents: number;
  referred_by_partner_id?: string;
}

export const TRANSFER_STAGE: Record<TransferStage, { label: string; tone: Tone }> = {
  aguardando_motorista: { label: "Aguardando motorista", tone: "warn" },
  com_motorista: { label: "Com motorista", tone: "gold" },
  em_andamento: { label: "Em andamento", tone: "ok" },
  concluido: { label: "Concluído", tone: "muted" },
  cancelado: { label: "Cancelado", tone: "muted" },
};

export const EVENT_LABEL: Record<string, string> = {
  criado: "Transfer registrado",
  oferta: "Oferta aberta aos motoristas",
  oferta_reaberta: "Oferta reaberta",
  aceito: "Motorista aceitou",
  desistiu: "Motorista desistiu (sem penalidade)",
  pago: "Pagamento marcado",
  pagamento_desfeito: "Pagamento desmarcado",
  iniciado: "Corrida iniciada",
  concluido: "Corrida concluída",
  cancelado: "Transfer cancelado",
};

export const isOpen = (s: TransferStage) => s !== "concluido" && s !== "cancelado";
export const isCancellable = (s: TransferStage) => s === "aguardando_motorista" || s === "com_motorista";

const FREE_CANCEL_MS = 24 * 60 * 60 * 1000;

/** Multa do cancelamento: grátis até 24 horas antes ou com voo cancelado; dentro, 50% (RN-02.10). Espelha a API. */
export function cancelFee(t: Pick<Transfer, "price_cents" | "pickup_at">, flightCancelled: boolean, now: number = Date.now()): number {
  if (flightCancelled || Date.parse(t.pickup_at) - now >= FREE_CANCEL_MS) return 0;
  return Math.floor((t.price_cents + 1) / 2);
}

/** A oferta já passou do prazo? */
export function offerExpired(t: Pick<Transfer, "offer_expires_at">, now: number = Date.now()): boolean {
  return t.offer_expires_at !== null && Date.parse(t.offer_expires_at) <= now;
}

/** Texto para a central enviar aos motoristas pelo WhatsApp (RN-02.27). Sem o nome do cliente. */
export function offerMessage(t: Transfer): string {
  const pax = t.passengers === 1 ? "1 passageiro" : `${t.passengers} passageiros`;
  return [
    "Corrida disponível — Neon Flow",
    `${t.origin} → ${t.destination}`,
    `${formatDateTime(t.pickup_at)} · ${pax}${t.flight ? ` · voo ${t.flight}` : ""}`,
    t.offer_cents !== null ? `Valor para o motorista: ${formatCents(t.offer_cents)}` : "",
    t.offer_expires_at ? `Responda até ${formatDateTime(t.offer_expires_at)}. O primeiro que aceitar leva.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
