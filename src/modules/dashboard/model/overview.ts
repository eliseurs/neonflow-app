import { isOverdue, type Booking } from "@/modules/bookings/model/booking.types";
import { vehicleStatus, type Vehicle } from "@/modules/fleet/model/fleet.types";
import type { Payout } from "@/modules/payouts/model/payouts.types";
import type { Transfer } from "@/modules/transfers/model/transfer.types";
import { operationDay } from "@/shared/lib/format";

/** Números da visão geral, a partir das listas que a API já devolve. Nenhuma regra nova: só contagem. */
export interface Overview {
  /** Agora */
  onRoad: number;
  overdue: Booking[];
  available: number;
  activeFleet: number;
  fleetSize: number;
  maintenance: number;
  awaitingChecklist: number;
  /** Hoje (dia de Gramado) */
  pickupsToday: number;
  returnsToday: number;
  transfersToday: number;
  awaitingPayment: number;
  /** Transfers ainda sem motorista, de hoje em diante. */
  transfersWithoutDriver: number;
  /** Repasses e comissões a pagar: soma dos valores definidos e quantos ainda sem percentual. */
  payoutPendingCents: number;
  payoutPendingCount: number;
  payoutUndefinedCount: number;
}

export function overview(bookings: Booking[], vehicles: Vehicle[], transfers: Transfer[], payouts: Payout[], now: number = Date.now()): Overview {
  const today = operationDay(new Date(now).toISOString());
  const day = (iso: string) => operationDay(iso);
  const statuses = vehicles.map(vehicleStatus);
  const pending = payouts.filter((p) => p.status === "pendente");
  return {
    onRoad: bookings.filter((b) => b.stage === "em_locacao").length,
    overdue: bookings.filter((b) => isOverdue(b, now)).sort((a, b) => a.end_at.localeCompare(b.end_at)),
    available: statuses.filter((s) => s === "livre").length,
    activeFleet: vehicles.filter((v) => !v.in_maintenance).length,
    fleetSize: vehicles.length,
    maintenance: vehicles.filter((v) => v.in_maintenance).length,
    awaitingChecklist: statuses.filter((s) => s === "aguardando_checklist").length,
    pickupsToday: bookings.filter((b) => b.stage === "confirmada" && day(b.start_at) === today).length,
    returnsToday: bookings.filter((b) => b.stage === "em_locacao" && day(b.end_at) === today).length,
    transfersToday: transfers.filter((t) => t.stage !== "cancelado" && day(t.pickup_at) === today).length,
    awaitingPayment: bookings.filter((b) => b.stage === "preparacao").length,
    transfersWithoutDriver: transfers.filter((t) => t.stage === "aguardando_motorista" && day(t.pickup_at) >= today).length,
    payoutPendingCents: pending.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0),
    payoutPendingCount: pending.length,
    payoutUndefinedCount: pending.filter((p) => p.amount_cents === null).length,
  };
}
