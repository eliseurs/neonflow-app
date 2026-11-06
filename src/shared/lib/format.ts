const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

/** "1.234,56", "1234.5" ou "320" → centavos. Inválido ou negativo → null. */
export function parseReais(input: string): number | null {
  const raw = input.replace(/[R$\s]/g, "");
  if (!raw) return null;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** "2026-11-05" → "05/11/2026", sem passar por fuso. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Fuso da operação (Gramado). Datas e horas do painel são sempre mostradas nele. */
export const OPERATION_TZ = "America/Sao_Paulo";

function parts(date: Date): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: OPERATION_TZ,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  return Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
}

/** Instante ISO → "10/12/2026 14:00", no horário de Gramado. */
export function formatDateTime(iso: string): string {
  const p = parts(new Date(iso));
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

/** Dia (AAAA-MM-DD) de um instante no horário de Gramado. */
export function operationDay(date: Date | string = new Date()): string {
  const p = parts(typeof date === "string" ? new Date(date) : date);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Valor de um campo datetime-local: dia deslocado e hora cheia (ex.: "2026-12-10T10:00"). */
export function localDateTime(offsetDays = 0, hour = 10, from = new Date()): string {
  return `${isoDate(offsetDays, from)}T${String(hour).padStart(2, "0")}:00`;
}

/** Data local de hoje (ou deslocada em dias) como AAAA-MM-DD. */
export function isoDate(offsetDays = 0, from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offsetDays);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
