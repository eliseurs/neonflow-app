import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { formatCents } from "@/shared/lib/format";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import type { VehicleStats } from "../model/fleet.types";
import { fleetService } from "../services/fleet.service";

type Col = { label: string; value: (s: VehicleStats) => number; show: (s: VehicleStats) => string; best: "max" | "min" };

const COLS: Col[] = [
  { label: "Reservas", value: (s) => s.bookings, show: (s) => String(s.bookings), best: "max" },
  { label: "Dias alugados", value: (s) => s.rented_days, show: (s) => String(s.rented_days), best: "max" },
  { label: "Ocupação", value: (s) => s.occupancy_percent, show: (s) => `${String(s.occupancy_percent).replace(".", ",")}%`, best: "max" },
  { label: "Receita", value: (s) => s.revenue_cents, show: (s) => formatCents(s.revenue_cents), best: "max" },
  { label: "Manutenções", value: (s) => s.maintenance_count, show: (s) => String(s.maintenance_count), best: "min" },
  { label: "Custo manutenção", value: (s) => s.maintenance_cents, show: (s) => formatCents(s.maintenance_cents), best: "min" },
  { label: "Resultado", value: (s) => s.result_cents, show: (s) => formatCents(s.result_cents), best: "max" },
];

/** Comparativo dos últimos 12 meses: qual carro sai mais e qual dá mais manutenção. O melhor de cada coluna fica em dourado. */
export function FleetComparison() {
  const stats = useQuery({ queryKey: ["vehicles", "stats"], queryFn: fleetService.comparison });
  const list = stats.data ?? [];
  const best = (c: Col) => {
    if (list.length < 2) return null;
    const values = list.map(c.value);
    const target = c.best === "max" ? Math.max(...values) : Math.min(...values);
    return values.filter((v) => v === target).length === values.length ? null : target;
  };

  return (
    <Panel className="p-6 md:p-8">
      <h2 className="font-serif text-2xl font-light">Comparativo da frota</h2>
      <p className="mt-1 text-sm text-bone/55">Últimos 12 meses. Resultado = receita das locações menos o custo de manutenção (sem repasse nem comissão).</p>
      {stats.isPending && <div className="mt-4"><Loading /></div>}
      {stats.isError && <div className="mt-4"><ErrorNote>{apiErrorMessage(stats.error, "Não foi possível carregar o comparativo.")}</ErrorNote></div>}
      {list.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-bone/45">
                <th className="py-3 pr-4 font-medium">Carro</th>
                {COLS.map((c) => <th key={c.label} className="py-3 pr-4 text-right font-medium">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.vehicle_id} className="border-b border-white/[0.06]">
                  <td className="py-3 pr-4">
                    <Link to={`/frota/${s.vehicle_id}`} className="text-bone/90 hover:text-gold">{s.name}</Link>
                  </td>
                  {COLS.map((c) => (
                    <td key={c.label} className={cn("py-3 pr-4 text-right tabular-nums text-bone/75", best(c) === c.value(s) && "font-semibold text-gold")}>
                      {c.show(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
