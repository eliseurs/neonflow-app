import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { booking, vehicle } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import { bookingService } from "../services/booking.service";
import { BookingsPage } from "./BookingsPage";

vi.mock("../services/booking.service", () => ({
  bookingService: { list: vi.fn(), create: vi.fn(), available: vi.fn() },
}));
vi.mock("@/modules/fleet/services/fleet.service", () => ({ fleetService: { list: vi.fn() } }));
vi.mock("@/modules/partners/services/partners.service", () => ({
  partnersService: {
    list: () => Promise.resolve([
      { id: "p1", name: "Hotel Teste", kinds: ["indicador"], referral_code: "HTL234", active: true },
    ]),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fleetService.list).mockResolvedValue([vehicle()]);
});

describe("BookingsPage", () => {
  it("mostra as ativas por padrão e filtra por etapa", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([
      booking(),
      booking({ id: "b2", client_name: "Encerrada Teste", stage: "encerrada" }),
    ]);
    renderPage(<BookingsPage />);
    expect(await screen.findByText("Cliente Teste")).toBeInTheDocument();
    expect(screen.queryByText("Encerrada Teste")).not.toBeInTheDocument();
    expect(await screen.findByText(/Carro Teste/)).toBeInTheDocument();
    expect(screen.getByText(/Paga até/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Encerrada" }));
    expect(screen.getByText("Encerrada Teste")).toBeInTheDocument();
    expect(screen.queryByText("Cliente Teste")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelada" }));
    expect(screen.getByText("Nenhuma reserva nesta etapa.")).toBeInTheDocument();
  });

  it("cria a pré-reserva com veículo livre e abre o detalhe", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(bookingService.available).mockResolvedValue([vehicle()]);
    vi.mocked(bookingService.create).mockResolvedValue(booking({ id: "nova" }));
    renderPage(<BookingsPage />, { path: "/reservas", route: "/reservas" });

    fireEvent.click((await screen.findAllByRole("button", { name: /Nova reserva/ }))[0]);
    // 49 horas: 3 diárias de 24 h (RN-02.24).
    fireEvent.change(screen.getByLabelText("Retirada"), { target: { value: "2026-12-10T14:00" } });
    fireEvent.change(screen.getByLabelText("Devolução"), { target: { value: "2026-12-12T15:00" } });
    await waitFor(() => expect(bookingService.available).toHaveBeenLastCalledWith("2026-12-10T14:00", "2026-12-12T15:00"));
    fireEvent.change(await screen.findByLabelText("Veículo disponível"), { target: { value: "v1" } });
    expect(screen.getByText(/3 diárias de 24 h/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s300,00/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Cliente/), { target: { value: " Cliente Teste " } });
    fireEvent.change(screen.getByLabelText("Local de retirada"), { target: { value: "Aeroporto" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar pré-reserva" }));

    await waitFor(() => expect(screen.getByText("outra rota")).toBeInTheDocument());
    expect(vi.mocked(bookingService.create).mock.calls[0][0]).toEqual({
      vehicle_id: "v1",
      client_name: "Cliente Teste",
      start_at: "2026-12-10T14:00",
            end_at: "2026-12-12T15:00",
      place: "Aeroporto",
      km_plan: "livre",
    });
  });

  it("avisa período inválido e falta de veículo livre", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(bookingService.available).mockResolvedValue([]);
    renderPage(<BookingsPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Nova reserva/ }))[0]);
    expect(await screen.findByText("Nenhum veículo livre no período")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Retirada"), { target: { value: "2026-12-10T14:00" } });
    fireEvent.change(screen.getByLabelText("Devolução"), { target: { value: "2026-12-10T13:00" } });
    expect(screen.getByText("A devolução precisa ser depois da retirada.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar pré-reserva" })).toBeDisabled();
  });

  it("sinaliza devolução atrasada e o valor do atraso", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([
      booking({ id: "a", client_name: "Atrasado Teste", stage: "em_locacao", end_at: "2026-01-02T09:00:00-03:00" }),
      booking({ id: "b", client_name: "Devolvido Teste", stage: "devolvida", extra_days: 1, extra_cents: 10000 }),
    ]);
    renderPage(<BookingsPage />);
    expect(await screen.findByText("Devolução atrasada")).toBeInTheDocument();
    expect(screen.getByText(/\+ R\$\s100,00 de atraso/)).toBeInTheDocument();
  });

  it("escolhe o plano de km e mostra franquia e caução do veículo (RN-02.18, RN-06.4)", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(bookingService.available).mockResolvedValue([
      vehicle({ deposit_cents: 150000, km_limit_per_day: 200, extra_km_cents: 150 }),
    ]);
    vi.mocked(bookingService.create).mockResolvedValue(booking({ id: "nova" }));
    renderPage(<BookingsPage />, { path: "/reservas", route: "/reservas" });

    fireEvent.click((await screen.findAllByRole("button", { name: /Nova reserva/ }))[0]);
    fireEvent.change(screen.getByLabelText("Retirada"), { target: { value: "2026-12-10T10:00" } });
    fireEvent.change(screen.getByLabelText("Devolução"), { target: { value: "2026-12-13T10:00" } });
    fireEvent.change(await screen.findByLabelText("Veículo disponível"), { target: { value: "v1" } });

    expect(screen.getByRole("radio", { name: /Limitado · 200 km\/dia/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Franquia de 600 km no período · excedente de R\$\s1,50 por km/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s1\.500,00/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Km livre" }));
    fireEvent.change(screen.getByLabelText(/Cliente/), { target: { value: "Cliente Teste" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar pré-reserva" }));
    await waitFor(() => expect(bookingService.create).toHaveBeenCalled());
    expect(vi.mocked(bookingService.create).mock.calls[0][0].km_plan).toBe("livre");
  });

  it("registra o parceiro que indicou (RN-07.5)", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(bookingService.available).mockResolvedValue([vehicle()]);
    vi.mocked(bookingService.create).mockResolvedValue(booking({ id: "nova" }));
    renderPage(<BookingsPage />, { path: "/reservas", route: "/reservas" });
    fireEvent.click((await screen.findAllByRole("button", { name: /Nova reserva/ }))[0]);
    fireEvent.change(await screen.findByLabelText("Veículo disponível"), { target: { value: "v1" } });
    await waitFor(() => expect(screen.getByRole("option", { name: "HTL234 · Hotel Teste" })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Indicado por"), { target: { value: "p1" } });
    fireEvent.change(screen.getByLabelText(/Cliente/), { target: { value: "Cliente Teste" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar pré-reserva" }));
    await waitFor(() => expect(bookingService.create).toHaveBeenCalled());
    expect(vi.mocked(bookingService.create).mock.calls[0][0].referred_by_partner_id).toBe("p1");
  });
});
