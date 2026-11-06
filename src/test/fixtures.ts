import type { Booking } from "@/modules/bookings/model/booking.types";
import type { Vehicle } from "@/modules/fleet/model/fleet.types";

// Dados fictícios. A diária é só um número de teste, não tarifa do produto.
export const vehicle = (over: Partial<Vehicle> = {}): Vehicle => ({
  id: "v1",
  plate: "ABC1D23",
  name: "Carro Teste",
  category: "economy",
  owner: "Parceiro Teste",
  seats: 5,
  gear: "automatico",
  daily_rate_cents: 10000,
  in_maintenance: false,
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
  ...over,
});

export const booking = (over: Partial<Booking> = {}): Booking => ({
  id: "b1",
  vehicle_id: "v1",
  client_name: "Cliente Teste",
  start_date: "2026-12-10",
  end_date: "2026-12-12",
  place: "Aeroporto",
  stage: "preparacao",
  days: 2,
  daily_rate_cents: 10000,
  total_cents: 20000,
  checks: {},
  expires_at: "2026-11-06T12:00:00Z",
  created_by: "u1",
  created_at: "2026-11-05T12:00:00Z",
  updated_at: "2026-11-05T12:00:00Z",
  ...over,
});
