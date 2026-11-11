import { describe, expect, it } from "vitest";
import { expectedAmount, totalsByPartner, type Payout } from "./payouts.types";

const p = (partner: string, amount: number | null): Payout => ({
  id: Math.random().toString(), kind: "comissao", booking_id: "b", transfer_id: null, client_name: "", description: "", end_at: "",
  partner_id: partner, partner_name: `Parceiro ${partner}`, base_cents: 0, percent: amount === null ? null : 10,
  amount_cents: amount, status: "pendente", paid_at: null, paid_by_name: null, created_at: "",
});

describe("totalsByPartner", () => {
  it("soma por parceiro, maior primeiro, e conta os sem percentual", () => {
    const t = totalsByPartner([p("a", 100), p("b", 500), p("a", 200), p("a", null)]);
    expect(t.map((x) => x.partnerId)).toEqual(["b", "a"]);
    expect(t[1]).toMatchObject({ amountCents: 300, count: 3, undefinedCount: 1 });
  });
});

describe("expectedAmount", () => {
  const partner = { commission_percent: 10, owner_share_percent: 70 };
  it("usa o valor gravado quando existe", () => {
    expect(expectedAmount({ kind: "repasse", amount_cents: 123, base_cents: 999 }, partner)).toEqual({ cents: 123, percent: null });
  });
  it("calcula como a API: base × pontos-base ÷ 10000, arredondado ao centavo", () => {
    expect(expectedAmount({ kind: "repasse", amount_cents: null, base_cents: 34000 }, partner)).toEqual({ cents: 23800, percent: 70 });
    expect(expectedAmount({ kind: "comissao", amount_cents: null, base_cents: 12345 }, { ...partner, commission_percent: 12.5 })).toEqual({ cents: 1543, percent: 12.5 });
  });
  it("sem percentual no parceiro (ou motorista sem valor) devolve nulo", () => {
    expect(expectedAmount({ kind: "repasse", amount_cents: null, base_cents: 100 }, { commission_percent: 10, owner_share_percent: null })).toBeNull();
    expect(expectedAmount({ kind: "motorista", amount_cents: null, base_cents: 100 }, partner)).toBeNull();
    expect(expectedAmount({ kind: "comissao", amount_cents: null, base_cents: 100 }, undefined)).toBeNull();
  });
});

