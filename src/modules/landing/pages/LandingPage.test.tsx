import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "./LandingPage";

function renderLanding(props: Parameters<typeof LandingPage>[0] = {}) {
  return render(
    <MemoryRouter>
      <LandingPage initialLang="pt" number="" {...props} />
    </MemoryRouter>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe("LandingPage", () => {
  it("mostra aluguel e transfer com o mesmo peso e as condições aprovadas", () => {
    renderLanding();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Aluguel e transfer na Serra Gaúcha.");
    expect(screen.getByRole("link", { name: "Alugar um carro" })).toHaveAttribute("href", "#aluguel");
    expect(screen.getByRole("link", { name: "Reservar transfer" })).toHaveAttribute("href", "#transfer");
    expect(screen.getByText("Mercedes-Benz C180")).toBeInTheDocument();
    expect(screen.getByText(/Cancelamento grátis até 48 horas antes da retirada/)).toBeInTheDocument();
    expect(screen.getByText(/Cancelamento grátis até 24 horas antes do serviço/)).toBeInTheDocument();
    expect(screen.getByText("Outras cidades sob consulta.")).toBeInTheDocument();
  });

  it("não mostra nenhum preço", () => {
    const { container } = renderLanding();
    expect(container.textContent).not.toMatch(/R\$|US\$|\$\s?\d/);
  });

  it("troca para inglês e atualiza o lang do documento", () => {
    renderLanding();
    fireEvent.click(screen.getByRole("button", { name: "Switch to English" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Car rental and transfers in the Serra Gaúcha.");
    expect(document.documentElement.lang).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Mudar para português" }));
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("sem número configurado, desativa o envio e esconde o botão flutuante", () => {
    renderLanding();
    expect(screen.getByRole("button", { name: "Enviar pelo WhatsApp" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("ainda está sendo configurado");
    expect(screen.queryByRole("link", { name: "Falar no WhatsApp" })).toBeNull();
  });

  it("com número, o pedido do card escolhe o serviço e o formulário abre o WhatsApp", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    Element.prototype.scrollIntoView = vi.fn();
    renderLanding({ number: "5554999990000" });

    expect(screen.getByRole("link", { name: "Falar no WhatsApp" })).toHaveAttribute("href", "https://wa.me/5554999990000");

    fireEvent.click(screen.getByRole("button", { name: "Pedir transfer" }));
    const form0 = screen.getByRole("button", { name: "Enviar pelo WhatsApp" }).closest("form")!;
    expect(within(form0).getByRole("radio", { name: "Transfer" })).toHaveAttribute("aria-checked", "true");

    const form = screen.getByRole("button", { name: "Enviar pelo WhatsApp" }).closest("form")!;
    fireEvent.change(within(form).getByLabelText("Nome"), { target: { value: "Ana Teste" } });
    fireEvent.change(within(form).getByLabelText("Data de início"), { target: { value: "2026-12-10" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pelo WhatsApp" }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = decodeURIComponent(open.mock.calls[0][0] as string);
    expect(url).toContain("https://wa.me/5554999990000?text=");
    expect(url).toContain("Serviço: Transfer");
    expect(url).toContain("Nome: Ana Teste");
    expect(url).toContain("Início: 10/12/2026");
  });

  it("o cartão do hero escolhe o serviço e leva ao formulário", () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    renderLanding();
    const hero = screen.getByRole("radiogroup", { name: "Escolha o serviço" });
    expect(within(hero).getByRole("radio", { name: "Aluguel" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(within(hero).getByRole("radio", { name: "Transfer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar abaixo" }));
    expect(scroll).toHaveBeenCalled();
    const form = screen.getByRole("button", { name: "Enviar pelo WhatsApp" }).closest("form")!;
    expect(within(form).getByRole("radio", { name: "Transfer" })).toHaveAttribute("aria-checked", "true");
  });

  it("pedir um carro da frota escolhe aluguel e anota o modelo", () => {
    Element.prototype.scrollIntoView = vi.fn();
    renderLanding();
    fireEvent.click(screen.getAllByRole("button", { name: "Pedir este carro" })[1]);
    expect(screen.getByLabelText("Observações (voo, passageiros, malas)")).toHaveValue("Mercedes-Benz C180");
    const form = screen.getByRole("button", { name: "Enviar pelo WhatsApp" }).closest("form")!;
    expect(within(form).getByRole("radio", { name: "Aluguel sem motorista" })).toHaveAttribute("aria-checked", "true");
  });

  it("o menu abre em painel lateral, fecha com Esc e com o link", () => {
    renderLanding({ number: "5554999990000" });
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const menu = screen.getByRole("dialog", { name: "Abrir menu" });
    expect(within(menu).getByRole("link", { name: "Frota" })).toHaveAttribute("href", "#frota");
    expect(within(menu).getByRole("link", { name: /Área da central/ })).toHaveAttribute("href", "/login");
    expect(within(menu).getByRole("link", { name: "Falar no WhatsApp" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Contato" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("o cabeçalho vira cápsula ao rolar", () => {
    renderLanding();
    const bar = screen.getByRole("banner");
    expect(bar).toHaveClass("py-6");
    Object.defineProperty(window, "scrollY", { value: 300, configurable: true });
    fireEvent.scroll(window);
    expect(bar).toHaveClass("py-3");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
});
