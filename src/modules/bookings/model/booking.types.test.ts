import { describe, expect, it } from "vitest";
import { excessKm, extrasCents, isActive, isCancelable, isOverdue, lateDays, nextStage, pendingChecks, rentalDays, stageChecks } from "./booking.types";

describe("etapas da reserva", () => {
  it("segue o fluxo da API", () => {
    expect(nextStage("preparacao")).toBe("confirmada");
    expect(nextStage("devolvida")).toBe("encerrada");
    expect(nextStage("encerrada")).toBeNull();
    expect(nextStage("cancelada")).toBeNull();
  });

  it("lista as conferências que faltam", () => {
    expect(pendingChecks({ stage: "preparacao", checks: { cnh: true, payment: true } })).toEqual([
      "Aceite dos termos",
      "Caução pré-autorizada",
    ]);
    expect(pendingChecks({ stage: "confirmada", checks: { delivery: true } })).toEqual([]);
    expect(pendingChecks({ stage: "encerrada", checks: {} })).toEqual([]);
  });

  it("cancela só antes da entrega", () => {
    expect(isCancelable("preparacao")).toBe(true);
    expect(isCancelable("confirmada")).toBe(true);
    expect(isCancelable("em_locacao")).toBe(false);
  });

  it("ativas são as que bloqueiam o período", () => {
    expect(isActive("devolvida")).toBe(true);
    expect(isActive("encerrada")).toBe(false);
    expect(isActive("cancelada")).toBe(false);
  });

  it("em devolvida, o checklist de devolução entra nas conferências", () => {
    const items = [{ key: "combustivel", label: "Combustível" }, { key: "pneus", label: "Pneus" }];
    expect(stageChecks("devolvida", items).map((c) => c.key)).toEqual(["issues", "combustivel", "pneus"]);
    expect(stageChecks("confirmada", items).map((c) => c.key)).toEqual(["delivery"]);
    expect(pendingChecks({ stage: "devolvida", checks: { issues: true, pneus: true } }, items)).toEqual(["Combustível"]);
  });

  it("conta diárias em blocos de 24 horas (RN-02.24)", () => {
    expect(rentalDays("2026-12-10T14:00", "2026-12-11T14:00")).toBe(1);
    expect(rentalDays("2026-12-10T14:00", "2026-12-11T15:00")).toBe(2);
    expect(rentalDays("2026-12-10T10:00", "2026-12-10T13:00")).toBe(1);
    expect(rentalDays("2026-12-10T14:00", "2026-12-10T14:00")).toBe(0);
    expect(rentalDays("2026-12-10T14:00", "")).toBe(0);
  });

  it("calcula o atraso como a API (RN-02.19)", () => {
    const end = "2026-12-12T10:00:00-03:00";
    const at = (iso: string) => Date.parse(iso);
    expect(lateDays(end, at("2026-12-12T08:00:00-03:00"))).toBe(0);
    expect(lateDays(end, at("2026-12-12T11:00:00-03:00"))).toBe(0);
    expect(lateDays(end, at("2026-12-12T11:01:00-03:00"))).toBe(1);
    expect(lateDays(end, at("2026-12-13T11:00:00-03:00"))).toBe(1);
    expect(lateDays(end, at("2026-12-13T11:01:00-03:00"))).toBe(2);
  });

  it("marca a locação atrasada depois da tolerância", () => {
    const b = { stage: "em_locacao" as const, end_at: "2026-12-12T10:00:00-03:00" };
    expect(isOverdue(b, Date.parse("2026-12-12T11:00:00-03:00"))).toBe(false);
    expect(isOverdue(b, Date.parse("2026-12-12T11:01:00-03:00"))).toBe(true);
    expect(isOverdue({ ...b, stage: "devolvida" }, Date.parse("2026-12-20T10:00:00-03:00"))).toBe(false);
  });

  it("calcula km excedente e extras como a API", () => {
    expect(excessKm(200, 2, 400)).toBe(0);
    expect(excessKm(200, 2, 450)).toBe(50);
    expect(excessKm(200, 3, 450)).toBe(0);
    expect(extrasCents({ extra_cents: 10000, excess_km_cents: 7500 })).toBe(17500);
  });
});
