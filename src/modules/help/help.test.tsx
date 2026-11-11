import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { navFor } from "@/app/layout/nav";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { renderPage } from "@/test/render";
import { ARTICLES, articleForPath, articlesFor } from "./content";
import { HelpArticlePage } from "./pages/HelpArticlePage";
import { HelpPage } from "./pages/HelpPage";

/**
 * Abas que ainda não têm artigo (segundo lote). Ao escrever o artigo, tire a rota daqui:
 * o teste falha se uma rota estiver aqui e também tiver artigo, ou se não estiver em lugar nenhum.
 */
const PENDING: string[] = [];

const loginAs = (role: string) =>
  useAuthStore.setState({ token: "t", expiresAt: "2099-01-01T00:00:00Z", user: { id: "u1", name: "Teste", email: "t@neonflow.test", role } } as never);

beforeEach(() => useAuthStore.setState({ token: null, expiresAt: null, user: null }));

describe("central de ajuda: cobertura", () => {
  const routes = [...new Set(["admin", "central", "legal_reviewer"].flatMap((r) => navFor(r).flatMap((g) => g.items.map((i) => i.to))))];
  const covered = new Set(ARTICLES.flatMap((a) => a.routes));

  it.each(routes)("a aba %s tem artigo de ajuda (ou está na lista de pendentes)", (route) => {
    expect(covered.has(route) || PENDING.includes(route)).toBe(true);
  });

  it("a lista de pendentes não tem rota que já ganhou artigo nem rota que saiu do menu", () => {
    for (const r of PENDING) {
      expect(covered.has(r), `${r} já tem artigo: tire de PENDING`).toBe(false);
      expect(routes, `${r} não está mais no menu`).toContain(r);
    }
  });

  it("artigos bem formados", () => {
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(ARTICLES.length);
    for (const a of ARTICLES) {
      expect(a.updated, a.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.sections.length, a.slug).toBeGreaterThan(0);
      expect(a.roles.length, a.slug).toBeGreaterThan(0);
      for (const r of a.rules) expect(r, a.slug).toMatch(/^RN-\d{2}\.\d+$/);
    }
  });
});

describe("central de ajuda: acesso e contexto", () => {
  it("cada papel vê só os artigos dos fluxos que usa", () => {
    expect(articlesFor("central").map((a) => a.slug)).toEqual([
      "visao-geral", "reservas", "transfer", "frota", "clientes-parceiros", "repasses", "usuarios", "novidades",
    ]);
    expect(articlesFor("legal_reviewer").map((a) => a.slug)).toEqual(["contratos", "usuarios", "novidades"]);
    expect(articlesFor(undefined)).toEqual([]);
  });

  it("acha o artigo da tela, também nas telas de detalhe", () => {
    expect(articleForPath("/reservas", "central")?.slug).toBe("reservas");
    expect(articleForPath("/reservas/123", "central")?.slug).toBe("reservas");
    expect(articleForPath("/contratos/versoes/v1", "admin")?.slug).toBe("contratos");
    expect(articleForPath("/contratos", "central")).toBeUndefined();
    expect(articleForPath("/reservasx", "admin")).toBeUndefined();
    expect(articleForPath("/central", "central")?.slug).toBe("visao-geral");
    expect(articleForPath("/parceiros", "admin")?.slug).toBe("clientes-parceiros");
  });

  it("índice lista os artigos do papel", () => {
    loginAs("central");
    renderPage(<HelpPage />);
    expect(screen.getByRole("link", { name: /Reservas \(aluguel sem motorista\)/ })).toHaveAttribute("href", "/ajuda/reservas");
    expect(screen.getByRole("link", { name: /^Transfer/ })).toHaveAttribute("href", "/ajuda/transfer");
    expect(screen.queryByText("Contratos e termos")).toBeNull();
    expect(screen.getByRole("link", { name: /^Novidades/ })).toHaveAttribute("href", "/ajuda/novidades");
  });

  it("atalhos só para as telas que o papel abre", () => {
    loginAs("central");
    renderPage(<HelpArticlePage />, { path: "/ajuda/:slug", route: "/ajuda/usuarios" });
    expect(screen.getByRole("heading", { name: "Usuários e acesso" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir usuarios" })).toBeNull();
  });

  it("artigo mostra etapas, passo a passo, dúvidas e regras", () => {
    loginAs("admin");
    renderPage(<HelpArticlePage />, { path: "/ajuda/:slug", route: "/ajuda/reservas" });
    expect(screen.getByRole("heading", { name: "Reservas (aluguel sem motorista)" })).toBeInTheDocument();
    expect(screen.getByText("Etapa 1")).toBeInTheDocument();
    expect(screen.getByText(/Clique em Criar pré-reserva/)).toBeInTheDocument();
    const q = screen.getByText("O botão de avançar está desabilitado. Por quê?");
    fireEvent.click(q);
    expect(screen.getByText(/Falta alguma conferência/)).toBeInTheDocument();
    expect(screen.getByText(/RN-02.19/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir reservas" })).toHaveAttribute("href", "/reservas");
  });

  it("artigo de outro papel ou inexistente volta para o índice", () => {
    loginAs("central");
    renderPage(<HelpArticlePage />, { path: "/ajuda/:slug", route: "/ajuda/contratos" });
    expect(screen.getByText("outra rota")).toBeInTheDocument();
  });
});
