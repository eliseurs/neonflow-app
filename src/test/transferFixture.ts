import type { Transfer } from "@/modules/transfers/model/transfer.types";

export const transfer = (over: Partial<Transfer> = {}): Transfer => ({
  id: "t1", client_name: "Cliente Teste", pickup_at: "2026-12-10T08:30:00-03:00", origin: "Aeroporto POA", destination: "Gramado",
  flight: "LA3090", passengers: 2, notes: "", price_cents: 45000, stage: "aguardando_motorista", offer_cents: null,
  offer_expires_at: null, driver_partner_id: null, driver_name: null, driver_cents: null, paid_at: null, extra_wait_cents: 0,
  cancel_fee_cents: 0, flight_cancelled: false, referred_by_partner_id: null, created_by: null, created_at: "", updated_at: "", ...over,
});
