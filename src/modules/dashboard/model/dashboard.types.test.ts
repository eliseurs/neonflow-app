import { describe, expect, it } from "vitest";
import { monthLabel } from "./dashboard.types";

describe("monthLabel", () => {
  it("escreve o mês por extenso", () => {
    expect(monthLabel("2026-11")).toBe("novembro de 2026");
    expect(monthLabel("2027-01")).toBe("janeiro de 2027");
    expect(monthLabel("xx")).toBe("xx");
  });
});
