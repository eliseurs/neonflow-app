import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { publicCar } from "@/test/carFixture";
import type { PublicCar } from "../model/fleet";
import { CarPage } from "./CarPage";

function open(loader: (id: string) => Promise<PublicCar>, route = "/carros/v1?lang=pt") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/carros/:id" element={<CarPage loader={loader} number="5551997192854" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CarPage", () => {
  it("mostra galeria, ficha, itens, descrição e o pedido, sem preço", async () => {
    open(() => Promise.resolve(publicCar({ photo_ids: ["p1", "p2", "p3"] })));
    expect(await screen.findByRole("heading", { level: 1, name: "Jetta Confortline" })).toBeInTheDocument();
    expect(screen.getByText("2014 · Preto")).toBeInTheDocument();
    const specs = screen.getByRole("heading", { name: "Ficha técnica" }).parentElement!;
    expect(within(specs).getByText("Flex")).toBeInTheDocument();
    expect(within(specs).getByText("Automático")).toBeInTheDocument();
    expect(within(specs).getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Ar-condicionado")).toBeInTheDocument();
    expect(screen.getByText("Multimídia")).toBeInTheDocument();
    expect(screen.getByText("Sedã confortável.")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/R\\$\\s?\\d/);
    expect(screen.getByRole("link", { name: "Pedir este carro" })).toHaveAttribute("href", "/?carro=Jetta%20Confortline#contato");
    expect(decodeURIComponent(screen.getByRole("link", { name: /Falar no WhatsApp/ }).getAttribute("href")!)).toContain("Tenho interesse no Jetta Confortline");
    expect(document.title).toBe("Jetta Confortline · Neon Flow");
  });

  it("galeria: setas, miniaturas e tela cheia com teclado", async () => {
    open(() => Promise.resolve(publicCar({ photo_ids: ["p1", "p2", "p3"] })));
    const main = await screen.findByRole("img", { name: "Jetta Confortline · Foto 1" });
    expect(main).toHaveAttribute("loading", "eager");
    expect(main.getAttribute("srcset")).toContain("/public/photos/p1/w/1920 1920w");
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próxima foto" }));
    expect(screen.getByRole("img", { name: "Jetta Confortline · Foto 2" })).toHaveAttribute("loading", "lazy");
    fireEvent.click(screen.getByRole("button", { name: "Foto anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Foto anterior" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("listitem", { name: "Foto 1" }));
    expect(screen.getByRole("listitem", { name: "Foto 1" })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: "Ver em tela cheia" }));
    const dialog = screen.getByRole("dialog", { name: "Jetta Confortline" });
    expect(within(dialog).getByRole("img").getAttribute("src")).toContain("/w/1920");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(within(dialog).getByText("1 / 3")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("sem fotos, mostra o fundo com o símbolo; em inglês", async () => {
    open(() => Promise.resolve(publicCar({ photo_ids: [], features: [], description: "", fuel: "", doors: null })), "/carros/v1?lang=en");
    expect(await screen.findByRole("link", { name: "Request this car" })).toHaveAttribute("href", "/?carro=Jetta%20Confortline&lang=en#contato");
    expect(screen.queryByRole("button", { name: "View full screen" })).toBeNull();
    expect(screen.queryByText("Features")).toBeNull();
    expect(screen.getByText("Back to the fleet")).toBeInTheDocument();
  });

  it("carro inexistente ou em manutenção", async () => {
    open(() => Promise.reject(new Error("404")));
    expect(await screen.findByText(/Carro não encontrado/)).toBeInTheDocument();
  });
});
