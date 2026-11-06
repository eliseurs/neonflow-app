// Espelha internal/domain/dashboard da API (PEN-11, q97, q98).
export interface Summary {
  month: string;
  /** Reservas com retirada no mês, confirmadas em diante: diárias + atraso + km. */
  pickup_revenue_cents: number;
  pickup_count: number;
  /** Pagamentos marcados no mês, pelo valor das diárias. */
  paid_cents: number;
  paid_count: number;
  rented_today: number;
  fleet_size: number;
  occupancy_percent: number;
}

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-11" → "novembro de 2026". */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return MONTHS[m - 1] ? `${MONTHS[m - 1]} de ${y}` : month;
}
