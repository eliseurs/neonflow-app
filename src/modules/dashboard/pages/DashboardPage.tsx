import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { StageBadge } from "@/modules/bookings/components/StageBadge";
import { isActive, isOverdue, type Booking } from "@/modules/bookings/model/booking.types";
import { bookingService } from "@/modules/bookings/services/booking.service";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { payoutsService } from "@/modules/payouts/services/payouts.service";
import { transferService } from "@/modules/transfers/services/transfer.service";
import { cn } from "@/shared/lib/cn";
import { formatCents, formatDate, formatDateTime, operationDay } from "@/shared/lib/format";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Panel } from "@/shared/ui/Panel";
import { monthLabel } from "../model/dashboard.types";
import { overview } from "../model/overview";
import { dashboardService } from "../services/dashboard.service";

function Stat({ label, value, hint, to, alert }: { label: string; value: number | string; hint?: string; to: string; alert?: boolean }) {
  return (
    <Link to={to} className="group">
      <Panel className={cn("h-full p-5 transition group-hover:border-gold/40 md:p-6", alert && "border-rose-400/40 bg-rose-400/[0.05]")}>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/55">{label}</p>
        <p className={cn("mt-3 font-serif text-4xl font-light md:mt-4 md:text-5xl", alert ? "text-rose-300" : "text-gold")}>{value}</p>
        {hint && <p className="mt-1 text-xs text-bone/50">{hint}</p>}
      </Panel>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-bone/45">{title}</h2>
      {children}
    </section>
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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function DashboardPage() {
  const name = useAuthStore((s) => s.user?.name);
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: () => bookingService.list() });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fleetService.list });
  const transfers = useQuery({ queryKey: ["transfers"], queryFn: transferService.list });
  const payouts = useQuery({ queryKey: ["payouts", "pendente"], queryFn: payoutsService.pending });
  const summary = useQuery({ queryKey: ["dashboard"], queryFn: dashboardService.summary });
  const s = summary.data;
  // "Hoje" é o dia de Gramado, qualquer que seja o fuso do navegador.
  const today = operationDay();
  const now = new Date().toISOString();
  const all = bookings.data ?? [];
  const o = overview(all, vehicles.data ?? [], transfers.data ?? [], payouts.data ?? []);
  const ready = bookings.isSuccess && vehicles.isSuccess;
  const n = (v: number) => (ready ? v : "—");

  const pickups = all
    .filter((b) => (b.stage === "confirmada" || b.stage === "preparacao") && b.end_at > now)
    .sort((a, b) => a.start_at.localeCompare(b.start_at));
  // Na rua: atrasados primeiro, depois pela devolução mais próxima.
  const onRoad = all
    .filter((b) => b.stage === "em_locacao")
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)) || a.end_at.localeCompare(b.end_at));

  const attention: { key: string; text: string; to: string }[] = [];
  if (transfers.isSuccess && o.transfersWithoutDriver > 0)
    attention.push({ key: "transfer", text: `${plural(o.transfersWithoutDriver, "transfer", "transfers")} sem motorista`, to: "/transfers" });
  if (bookings.isSuccess && o.awaitingPayment > 0)
    attention.push({ key: "pagamento", text: `${plural(o.awaitingPayment, "pré-reserva", "pré-reservas")} aguardando pagamento`, to: "/reservas" });
  if (vehicles.isSuccess && o.awaitingChecklist > 0)
    attention.push({ key: "checklist", text: `${plural(o.awaitingChecklist, "carro", "carros")} aguardando o checklist de devolução`, to: "/frota" });

  const failed = [bookings, vehicles, transfers, payouts].find((q) => q.isError);

  return (
    <section className="space-y-10">
      <PageHeader
        overline="Visão geral"
        title={name ? `Olá, ${name.split(" ")[0]}.` : "Visão geral."}
        accent="Bom trabalho."
        description={`Hoje é ${formatDate(today)}. O que precisa de atenção, a frota agora, o movimento do dia e o mês.`}
      />

      {failed && <ErrorNote>{apiErrorMessage(failed.error, "Não foi possível carregar a visão geral.")}</ErrorNote>}

      <Section title="Precisa de atenção">
        {ready && o.overdue.length === 0 && attention.length === 0 ? (
          <Panel className="flex items-center gap-3 p-5 text-sm text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden /> Tudo em dia: nenhuma devolução atrasada nem pendência.
          </Panel>
        ) : (
          <Panel className="space-y-3 p-5 md:p-6">
            {o.overdue.map((b) => (
              <Link key={b.id} to={`/reservas/${b.id}`} className="flex items-start gap-3 text-sm text-rose-200 hover:text-rose-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  Devolução atrasada: <strong>{b.client_name}</strong>, prevista para {formatDateTime(b.end_at)}
                </span>
              </Link>
            ))}
            {attention.map((a) => (
              <Link key={a.key} to={a.to} className="flex items-start gap-3 text-sm text-amber-200 hover:text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{a.text}</span>
              </Link>
            ))}
            {!ready && o.overdue.length === 0 && attention.length === 0 && <p className="text-sm text-bone/50">Carregando...</p>}
          </Panel>
        )}
      </Section>

      <Section title="Frota agora">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <Stat label="Carros alugados" value={n(o.onRoad)} hint="Na rua agora" to="/reservas" />
          <Stat label="Atrasados na devolução" value={n(o.overdue.length)} hint="Passaram do horário e da tolerância" to="/reservas" alert={o.overdue.length > 0} />
          <Stat label="Disponíveis" value={n(o.available)} hint={ready ? `de ${plural(o.activeFleet, "carro ativo", "carros ativos")}` : undefined} to="/frota" />
          <Stat label="Em manutenção" value={n(o.maintenance)} hint={ready ? `de ${plural(o.fleetSize, "carro", "carros")} na frota` : undefined} to="/frota" />
        </div>
      </Section>

      <Section title="Hoje">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <Stat label="Retiradas hoje" value={n(o.pickupsToday)} to="/reservas" />
          <Stat label="Devoluções hoje" value={n(o.returnsToday)} to="/reservas" />
          <Stat label="Transfers hoje" value={transfers.isSuccess ? o.transfersToday : "—"} to="/transfers" />
          <Stat label="Aguardando pagamento" value={n(o.awaitingPayment)} hint="Pré-reservas" to="/reservas" />
        </div>
      </Section>

      <Section title={s ? `Mês · ${monthLabel(s.month)}` : "Mês"}>
        {summary.isError && <ErrorNote>{apiErrorMessage(summary.error, "Não foi possível carregar os indicadores do mês.")}</ErrorNote>}
        <div className="grid gap-3 md:gap-4 lg:grid-cols-4">
          {/* q97: os dois faturamentos lado a lado. */}
          <Panel className="p-5 md:p-6 lg:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/55">
              Faturamento {s ? `de ${monthLabel(s.month)}` : "do mês"}
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-serif text-3xl font-light text-gold md:text-4xl">{s ? formatCents(s.pickup_revenue_cents) : "—"}</p>
                <p className="mt-1 text-xs text-bone/50">
                  Retiradas no mês{s && ` · ${plural(s.pickup_count, "reserva", "reservas")}`}. Diárias, atraso e km.
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl font-light text-gold md:text-4xl">{s ? formatCents(s.paid_cents) : "—"}</p>
                <p className="mt-1 text-xs text-bone/50">
                  Pago no mês{s && ` · ${plural(s.paid_count, "pagamento", "pagamentos")}`}. Valor das reservas pagas.
                </p>
              </div>
            </div>
          </Panel>
          {/* q98: carros alugados hoje ÷ frota. */}
          <Stat
            label="Ocupação hoje"
            value={s ? `${String(s.occupancy_percent).replace(".", ",")}%` : "—"}
            hint={s ? `${s.rented_today} de ${plural(s.fleet_size, "carro", "carros")} em locação` : undefined}
            to="/frota"
          />
          <Stat
            label="A pagar a parceiros"
            value={payouts.isSuccess ? formatCents(o.payoutPendingCents) : "—"}
            hint={
              payouts.isSuccess
                ? `${plural(o.payoutPendingCount, "repasse pendente", "repasses pendentes")}${o.payoutUndefinedCount ? ` · ${o.payoutUndefinedCount} sem percentual definido` : ""}`
                : undefined
            }
            to="/repasses"
          />
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Agenda title="Próximas retiradas" items={pickups.slice(0, 6)} date={(b) => b.start_at} empty="Nenhuma retirada marcada." />
        <Agenda title="Carros na rua" items={onRoad.slice(0, 6)} date={(b) => b.end_at} empty="Nenhum carro em locação." />
      </div>

      {bookings.isSuccess && all.filter((b) => isActive(b.stage)).length === 0 && (
        <p className="text-sm text-bone/50">
          Nenhuma reserva ativa. <Link to="/reservas" className="text-gold hover:underline">Criar uma reserva</Link>
        </p>
      )}
    </section>
  );
}
