import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { booking, vehicle } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import { bookingService } from "../services/booking.service";
import { checklistService } from "@/modules/checklist/services/checklist.service";
import { BookingDetailPage } from "./BookingDetailPage";

vi.mock("../services/booking.service", () => ({
  bookingService: { get: vi.fn(), events: vi.fn(), setChecks: vi.fn(), advance: vi.fn(), cancel: vi.fn() },
}));
vi.mock("@/modules/fleet/services/fleet.service", () => ({ fleetService: { list: vi.fn() } }));
vi.mock("@/modules/checklist/services/checklist.service", () => ({ checklistService: { list: vi.fn() } }));

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

  it("em devolvida, exige o checklist de devolução ativo para encerrar (RN-01.6)", async () => {
    vi.mocked(checklistService.list).mockResolvedValue([
      { id: "1", key: "pneus", label: "Pneus", position: 60, active: true, created_at: "", updated_at: "" },
      { id: "2", key: "combustivel", label: "Combustível", position: 10, active: true, created_at: "", updated_at: "" },
      { id: "3", key: "fotos", label: "Fotos", position: 90, active: false, created_at: "", updated_at: "" },
    ]);
    vi.mocked(bookingService.get).mockResolvedValue(booking({ stage: "devolvida", checks: { issues: true, combustivel: true } }));
    vi.mocked(bookingService.setChecks).mockResolvedValue(booking({ stage: "devolvida", checks: { issues: true, combustivel: true, pneus: true } }));
    open();

    expect(await screen.findByRole("heading", { name: /Checklist de devolução/ })).toBeInTheDocument();
    await screen.findByRole("checkbox", { name: "Pneus" });
    const boxes = screen.getAllByRole("checkbox").map((c) => c.textContent);
    expect(boxes).toEqual(["Ocorrências conferidas", "Combustível", "Pneus"]);
    expect(screen.queryByRole("checkbox", { name: "Fotos" })).toBeNull();
    expect(screen.getByRole("button", { name: "Avançar para encerrada" })).toBeDisabled();
    expect(screen.getByText("Falta: Pneus.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Pneus" }));
    await waitFor(() => expect(bookingService.setChecks).toHaveBeenCalledWith("b1", { pneus: true }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Avançar para encerrada" })).toBeEnabled());
  });

  it("confirmada não sai enquanto o carro aguarda o checklist de outra reserva", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([vehicle({ status: "aguardando_checklist" })]);
    vi.mocked(bookingService.get).mockResolvedValue(booking({ stage: "confirmada", checks: { delivery: true } }));
    open();
    expect(await screen.findByText(/aguarda o checklist de devolução da reserva anterior/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avançar para em locação" })).toBeDisabled();
  });
});
