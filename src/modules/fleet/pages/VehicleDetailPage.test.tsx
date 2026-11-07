import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookingService } from "@/modules/bookings/services/booking.service";
import { booking, vehicle } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import { fleetService } from "../services/fleet.service";
import { VehicleDetailPage } from "./VehicleDetailPage";

vi.mock("../services/fleet.service", () => ({
  fleetService: { get: vi.fn(), stats: vi.fn(), maintenance: vi.fn(), addMaintenance: vi.fn(), removeMaintenance: vi.fn(), update: vi.fn(), list: vi.fn() },
}));
vi.mock("@/modules/bookings/services/booking.service", () => ({ bookingService: { list: vi.fn() } }));
vi.mock("@/modules/photos/services/photo.service", () => ({ photoService: { vehicle: () => Promise.resolve([]) } }));
vi.mock("@/modules/partners/services/partners.service", () => ({ partnersService: { list: () => Promise.resolve([]) } }));

const open = () => renderPage(<VehicleDetailPage />, { path: "/frota/:id", route: "/frota/v1" });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fleetService.get).mockResolvedValue(
    vehicle({ year: 2014, color: "Preto", fuel: "flex", doors: 4, features: ["ar_condicionado"], description: "Sedã confortável." }),
  );
  vi.mocked(fleetService.stats).mockResolvedValue({
    vehicle_id: "v1", name: "Carro Teste", plate: "TST1A23", bookings: 4, rented_days: 9, occupancy_percent: 2.5,
    revenue_cents: 180000, km_driven: 1200, maintenance_count: 2, maintenance_cents: 45000, result_cents: 135000,
    last_maintenance: "2026-10-01", since: "2025-11-06T12:00:00-03:00",
  });
  vi.mocked(fleetService.maintenance).mockResolvedValue([
    { id: "m1", vehicle_id: "v1", date: "2026-10-01", kind: "preventiva", description: "Troca de óleo", cost_cents: 30000, odometer_km: 61000, workshop: "Oficina Teste", created_at: "" },
  ]);
  vi.mocked(bookingService.list).mockResolvedValue([booking({ id: "b9", client_name: "Cliente Antigo" })]);
});

describe("VehicleDetailPage", () => {
  it("mostra desempenho, ficha, manutenções e reservas do carro", async () => {
    open();
    expect(await screen.findByRole("heading", { name: /Carro Teste/ })).toBeInTheDocument();
    expect(await screen.findByText("2,5%")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s1\.800,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s1\.350,00/)).toBeInTheDocument();
    expect(screen.getByText(/9 dias alugados/)).toBeInTheDocument();
    expect(screen.getByText(/última em 01\/10\/2026/)).toBeInTheDocument();
    expect(screen.getByText("Flex")).toBeInTheDocument();
    expect(screen.getByText("Ar-condicionado")).toBeInTheDocument();
    expect(screen.getByText("Sedã confortável.")).toBeInTheDocument();
    expect(await screen.findByText("Troca de óleo")).toBeInTheDocument();
    expect(screen.getByText(/61\.000 km · Oficina Teste/)).toBeInTheDocument();
    expect(await screen.findByText("Cliente Antigo")).toBeInTheDocument();
    expect(bookingService.list).toHaveBeenCalledWith("v1");
    expect(screen.getByRole("link", { name: /Ver no site/ })).toHaveAttribute("href", "/carros/v1");
  });

  it("registra e apaga manutenção", async () => {
    vi.mocked(fleetService.addMaintenance).mockResolvedValue({} as never);
    vi.mocked(fleetService.removeMaintenance).mockResolvedValue({} as never);
    open();
    fireEvent.click(await screen.findByRole("button", { name: /Registrar manutenção/ }));
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-11-01" } });
    fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "pneus" } });
    fireEvent.change(screen.getByLabelText("O que foi feito"), { target: { value: "4 pneus" } });
    fireEvent.change(screen.getByLabelText(/Custo/), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("custo");
    fireEvent.change(screen.getByLabelText(/Custo/), { target: { value: "1.200,00" } });
    fireEvent.change(screen.getByLabelText("Quilometragem"), { target: { value: "62000" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    await waitFor(() => expect(fleetService.addMaintenance).toHaveBeenCalledWith("v1", {
      date: "2026-11-01", kind: "pneus", description: "4 pneus", cost_cents: 120000, odometer_km: 62000, workshop: "",
    }));
    fireEvent.click(screen.getByRole("button", { name: "Apagar manutenção de 01/10/2026" }));
    await waitFor(() => expect(fleetService.removeMaintenance).toHaveBeenCalledWith("m1"));
  });

  it("edita a ficha", async () => {
    vi.mocked(fleetService.update).mockResolvedValue(vehicle());
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Ano")).toHaveValue("2014");
    fireEvent.change(within(dialog).getByLabelText("Ano"), { target: { value: "1900" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Ano inválido");
    fireEvent.change(within(dialog).getByLabelText("Ano"), { target: { value: "2015" } });
    fireEvent.change(within(dialog).getByLabelText("Portas"), { target: { value: "9" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Portas");
    fireEvent.change(within(dialog).getByLabelText("Portas"), { target: { value: "4" } });
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Câmera de ré" }));
    fireEvent.change(within(dialog).getByLabelText("Combustível"), { target: { value: "gasolina" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(fleetService.update).toHaveBeenCalled());
    expect(vi.mocked(fleetService.update).mock.calls[0][1]).toMatchObject({
      year: 2015, doors: 4, fuel: "gasolina", color: "Preto", features: ["ar_condicionado", "camera_re"], description: "Sedã confortável.",
    });
  });

  it("veículo inexistente", async () => {
    vi.mocked(fleetService.get).mockRejectedValue(new Error("404"));
    open();
    expect(await screen.findByText(/Veículo não encontrado/)).toBeInTheDocument();
  });
});
