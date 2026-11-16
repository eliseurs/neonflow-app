// Espelha internal/domain/siterequest da API: pedidos do site (RN-02.33 a 02.37).
import { formatCents, formatDateTime } from "@/shared/lib/format";
import type { Tone } from "@/shared/ui/Badge";

export type RequestKind = "aluguel" | "transfer";
export type RequestStatus = "solicitado" | "ajuste_pedido" | "confirmado" | "recusado" | "cancelado";

export interface Quote {
  days: number | null;
  daily_rate_cents: number | null;
  total_cents: number | null;
  deposit_cents: number | null;
  km_limit_per_day: number | null;
  extra_km_cents: number | null;
}

export interface SiteRequest extends Quote {
  id: string;
  kind: RequestKind;
  status: RequestStatus;
  customer_id: string;
  customer_name: string;
  email: string;
  whatsapp: string;
  notes: string;
  referred_by_partner_id: string | null;
  vehicle_id: string | null;
  vehicle_name: string;
  start_at: string | null;
  end_at: string | null;
  place: string;
  km_plan: "" | "livre" | "limitado";
  origin: string;
  destination: string;
  pickup_at: string | null;
  passengers: number | null;
  flight: string;
  central_note: string;
  booking_id: string | null;
  transfer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestEvent {
  from_status: RequestStatus | null;
  to_status: RequestStatus;
  note: string;
  user_id: string;
  created_at: string;
}

export interface RequestDetail extends SiteRequest {
  events: RequestEvent[];
}

export interface ClientCar extends Quote {
  id: string;
  name: string;
  category: string;
  seats: number;
  gear: string;
}

export interface RequestInput {
  kind: RequestKind;
  whatsapp: string;
  notes: string;
  referral_code?: string;
  vehicle_id?: string;
  start_at?: string;
  end_at?: string;
  place?: string;
  km_plan?: "" | "livre" | "limitado";
  origin?: string;
  destination?: string;
  pickup_at?: string;
  passengers?: number;
  flight?: string;
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  solicitado: "Aguardando a central",
  ajuste_pedido: "Ajuste pedido",
  confirmado: "Confirmado",
  recusado: "Recusado",
  cancelado: "Cancelado",
};

export const STATUS_TONE: Record<RequestStatus, Tone> = {
  solicitado: "warn",
  ajuste_pedido: "gold",
  confirmado: "ok",
  recusado: "muted",
  cancelado: "muted",
};

/** O cliente ainda pode cancelar (e, em ajuste, reenviar). */
export function isOpen(status: RequestStatus): boolean {
  return status === "solicitado" || status === "ajuste_pedido";
}

/** Uma linha: "Aluguel · Jetta · 10/12/2026 10:00 → 12/12/2026 10:00" ou "Transfer · POA → Gramado · 10/12/2026 08:30". */
export function describe(r: SiteRequest): string {
  if (r.kind === "transfer") {
    return `Transfer · ${r.origin} → ${r.destination}${r.pickup_at ? ` · ${formatDateTime(r.pickup_at)}` : ""}`;
  }
  const period = r.start_at && r.end_at ? ` · ${formatDateTime(r.start_at)} → ${formatDateTime(r.end_at)}` : "";
  return `Aluguel · ${r.vehicle_name}${period}`;
}

/** Valor do pedido: a estimativa do aluguel; o transfer é sob consulta até a central confirmar. */
export function priceLabel(q: Quote): string {
  return q.total_cents === null ? "Sob consulta" : formatCents(q.total_cents);
}

export function kmLabel(q: Quote): string {
  if (q.km_limit_per_day === null) return "Quilometragem livre";
  const extra = q.extra_km_cents === null ? "" : `, excedente ${formatCents(q.extra_km_cents)} por km`;
  return `${q.km_limit_per_day} km por dia${extra}`;
}

/** Mensagem pronta para a central avisar o cliente no WhatsApp (RN-02.36). */
export function whatsappMessage(r: SiteRequest): string {
  const first = r.customer_name.split(" ")[0] || r.customer_name;
  const what = describe(r).replace(/^(Aluguel|Transfer) · /, (m) => (m.startsWith("Aluguel") ? "aluguel do " : "transfer "));
  switch (r.status) {
    case "confirmado":
      return `Olá, ${first}! Confirmamos o seu pedido de ${what}. Os próximos passos estão em Minha conta no site e no seu e-mail.`;
    case "ajuste_pedido":
      return `Olá, ${first}! Sobre o seu pedido de ${what}: ${r.central_note} Você pode alterar o pedido em Minha conta no site.`;
    case "recusado":
      return `Olá, ${first}. Infelizmente não conseguimos atender o seu pedido de ${what}: ${r.central_note}`;
    default:
      return `Olá, ${first}! Recebemos o seu pedido de ${what} e já estamos analisando.`;
  }
}
