import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { transfer } from "@/test/transferFixture";
import { transferService } from "../services/transfer.service";
import { TransfersPage } from "./TransfersPage";

vi.mock("@/modules/customers/services/customer.service", () => ({
  customerService: {
    list: () => Promise.resolve([
      { id: "c1", name: "Ana Cadastrada", whatsapp: "5554999990001", email: "", language: "pt", notes: "", anonymized_at: null,
        created_at: "", updated_at: "", booking_count: 1, transfer_count: 0 },
    ]),
    create: (req: { name: string }) => Promise.resolve({ id: "c2", name: req.name, whatsapp: "", email: "", language: "pt", notes: "",
      anonymized_at: null, created_at: "", updated_at: "", booking_count: 0, transfer_count: 0 }),
  },
}));
vi.mock("../services/transfer.service", () => ({ transferService: { list: vi.fn(), create: vi.fn() } }));
vi.mock("@/modules/partners/services/partners.service", () => ({
  partnersService: { list: () => Promise.resolve([{ id: "p1", name: "Hotel Teste", referral_code: "HTL234", active: true }]) },
}));

beforeEach(() => vi.resetAllMocks());

describe("TransfersPage", () => {
  it("lista os em aberto, o próximo primeiro, e filtra concluídos", async () => {
    vi.mocked(transferService.list).mockResolvedValue([
      transfer({ id: "a", pickup_at: "2026-12-12T08:00:00-03:00", destination: "Canela" }),
      transfer({ id: "b", pickup_at: "2026-12-10T08:00:00-03:00", stage: "com_motorista", driver_name: "Motorista Teste" }),
      transfer({ id: "c", stage: "concluido", destination: "Bento Gonçalves" }),
      transfer({ id: "d", offer_cents: 35000, destination: "Nova Petrópolis" }),
    ]);
    renderPage(<TransfersPage />);
    expect(await screen.findByText("Aeroporto POA → Canela")).toBeInTheDocument();
    const links = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
    expect(links.indexOf("/transfers/b")).toBeLessThan(links.indexOf("/transfers/a"));
    expect(screen.getByText(/Motorista Teste/)).toBeInTheDocument();
    expect(screen.getByText(/Valor para o motorista R\$\s350,00 · chame e marque quem aceitou/)).toBeInTheDocument();
    expect(screen.getAllByText("Defina o valor e chame um motorista").length).toBeGreaterThan(0);
    expect(screen.queryByText("Aeroporto POA → Bento Gonçalves")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Concluídos" }));
    expect(screen.getByText("Aeroporto POA → Bento Gonçalves")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancelados" }));
    expect(screen.getByText("Nada por aqui")).toBeInTheDocument();
  });

  it("registra um transfer com preço em centavos e indicação", async () => {
    vi.mocked(transferService.list).mockResolvedValue([]);
    vi.mocked(transferService.create).mockResolvedValue(transfer({ id: "novo" }));
    renderPage(<TransfersPage />, { path: "/transfers", route: "/transfers" });
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo transfer/ }))[0]);
    const dialog = screen.getByRole("dialog");
    const fill = (label: string, value: string) => fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
    fill("Cliente", "Cliente Teste");
    fill("Data e hora", "2026-12-10T08:30");
    fill("Origem", "Aeroporto POA");
    fill("Destino", "Gramado");
    fill("Voo", "la 3090");
    fill("Passageiros", "2");
    fireEvent.click(within(dialog).getByRole("button", { name: "Registrar transfer" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("preço");
    fill("Preço (R$)", "450,00");
    await waitFor(() => expect(within(dialog).getByRole("option", { name: "HTL234 · Hotel Teste" })).toBeInTheDocument());
    fill("Indicado por", "p1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Registrar transfer" }));
    await waitFor(() => expect(transferService.create).toHaveBeenCalled());
    expect(vi.mocked(transferService.create).mock.calls[0][0]).toMatchObject({
      client_name: "Cliente Teste", pickup_at: "2026-12-10T08:30", passengers: 2, price_cents: 45000, flight: "la 3090", referred_by_partner_id: "p1",
    });
  });
});
