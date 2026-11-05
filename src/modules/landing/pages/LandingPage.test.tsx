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
    expect(screen.getByLabelText("Serviço")).toHaveValue("transfer");

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
});
