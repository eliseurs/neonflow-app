import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { vehicle } from "@/test/fixtures";
import { fleetService } from "../services/fleet.service";
import { FleetPage } from "./FleetPage";

vi.mock("../services/fleet.service", () => ({
  fleetService: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
vi.mock("@/modules/checklist/services/checklist.service", () => ({
  checklistService: { list: vi.fn().mockResolvedValue([]), create: vi.fn(), update: vi.fn() },
}));

beforeEach(() => vi.resetAllMocks());

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("FleetPage", () => {
  it("mostra a frota com diária, placa e manutenção", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([vehicle(), vehicle({ id: "v2", name: "Outro Teste", plate: "XYZ1234", in_maintenance: true, status: "manutencao" })]);
    renderPage(<FleetPage />);
    expect(await screen.findByText("Carro Teste")).toBeInTheDocument();
    expect(screen.getByText("XYZ-1234")).toBeInTheDocument();
    expect(screen.getByText("Manutenção")).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s100,00/)).toHaveLength(2);
  });

  it("frota vazia convida a cadastrar", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([]);
    renderPage(<FleetPage />);
    expect(await screen.findByText("Nenhum veículo cadastrado")).toBeInTheDocument();
  });

  it("cadastra um veículo em centavos e com a placa normalizada", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([]);
    vi.mocked(fleetService.create).mockResolvedValue(vehicle());
    renderPage(<FleetPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo veículo/ }))[0]);

    fill("Modelo", "Carro Teste");
    fill("Placa", "abc-1d23");
    fill("Proprietário", "Parceiro Teste");
    fill("Lugares", "5");
    fill("Diária (R$)", "123,45");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(fleetService.create).toHaveBeenCalled());
    expect(vi.mocked(fleetService.create).mock.calls[0][0]).toEqual({
      plate: "ABC1D23",
      name: "Carro Teste",
      category: "economy",
      owner: "Parceiro Teste",
      seats: 5,
      gear: "automatico",
            daily_rate_cents: 12345,
      in_maintenance: false,
      deposit_cents: null,
      km_limit_per_day: null,
      extra_km_cents: null,
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("valida placa e diária antes de enviar", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([]);
    renderPage(<FleetPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo veículo/ }))[0]);
    fill("Modelo", "Carro Teste");
    fill("Proprietário", "Parceiro Teste");
    fill("Placa", "AB12");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Placa inválida");

    fill("Placa", "ABC1234");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("diária");
    expect(fleetService.create).not.toHaveBeenCalled();
  });

  it("edita mantendo os valores e mostra o erro da API", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([vehicle()]);
    vi.mocked(fleetService.update).mockRejectedValue(new Error("x"));
    renderPage(<FleetPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Editar Carro Teste" }));
    expect(screen.getByLabelText("Diária (R$)")).toHaveValue("100,00");
    fireEvent.click(screen.getByLabelText(/Em manutenção/));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar o veículo.");
    expect(vi.mocked(fleetService.update).mock.calls[0]).toEqual(["v1", expect.objectContaining({ in_maintenance: true, daily_rate_cents: 10000 })]);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra o estado calculado e a próxima reserva (RN-01.3)", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([
      vehicle({
        status: "reservado",
        next_booking: {
          id: "b9", client_name: "Cliente Teste", stage: "confirmada", start_date: "2026-12-10", end_date: "2026-12-12",
          start_at: "2026-12-10T14:00:00-03:00", end_at: "2026-12-12T10:30:00-03:00",
        },
      }),
      vehicle({ id: "v2", name: "Devolvido Teste", plate: "XYZ1234", status: "aguardando_checklist" }),
      vehicle({ id: "v3", name: "Sem Estado", plate: "XYZ1235", status: undefined }),
    ]);
    renderPage(<FleetPage />);
    expect(await screen.findByText("Reservado")).toBeInTheDocument();
    expect(screen.getByText("Aguardando checklist")).toBeInTheDocument();
    expect(screen.getByText("Livre")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Próxima reserva/ })).toHaveAttribute("href", "/reservas/b9");
    expect(screen.getByText(/10\/12\/2026 14:00 → 12\/12\/2026 10:30 · Cliente Teste/)).toBeInTheDocument();
  });

  it("abre a configuração do checklist de devolução", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([]);
    renderPage(<FleetPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Checklist de devolução/ }));
    expect(screen.getByRole("dialog", { name: "Checklist de devolução" })).toBeInTheDocument();
  });

  it("cadastra caução e plano de km, e exige os dois campos de km juntos", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([]);
    vi.mocked(fleetService.create).mockResolvedValue(vehicle());
    renderPage(<FleetPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Novo veículo/ }))[0]);
    fill("Modelo", "Carro Teste");
    fill("Placa", "ABC1D23");
    fill("Proprietário", "Parceiro Teste");
    fill("Lugares", "5");
    fill("Diária (R$)", "100");
    fill("Caução (R$)", "1.500,00");
    fill("Limite de km por dia", "200");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("juntos");

    fill("Km excedente (R$)", "1,50");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    await waitFor(() => expect(fleetService.create).toHaveBeenCalled());
    expect(vi.mocked(fleetService.create).mock.calls[0][0]).toMatchObject({
      deposit_cents: 150000, km_limit_per_day: 200, extra_km_cents: 150,
    });
  });

  it("mostra caução e quilometragem no cartão", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([vehicle({ deposit_cents: 150000, km_limit_per_day: 200, extra_km_cents: 150 })]);
    renderPage(<FleetPage />);
    expect(await screen.findByText(/R\$\s1\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/200 km\/dia · R\$\s1,50 por km excedente/)).toBeInTheDocument();
  });
});
