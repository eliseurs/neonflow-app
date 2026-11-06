// Espelha internal/domain/fleet/entity.go da API.
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
}

export type VehicleRequest = Omit<Vehicle, "id" | "created_at" | "updated_at">;

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
