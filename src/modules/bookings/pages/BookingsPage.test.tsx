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
    fireEvent.change(screen.getByLabelText("Retirada"), { target: { value: "2026-12-10" } });
    fireEvent.change(screen.getByLabelText("Devolução"), { target: { value: "2026-12-13" } });
    await waitFor(() => expect(bookingService.available).toHaveBeenLastCalledWith("2026-12-10", "2026-12-13"));
    fireEvent.change(await screen.findByLabelText("Veículo disponível"), { target: { value: "v1" } });
    expect(screen.getByText(/3 diárias/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s300,00/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Cliente/), { target: { value: " Cliente Teste " } });
    fireEvent.change(screen.getByLabelText("Local de retirada"), { target: { value: "Aeroporto" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar pré-reserva" }));

    await waitFor(() => expect(screen.getByText("outra rota")).toBeInTheDocument());
    expect(vi.mocked(bookingService.create).mock.calls[0][0]).toEqual({
      vehicle_id: "v1",
      client_name: "Cliente Teste",
      start_date: "2026-12-10",
      end_date: "2026-12-13",
      place: "Aeroporto",
    });
  });

  it("avisa período inválido e falta de veículo livre", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(bookingService.available).mockResolvedValue([]);
    renderPage(<BookingsPage />);
    fireEvent.click((await screen.findAllByRole("button", { name: /Nova reserva/ }))[0]);
    expect(await screen.findByText("Nenhum veículo livre no período")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Retirada"), { target: { value: "2026-12-10" } });
    fireEvent.change(screen.getByLabelText("Devolução"), { target: { value: "2026-12-10" } });
    expect(screen.getByText(/mínimo de 1 diária/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar pré-reserva" })).toBeDisabled();
  });
});
