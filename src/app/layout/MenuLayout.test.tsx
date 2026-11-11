import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { NavGroups } from "./NavGroups";

function renderAt(route: string, ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

describe("menu em acordeão", () => {
  it("fecha e abre um grupo e lembra no navegador", () => {
    const { unmount } = renderAt("/central", <NavGroups role="admin" size="compact" />);
    const toggle = screen.getByRole("button", { name: "Relacionamento" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Clientes/ })).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /Clientes/ })).toBeNull();
    unmount();
    renderAt("/central", <NavGroups role="admin" size="compact" />);
    expect(screen.getByRole("button", { name: "Relacionamento" })).toHaveAttribute("aria-expanded", "false");
  });

  it("o grupo da tela atual também fecha, com o chevron, e o título fica dourado", () => {
    renderAt("/reservas/123", <NavGroups role="admin" size="compact" />);
    const toggle = screen.getByRole("button", { name: "Operação" });
    expect(toggle).toBeEnabled();
    expect(toggle.querySelector("svg")).not.toBeNull();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /Reservas/ })).toBeNull();
    expect(toggle.className).toContain("text-gold");
    fireEvent.click(toggle);
    expect(screen.getByRole("link", { name: /Reservas/ })).toBeInTheDocument();
  });

  it("ao navegar para uma tela de grupo fechado, ele abre sozinho", () => {
    localStorage.setItem("neonflow-nav-fechados", JSON.stringify(["Operação"]));
    renderAt(
      "/central",
      <>
        <NavGroups role="admin" size="compact" />
        <Link to="/reservas/9">ir para a reserva</Link>
      </>,
    );
    expect(screen.getByRole("button", { name: "Operação" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("link", { name: "ir para a reserva" }));
    expect(screen.getByRole("button", { name: "Operação" })).toHaveAttribute("aria-expanded", "true");
    expect(JSON.parse(localStorage.getItem("neonflow-nav-fechados") ?? "[]")).toEqual([]);
  });

  it("ao carregar a página, o grupo fechado continua fechado", () => {
    localStorage.setItem("neonflow-nav-fechados", JSON.stringify(["Operação"]));
    renderAt("/reservas", <NavGroups role="admin" size="compact" />);
    expect(screen.getByRole("button", { name: "Operação" })).toHaveAttribute("aria-expanded", "false");
  });

  it("storage inválido abre todos", () => {
    localStorage.setItem("neonflow-nav-fechados", "{quebrado");
    renderAt("/central", <NavGroups role="admin" size="compact" />);
    expect(screen.getByRole("button", { name: "Financeiro" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("navegação no celular", () => {
  const props = { name: "Ana Teste", roleLabel: "Central", onChangePassword: vi.fn(), onLogout: vi.fn() };

  it("barra com as telas principais e o Menu com o restante", () => {
    renderAt("/central", <MobileNav role="central" {...props} />);
    const bar = screen.getByRole("navigation", { name: "Navegação" });
    expect(within(bar).getAllByRole("link").map((l) => l.textContent)).toEqual(["Visão geral", "Reservas", "Transfer", "Frota"]);
    fireEvent.click(within(bar).getByRole("button", { name: "Menu" }));
    const sheet = screen.getByRole("dialog", { name: "Menu" });
    expect(within(sheet).getByText("Ana Teste")).toBeInTheDocument();
    expect(within(sheet).getByRole("link", { name: /Repasses/ })).toHaveAttribute("href", "/repasses");
    expect(within(sheet).getByRole("link", { name: /Ajuda/ })).toHaveAttribute("href", "/ajuda");
  });

  it("o painel fecha ao escolher uma tela e no Esc", () => {
    renderAt("/central", <MobileNav role="central" {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("link", { name: /Clientes/ }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("trocar senha e sair pelo painel", () => {
    renderAt("/central", <MobileNav role="central" {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: /Senha/ }));
    expect(props.onChangePassword).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("button", { name: /Sair/ }));
    expect(props.onLogout).toHaveBeenCalled();
  });

  it("tela fora da barra destaca o Menu", () => {
    renderAt("/repasses", <MobileNav role="central" {...props} />);
    expect(screen.getByRole("button", { name: "Menu" }).className).toContain("text-gold");
  });
});
