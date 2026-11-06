// Espelha internal/domain/fleet/entity.go da API.
import type { Tone } from "@/shared/ui/Badge";

export type Category = "economy" | "premium";
export type Gear = "manual" | "automatico";

export interface Vehicle {
  id: string;
  plate: string;
  name: string;
  category: Category;
  owner: string;
  seats: number;
  gear: Gear;
  daily_rate_cents: number;
  in_maintenance: boolean;
  created_at: string;
  updated_at: string;
  /** Calculado pela API nas leituras da frota (RN-01.1, RN-01.3, RN-01.6). */
  status?: VehicleStatus;
  next_booking?: NextBooking;
}

export type VehicleStatus = "manutencao" | "em_locacao" | "aguardando_checklist" | "reservado" | "livre";

export interface NextBooking {
  id: string;
  client_name: string;
  start_date: string;
  end_date: string;
  stage: string;
}

export const VEHICLE_STATUS: Record<VehicleStatus, { label: string; tone: Tone }> = {
  manutencao: { label: "Manutenção", tone: "warn" },
  em_locacao: { label: "Em locação", tone: "ok" },
  aguardando_checklist: { label: "Aguardando checklist", tone: "warn" },
  reservado: { label: "Reservado", tone: "gold" },
  livre: { label: "Livre", tone: "neutral" },
};

/** Sem o estado calculado (respostas antigas), cai no que o cadastro diz. */
export function vehicleStatus(v: Pick<Vehicle, "status" | "in_maintenance">): VehicleStatus {
  return v.status ?? (v.in_maintenance ? "manutencao" : "livre");
}

export type VehicleRequest = Omit<Vehicle, "id" | "created_at" | "updated_at" | "status" | "next_booking">;

export const CATEGORY_LABEL: Record<Category, string> = { economy: "Economy", premium: "Premium" };
export const GEAR_LABEL: Record<Gear, string> = { manual: "Manual", automatico: "Automático" };

/** ABC1234 ou ABC1D23, como a API normaliza (sem hífen, maiúsculas). */
export function normalizePlate(plate: string): string {
  return plate.trim().replace(/-/g, "").toUpperCase();
}

export const PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export function formatPlate(plate: string): string {
  return /^[A-Z]{3}[0-9]{4}$/.test(plate) ? `${plate.slice(0, 3)}-${plate.slice(3)}` : plate;
}
