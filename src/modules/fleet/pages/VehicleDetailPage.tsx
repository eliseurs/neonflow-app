import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { StageBadge } from "@/modules/bookings/components/StageBadge";
import { bookingService } from "@/modules/bookings/services/booking.service";
import { PhotoGallery } from "@/modules/photos/components/PhotoGallery";
import { formatCents, formatDate, formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { MaintenanceLog } from "../components/MaintenanceLog";
import { VehicleForm } from "../components/VehicleForm";
import { CATEGORY_LABEL, FEATURES, FUEL_LABEL, GEAR_LABEL, VEHICLE_STATUS, formatPlate, kmPlanLabel, vehicleStatus } from "../model/fleet.types";
import { fleetService } from "../services/fleet.service";

function Metric({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-bone/50">{label}</p>
      <p className="mt-2 font-serif text-2xl font-light text-gold">{value}</p>
      {hint && <p className="mt-1 text-xs text-bone/45">{hint}</p>}
    </div>
  );
}

/** Ficha do carro no painel: desempenho, dados, fotos, manutenções e reservas. */
export function VehicleDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const vehicle = useQuery({ queryKey: ["vehicles", id], queryFn: () => fleetService.get(id) });
  const stats = useQuery({ queryKey: ["vehicles", id, "stats"], queryFn: () => fleetService.stats(id) });
  const bookings = useQuery({ queryKey: ["bookings", { vehicle: id }], queryFn: () => bookingService.list(id) });
  const [editing, setEditing] = useState(false);

  const back = (
    <Link to="/frota" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bone/60 hover:text-gold">
      <ArrowLeft className="h-4 w-4" aria-hidden /> Frota
    </Link>
  );
  if (vehicle.isPending) return <section className="space-y-6">{back}<Loading /></section>;
  if (vehicle.isError) return <section className="space-y-6">{back}<ErrorNote>{apiErrorMessage(vehicle.error, "Veículo não encontrado.")}</ErrorNote></section>;
  const v = vehicle.data;
  const st = VEHICLE_STATUS[vehicleStatus(v)];
  const s = stats.data;
  const specs: [string, string][] = [
    ["Placa", formatPlate(v.plate)],
    ["Categoria", CATEGORY_LABEL[v.category]],
    ["Ano", v.year ? String(v.year) : "—"],
    ["Cor", v.color || "—"],
    ["Combustível", v.fuel ? FUEL_LABEL[v.fuel].pt : "—"],
    ["Câmbio", GEAR_LABEL[v.gear]],
    ["Portas", v.doors ? String(v.doors) : "—"],
    ["Lugares", String(v.seats)],
    ["Diária", formatCents(v.daily_rate_cents)],
    ["Caução", v.deposit_cents ? formatCents(v.deposit_cents) : "A definir"],
    ["Quilometragem", kmPlanLabel(v.km_limit_per_day, v.extra_km_cents, formatCents)],
    ["Proprietário", v.owner],
  ];
  const recent = (bookings.data ?? []).slice().sort((a, b) => b.start_at.localeCompare(a.start_at)).slice(0, 8);

  return (
    <section className="space-y-8">
      {back}
      <PageHeader
        overline={`${CATEGORY_LABEL[v.category]}${v.year ? ` · ${v.year}` : ""}`}
        title={v.name}
        accent=""
        description={formatPlate(v.plate)}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={st.tone}>{st.label}</Badge>
            <a href={`/carros/${v.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold hover:underline">
              Ver no site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            <Button variant="outline" className="px-4 py-2" onClick={() => setEditing(true)}>Editar</Button>
          </div>
        }
      />

      <Panel className="p-6 md:p-8">
        <h2 className="font-serif text-2xl font-light">Desempenho</h2>
        <p className="mt-1 text-sm text-bone/55">
          Últimos 12 meses{s ? `, desde ${formatDate(s.since.slice(0, 10))}` : ""}. Resultado = receita menos manutenção (sem repasse nem comissão).
        </p>
        {stats.isError && <div className="mt-4"><ErrorNote>{apiErrorMessage(stats.error, "Não foi possível carregar o desempenho.")}</ErrorNote></div>}
        {s && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Reservas" value={s.bookings} hint={`${s.rented_days} ${s.rented_days === 1 ? "dia alugado" : "dias alugados"}`} />
            <Metric label="Ocupação" value={`${String(s.occupancy_percent).replace(".", ",")}%`} hint="Horas com o carro fora" />
            <Metric label="Receita" value={formatCents(s.revenue_cents)} hint={`${s.km_driven.toLocaleString("pt-BR")} km rodados`} />
            <Metric
              label="Manutenção"
              value={formatCents(s.maintenance_cents)}
              hint={`${s.maintenance_count} ${s.maintenance_count === 1 ? "registro" : "registros"}${s.last_maintenance ? ` · última em ${formatDate(s.last_maintenance)}` : ""}`}
            />
            <div className="col-span-2 md:col-span-4">
              <Metric label="Resultado" value={formatCents(s.result_cents)} />
            </div>
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6 md:p-8">
          <h2 className="font-serif text-2xl font-light">Ficha</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt className="text-bone/45">{label}</dt>
                <dd className="text-bone/85">{value}</dd>
              </div>
            ))}
          </dl>
          {v.features.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {FEATURES.filter((f) => v.features.includes(f.key)).map((f) => <Badge key={f.key} tone="neutral">{f.pt}</Badge>)}
            </div>
          )}
          {v.description && <p className="mt-5 whitespace-pre-wrap text-sm text-bone/70">{v.description}</p>}
        </Panel>
        <Panel className="p-6 md:p-8">
          <h2 className="mb-4 font-serif text-2xl font-light">Fotos</h2>
          <PhotoGallery target={{ kind: "veiculo", id: v.id }} label={`Foto de ${v.name}`} />
        </Panel>
      </div>

      <MaintenanceLog vehicleId={v.id} />

      <Panel className="p-6 md:p-8">
        <h2 className="font-serif text-2xl font-light">Reservas</h2>
        {bookings.isSuccess && recent.length === 0 && <p className="mt-4 text-sm text-bone/50">Nenhuma reserva ainda.</p>}
        {recent.length > 0 && (
          <ul className="mt-4 divide-y divide-white/[0.08]">
            {recent.map((b) => (
              <li key={b.id}>
                <Link to={`/reservas/${b.id}`} className="flex flex-wrap items-center gap-4 py-3 hover:text-gold">
                  <span className="min-w-0 flex-1">
                    {b.client_name}
                    <span className="block text-xs text-bone/45">{formatDateTime(b.start_at)} → {formatDateTime(b.end_at)}</span>
                  </span>
                  <span className="tabular-nums text-bone/75">{formatCents(b.total_cents + b.extra_cents + b.excess_km_cents)}</span>
                  <StageBadge stage={b.stage} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {editing && (
        <Dialog title="Editar veículo" onClose={() => setEditing(false)}>
          <VehicleForm
            vehicle={v}
            onDone={() => {
              setEditing(false);
              qc.invalidateQueries({ queryKey: ["vehicles", id] });
            }}
          />
        </Dialog>
      )}
    </section>
  );
}
