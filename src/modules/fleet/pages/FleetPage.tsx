import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatCents } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { VehicleForm } from "../components/VehicleForm";
import { CATEGORY_LABEL, GEAR_LABEL, formatPlate, type Vehicle } from "../model/fleet.types";
import { fleetService } from "../services/fleet.service";

export function FleetPage() {
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fleetService.list });
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);

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
        actions={add}
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
                {v.in_maintenance ? <Badge tone="warn">Manutenção</Badge> : <Badge tone="ok">Ativo</Badge>}
              </div>
              <h2 className="mt-3 font-serif text-2xl font-light">{v.name}</h2>
              <p className="mt-1 text-sm tracking-[0.15em] text-bone/60">{formatPlate(v.plate)}</p>
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
              </dl>
              <Button variant="outline" className="mt-6" onClick={() => setEditing(v)} aria-label={`Editar ${v.name}`}>
                Editar
              </Button>
            </Panel>
          ))}
        </div>
      )}

      {editing && (
        <Dialog title={editing === "new" ? "Novo veículo" : "Editar veículo"} onClose={() => setEditing(null)}>
          <VehicleForm vehicle={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
        </Dialog>
      )}
    </section>
  );
}
