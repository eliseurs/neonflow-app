import { describe, expect, it } from "vitest";
import { PERMS } from "@/test/permissions";
import { homeFor, isActiveRoute, navFor, primaryFor } from "./nav";

const labels = (role?: keyof typeof PERMS) => navFor(role && PERMS[role]).map((g) => [g.title, g.items.map((i) => i.label)]);

describe("menu por permissão", () => {
  it("admin vê todos os grupos, na ordem", () => {
    expect(labels("admin")).toEqual([
      ["", ["Visão geral"]],
      ["Operação", ["Reservas", "Transfer", "Frota", "Pedidos do site"]],
      ["Relacionamento", ["Clientes", "Parceiros"]],
      ["Financeiro", ["Repasses"]],
      ["Documentos", ["Contratos", "Termos"]],
      ["Administração", ["Usuários", "Auditoria"]],
    ]);
    expect(homeFor(PERMS.admin)).toBe("/central");
  });

  it("central não vê documentos nem usuários", () => {
    const titles = navFor(PERMS.central).map((g) => g.title);
    expect(titles).toEqual(["", "Operação", "Relacionamento", "Financeiro"]);
  });

  it("revisora jurídica só vê contratos e começa por eles", () => {
    expect(labels("legal_reviewer")).toEqual([["Documentos", ["Contratos"]]]);
    expect(homeFor(PERMS.legal_reviewer)).toBe("/contratos");
  });

  it("parceiro e cliente só veem Minha conta e começam por ela", () => {
    expect(labels("parceiro")).toEqual([["", ["Minha conta"]]]);
    expect(labels("cliente")).toEqual([["", ["Minha conta"]]]);
    expect(homeFor(PERMS.parceiro)).toBe("/minha-conta");
    expect(homeFor(PERMS.cliente)).toBe("/minha-conta");
  });

  it("sem permissão não há abas e o início é a ajuda", () => {
    expect(navFor(undefined)).toEqual([]);
    expect(navFor([])).toEqual([]);
    expect(homeFor(undefined)).toBe("/ajuda");
  });

  it("segue a lista da API, não o nome do papel", () => {
    expect(labels()).toEqual([]);
    expect(navFor(["contratos", "auditoria"]).flatMap((g) => g.items.map((i) => i.to))).toEqual(["/contratos", "/auditoria"]);
  });
});

describe("atalhos do celular", () => {
  it("as quatro primeiras telas do papel", () => {
    expect(primaryFor(PERMS.admin).map((i) => i.label)).toEqual(["Visão geral", "Reservas", "Transfer", "Frota"]);
    expect(primaryFor(PERMS.legal_reviewer).map((i) => i.label)).toEqual(["Contratos"]);
    expect(primaryFor(undefined)).toEqual([]);
  });

  it("reconhece a rota atual também no detalhe", () => {
    expect(isActiveRoute({ to: "/reservas" }, "/reservas")).toBe(true);
    expect(isActiveRoute({ to: "/reservas" }, "/reservas/123")).toBe(true);
    expect(isActiveRoute({ to: "/reservas" }, "/reservasx")).toBe(false);
  });
});
