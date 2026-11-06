import { describe, expect, it } from "vitest";
import { transfer } from "@/test/transferFixture";
import { cancelFee, isCancellable, isOpen, offerExpired, offerMessage } from "./transfer.types";


describe("transfer.types", () => {
  it("calcula a multa como a API (RN-02.10)", () => {
    const at = (iso: string) => Date.parse(iso);
    expect(cancelFee(transfer(), false, at("2026-12-09T08:30:00-03:00"))).toBe(0);
    expect(cancelFee(transfer(), false, at("2026-12-09T09:30:00-03:00"))).toBe(22500);
    expect(cancelFee(transfer({ price_cents: 45001 }), false, at("2026-12-10T08:00:00-03:00"))).toBe(22501);
    expect(cancelFee(transfer(), true, at("2026-12-10T08:00:00-03:00"))).toBe(0);
  });

  it("sabe quando a oferta venceu e o que pode ser cancelado", () => {
    expect(offerExpired(transfer())).toBe(false);
    expect(offerExpired(transfer({ offer_expires_at: "2026-12-09T10:00:00-03:00" }), Date.parse("2026-12-09T10:00:00-03:00"))).toBe(true);
    expect(offerExpired(transfer({ offer_expires_at: "2026-12-09T10:00:00-03:00" }), Date.parse("2026-12-09T09:59:00-03:00"))).toBe(false);
    expect(isOpen("com_motorista")).toBe(true);
    expect(isOpen("concluido")).toBe(false);
    expect(isCancellable("em_andamento")).toBe(false);
  });

  it("monta a mensagem da oferta sem o nome do cliente", () => {
    const msg = offerMessage(transfer({ offer_cents: 25000, offer_expires_at: "2026-12-09T10:30:00-03:00" }));
    expect(msg).toContain("Aeroporto POA → Gramado");
    expect(msg).toContain("10/12/2026 08:30 · 2 passageiros · voo LA3090");
    expect(msg).toMatch(/Valor para o motorista: R\$\s250,00/);
    expect(msg).toContain("Responda até 09/12/2026 10:30");
    expect(msg).not.toContain("Cliente Teste");
    expect(offerMessage(transfer({ passengers: 1, flight: "" }))).toContain("1 passageiro");
  });
});
