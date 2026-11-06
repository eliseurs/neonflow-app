import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { booking, vehicle } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import { bookingService } from "../services/booking.service";
import { BookingDetailPage } from "./BookingDetailPage";

vi.mock("../services/booking.service", () => ({
  bookingService: { get: vi.fn(), events: vi.fn(), setChecks: vi.fn(), advance: vi.fn(), cancel: vi.fn() },
}));
vi.mock("@/modules/fleet/services/fleet.service", () => ({ fleetService: { list: vi.fn() } }));

const open = () => renderPage(<BookingDetailPage />, { path: "/reservas/:id", route: "/reservas/b1" });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fleetService.list).mockResolvedValue([vehicle()]);
  vi.mocked(bookingService.events).mockResolvedValue([
    { from_stage: null, to_stage: "preparacao", user_id: "u1", created_at: "2026-11-05T12:00:00Z" },
  ]);
});

describe("BookingDetailPage", () => {
  it("mostra a reserva, o total e o prazo de pagamento", async () => {
    vi.mocked(bookingService.get).mockResolvedValue(booking());
    open();
    expect(await screen.findByRole("heading", { name: "Cliente Teste" })).toBeInTheDocument();
    expect(await screen.findByText("Carro Teste")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s200,00/)).toBeInTheDocument();
    expect(screen.getByText(/a pré-reserva é cancelada/)).toBeInTheDocument();
    expect(await screen.findByText("Criada em preparação")).toBeInTheDocument();
    expect(bookingService.get).toHaveBeenCalledWith("b1");
  });

  it("marca conferências e só avança com todas feitas", async () => {
    vi.mocked(bookingService.get).mockResolvedValue(booking({ checks: { cnh: true, terms: true, deposit: true } }));
    vi.mocked(bookingService.setChecks).mockResolvedValue(booking({ checks: { cnh: true, terms: true, deposit: true, payment: true } }));
    vi.mocked(bookingService.advance).mockResolvedValue(booking({ stage: "confirmada", checks: { cnh: true, terms: true, deposit: true, payment: true } }));
    open();

    const advance = await screen.findByRole("button", { name: "Avançar para confirmada" });
    expect(advance).toBeDisabled();
    expect(screen.getByText("Falta: Pagamento integral confirmado.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Pagamento integral confirmado" }));
    await waitFor(() => expect(bookingService.setChecks).toHaveBeenCalledWith("b1", { payment: true }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Avançar para confirmada" })).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: "Avançar para confirmada" }));
    expect(await screen.findByRole("checkbox", { name: "Veículo entregue ao cliente" })).toBeInTheDocument();
  });

  it("cancela em dois passos", async () => {
    vi.mocked(bookingService.get).mockResolvedValue(booking({ stage: "confirmada" }));
    vi.mocked(bookingService.cancel).mockResolvedValue(booking({ stage: "cancelada" }));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar reserva" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar cancelamento" }));
    expect(await screen.findByText(/O período do veículo está livre/)).toBeInTheDocument();
    expect(bookingService.cancel).toHaveBeenCalledWith("b1");
  });

  it("não oferece cancelar em locação e mostra erro de reserva inexistente", async () => {
    vi.mocked(bookingService.get).mockResolvedValueOnce(booking({ stage: "em_locacao" }));
    open();
    expect(await screen.findByRole("checkbox", { name: "Veículo devolvido" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancelar reserva" })).not.toBeInTheDocument();
  });

  it("reserva inexistente mostra o erro", async () => {
    vi.mocked(bookingService.get).mockRejectedValue(new Error("x"));
    open();
    expect(await screen.findByRole("alert")).toHaveTextContent("Reserva não encontrada.");
  });
});
