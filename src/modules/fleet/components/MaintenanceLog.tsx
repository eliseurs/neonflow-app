import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatCents, formatDate, operationDay, parseReais } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote, Panel } from "@/shared/ui/Panel";
import { MAINTENANCE_KIND, type MaintenanceKind, type MaintenanceRequest } from "../model/fleet.types";
import { fleetService } from "../services/fleet.service";

/** Histórico de manutenção do carro: data, tipo, o que foi feito, custo, km e oficina. */
export function MaintenanceLog({ vehicleId }: { vehicleId: string }) {
  const qc = useQueryClient();
  const records = useQuery({ queryKey: ["vehicles", vehicleId, "maintenance"], queryFn: () => fleetService.maintenance(vehicleId) });
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(operationDay());
  const [kind, setKind] = useState<MaintenanceKind>("preventiva");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [km, setKm] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["vehicles", vehicleId, "maintenance"] });
    qc.invalidateQueries({ queryKey: ["vehicles", "stats"] });
    qc.invalidateQueries({ queryKey: ["vehicles", vehicleId, "stats"] });
  };
  const add = useMutation({
    mutationFn: (req: MaintenanceRequest) => fleetService.addMaintenance(vehicleId, req),
    onSuccess: () => {
      refresh();
      toast.success("Manutenção registrada.");
      setAdding(false);
      setDescription("");
      setCost("");
      setKm("");
    },
  });
  const remove = useMutation({ mutationFn: (id: string) => fleetService.removeMaintenance(id), onSuccess: refresh });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const costCents = cost.trim() ? parseReais(cost) : null;
    if (cost.trim() && costCents === null) return setProblem("Informe o custo em reais, ou deixe em branco.");
    const kmN = km.trim() ? Number(km) : null;
    if (kmN !== null && (!Number.isInteger(kmN) || kmN < 0)) return setProblem("Quilometragem inválida.");
    setProblem(null);
    add.mutate({ date, kind, description: description.trim(), cost_cents: costCents, odometer_km: kmN, workshop: workshop.trim() });
  };
  const error = problem ?? (add.isError ? apiErrorMessage(add.error, "Não foi possível registrar.") : null);
  const list = records.data ?? [];
  const total = list.reduce((sum, r) => sum + (r.cost_cents ?? 0), 0);

  return (
    <Panel className="space-y-5 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-light">Manutenções</h2>
          {list.length > 0 && <p className="text-sm text-bone/55">{list.length} registros · {formatCents(total)} no total</p>}
        </div>
        {!adding && (
          <Button variant="outline" className="px-4 py-2" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Registrar manutenção
          </Button>
        )}
      </div>

      {adding && (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 p-4 sm:grid-cols-2" noValidate>
          <Field id="maint-date" label="Data">
            <input id="maint-date" type="date" value={date} max={operationDay()} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </Field>
          <Field id="maint-kind" label="Tipo">
            <select id="maint-kind" value={kind} onChange={(e) => setKind(e.target.value as MaintenanceKind)} className={inputClass}>
              {(Object.keys(MAINTENANCE_KIND) as MaintenanceKind[]).map((k) => (
                <option key={k} value={k} className="bg-noir">{MAINTENANCE_KIND[k]}</option>
              ))}
            </select>
          </Field>
          <Field id="maint-description" label="O que foi feito" className="sm:col-span-2">
            <input id="maint-description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </Field>
          <Field id="maint-cost" label="Custo (R$)" hint="Em branco: sem custo informado.">
            <input id="maint-cost" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} className={inputClass} />
          </Field>
          <Field id="maint-km" label="Quilometragem">
            <input id="maint-km" inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} className={inputClass} />
          </Field>
          <Field id="maint-workshop" label="Oficina" className="sm:col-span-2">
            <input id="maint-workshop" value={workshop} onChange={(e) => setWorkshop(e.target.value)} className={inputClass} />
          </Field>
          {error && <div className="sm:col-span-2"><ErrorNote>{error}</ErrorNote></div>}
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" disabled={add.isPending || !description.trim()}>{add.isPending ? "Salvando..." : "Registrar"}</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {records.isSuccess && list.length === 0 && !adding && <p className="text-sm text-bone/50">Nenhuma manutenção registrada.</p>}
      {list.length > 0 && (
        <ul className="divide-y divide-white/[0.08]">
          {list.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-4 py-3">
              <span className="w-24 shrink-0 text-sm tabular-nums text-bone/60">{formatDate(r.date)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-bone/90">{r.description}</p>
                <p className="text-xs text-bone/45">
                  {[r.odometer_km !== null && `${r.odometer_km.toLocaleString("pt-BR")} km`, r.workshop].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Badge tone="neutral">{MAINTENANCE_KIND[r.kind]}</Badge>
              <span className="w-24 text-right tabular-nums text-bone/80">{r.cost_cents !== null ? formatCents(r.cost_cents) : "—"}</span>
              <button type="button" onClick={() => remove.mutate(r.id)} aria-label={`Apagar manutenção de ${formatDate(r.date)}`} className="text-bone/40 hover:text-rose-300">
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
