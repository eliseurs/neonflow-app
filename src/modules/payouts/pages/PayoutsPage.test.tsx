import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import type { Payout } from "../model/payouts.types";
import { partnersService } from "@/modules/partners/services/partners.service";
import { payoutsService } from "../services/payouts.service";
import { PayoutsPage } from "./PayoutsPage";

vi.mock("../services/payouts.service", () => ({ payoutsService: { list: vi.fn(), pay: vi.fn() } }));
vi.mock("@/modules/partners/services/partners.service", () => ({ partnersService: { get: vi.fn() } }));

const payout = (over: Partial<Payout> = {}): Payout => ({
  id: "o1", kind: "repasse", booking_id: "b1", transfer_id: null, client_name: "Cliente Teste", description: "Sedã Teste",
  end_at: "2026-12-12T10:00:00-03:00", partner_id: "p1", partner_name: "Dono Teste", base_cents: 34000,
  percent: 70, amount_cents: 23800, status: "pendente", paid_at: null, paid_by_name: null, created_at: "", ...over,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("PayoutsPage", () => {
  it("lista os repasses a pagar com o total por parceiro", async () => {
    vi.mocked(payoutsService.list).mockResolvedValue([
      payout(),
      payout({ id: "o2", booking_id: "b2", client_name: "Outro Cliente", base_cents: 15000, amount_cents: 10500, percent: 70 }),
      payout({ id: "o3", partner_id: "p2", partner_name: "Sem Percentual", percent: null, amount_cents: null }),
    ]);
    renderPage(<PayoutsPage />);
    expect(await screen.findByText(/R\$\s343,00/)).toBeInTheDocument();
    expect(payoutsService.list).toHaveBeenCalledWith("repasse", "pendente");
    expect(screen.getByText("2 reservas")).toBeInTheDocument();
    expect(screen.getByText(/1 com percentual a definir/)).toBeInTheDocument();
    expect(screen.getAllByText(/70% sobre diárias, atraso e km de R\$\s340,00/)).toHaveLength(1);
    expect(screen.getByText("Percentual a definir", { selector: "span" })).toBeInTheDocument();
  });

  it("troca para comissões e para pagos", async () => {
    vi.mocked(payoutsService.list).mockResolvedValue([]);
    renderPage(<PayoutsPage />);
    expect(await screen.findByText("Nada a pagar")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Comissões de indicadores" }));
    await waitFor(() => expect(payoutsService.list).toHaveBeenCalledWith("comissao", "pendente"));
    expect(await screen.findByText(/Indicado por/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pagos" }));
    await waitFor(() => expect(payoutsService.list).toHaveBeenCalledWith("comissao", "paga"));
    expect(await screen.findByText("Nenhum pagamento registrado")).toBeInTheDocument();
  });

  it("marca como pago depois de confirmar", async () => {
    vi.mocked(payoutsService.list).mockResolvedValue([payout()]);
    vi.mocked(payoutsService.pay).mockResolvedValue(payout({ status: "paga", paid_at: "2026-12-13T10:00:00-03:00" }));
    renderPage(<PayoutsPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Marcar como pago: Dono Teste/ }));
    const dialog = screen.getByRole("dialog", { name: "Confirmar pagamento" });
    expect(within(dialog).getByText(/repasse de Cliente Teste/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Sim, marcar como pago" }));
    await waitFor(() => expect(payoutsService.pay).toHaveBeenCalledWith("o1"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("mostra quem pagou na lista de pagos", async () => {
    vi.mocked(payoutsService.list).mockResolvedValue([
      payout({ kind: "comissao", status: "paga", paid_at: "2026-12-13T10:00:00-03:00", paid_by_name: "Central Teste", percent: 10, base_cents: 30000, amount_cents: 3000 }),
    ]);
    renderPage(<PayoutsPage />);
    expect(await screen.findByText(/Pago em 13\/12\/2026 10:00 por Central Teste/)).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText(/10% sobre o valor do serviço/)).toBeInTheDocument();
  });

  it("mostra o pagamento do motorista do transfer com link para a corrida", async () => {
    vi.mocked(payoutsService.list).mockResolvedValue([
      payout({ kind: "motorista", booking_id: null, transfer_id: "t1", description: "Aeroporto POA → Gramado", percent: null, amount_cents: 30000 }),
    ]);
    renderPage(<PayoutsPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Motoristas" }));
    await waitFor(() => expect(payoutsService.list).toHaveBeenCalledWith("motorista", "pendente"));
    expect(await screen.findByText(/Valor fixo: oferta aceita \+ espera extra/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cliente Teste" })).toHaveAttribute("href", "/transfers/t1");
  });

  it("sem percentual no encerramento, paga com o percentual atual do parceiro", async () => {
    vi.mocked(payoutsService.list).mockResolvedValue([payout({ id: "o9", partner_id: "p9", partner_name: "Sem Percentual", percent: null, amount_cents: null })]);
    vi.mocked(partnersService.get).mockResolvedValue({ commission_percent: null, owner_share_percent: 62.5, driver_share_percent: null } as never);
    vi.mocked(payoutsService.pay).mockResolvedValue(payout({ id: "o9", status: "paga" }));
    renderPage(<PayoutsPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Marcar como pago: Sem Percentual/ }));
    // 62,5% de R$ 340,00 = R$ 212,50
    expect(await screen.findByText(/R\$\s212,50/)).toBeInTheDocument();
    expect(screen.getByText(/Percentual atual do parceiro: 62,5%/)).toBeInTheDocument();
    expect(partnersService.get).toHaveBeenCalledWith("p9");
    fireEvent.click(screen.getByRole("button", { name: "Sim, marcar como pago" }));
    await waitFor(() => expect(payoutsService.pay).toHaveBeenCalledWith("o9"));
  });

  it("parceiro ainda sem percentual: orienta e não deixa marcar", async () => {
    vi.mocked(payoutsService.list).mockResolvedValue([payout({ id: "o9", partner_id: "p9", partner_name: "Sem Percentual", percent: null, amount_cents: null })]);
    vi.mocked(partnersService.get).mockResolvedValue({ commission_percent: null, owner_share_percent: null, driver_share_percent: null } as never);
    renderPage(<PayoutsPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Marcar como pago: Sem Percentual/ }));
    expect(await screen.findByText(/ainda não tem percentual de repasse/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parceiros" })).toHaveAttribute("href", "/parceiros");
    expect(screen.getByRole("button", { name: "Sim, marcar como pago" })).toBeDisabled();
  });
});
