import { describe, expect, it } from "vitest";
import { transfer } from "@/test/transferFixture";
import { cancelFee, driverMessage, isCancellable, isOpen, sameDayLabel } from "./transfer.types";


describe("transfer.types", () => {
  it("calcula a multa como a API (RN-02.10)", () => {
    const at = (iso: string) => Date.parse(iso);
    expect(cancelFee(transfer(), false, at("2026-12-09T08:30:00-03:00"))).toBe(0);
    expect(cancelFee(transfer(), false, at("2026-12-09T09:30:00-03:00"))).toBe(22500);
    expect(cancelFee(transfer({ price_cents: 45001 }), false, at("2026-12-10T08:00:00-03:00"))).toBe(22501);
    expect(cancelFee(transfer(), true, at("2026-12-10T08:00:00-03:00"))).toBe(0);
  });

  it("sabe o que está aberto e o que pode ser cancelado", () => {
    expect(isOpen("com_motorista")).toBe(true);
    expect(isOpen("concluido")).toBe(false);
    expect(isCancellable("aguardando_motorista")).toBe(true);
    expect(isCancellable("em_andamento")).toBe(false);
  });

  it("monta a mensagem pessoal ao motorista, sem o nome do cliente", () => {
    const msg = driverMessage(transfer(), " João da Silva ", 35000);
    expect(msg).toContain("Olá, João!");
    expect(msg).toContain("Aeroporto POA → Gramado, 10/12/2026 08:30, 2 passageiros, voo LA3090.");
    expect(msg).toMatch(/Valor para você: R\$\s350,00\./);
    expect(msg).toContain("Você consegue fazer?");
    expect(msg).not.toContain("Cliente Teste");
    const plain = driverMessage(transfer({ passengers: 1, flight: "" }), "Ana", null);
    expect(plain).toContain("1 passageiro.");
    expect(plain).not.toContain("Valor");
  });

  it("lista os horários do mesmo dia", () => {
    expect(sameDayLabel(["2026-12-10T08:00:00-03:00", "2026-12-10T15:30:00-03:00"])).toBe("08:00, 15:30");
  });
});
