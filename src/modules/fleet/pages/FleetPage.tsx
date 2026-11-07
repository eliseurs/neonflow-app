import { useQuery } from "@tanstack/react-query";
import { Camera, ClipboardCheck, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { ChecklistManager } from "@/modules/checklist/components/ChecklistManager";
import { PhotoGallery } from "@/modules/photos/components/PhotoGallery";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { buttonClass } from "@/shared/ui/buttonClass";
import { FleetComparison } from "../components/FleetComparison";
import { VehicleForm } from "../components/VehicleForm";
import { CATEGORY_LABEL, GEAR_LABEL, VEHICLE_STATUS, formatPlate, kmPlanLabel, minDaysLabel, vehicleStatus, type Vehicle } from "../model/fleet.types";
import { fleetService } from "../services/fleet.service";

export function FleetPage() {
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fleetService.list });
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);
    const [checklistOpen, setChecklistOpen] = useState(false);
  const [photosOf, setPhotosOf] = useState<Vehicle | null>(null);

  const add = (
    <Button onClick={() => setEditing("new")}>
      <Plus className="h-4 w-4" aria-hidden /> Novo veículo
    </Button>
  );

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Frota"
        title="Veículos"
        accent="da central."
        description="Próprios e de parceiros, cada um com a sua diária. Veículo em manutenção não aceita reservas."
        actions={
          <>
            <Button variant="outline" onClick={() => setChecklistOpen(true)}>
              <ClipboardCheck className="h-4 w-4" aria-hidden /> Checklist de devolução
            </Button>
            {add}
          </>
        }
      />

      {vehicles.isPending && <Loading />}
      {vehicles.isError && <ErrorNote>{apiErrorMessage(vehicles.error, "Não foi possível carregar a frota.")}</ErrorNote>}
      {vehicles.data?.length === 0 && (
        <EmptyState title="Nenhum veículo cadastrado" text="Cadastre os carros da frota com placa, proprietário e diária." action={add} />
      )}

      {!!vehicles.data?.length && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.data.map((v) => (
            <Panel key={v.id} className="relative overflow-hidden p-6">
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{CATEGORY_LABEL[v.category]}</p>
                <Badge tone={VEHICLE_STATUS[vehicleStatus(v)].tone}>{VEHICLE_STATUS[vehicleStatus(v)].label}</Badge>
              </div>
                            <h2 className="mt-3 font-serif text-2xl font-light">
                <Link to={`/frota/${v.id}`} className="hover:text-gold">{v.name}</Link>
              </h2>
              <p className="mt-1 text-sm tracking-[0.15em] text-bone/60">{formatPlate(v.plate)}</p>
              {v.next_booking && (
                <Link
                  to={`/reservas/${v.next_booking.id}`}
                  className="mt-4 block rounded-xl border border-gold/20 bg-gold/[0.05] px-3 py-2 text-sm text-bone/80 transition-colors hover:border-gold/50"
                >
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-gold">Próxima reserva</span>
                  {formatDateTime(v.next_booking.start_at)} → {formatDateTime(v.next_booking.end_at)} · {v.next_booking.client_name}
                </Link>
              )}
              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-bone/45">Diária</dt>
                  <dd className="font-serif text-lg font-light text-bone">{formatCents(v.daily_rate_cents)}</dd>
                </div>
                <div>
                  <dt className="text-bone/45">Proprietário</dt>
                  <dd className="truncate text-bone/85">{v.owner}</dd>
                </div>
                <div>
                  <dt className="text-bone/45">Lugares</dt>
                  <dd className="text-bone/85">{v.seats}</dd>
                </div>
                <div>
                                    <dt className="text-bone/45">Câmbio</dt>
                  <dd className="text-bone/85">{GEAR_LABEL[v.gear]}</dd>
                </div>
                <div>
                  <dt className="text-bone/45">Caução</dt>
                  <dd className="text-bone/85">{v.deposit_cents ? formatCents(v.deposit_cents) : "A definir"}</dd>
                </div>
                <div>
                  <dt className="text-bone/45">Mínimo</dt>
                  <dd className="text-bone/85">{minDaysLabel(v.min_days)}</dd>
                </div>
                <div>
                  <dt className="text-bone/45">Quilometragem</dt>
                  <dd className="text-bone/85">{kmPlanLabel(v.km_limit_per_day, v.extra_km_cents, formatCents)}</dd>
                </div>
              </dl>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link to={`/frota/${v.id}`} className={buttonClass("primary")} aria-label={`Ficha de ${v.name}`}>
                  Ver ficha
                </Link>
                <Button variant="outline" onClick={() => setEditing(v)} aria-label={`Editar ${v.name}`}>
                  Editar
                </Button>
                <Button variant="ghost" onClick={() => setPhotosOf(v)} aria-label={`Fotos de ${v.name}`}>
                  <Camera className="h-4 w-4" aria-hidden /> Fotos
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

                  {vehicles.isSuccess && vehicles.data.length > 0 && <FleetComparison />}

      {photosOf && (
        <Dialog title={`Fotos · ${photosOf.name}`} onClose={() => setPhotosOf(null)}>
          <p className="mb-4 text-sm text-bone/60">A primeira é a capa. Até haver fotos, o site usa imagens ilustrativas (RN-01.7).</p>
          <PhotoGallery target={{ kind: "veiculo", id: photosOf.id }} label={`Foto de ${photosOf.name}`} />
        </Dialog>
      )}

      {checklistOpen && (
        <Dialog title="Checklist de devolução" onClose={() => setChecklistOpen(false)}>
          <ChecklistManager />
        </Dialog>
      )}

      {editing && (
        <Dialog title={editing === "new" ? "Novo veículo" : "Editar veículo"} onClose={() => setEditing(null)}>
          <VehicleForm vehicle={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
        </Dialog>
      )}
    </section>
  );
}
