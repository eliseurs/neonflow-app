import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import type { VehicleStats } from "../model/fleet.types";
import { fleetService } from "../services/fleet.service";
import { FleetComparison } from "./FleetComparison";

vi.mock("../services/fleet.service", () => ({ fleetService: { comparison: vi.fn() } }));

const stat = (over: Partial<VehicleStats>): VehicleStats => ({
  vehicle_id: "v", name: "Carro", plate: "TST1A23", bookings: 0, rented_days: 0, occupancy_percent: 0, revenue_cents: 0, km_driven: 0,
  maintenance_count: 0, maintenance_cents: 0, result_cents: 0, last_maintenance: null, since: "", ...over,
});

describe("FleetComparison", () => {
  it("compara os carros e destaca o melhor de cada coluna", async () => {
    vi.mocked(fleetService.comparison).mockResolvedValue([
      stat({ vehicle_id: "v1", name: "Jetta", bookings: 5, revenue_cents: 200000, maintenance_cents: 50000, result_cents: 150000, occupancy_percent: 4.5 }),
      stat({ vehicle_id: "v2", name: "Mobi", bookings: 2, revenue_cents: 80000, maintenance_cents: 0, result_cents: 80000, occupancy_percent: 1.2 }),
    ]);
    renderPage(<FleetComparison />);
    const jetta = (await screen.findByRole("link", { name: "Jetta" })).closest("tr")!;
    expect(screen.getByRole("link", { name: "Jetta" })).toHaveAttribute("href", "/frota/v1");
    expect(within(jetta).getByText("5")).toHaveClass("text-gold");
    expect(within(jetta).getByText("4,5%")).toHaveClass("text-gold");
    const mobi = screen.getByRole("link", { name: "Mobi" }).closest("tr")!;
    expect(within(mobi).getAllByText(/R\$\s0,00/)[0]).toHaveClass("text-gold");
  });
});
