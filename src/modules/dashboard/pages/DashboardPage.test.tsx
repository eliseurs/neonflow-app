import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bookingService } from "@/modules/bookings/services/booking.service";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { booking, vehicle } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import { DashboardPage } from "./DashboardPage";

vi.mock("@/modules/bookings/services/booking.service", () => ({ bookingService: { list: vi.fn() } }));
vi.mock("@/modules/fleet/services/fleet.service", () => ({ fleetService: { list: vi.fn() } }));

// Relógio fixo: 10/12/2026 às 12:00 em Gramado (15:00 UTC), em qualquer fuso de máquina.
beforeEach(() => {
  vi.resetAllMocks();
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
  });

  it("sem reservas sugere criar uma", async () => {
    vi.mocked(bookingService.list).mockResolvedValue([]);
    vi.mocked(fleetService.list).mockResolvedValue([]);
    renderPage(<DashboardPage />);
    expect(await screen.findByRole("link", { name: "Criar uma reserva" })).toHaveAttribute("href", "/reservas");
    expect(screen.getByText("Nenhum carro em locação.")).toBeInTheDocument();
  });
});
