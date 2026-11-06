import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { CATEGORY_LABEL, formatPlate } from "@/modules/fleet/model/fleet.types";
import { formatCents, isoDate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote, Loading } from "@/shared/ui/Panel";
import type { Booking } from "../model/booking.types";
import { bookingService } from "../services/booking.service";

function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);
}

export function NewBookingForm({ onCreated }: { onCreated: (b: Booking) => void }) {
  const qc = useQueryClient();
  const [start, setStart] = useState(isoDate());
  const [end, setEnd] = useState(isoDate(1));
  const [vehicleId, setVehicleId] = useState("");
  const [client, setClient] = useState("");
  const [place, setPlace] = useState("");

  const days = start && end ? daysBetween(start, end) : 0;
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
    create.mutate({ vehicle_id: vehicleId, client_name: client.trim(), start_date: start, end_date: end, place: place.trim() });
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field id="booking-start" label="Retirada">
        <input id="booking-start" type="date" value={start} onChange={(e) => { setStart(e.target.value); setVehicleId(""); }} className={inputClass} />
      </Field>
      <Field id="booking-end" label="Devolução">
        <input id="booking-end" type="date" min={start || undefined} value={end} onChange={(e) => { setEnd(e.target.value); setVehicleId(""); }} className={inputClass} />
      </Field>
      {!validPeriod && <p className="text-sm text-amber-200 sm:col-span-2">A devolução precisa ser depois da retirada (mínimo de 1 diária).</p>}

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

      {vehicle && (
        <div className="flex items-baseline justify-between rounded-xl border border-gold/30 bg-gold/[0.05] px-4 py-3 sm:col-span-2">
          <span className="text-sm text-bone/70">
            {days} {days === 1 ? "diária" : "diárias"} × {formatCents(vehicle.daily_rate_cents)}
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
