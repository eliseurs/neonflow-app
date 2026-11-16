import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicRequestsService } from "@/modules/requests/services/requests.service";
import { publicCar } from "@/test/carFixture";
import type { PublicCar } from "../model/fleet";
import { CarPage } from "./CarPage";

vi.mock("@/modules/requests/services/requests.service", () => ({
  publicRequestsService: { quote: vi.fn(), guest: vi.fn() },
  clientRequestsService: { create: vi.fn() },
}));

beforeEach(() => vi.resetAllMocks());

function open(loader: (id: string) => Promise<PublicCar>, route = "/carros/v1?lang=pt") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/carros/:id" element={<CarPage loader={loader} number="5551997192854" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CarPage", () => {
  it("mostra galeria, ficha, itens, descrição e o pedido, sem preço até escolher as datas", async () => {
    open(() => Promise.resolve(publicCar({ photo_ids: ["p1", "p2", "p3"], min_days: 2 })));
    expect(await screen.findByRole("heading", { level: 1, name: "Jetta Confortline" })).toBeInTheDocument();
    expect(screen.getByText("Mínimo de 2 diárias")).toBeInTheDocument();
    expect(screen.getByText("2014 · Preto")).toBeInTheDocument();
    const specs = screen.getByRole("heading", { name: "Ficha técnica" }).parentElement!;
    expect(within(specs).getByText("Flex")).toBeInTheDocument();
    expect(within(specs).getByText("Automático")).toBeInTheDocument();
    expect(within(specs).getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Ar-condicionado")).toBeInTheDocument();
    expect(screen.getByText("Multimídia")).toBeInTheDocument();
    expect(screen.getByText("Sedã confortável.")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/R\\$\\s?\\d/);
    expect(screen.getByRole("link", { name: "Pedir pelo WhatsApp" })).toHaveAttribute("href", "/?carro=Jetta%20Confortline#contato");
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
    expect(await screen.findByRole("link", { name: "Request on WhatsApp" })).toHaveAttribute("href", "/?carro=Jetta%20Confortline&lang=en#contato");
    expect(screen.getByRole("form", { name: "Book this car" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View full screen" })).toBeNull();
    expect(screen.queryByText("Features")).toBeNull();
    expect(screen.getByText("Back to the fleet")).toBeInTheDocument();
  });

  it("carro inexistente ou em manutenção", async () => {
    open(() => Promise.reject(new Error("404")));
    expect(await screen.findByText(/Carro não encontrado/)).toBeInTheDocument();
  });

  it("reserva na página: datas, valor, contato e o aviso do e-mail (RN-02.38)", async () => {
    vi.mocked(publicRequestsService.quote).mockResolvedValue({
      available: true, days: 2, daily_rate_cents: 20000, total_cents: 40000, deposit_cents: 35000, km_limit_per_day: null, extra_km_cents: null,
    });
    vi.mocked(publicRequestsService.guest).mockResolvedValue({ message: "ok" });
    open(() => Promise.resolve(publicCar()));
    const form = await screen.findByRole("form", { name: "Reservar este carro" });
    expect(within(form).getByText(/Escolha a retirada e a devolução/)).toBeInTheDocument();
    fireEvent.change(within(form).getByLabelText("Retirada"), { target: { value: "2026-12-10T10:00" } });
    fireEvent.change(within(form).getByLabelText("Devolução"), { target: { value: "2026-12-12T10:00" } });
    expect(await within(form).findByText(/400,00/)).toBeInTheDocument();
    expect(within(form).getByText(/2 diárias/)).toBeInTheDocument();
    expect(publicRequestsService.quote).toHaveBeenCalledWith("v1", "2026-12-10T10:00", "2026-12-12T10:00");

    fireEvent.click(within(form).getByRole("button", { name: "Enviar pedido" }));
    expect(within(form).getByText("Preencha nome, e-mail e WhatsApp.")).toBeInTheDocument();
    fireEvent.change(within(form).getByLabelText("Nome"), { target: { value: "Bia Teste" } });
    fireEvent.change(within(form).getByLabelText("E-mail"), { target: { value: "bia@neonflow.test" } });
    fireEvent.change(within(form).getByLabelText("WhatsApp"), { target: { value: "+55 54 99999-0002" } });
    fireEvent.click(within(form).getByRole("button", { name: "Enviar pedido" }));
    await waitFor(() =>
      expect(publicRequestsService.guest).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Bia Teste", email: "bia@neonflow.test", vehicle_id: "v1", start_at: "2026-12-10T10:00", end_at: "2026-12-12T10:00" }),
      ),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Enviamos um link para bia@neonflow.test");
  });

  it("período reservado: mostra o aviso e não pede o contato", async () => {
    vi.mocked(publicRequestsService.quote).mockResolvedValue({
      available: false, days: 2, daily_rate_cents: 20000, total_cents: 40000, deposit_cents: null, km_limit_per_day: null, extra_km_cents: null,
    });
    open(() => Promise.resolve(publicCar()));
    const form = await screen.findByRole("form", { name: "Reservar este carro" });
    fireEvent.change(within(form).getByLabelText("Retirada"), { target: { value: "2026-12-10T10:00" } });
    fireEvent.change(within(form).getByLabelText("Devolução"), { target: { value: "2026-12-12T10:00" } });
    expect(await within(form).findByText(/já está reservado/)).toBeInTheDocument();
    expect(within(form).queryByLabelText("E-mail")).toBeNull();
  });
});
