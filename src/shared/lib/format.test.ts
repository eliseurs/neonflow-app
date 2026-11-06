import { describe, expect, it } from "vitest";
import { centsToInput, formatCents, formatDate, isoDate, parseReais } from "./format";

describe("format", () => {
  it("formata centavos em reais", () => {
    expect(formatCents(123456).replace(/\s/g, " ")).toBe("R$ 1.234,56");
  });

  it.each([
    ["320", 32000],
    ["1.234,56", 123456],
    ["R$ 99,9", 9990],
    ["150.5", 15050],
  ])("lê %s como %i centavos", (input, cents) => {
    expect(parseReais(input)).toBe(cents);
  });

  it.each(["", "abc", "-10", "1,234"])("recusa %j", (input) => {
    expect(parseReais(input)).toBeNull();
  });

  it("converte centavos para o campo", () => {
    expect(centsToInput(15050)).toBe("150,50");
  });

  it("formata a data sem fuso", () => {
    expect(formatDate("2026-11-05")).toBe("05/11/2026");
  });

  it("calcula datas locais", () => {
    const base = new Date(2026, 11, 31);
    expect(isoDate(0, base)).toBe("2026-12-31");
    expect(isoDate(1, base)).toBe("2027-01-01");
  });
});
