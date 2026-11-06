// Espelha internal/domain/payout da API (RN-03.12, RN-03.13).
export type PayoutKind = "comissao" | "repasse";
export type PayoutStatus = "pendente" | "paga";

export interface Payout {
  id: string;
  kind: PayoutKind;
  booking_id: string;
  client_name: string;
  vehicle_name: string;
  end_at: string;
  partner_id: string;
  partner_name: string;
  base_cents: number;
  /** Nulo = percentual a definir no cadastro do parceiro. */
  percent: number | null;
  amount_cents: number | null;
  status: PayoutStatus;
  paid_at: string | null;
  paid_by_name: string | null;
  created_at: string;
}

export const KIND_TITLE: Record<PayoutKind, string> = {
  comissao: "Comissões de indicadores",
  repasse: "Repasses aos proprietários",
};

export const KIND_BASE: Record<PayoutKind, string> = {
  comissao: "sobre as diárias",
  repasse: "sobre diárias, atraso e km",
};

export interface PartnerTotal {
  partnerId: string;
  partnerName: string;
  count: number;
  amountCents: number;
  /** Itens sem percentual, que ainda não somam valor. */
  undefinedCount: number;
}

/** Total a pagar por parceiro, maior primeiro. */
export function totalsByPartner(list: Payout[]): PartnerTotal[] {
  const map = new Map<string, PartnerTotal>();
  for (const p of list) {
    const t = map.get(p.partner_id) ?? { partnerId: p.partner_id, partnerName: p.partner_name, count: 0, amountCents: 0, undefinedCount: 0 };
    t.count++;
    if (p.amount_cents === null) t.undefinedCount++;
    else t.amountCents += p.amount_cents;
    map.set(p.partner_id, t);
  }
  return [...map.values()].sort((a, b) => b.amountCents - a.amountCents);
}
