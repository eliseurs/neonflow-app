import { describe, expect, it } from "vitest";
import { booking, vehicle } from "@/test/fixtures";
import { transfer } from "@/test/transferFixture";
import { overview } from "./overview";

// 10/12/2026 12:00 em Gramado.
const NOW = Date.parse("2026-12-10T15:00:00Z");

describe("overview", () => {
  it("conta a frota, os atrasos e o movimento do dia", () => {
    const o = overview(
      [
        booking({ id: "late", stage: "em_locacao", end_at: "2026-12-10T10:00:00-03:00" }),
        // Dentro da tolerância (1 h): ainda não é atraso.
        booking({ id: "ok", stage: "em_locacao", end_at: "2026-12-10T11:30:00-03:00" }),
        booking({ id: "pick", stage: "confirmada", start_at: "2026-12-10T16:00:00-03:00" }),
        booking({ id: "pre", stage: "preparacao" }),
      ],
      [vehicle(), vehicle({ id: "v2", in_maintenance: true, status: "manutencao" }), vehicle({ id: "v3", status: "aguardando_checklist" })],
      [
        transfer({ id: "t1", pickup_at: "2026-12-10T18:00:00-03:00" }),
        transfer({ id: "t2", pickup_at: "2026-12-10T19:00:00-03:00", stage: "cancelado" }),
        transfer({ id: "t3", pickup_at: "2026-12-09T19:00:00-03:00" }),
        transfer({ id: "t4", pickup_at: "2026-12-12T08:00:00-03:00", stage: "com_motorista" }),
      ],
      [],
      NOW,
    );
    expect(o.onRoad).toBe(2);
    expect(o.overdue.map((b) => b.id)).toEqual(["late"]);
    expect(o.available).toBe(1);
    expect(o.activeFleet).toBe(2);
    expect(o.fleetSize).toBe(3);
    expect(o.maintenance).toBe(1);
    expect(o.awaitingChecklist).toBe(1);
    expect(o.pickupsToday).toBe(1);
    expect(o.returnsToday).toBe(2);
    expect(o.transfersToday).toBe(1);
    expect(o.awaitingPayment).toBe(1);
    // Ontem sem motorista já passou; o de hoje conta.
    expect(o.transfersWithoutDriver).toBe(1);
  });
});
