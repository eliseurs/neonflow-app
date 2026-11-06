import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { StageBadge } from "@/modules/bookings/components/StageBadge";
import { isActive, isOverdue, type Booking } from "@/modules/bookings/model/booking.types";
import { bookingService } from "@/modules/bookings/services/booking.service";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { formatCents, formatDate, formatDateTime, operationDay } from "@/shared/lib/format";
import { monthLabel } from "../model/dashboard.types";
import { dashboardService } from "../services/dashboard.service";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Panel } from "@/shared/ui/Panel";

function Stat({ label, value, to }: { label: string; value: number | string; to: string }) {
  return (
    <Link to={to} className="group">
      <Panel className="h-full p-5 transition group-hover:border-gold/40 md:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/55">{label}</p>
        <p className="mt-3 font-serif text-4xl font-light text-gold md:mt-4 md:text-5xl">{value}</p>
      </Panel>
    </Link>
  );
}

function Agenda({ title, items, date, empty }: { title: string; items: Booking[]; date: (b: Booking) => string; empty: string }) {
  return (
    <Panel className="p-6 md:p-8">
      <h2 className="font-serif text-2xl font-light">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-bone/50">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/[0.08]">
          {items.map((b) => (
            <li key={b.id}>
              <Link to={`/reservas/${b.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-gold">
                <span>
                  {b.client_name}
                  <span className="block text-xs text-bone/45">
                    {formatDateTime(date(b))}
                    {isOverdue(b) && <span className="text-rose-300"> · atrasada</span>}
                  </span>
                </span>
                <StageBadge stage={b.stage} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function DashboardPage() {
  const name = useAuthStore((s) => s.user?.name);
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: bookingService.list });
    const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fleetService.list });
  const summary = useQuery({ queryKey: ["dashboard"], queryFn: dashboardService.summary });
  const s = summary.data;
  // "Hoje" e a hora das retiradas são os de Gramado, qualquer que seja o fuso do navegador.
  const today = operationDay();
  const now = new Date().toISOString();
  const all = bookings.data ?? [];
  const count = (v?: number) => (bookings.isSuccess || vehicles.isSuccess ? (v ?? 0) : "—");

  // Sem horário de retirada e devolução ainda (PEN-29): o dia é a unidade.
  const pickups = all
    .filter((b) => (b.stage === "confirmada" || b.stage === "preparacao") && b.end_at > now)
    .sort((a, b) => a.start_at.localeCompare(b.start_at));
  const returns = all.filter((b) => b.stage === "em_locacao").sort((a, b) => a.end_at.localeCompare(b.end_at));

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Central de mobilidade"
        title={name ? `Olá, ${name.split(" ")[0]}.` : "Central."}
        accent="Bom trabalho."
        description={`Hoje é ${formatDate(today)}. Retiradas e devoluções do dia, pré-reservas aguardando pagamento e a frota parada.`}
      />

      {(bookings.isError || vehicles.isError) && <ErrorNote>{apiErrorMessage(bookings.error ?? vehicles.error, "Não foi possível carregar a central.")}</ErrorNote>}

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Retiradas hoje" value={count(all.filter((b) => b.stage === "confirmada" && operationDay(b.start_at) === today).length)} to="/reservas" />
        <Stat label="Devoluções hoje" value={count(all.filter((b) => b.stage === "em_locacao" && operationDay(b.end_at) === today).length)} to="/reservas" />
        <Stat label="Aguardando pagamento" value={count(all.filter((b) => b.stage === "preparacao").length)} to="/reservas" />
        <Stat label="Em manutenção" value={vehicles.isSuccess ? vehicles.data.filter((v) => v.in_maintenance).length : "—"} to="/frota" />
      </div>

            {summary.isError && <ErrorNote>{apiErrorMessage(summary.error, "Não foi possível carregar os indicadores do mês.")}</ErrorNote>}
      <div className="grid gap-3 md:gap-4 lg:grid-cols-3">
        {/* q97: os dois faturamentos lado a lado. */}
        <Panel className="p-5 md:p-6 lg:col-span-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/55">
            Faturamento {s ? `de ${monthLabel(s.month)}` : "do mês"}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-serif text-3xl font-light text-gold md:text-4xl">{s ? formatCents(s.pickup_revenue_cents) : "—"}</p>
              <p className="mt-1 text-xs text-bone/50">
                Retiradas no mês{s && ` · ${s.pickup_count} ${s.pickup_count === 1 ? "reserva" : "reservas"}`}. Diárias, atraso e km.
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-gold md:text-4xl">{s ? formatCents(s.paid_cents) : "—"}</p>
              <p className="mt-1 text-xs text-bone/50">
                Pago no mês{s && ` · ${s.paid_count} ${s.paid_count === 1 ? "pagamento" : "pagamentos"}`}. Valor das reservas pagas.
              </p>
            </div>
          </div>
        </Panel>
        {/* q98: carros alugados hoje ÷ frota. */}
        <Link to="/frota" className="group">
          <Panel className="h-full p-5 transition group-hover:border-gold/40 md:p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/55">Ocupação hoje</p>
            <p className="mt-3 font-serif text-4xl font-light text-gold md:text-5xl">
              {s ? `${String(s.occupancy_percent).replace(".", ",")}%` : "—"}
            </p>
            <p className="mt-1 text-xs text-bone/50">{s && `${s.rented_today} de ${s.fleet_size} ${s.fleet_size === 1 ? "carro" : "carros"} em locação`}</p>
          </Panel>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Agenda title="Próximas retiradas" items={pickups.slice(0, 6)} date={(b) => b.start_at} empty="Nenhuma retirada marcada." />
        <Agenda title="Carros na rua" items={returns.slice(0, 6)} date={(b) => b.end_at} empty="Nenhum carro em locação." />
      </div>

      {bookings.isSuccess && all.filter((b) => isActive(b.stage)).length === 0 && (
        <p className="text-sm text-bone/50">
          Nenhuma reserva ativa. <Link to="/reservas" className="text-gold hover:underline">Criar uma reserva</Link>
        </p>
      )}
    </section>
  );
}
