import { describe, expect, it } from "vitest";
import { formatPercent, parsePercent, referralLink } from "./partners.types";

describe("partners.types", () => {
  it("lê percentuais", () => {
    expect(parsePercent("")).toBeNull();
    expect(parsePercent("12,5")).toBe(12.5);
    expect(parsePercent("100")).toBe(100);
    expect(parsePercent("100,01")).toBeUndefined();
    expect(parsePercent("-1")).toBeUndefined();
    expect(parsePercent("abc")).toBeUndefined();
    expect(formatPercent(12.5)).toBe("12,5");
    expect(formatPercent(null)).toBe("");
  });

  it("monta o link de indicação", () => {
    expect(referralLink("HTL234", "https://neonflow.test")).toBe("https://neonflow.test/?ref=HTL234");
  });
});
