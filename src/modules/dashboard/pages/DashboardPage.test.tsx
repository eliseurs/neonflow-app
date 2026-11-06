import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookingService } from "@/modules/bookings/services/booking.service";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { isoDate } from "@/shared/lib/format";
import { booking, vehicle } from "@/test/fixtures";
import { renderPage } from "@/test/render";
import { DashboardPage } from "./DashboardPage";

vi.mock("@/modules/bookings/services/booking.service", () => ({ bookingService: { list: vi.fn() } }));
vi.mock("@/modules/fleet/services/fleet.service", () => ({ fleetService: { list: vi.fn() } }));

beforeEach(() => vi.resetAllMocks());

const stat = (label: string) => screen.getByText(label).parentElement as HTMLElement;

describe("DashboardPage", () => {
  it("conta retiradas, devoluções, pagamentos e manutenção do dia", async () => {
    const today = isoDate();
    vi.mocked(bookingService.list).mockResolvedValue([
      booking({ id: "a", stage: "confirmada", start_date: today, end_date: isoDate(2), client_name: "Retira Hoje" }),
      booking({ id: "b", stage: "em_locacao", start_date: isoDate(-2), end_date: today, client_name: "Devolve Hoje" }),
      booking({ id: "c", stage: "preparacao", start_date: isoDate(5), end_date: isoDate(6), client_name: "Sem Pagamento" }),
    ]);
    vi.mocked(fleetService.list).mockResolvedValue([vehicle(), vehicle({ id: "v2", in_maintenance: true })]);
    renderPage(<DashboardPage />);

    expect(await screen.findByText("Retira Hoje")).toBeInTheDocument();
    expect(within(stat("Retiradas hoje")).getByText("1")).toBeInTheDocument();
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
