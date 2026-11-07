// Espelha internal/domain/fleet/entity.go da API.
import type { Tone } from "@/shared/ui/Badge";

export type Category = "economy" | "premium";
export type Gear = "manual" | "automatico";
export type Fuel = "flex" | "gasolina" | "etanol" | "diesel" | "eletrico" | "hibrido";
export type Feature =
  | "ar_condicionado" | "direcao_eletrica" | "vidros_eletricos" | "multimidia" | "bluetooth"
  | "camera_re" | "sensor_estacionamento" | "piloto_automatico" | "bancos_couro" | "teto_solar";

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
  /** Caução (RN-06.4) e quilometragem (RN-02.18), configuráveis; null = não informado. */
    deposit_cents: number | null;
  km_limit_per_day: number | null;
  extra_km_cents: number | null;
    /** Parceiro proprietário cadastrado (RN-07.4); "owner" continua como nome. */
  owner_partner_id: string | null;
  /** Ficha para o site e o painel; todos opcionais. */
  year: number | null;
  color: string;
  fuel: Fuel | "";
  doors: number | null;
  features: Feature[];
  description: string;
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
  start_at: string;
  end_at: string;
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

export const FUEL_LABEL: Record<Fuel, { pt: string; en: string }> = {
  flex: { pt: "Flex", en: "Flex fuel" },
  gasolina: { pt: "Gasolina", en: "Gasoline" },
  etanol: { pt: "Etanol", en: "Ethanol" },
  diesel: { pt: "Diesel", en: "Diesel" },
  eletrico: { pt: "Elétrico", en: "Electric" },
  hibrido: { pt: "Híbrido", en: "Hybrid" },
};

/** Itens da ficha, na ordem da API, com o rótulo em PT e EN. */
export const FEATURES: { key: Feature; pt: string; en: string }[] = [
  { key: "ar_condicionado", pt: "Ar-condicionado", en: "Air conditioning" },
  { key: "direcao_eletrica", pt: "Direção elétrica", en: "Power steering" },
  { key: "vidros_eletricos", pt: "Vidros elétricos", en: "Power windows" },
  { key: "multimidia", pt: "Multimídia", en: "Infotainment" },
  { key: "bluetooth", pt: "Bluetooth", en: "Bluetooth" },
  { key: "camera_re", pt: "Câmera de ré", en: "Rear camera" },
  { key: "sensor_estacionamento", pt: "Sensor de estacionamento", en: "Parking sensors" },
  { key: "piloto_automatico", pt: "Piloto automático", en: "Cruise control" },
  { key: "bancos_couro", pt: "Bancos de couro", en: "Leather seats" },
  { key: "teto_solar", pt: "Teto solar", en: "Sunroof" },
];

/** Desempenho do carro nos últimos 12 meses (GET /vehicles/stats e /vehicles/:id/stats). */
export interface VehicleStats {
  vehicle_id: string;
  name: string;
  plate: string;
  bookings: number;
  rented_days: number;
  occupancy_percent: number;
  revenue_cents: number;
  km_driven: number;
  maintenance_count: number;
  maintenance_cents: number;
  /** Receita menos manutenção (sem repasse nem comissão). */
  result_cents: number;
  last_maintenance: string | null;
  since: string;
}

export type MaintenanceKind = "preventiva" | "corretiva" | "revisao" | "pneus" | "outros";
export const MAINTENANCE_KIND: Record<MaintenanceKind, string> = {
  preventiva: "Preventiva", corretiva: "Corretiva", revisao: "Revisão", pneus: "Pneus", outros: "Outros",
};

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  date: string;
  kind: MaintenanceKind;
  description: string;
  cost_cents: number | null;
  odometer_km: number | null;
  workshop: string;
  created_at: string;
}

export type MaintenanceRequest = Pick<MaintenanceRecord, "date" | "kind" | "description" | "cost_cents" | "odometer_km" | "workshop">;

/** ABC1234 ou ABC1D23, como a API normaliza (sem hífen, maiúsculas). */
export function normalizePlate(plate: string): string {
  return plate.trim().replace(/-/g, "").toUpperCase();
}

export const PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

/** "200 km/dia · R$ 1,50 por km excedente", "200 km/dia · excedente a definir" ou "Km livre". */
export function kmPlanLabel(limit: number | null, extraCents: number | null, money: (c: number) => string): string {
  if (!limit) return "Km livre";
  return extraCents ? `${limit} km/dia · ${money(extraCents)} por km excedente` : `${limit} km/dia · excedente a definir`;
}

export function formatPlate(plate: string): string {
  return /^[A-Z]{3}[0-9]{4}$/.test(plate) ? `${plate.slice(0, 3)}-${plate.slice(3)}` : plate;
}
