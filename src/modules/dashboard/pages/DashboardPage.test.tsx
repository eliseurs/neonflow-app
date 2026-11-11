import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bookingService } from "@/modules/bookings/services/booking.service";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { payoutsService } from "@/modules/payouts/services/payouts.service";
import { transferService } from "@/modules/transfers/services/transfer.service";
import { booking, vehicle } from "@/test/fixtures";
import { transfer } from "@/test/transferFixture";
import { renderPage } from "@/test/render";
import { dashboardService } from "../services/dashboard.service";
import { DashboardPage } from "./DashboardPage";

vi.mock("@/modules/bookings/services/booking.service", () => ({ bookingService: { list: vi.fn() } }));
vi.mock("@/modules/fleet/services/fleet.service", () => ({ fleetService: { list: vi.fn() } }));
vi.mock("../services/dashboard.service", () => ({ dashboardService: { summary: vi.fn() } }));
vi.mock("@/modules/transfers/services/transfer.service", () => ({ transferService: { list: vi.fn() } }));
vi.mock("@/modules/payouts/services/payouts.service", () => ({ payoutsService: { pending: vi.fn() } }));

// Relógio fixo: 10/12/2026 às 12:00 em Gramado (15:00 UTC), em qualquer fuso de máquina.
beforeEach(() => {
    vi.resetAllMocks();
  vi.mocked(dashboardService.summary).mockResolvedValue({
    month: "2026-12", pickup_revenue_cents: 54000, pickup_count: 2, paid_cents: 30000, paid_count: 1,
    rented_today: 1, fleet_size: 3, occupancy_percent: 33.3,
  });
  vi.mocked(transferService.list).mockResolvedValue([]);
  vi.mocked(payoutsService.pending).mockResolvedValue([]);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-12-10T15:00:00Z"));
});
afterEach(() => vi.useRealTimers());

const stat = (label: string) => screen.getByText(label).parentElement as HTMLElement;

