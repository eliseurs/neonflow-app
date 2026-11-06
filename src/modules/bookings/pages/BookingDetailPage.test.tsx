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

  it("registra a hora real da entrega", async () => {
    vi.mocked(bookingService.get).mockResolvedValue(booking({ stage: "confirmada", checks: { delivery: true } }));
    vi.mocked(bookingService.advance).mockResolvedValue(
      booking({ stage: "em_locacao", checks: { delivery: true }, delivered_at: "2026-12-10T09:20:00-03:00" }),
    );
    open();
    fireEvent.change(await screen.findByLabelText("Hora real da entrega"), { target: { value: "2026-12-10T09:20" } });
    fireEvent.click(screen.getByRole("button", { name: "Avançar para em locação" }));
        await waitFor(() => expect(bookingService.advance).toHaveBeenCalledWith("b1", "2026-12-10T09:20", undefined));
    expect(await screen.findByText("Entregue em 10/12/2026 09:20")).toBeInTheDocument();
  });

  it("na devolução, mostra o atraso antes de confirmar e o total depois (RN-02.19)", async () => {
    const emLocacao = booking({
      stage: "em_locacao", checks: { return: true }, end_at: "2026-12-12T09:00:00-03:00", daily_rate_cents: 10000,
      delivered_at: "2026-12-10T09:10:00-03:00",
    });
    vi.mocked(bookingService.get).mockResolvedValue(emLocacao);
    vi.mocked(bookingService.advance).mockResolvedValue({
      ...emLocacao, stage: "devolvida", returned_at: "2026-12-12T14:00:00-03:00", extra_days: 1, extra_cents: 10000,
    });
    open();

    const field = await screen.findByLabelText("Hora real da devolução");
    fireEvent.change(field, { target: { value: "" } });
    expect(screen.getByRole("button", { name: "Avançar para devolvida" })).toBeDisabled();
    fireEvent.change(field, { target: { value: "2026-12-12T09:45" } });
    expect(screen.getByText(/Dentro do combinado/)).toBeInTheDocument();
    fireEvent.change(field, { target: { value: "2026-12-12T14:00" } });
    expect(screen.getByText(/Atraso: 1 diária extra · R\$\s100,00/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Avançar para devolvida" }));
        await waitFor(() => expect(bookingService.advance).toHaveBeenCalledWith("b1", "2026-12-12T14:00", undefined));
    expect(await screen.findByText("Devolvido em 12/12/2026 14:00")).toBeInTheDocument();
        expect(screen.getByText("Total com extras")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s300,00/)).toBeInTheDocument();
    expect(screen.getByText(/Reserva R\$\s200,00 \+ atraso R\$\s100,00/)).toBeInTheDocument();
  });

  it("avisa a devolução atrasada e não pede hora nas outras etapas", async () => {
    vi.mocked(bookingService.get).mockResolvedValue(booking({ stage: "em_locacao", end_at: "2026-01-02T09:00:00-03:00" }));
    open();
    expect(await screen.findByText(/Devolução atrasada: o combinado era 02\/01\/2026 09:00/)).toBeInTheDocument();
    // Informando uma devolução dentro do combinado, o aviso sai.
    fireEvent.change(screen.getByLabelText("Hora real da devolução"), { target: { value: "2026-01-02T09:30" } });
    expect(screen.queryByText(/Devolução atrasada: o combinado era/)).toBeNull();
  });

  it("não entrega o carro que ainda está com outro cliente", async () => {
    vi.mocked(fleetService.list).mockResolvedValue([vehicle({ status: "em_locacao" })]);
    vi.mocked(bookingService.get).mockResolvedValue(booking({ stage: "confirmada", checks: { delivery: true } }));
    open();
    expect(await screen.findByText(/ainda está em locação em outra reserva/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avançar para em locação" })).toBeDisabled();
  });

  it("no plano limitado, exige o odômetro e mostra o km excedente (RN-02.18)", async () => {
    const emLocacao = booking({
      stage: "em_locacao", checks: { return: true }, days: 2, end_at: "2026-12-12T09:00:00-03:00",
      km_limit_per_day: 200, extra_km_cents: 150, deposit_cents: 150000,
      delivered_at: "2026-12-10T09:10:00-03:00", delivered_km: 10000,
    });
    vi.mocked(bookingService.get).mockResolvedValue(emLocacao);
    vi.mocked(bookingService.advance).mockResolvedValue({
      ...emLocacao, stage: "devolvida", returned_at: "2026-12-12T09:30:00-03:00", returned_km: 10450, excess_km: 50, excess_km_cents: 7500,
    });
    open();

    expect(await screen.findByText(/Obrigatória: plano de 200 km\/dia\. Na entrega: 10000 km\./)).toBeInTheDocument();
    expect(screen.getByText(/Franquia de 400 km no período/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s1\.500,00 \(pré-autorização\)/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Hora real da devolução"), { target: { value: "2026-12-12T09:30" } });
    const advanceBtn = () => screen.getByRole("button", { name: "Avançar para devolvida" });
    expect(advanceBtn()).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Quilometragem (odômetro)"), { target: { value: "9999" } });
    expect(screen.getByText(/não pode ser menor que a da entrega/)).toBeInTheDocument();
    expect(advanceBtn()).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Quilometragem (odômetro)"), { target: { value: "10450" } });
    expect(screen.getByText(/Km excedente: 50 km · R\$\s75,00/)).toBeInTheDocument();
    fireEvent.click(advanceBtn());
    await waitFor(() => expect(bookingService.advance).toHaveBeenCalledWith("b1", "2026-12-12T09:30", 10450));
    expect(await screen.findByText(/10000 → 10450 km \(450 km rodados\)/)).toBeInTheDocument();
    expect(screen.getByText(/Reserva R\$\s200,00 \+ km R\$\s75,00/)).toBeInTheDocument();
  });
});
