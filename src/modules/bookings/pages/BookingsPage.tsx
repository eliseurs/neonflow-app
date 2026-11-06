import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { cn } from "@/shared/lib/cn";
import { formatCents, formatDate, formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { NewBookingForm } from "../components/NewBookingForm";
import { StageBadge } from "../components/StageBadge";
import { STAGE, isActive, type Booking, type Stage } from "../model/booking.types";
import { bookingService } from "../services/booking.service";

type Filter = "ativas" | "todas" | Stage;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ativas", label: "Ativas" },
  ...(Object.keys(STAGE) as Stage[]).map((s) => ({ value: s as Filter, label: STAGE[s].label })),
  { value: "todas", label: "Todas" },
];

function matches(b: Booking, filter: Filter): boolean {
  if (filter === "todas") return true;
  if (filter === "ativas") return isActive(b.stage);
  return b.stage === filter;
}

export function BookingsPage() {
  const navigate = useNavigate();
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: bookingService.list });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fleetService.list });
  const [filter, setFilter] = useState<Filter>("ativas");
  const [creating, setCreating] = useState(false);

  const vehicleName = useMemo(() => new Map(vehicles.data?.map((v) => [v.id, v.name])), [vehicles.data]);
  const list = (bookings.data ?? []).filter((b) => matches(b, filter)).sort((a, b) => a.start_date.localeCompare(b.start_date));

  const add = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="h-4 w-4" aria-hidden /> Nova reserva
    </Button>
  );

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Ciclo de locação"
        title="Reservas"
        accent="do início ao fim."
        description="Preparação, confirmação, entrega, devolução e encerramento. O período fica bloqueado desde a criação; sem pagamento em 24 horas, a pré-reserva é cancelada."
        actions={add}
      />

      <div role="group" aria-label="Filtrar por etapa" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
              filter === f.value ? "border-gold bg-gold text-noir" : "border-white/15 text-bone/70 hover:border-gold/60 hover:text-bone",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {bookings.isPending && <Loading />}
      {bookings.isError && <ErrorNote>{apiErrorMessage(bookings.error, "Não foi possível carregar as reservas.")}</ErrorNote>}
      {bookings.isSuccess && list.length === 0 && (
        <EmptyState
          title="Nenhuma reserva aqui"
          text={filter === "ativas" ? "Não há reservas em andamento. Crie uma escolhendo o período e um veículo livre." : "Nenhuma reserva nesta etapa."}
          action={filter === "ativas" ? add : undefined}
        />
      )}

      {list.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {list.map((b) => (
            <Link
              key={b.id}
              to={`/reservas/${b.id}`}
              className="grid gap-3 p-5 transition hover:bg-white/[0.03] md:grid-cols-[1.4fr_1fr_1fr_auto_auto] md:items-center md:gap-6"
            >
              <div>
                <p className="font-serif text-xl font-light">{b.client_name}</p>
                <p className="text-sm text-bone/55">{vehicleName.get(b.vehicle_id) ?? "Veículo"}{b.place && ` · ${b.place}`}</p>
              </div>
              <p className="text-sm text-bone/80">
                {formatDate(b.start_date)} → {formatDate(b.end_date)}
                <span className="block text-bone/45">{b.days} {b.days === 1 ? "diária" : "diárias"}</span>
              </p>
              <p className="text-sm text-bone/80">
                {formatCents(b.total_cents)}
                {b.stage === "preparacao" && <span className="block text-amber-200/80">Paga até {formatDateTime(b.expires_at)}</span>}
              </p>
              <StageBadge stage={b.stage} />
              <ChevronRight className="hidden h-4 w-4 text-bone/40 md:block" aria-hidden />
            </Link>
          ))}
        </Panel>
      )}

      {creating && (
        <Dialog title="Nova reserva" onClose={() => setCreating(false)}>
          <NewBookingForm onCreated={(b) => { setCreating(false); navigate(`/reservas/${b.id}`); }} />
        </Dialog>
      )}
    </section>
  );
}
