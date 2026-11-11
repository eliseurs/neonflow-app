// Espelha internal/domain/payout da API (RN-03.12, RN-03.13).
export type PayoutKind = "comissao" | "repasse" | "motorista";
export type PayoutStatus = "pendente" | "paga";

export interface Payout {
  id: string;
  kind: PayoutKind;
    /** Origem: reserva de aluguel ou transfer. */
  booking_id: string | null;
  transfer_id: string | null;
  client_name: string;
  /** Carro da reserva ou "origem → destino" do transfer. */
  description: string;
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
  motorista: "Motoristas",
};

export const KIND_BASE: Record<PayoutKind, string> = {
    comissao: "sobre o valor do serviço",
  repasse: "sobre diárias, atraso e km",
  motorista: "oferta aceita + espera extra",
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

/**
 * Valor que a API grava ao marcar como pago. Sem percentual no encerramento, ela copia o percentual
 * atual do parceiro (comissão ou repasse) e calcula base × pontos-base ÷ 10000, arredondando ao centavo
 * (payout.Amount). Nulo = o parceiro ainda não tem percentual.
 */
export function expectedAmount(
  p: Pick<Payout, "kind" | "amount_cents" | "base_cents">,
  partner: { commission_percent: number | null; owner_share_percent: number | null } | undefined,
): { cents: number; percent: number | null } | null {
  if (p.amount_cents !== null) return { cents: p.amount_cents, percent: null };
  const percent = p.kind === "comissao" ? partner?.commission_percent : p.kind === "repasse" ? partner?.owner_share_percent : null;
  if (percent === null || percent === undefined) return null;
  const bp = Math.round(percent * 100);
  return { cents: Math.floor((p.base_cents * bp + 5000) / 10000), percent };
}
