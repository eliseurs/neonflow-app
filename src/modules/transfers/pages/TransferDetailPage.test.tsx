import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import { transfer } from "@/test/transferFixture";
import { transferService } from "../services/transfer.service";
import { TransferDetailPage } from "./TransferDetailPage";

vi.mock("../services/transfer.service", () => ({
  transferService: {
    get: vi.fn(), events: vi.fn(), offer: vi.fn(), accept: vi.fn(), release: vi.fn(), setPaid: vi.fn(),
    start: vi.fn(), complete: vi.fn(), cancel: vi.fn(),
  },
}));
vi.mock("@/modules/partners/services/partners.service", () => ({
  partnersService: {
    list: () => Promise.resolve([
      { id: "d1", name: "Motorista Teste", active: true },
      { id: "d2", name: "Motorista Inativo", active: false },
    ]),
  },
}));

const open = () => renderPage(<TransferDetailPage />, { path: "/transfers/:id", route: "/transfers/t1" });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(transferService.events).mockResolvedValue([
    { action: "criado", detail: "", user_name: "Central Teste", created_at: "2026-12-01T10:00:00-03:00" },
    { action: "desistiu", detail: "Motorista Teste", user_name: null, created_at: "2026-12-01T11:00:00-03:00" },
  ]);
});

describe("TransferDetailPage", () => {
  it("abre a oferta, não deixa diminuir ao reabrir e registra o aceite", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer());
    vi.mocked(transferService.offer).mockResolvedValue(transfer({ offer_cents: 20000, offer_expires_at: "2099-12-09T10:30:00-03:00" }));
    open();
    expect(await screen.findByText("Gramado")).toBeInTheDocument();
    expect(screen.getByText("Motorista desistiu (sem penalidade)")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Valor para o motorista (R$)"), { target: { value: "200,00" } });
    fireEvent.change(screen.getByLabelText("Prazo para aceitar (min)"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Abrir oferta" }));
    await waitFor(() => expect(transferService.offer).toHaveBeenCalledWith("t1", 20000, 45));

    expect(await screen.findByText(/aberta até 09\/12\/2099 10:30/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Valor para o motorista (R$)"), { target: { value: "150,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Reabrir oferta" }));
    expect(screen.getByRole("alert")).toHaveTextContent("não pode ser menor");

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    fireEvent.click(screen.getByRole("button", { name: /Copiar mensagem/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(writeText.mock.calls[0][0]).toContain("Aeroporto POA → Gramado");

    expect(screen.queryByRole("option", { name: "Motorista Inativo" })).toBeNull();
    vi.mocked(transferService.accept).mockResolvedValue(transfer({ stage: "com_motorista", driver_name: "Motorista Teste", driver_cents: 20000 }));
    await waitFor(() => expect(screen.getByRole("option", { name: "Motorista Teste" })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Quem aceitou primeiro"), { target: { value: "d1" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar aceite" }));
    await waitFor(() => expect(transferService.accept).toHaveBeenCalledWith("t1", "d1"));
    expect(await screen.findByText(/Recebe R\$\s200,00 pela corrida/)).toBeInTheDocument();
  });

  it("com motorista: marca o pagamento, registra a desistência e inicia", async () => {
    const assigned = transfer({ stage: "com_motorista", driver_name: "Motorista Teste", driver_cents: 20000 });
    vi.mocked(transferService.get).mockResolvedValue(assigned);
    vi.mocked(transferService.setPaid).mockResolvedValue({ ...assigned, paid_at: "2026-12-05T10:00:00-03:00" });
    vi.mocked(transferService.release).mockResolvedValue(transfer());
    vi.mocked(transferService.start).mockResolvedValue({ ...assigned, stage: "em_andamento" });
    open();
    fireEvent.click(await screen.findByLabelText(/Cliente pagou/));
    await waitFor(() => expect(transferService.setPaid).toHaveBeenCalledWith("t1", true));
    fireEvent.click(screen.getByRole("button", { name: "Iniciar corrida" }));
    await waitFor(() => expect(transferService.start).toHaveBeenCalledWith("t1"));
    expect(await screen.findByRole("button", { name: "Concluir corrida" })).toBeInTheDocument();
  });

  it("em andamento: exige pagamento e conclui com a espera extra", async () => {
    const onTrip = transfer({ stage: "em_andamento", driver_name: "Motorista Teste", driver_cents: 20000 });
    vi.mocked(transferService.get).mockResolvedValue(onTrip);
    open();
    expect(await screen.findByText("Marque o pagamento do cliente antes de concluir.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Concluir corrida" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Cancelar transfer" })).toBeNull();
  });

  it("conclui com espera extra", async () => {
    const onTrip = transfer({ stage: "em_andamento", driver_name: "Motorista Teste", driver_cents: 20000, paid_at: "2026-12-05T10:00:00-03:00" });
    vi.mocked(transferService.get).mockResolvedValue(onTrip);
    vi.mocked(transferService.complete).mockResolvedValue({ ...onTrip, stage: "concluido", extra_wait_cents: 5000 });
    open();
    fireEvent.change(await screen.findByLabelText("Espera extra (R$)"), { target: { value: "50,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Concluir corrida" }));
    await waitFor(() => expect(transferService.complete).toHaveBeenCalledWith("t1", 5000));
    expect(await screen.findByText(/R\$\s250,00/)).toBeInTheDocument();
  });

  it("cancela mostrando a multa e sem multa com voo cancelado", async () => {
    vi.mocked(transferService.get).mockResolvedValue(transfer({ pickup_at: new Date(Date.now() + 3600_000).toISOString() }));
    vi.mocked(transferService.cancel).mockResolvedValue(transfer({ stage: "cancelado", flight_cancelled: true }));
    open();
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar transfer" }));
    expect(screen.getByText(/multa de R\$\s225,00 \(50%\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("A companhia aérea cancelou o voo"));
    expect(screen.getByText(/Sem multa\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar cancelamento" }));
    await waitFor(() => expect(transferService.cancel).toHaveBeenCalledWith("t1", true));
    expect(await screen.findByText(/voo cancelado/)).toBeInTheDocument();
  });

  it("mostra erro quando não encontra", async () => {
    vi.mocked(transferService.get).mockRejectedValue(new Error("404"));
    open();
    expect(await screen.findByText(/Transfer não encontrado/)).toBeInTheDocument();
  });
});