describe("DashboardPage", () => {
  it("conta retiradas, devoluções, pagamentos e manutenção do dia", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([
      booking({ id: "a", stage: "confirmada", start_at: "2026-12-10T16:00:00-03:00", end_at: "2026-12-12T16:00:00-03:00", client_name: "Retira Hoje" }),
      booking({ id: "b", stage: "em_locacao", start_at: "2026-12-08T10:00:00-03:00", end_at: "2026-12-10T18:00:00-03:00", client_name: "Devolve Hoje" }),
      booking({ id: "c", stage: "preparacao", start_at: "2026-12-15T10:00:00-03:00", end_at: "2026-12-16T10:00:00-03:00", client_name: "Sem Pagamento" }),
      // 01:00 UTC do dia 11 é 22:00 do dia 10 em Gramado: conta como retirada de hoje.
      booking({ id: "d", stage: "confirmada", start_at: "2026-12-11T01:00:00Z", end_at: "2026-12-12T01:00:00Z", client_name: "Retira à Noite" }),
      booking({ id: "e", stage: "confirmada", start_at: "2026-12-01T10:00:00-03:00", end_at: "2026-12-02T10:00:00-03:00", client_name: "Já Passou" }),
    ]);
    vi.mocked(fleetService.list).mockResolvedValue([vehicle(), vehicle({ id: "v2", in_maintenance: true })]);
    renderPage(<DashboardPage />);

    expect(await screen.findByText("Retira Hoje")).toBeInTheDocument();
    expect(within(stat("Retiradas hoje")).getByText("2")).toBeInTheDocument();
    expect(screen.getByText("10/12/2026 22:00")).toBeInTheDocument();
    expect(screen.queryByText("Já Passou")).toBeNull();
    expect(within(stat("Devoluções hoje")).getByText("1")).toBeInTheDocument();
    expect(within(stat("Aguardando pagamento")).getByText("1")).toBeInTheDocument();
    expect(await within(stat("Em manutenção")).findByText("1")).toBeInTheDocument();
    expect(screen.getByText("Devolve Hoje")).toBeInTheDocument();
    expect(within(stat("Disponíveis")).getByText("de 1 carro ativo")).toBeInTheDocument();
  });

  it("destaca devoluções atrasadas e o que precisa de atenção", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([
      // Devolução ontem às 10:00: passou da hora e da tolerância.
      booking({ id: "x", stage: "em_locacao", start_at: "2026-12-07T10:00:00-03:00", end_at: "2026-12-09T10:00:00-03:00", client_name: "Cliente Atrasado" }),
      booking({ id: "y", stage: "em_locacao", start_at: "2026-12-09T10:00:00-03:00", end_at: "2026-12-11T10:00:00-03:00", client_name: "No Prazo" }),
    ]);
    vi.mocked(fleetService.list).mockResolvedValue([vehicle({ status: "em_locacao" }), vehicle({ id: "v2", status: "aguardando_checklist" })]);
    vi.mocked(transferService.list).mockResolvedValue([transfer({ pickup_at: "2026-12-10T18:00:00-03:00" })]);
    renderPage(<DashboardPage />);

    expect(await screen.findByRole("link", { name: /Devolução atrasada: Cliente Atrasado/ })).toHaveAttribute("href", "/reservas/x");
    expect(within(stat("Atrasados na devolução")).getByText("1")).toBeInTheDocument();
    expect(within(stat("Carros alugados")).getByText("2")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "1 transfer sem motorista" })).toHaveAttribute("href", "/transfers");
    expect(screen.getByRole("link", { name: "1 carro aguardando o checklist de devolução" })).toHaveAttribute("href", "/frota");
    expect(within(stat("Transfers hoje")).getByText("1")).toBeInTheDocument();
    // Na lista dos carros na rua, o atrasado vem primeiro.
    const road = screen.getByRole("heading", { name: "Carros na rua" }).parentElement as HTMLElement;
    const names = within(road).getAllByRole("link").map((l) => l.textContent);
    expect(names[0]).toContain("Cliente Atrasado");
  });

  it("sem pendências mostra que está tudo em dia", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(fleetService.list).mockResolvedValue([vehicle()]);
    renderPage(<DashboardPage />);
    expect(await screen.findByText(/Tudo em dia/)).toBeInTheDocument();
  });

  it("mostra quanto falta pagar a parceiros", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(fleetService.list).mockResolvedValue([]);
    const p = { kind: "repasse", booking_id: "b", transfer_id: null, client_name: "", description: "", end_at: "", partner_id: "p", partner_name: "Parceiro Teste",
      base_cents: 10000, percent: 50, status: "pendente", paid_at: null, paid_by_name: null, created_at: "" } as const;
    vi.mocked(payoutsService.pending).mockResolvedValue([{ ...p, id: "1", amount_cents: 5000 }, { ...p, id: "2", amount_cents: 2500 }, { ...p, id: "3", amount_cents: null, percent: null }]);
    renderPage(<DashboardPage />);
    expect(await screen.findByText(/R\$\s75,00/)).toBeInTheDocument();
    expect(screen.getByText("3 repasses pendentes · 1 sem percentual definido")).toBeInTheDocument();
  });

  it("sem reservas sugere criar uma", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(fleetService.list).mockResolvedValue([]);
    renderPage(<DashboardPage />);
    expect(await screen.findByRole("link", { name: "Criar uma reserva" })).toHaveAttribute("href", "/reservas");
    expect(screen.getByText("Nenhum carro em locação.")).toBeInTheDocument();
  });

  it("mostra o faturamento do mês lado a lado e a ocupação de hoje (q97, q98)", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(fleetService.list).mockResolvedValue([]);
    renderPage(<DashboardPage />);
    expect(await screen.findByText("Faturamento de dezembro de 2026")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s540,00/)).toBeInTheDocument();
    expect(screen.getByText(/Retiradas no mês · 2 reservas/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s300,00/)).toBeInTheDocument();
    expect(screen.getByText(/Pago no mês · 1 pagamento\./)).toBeInTheDocument();
    expect(screen.getByText("33,3%")).toBeInTheDocument();
    expect(screen.getByText("1 de 3 carros em locação")).toBeInTheDocument();
  });

  it("avisa quando os indicadores não carregam", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(fleetService.list).mockResolvedValue([]);
    vi.mocked(dashboardService.summary).mockRejectedValue(new Error("rede"));
    renderPage(<DashboardPage />);
    expect(await screen.findByText(/Não foi possível carregar os indicadores do mês/)).toBeInTheDocument();
  });
});
