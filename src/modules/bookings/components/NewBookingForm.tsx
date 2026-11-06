import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { CATEGORY_LABEL, formatPlate } from "@/modules/fleet/model/fleet.types";
import { cn } from "@/shared/lib/cn";
import { formatCents, localDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote, Loading } from "@/shared/ui/Panel";
import { rentalDays, type Booking, type KmPlan } from "../model/booking.types";
import { bookingService } from "../services/booking.service";

export function NewBookingForm({ onCreated }: { onCreated: (b: Booking) => void }) {
  const qc = useQueryClient();
  // Padrão: amanhã às 10h, por 1 diária.
  const [start, setStart] = useState(localDateTime(1, 10));
  const [end, setEnd] = useState(localDateTime(2, 10));
  const [vehicleId, setVehicleId] = useState("");
  const [client, setClient] = useState("");
    const [place, setPlace] = useState("");
  // Plano de km (RN-02.18): limitado por padrão quando o veículo tem limite.
  const [kmPlan, setKmPlan] = useState<KmPlan>("limitado");

  const days = start && end ? rentalDays(start, end) : 0;
  const validPeriod = days >= 1;

  const available = useQuery({
    queryKey: ["availability", start, end],
    queryFn: () => bookingService.available(start, end),
    enabled: validPeriod,
  });
  const vehicle = available.data?.find((v) => v.id === vehicleId);

  const create = useMutation({
    mutationFn: bookingService.create,
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Pré-reserva criada. O período está bloqueado por 24 horas até o pagamento.");
      onCreated(b);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
        const plan: KmPlan = vehicle?.km_limit_per_day ? kmPlan : "livre";
    create.mutate({ vehicle_id: vehicleId, client_name: client.trim(), start_at: start, end_at: end, place: place.trim(), km_plan: plan });
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field id="booking-start" label="Retirada">
        <input id="booking-start" type="datetime-local" step={900} value={start} onChange={(e) => { setStart(e.target.value); setVehicleId(""); }} className={inputClass} />
      </Field>
      <Field id="booking-end" label="Devolução">
        <input id="booking-end" type="datetime-local" step={900} min={start || undefined} value={end} onChange={(e) => { setEnd(e.target.value); setVehicleId(""); }} className={inputClass} />
      </Field>
      <p className="-mt-2 text-xs text-bone/45 sm:col-span-2">
        Horário de Gramado, combinado com o cliente. Cada diária vale 24 horas a partir da retirada: 25 horas contam 2 diárias.
      </p>
      {!validPeriod && <p className="text-sm text-amber-200 sm:col-span-2">A devolução precisa ser depois da retirada.</p>}

      <Field id="booking-vehicle" label="Veículo disponível" className="sm:col-span-2">
        {available.isFetching ? (
          <div className="mt-2"><Loading label="Consultando disponibilidade..." /></div>
        ) : (
          <select
            id="booking-vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={!validPeriod || !available.data?.length}
            className={inputClass}
          >
            <option value="" className="bg-noir">
              {available.data && !available.data.length ? "Nenhum veículo livre no período" : "Selecione"}
            </option>
            {available.data?.map((v) => (
              <option key={v.id} value={v.id} className="bg-noir">
                {v.name} · {formatPlate(v.plate)} · {CATEGORY_LABEL[v.category]} · {formatCents(v.daily_rate_cents)}/dia
              </option>
            ))}
          </select>
        )}
      </Field>
      {available.isError && <div className="sm:col-span-2"><ErrorNote>{apiErrorMessage(available.error)}</ErrorNote></div>}

      <Field id="booking-client" label="Cliente" hint="Só o nome, por enquanto. Documentos virão depois (PEN-48)." className="sm:col-span-2">
        <input id="booking-client" value={client} onChange={(e) => setClient(e.target.value)} className={inputClass} />
      </Field>
      <Field id="booking-place" label="Local de retirada" className="sm:col-span-2">
        <input id="booking-place" value={place} onChange={(e) => setPlace(e.target.value)} className={inputClass} />
      </Field>

            {vehicle?.km_limit_per_day && vehicle.extra_km_cents && (
        <fieldset className="sm:col-span-2">
          <legend id="km-plan" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-bone/60">Quilometragem</legend>
          <div role="radiogroup" aria-labelledby="km-plan" className="mt-2 grid gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5 sm:grid-cols-2">
            {([
              ["limitado", `Limitado · ${vehicle.km_limit_per_day} km/dia`],
              ["livre", "Km livre"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={kmPlan === value}
                onClick={() => setKmPlan(value)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ease-silk",
                  kmPlan === value ? "bg-gold text-noir" : "text-bone/70 hover:bg-white/[0.04]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {kmPlan === "limitado" && (
            <p className="mt-2 text-xs text-bone/50">
              Franquia de {vehicle.km_limit_per_day * Math.max(days, 1)} km no período · excedente de {formatCents(vehicle.extra_km_cents)} por km
            </p>
          )}
        </fieldset>
      )}

      {vehicle && (
        <p className="text-sm text-bone/60 sm:col-span-2">
          Caução (pré-autorização no cartão):{" "}
          {vehicle.deposit_cents ? <span className="text-bone">{formatCents(vehicle.deposit_cents)}</span> : "não cadastrada para este veículo"}
        </p>
      )}

      {vehicle && (
        <div className="flex items-baseline justify-between rounded-xl border border-gold/30 bg-gold/[0.05] px-4 py-3 sm:col-span-2">
          <span className="text-sm text-bone/70">
            {days} {days === 1 ? "diária" : "diárias"} de 24 h × {formatCents(vehicle.daily_rate_cents)}
          </span>
          <span className="font-serif text-2xl font-light text-gold">{formatCents(days * vehicle.daily_rate_cents)}</span>
        </div>
      )}

      {create.isError && <div className="sm:col-span-2"><ErrorNote>{apiErrorMessage(create.error, "Não foi possível criar a reserva.")}</ErrorNote></div>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={create.isPending || !validPeriod || !vehicleId || !client.trim()}>
          {create.isPending ? "Criando..." : "Criar pré-reserva"}
        </Button>
      </div>
    </form>
  );
}
