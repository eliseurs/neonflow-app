import { describe, expect, it } from "vitest";
import { isActive, isCancelable, nextStage, pendingChecks } from "./booking.types";

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
});
