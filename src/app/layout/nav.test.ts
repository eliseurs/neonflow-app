import { describe, expect, it } from "vitest";
import { homeFor, isActiveRoute, navFor, primaryFor } from "./nav";

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

describe("atalhos do celular", () => {
  it("as quatro primeiras telas do papel", () => {
    expect(primaryFor("admin").map((i) => i.label)).toEqual(["Visão geral", "Reservas", "Transfer", "Frota"]);
    expect(primaryFor("legal_reviewer").map((i) => i.label)).toEqual(["Contratos"]);
    expect(primaryFor(undefined)).toEqual([]);
  });

  it("reconhece a rota atual também no detalhe", () => {
    expect(isActiveRoute({ to: "/reservas" }, "/reservas")).toBe(true);
    expect(isActiveRoute({ to: "/reservas" }, "/reservas/123")).toBe(true);
    expect(isActiveRoute({ to: "/reservas" }, "/reservasx")).toBe(false);
  });
});
