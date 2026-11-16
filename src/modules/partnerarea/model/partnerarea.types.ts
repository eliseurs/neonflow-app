// Espelha internal/domain/partnerarea da API: a área do parceiro logado (RN-07.8 a 07.11).
import type { Stage } from "@/modules/bookings/model/booking.types";
import type { PartnerKind } from "@/modules/partners/model/partners.types";
import type { TransferStage } from "@/modules/transfers/model/transfer.types";
import { formatCents, formatDate } from "@/shared/lib/format";

export interface Payout {
  base_cents: number;
  /** Pontos-base (1% = 100); nulo = a definir ou valor fixo (motorista). */
  percent_bp: number | null;
  amount_cents: number | null;
  paid_at: string | null;
}

export interface AreaPartner {
  id: string;
  name: string;
  kinds: PartnerKind[];
  referral_code: string;
}

export interface AreaVehicle {
  id: string;
  name: string;
  plate: string;
  in_maintenance: boolean;
}

export interface AreaBooking {
  id: string;
  vehicle_name: string;
  start_at: string;
  end_at: string;
  stage: Stage;
  days: number;
  extra_minutes: number;
  excess_km: number;
  payout: Payout | null;
}

export interface AreaRide {
  id: string;
  pickup_at: string;
  origin: string;
  destination: string;
  flight: string;
  passengers: number;
  client_name: string;
  stage: TransferStage;
  driver_cents: number;
  payout: Payout | null;
}

export interface AreaReferral {
  id: string;
  kind: "aluguel" | "transfer";
  at: string;
  stage: Stage | TransferStage;
  payout: Payout | null;
}

export interface PartnerAreaData {
  partner: AreaPartner;
  vehicles: AreaVehicle[];
  bookings: AreaBooking[];
  rides: AreaRide[];
  referrals: AreaReferral[];
}

/** "R$ 280,00 · 70% de R$ 400,00 · pago em 20/12/2026", ou a situação enquanto não há valor. */
export function payoutLabel(p: Payout | null, pending = "gerado no encerramento"): string {
  if (!p) return `A receber: ${pending}`;
  const percent = p.percent_bp === null ? "" : ` · ${String(p.percent_bp / 100).replace(".", ",")}% de ${formatCents(p.base_cents)}`;
  const amount = p.amount_cents === null ? "percentual a definir" : formatCents(p.amount_cents);
  const status = p.paid_at ? `pago em ${formatDate(p.paid_at.slice(0, 10))}` : "pendente";
  return `${amount}${percent} · ${status}`;
}

/** Soma do que já foi pago e do que está pendente (com valor definido). */
export function totals(payouts: (Payout | null)[]): { paid: number; pending: number } {
  return payouts.reduce(
    (acc, p) => {
      if (!p || p.amount_cents === null) return acc;
      if (p.paid_at) acc.paid += p.amount_cents;
      else acc.pending += p.amount_cents;
      return acc;
    },
    { paid: 0, pending: 0 },
  );
}
