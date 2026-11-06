// Espelha internal/domain/partner da API (RN-07).
export type PartnerKind = "proprietario" | "motorista" | "indicador";

export interface Partner {
  id: string;
  name: string;
  kinds: PartnerKind[];
  whatsapp: string;
  email: string;
  city: string;
  notes: string;
  referral_code: string;
  commission_percent: number | null;
  owner_share_percent: number | null;
  driver_share_percent: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerRequest {
  name: string;
  kinds: PartnerKind[];
  whatsapp: string;
  email: string;
  city: string;
  notes: string;
  commission_percent: number | null;
  owner_share_percent: number | null;
  driver_share_percent: number | null;
  active?: boolean;
}

export const KIND_LABEL: Record<PartnerKind, string> = {
  proprietario: "Proprietário",
  motorista: "Motorista",
  indicador: "Indicador",
};

/** Link de indicação: a landing guarda o código e o envia na mensagem do WhatsApp (RN-07.2). */
export function referralLink(code: string, origin: string = window.location.origin): string {
  return `${origin}/?ref=${encodeURIComponent(code)}`;
}

/** "12,5" ou "12.5" → 12.5; vazio → null; inválido → undefined. */
export function parsePercent(input: string): number | null | undefined {
  const raw = input.trim().replace(",", ".");
  if (!raw) return null;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(raw)) return undefined;
  const n = Number(raw);
  return n >= 0 && n <= 100 ? n : undefined;
}

export function formatPercent(n: number | null): string {
  return n === null ? "" : String(n).replace(".", ",");
}
