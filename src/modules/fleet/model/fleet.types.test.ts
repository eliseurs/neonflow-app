import { describe, expect, it } from "vitest";
import { minDaysLabel } from "./fleet.types";

describe("minDaysLabel", () => {
  it("escreve o mínimo de diárias", () => {
    expect(minDaysLabel(null)).toBe("1 diária");
    expect(minDaysLabel(1)).toBe("1 diária");
    expect(minDaysLabel(3)).toBe("3 diárias");
  });
});
