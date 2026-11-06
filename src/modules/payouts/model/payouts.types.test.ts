import { describe, expect, it } from "vitest";
import { totalsByPartner, type Payout } from "./payouts.types";

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
