import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "@/app/providers/api/client";
import { captureReferral } from "@/modules/landing/model/whatsapp";
import { cn } from "@/shared/lib/cn";
import { formatCents, operationInstant, operationNowInput } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote, Loading } from "@/shared/ui/Panel";
import { kmLabel, type RequestInput, type RequestKind, type SiteRequest } from "../model/requests.types";
import { clientRequestsService } from "../services/requests.service";

interface RequestFormProps {
  /** Pedido em ajuste: o formulário abre preenchido e o tipo não muda. */
  initial?: SiteRequest;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: (input: RequestInput) => void;
}

const toInput = (iso: string | null) => (iso ? operationNowInput(new Date(iso)) : "");

/** Pedido do cliente logado: aluguel (período, carro livre com a estimativa) ou transfer (RN-02.33 a 02.35). */
export function RequestForm({ initial, submitLabel, pending, error, onSubmit }: RequestFormProps) {
  const [kind, setKind] = useState<RequestKind>(initial?.kind ?? "aluguel");
  const [start, setStart] = useState(toInput(initial?.start_at ?? null));
  const [end, setEnd] = useState(toInput(initial?.end_at ?? null));
  const [vehicleId, setVehicleId] = useState(initial?.vehicle_id ?? "");
  const [place, setPlace] = useState(initial?.place ?? "");
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [pickup, setPickup] = useState(toInput(initial?.pickup_at ?? null));
  const [passengers, setPassengers] = useState(String(initial?.passengers ?? 1));
  const [flight, setFlight] = useState(initial?.flight ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [problem, setProblem] = useState<string | null>(null);

  const periodOk = operationInstant(end) > operationInstant(start);
  const cars = useQuery({
    queryKey: ["client-cars", start, end],
    queryFn: () => clientRequestsService.cars(start, end),
    enabled: kind === "aluguel" && periodOk,
  });
  const chosen = cars.data?.find((c) => c.id === vehicleId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (whatsapp.replace(/\D/g, "").length < 10) return setProblem("Informe o WhatsApp com DDI e DDD.");
    const base = { kind, whatsapp, notes, referral_code: captureReferral() || undefined };
    if (kind === "aluguel") {
      if (!periodOk) return setProblem("A devolução precisa ser depois da retirada.");
      if (!chosen) return setProblem("Escolha um carro livre no período.");
      setProblem(null);
      return onSubmit({ ...base, vehicle_id: chosen.id, start_at: start, end_at: end, place });
    }
    if (!origin.trim() || !destination.trim() || !pickup) return setProblem("Informe origem, destino, data e horário.");
    setProblem(null);
    onSubmit({ ...base, origin, destination, pickup_at: pickup, passengers: Number(passengers) || 0, flight });
  };

  const shown = problem ?? error;
  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {!initial && (
        <div role="group" aria-label="Tipo de pedido" className="flex gap-2">
          {(["aluguel", "transfer"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
                kind === k ? "border-gold bg-gold text-noir" : "border-white/15 text-bone/70 hover:border-gold/60",
              )}
            >
              {k === "aluguel" ? "Aluguel de carro" : "Transfer"}
            </button>
          ))}
        </div>
      )}

      {kind === "aluguel" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="req-start" label="Retirada">
              <input id="req-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
            </Field>
            <Field id="req-end" label="Devolução">
              <input id="req-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/60">Carro</legend>
            {!periodOk && <p className="text-sm text-bone/55">Escolha a retirada e a devolução para ver os carros livres e o valor.</p>}
            {periodOk && cars.isPending && <Loading label="Buscando carros livres..." />}
            {cars.isError && <ErrorNote>{apiErrorMessage(cars.error, "Não foi possível buscar os carros.")}</ErrorNote>}
            {cars.data?.length === 0 && <p className="text-sm text-bone/70">Nenhum carro livre nesse período. Tente outras datas.</p>}
            {cars.data?.map((c) => (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                  vehicleId === c.id ? "border-gold/70 bg-gold/[0.06]" : "border-white/10 hover:border-white/25",
                )}
              >
                <input type="radio" name="req-car" value={c.id} checked={vehicleId === c.id} onChange={() => setVehicleId(c.id)} className="mt-1 accent-[#C9A86A]" />
                <span className="flex-1">
                  <span className="block font-serif text-xl font-light">{c.name}</span>
                  <span className="block text-sm text-bone/60">
                    {c.days} {c.days === 1 ? "diária" : "diárias"} de {formatCents(c.daily_rate_cents ?? 0)} · {kmLabel(c)}
                    {c.deposit_cents !== null && ` · caução ${formatCents(c.deposit_cents)}`}
                  </span>
                </span>
                <span className="font-serif text-xl text-gold">{formatCents(c.total_cents ?? 0)}</span>
              </label>
            ))}
          </fieldset>
          <Field id="req-place" label="Local de retirada (opcional)">
            <input id="req-place" value={place} onChange={(e) => setPlace(e.target.value)} className={inputClass} />
          </Field>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="req-origin" label="Origem">
              <input id="req-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} />
            </Field>
            <Field id="req-destination" label="Destino">
              <input id="req-destination" value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} />
            </Field>
            <Field id="req-pickup" label="Data e horário">
              <input id="req-pickup" type="datetime-local" value={pickup} onChange={(e) => setPickup(e.target.value)} className={inputClass} />
            </Field>
            <Field id="req-passengers" label="Passageiros">
              <input id="req-passengers" type="number" min={1} value={passengers} onChange={(e) => setPassengers(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field id="req-flight" label="Voo (opcional)">
            <input id="req-flight" value={flight} onChange={(e) => setFlight(e.target.value)} className={inputClass} />
          </Field>
          <p className="text-sm text-bone/55">O valor do transfer é informado pela central ao confirmar.</p>
        </>
      )}

      <Field id="req-whatsapp" label="WhatsApp" hint="Com DDI e DDD. A central pode falar com você por ele.">
        <input id="req-whatsapp" type="tel" autoComplete="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
      </Field>
      <Field id="req-notes" label="Observações (opcional)">
        <textarea id="req-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </Field>
      {kind === "aluguel" && chosen && (
        <p className="text-sm text-bone/70">
          Valor estimado: <strong className="text-gold">{formatCents(chosen.total_cents ?? 0)}</strong>. O carro fica reservado quando a central confirmar.
        </p>
      )}
      {shown && <ErrorNote>{shown}</ErrorNote>}
      <Button type="submit" disabled={pending}>{pending ? "Enviando..." : submitLabel}</Button>
    </form>
  );
}
