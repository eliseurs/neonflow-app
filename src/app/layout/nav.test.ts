import { describe, expect, it } from "vitest";
import { homeFor, navFor } from "./nav";

const labels = (role?: string) => navFor(role).map((g) => [g.title, g.items.map((i) => i.label)]);

describe("menu por papel", () => {
  it("admin vê todos os grupos, na ordem", () => {
    expect(labels("admin")).toEqual([
      ["", ["Visão geral"]],
      ["Operação", ["Reservas", "Transfer", "Frota"]],
      ["Relacionamento", ["Clientes", "Parceiros"]],
      ["Financeiro", ["Repasses"]],
      ["Documentos", ["Contratos", "Termos"]],
      ["Administração", ["Usuários"]],
    ]);
    expect(homeFor("admin")).toBe("/central");
  });

  it("central não vê documentos nem usuários", () => {
    const titles = navFor("central").map((g) => g.title);
    expect(titles).toEqual(["", "Operação", "Relacionamento", "Financeiro"]);
  });

  it("revisora jurídica só vê contratos e começa por eles", () => {
    expect(labels("legal_reviewer")).toEqual([["Documentos", ["Contratos"]]]);
    expect(homeFor("legal_reviewer")).toBe("/contratos");
  });

  it("sem papel não há abas", () => {
    expect(navFor(undefined)).toEqual([]);
    expect(homeFor(undefined)).toBe("/central");
  });
});
