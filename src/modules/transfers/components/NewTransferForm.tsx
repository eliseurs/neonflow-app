import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { partnersService } from "@/modules/partners/services/partners.service";
import { CustomerPicker } from "@/modules/customers/components/CustomerPicker";
import type { PickedCustomer } from "@/modules/customers/model/customer.types";
import { localDateTime, parseReais } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import type { Transfer } from "../model/transfer.types";
import { transferService } from "../services/transfer.service";

export function NewTransferForm({ onDone }: { onDone: (t?: Transfer) => void }) {
  const qc = useQueryClient();
    const [picked, setPicked] = useState<PickedCustomer>({ name: "", customerId: null });
  const client = picked.name;
  const [pickup, setPickup] = useState(() => localDateTime(1, 9));
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [flight, setFlight] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [referrer, setReferrer] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => partnersService.list() });

  const create = useMutation({
    mutationFn: transferService.create,
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer registrado. Agora abra a oferta aos motoristas.");
      onDone(t);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cents = parseReais(price);
    const pax = Number(passengers);
    if (!cents) return setProblem("Informe o preço combinado com o cliente, em reais.");
    if (!Number.isInteger(pax) || pax < 1 || pax > 60) return setProblem("Passageiros deve ficar entre 1 e 60.");
    setProblem(null);
    create.mutate({
      client_name: client.trim(), pickup_at: pickup, origin: origin.trim(), destination: destination.trim(), flight: flight.trim(),
      passengers: pax, notes: notes.trim(), price_cents: cents, ...(referrer ? { referred_by_partner_id: referrer } : {}),
      ...(picked.customerId ? { customer_id: picked.customerId } : {}),
    });
  };

  const error = problem ?? (create.isError ? apiErrorMessage(create.error, "Não foi possível registrar o transfer.") : null);

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
            <CustomerPicker id="transfer-client" value={picked} onChange={setPicked} className="sm:col-span-2" />
      <Field id="transfer-pickup" label="Data e hora" hint="Horário de Gramado.">
        <input id="transfer-pickup" type="datetime-local" value={pickup} onChange={(e) => setPickup(e.target.value)} className={inputClass} />
      </Field>
      <Field id="transfer-passengers" label="Passageiros">
        <input id="transfer-passengers" inputMode="numeric" value={passengers} onChange={(e) => setPassengers(e.target.value)} className={inputClass} />
      </Field>
      <Field id="transfer-origin" label="Origem" hint="Ex.: Aeroporto de Porto Alegre.">
        <input id="transfer-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} />
      </Field>
      <Field id="transfer-destination" label="Destino">
        <input id="transfer-destination" value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass} />
      </Field>
      <Field id="transfer-flight" label="Voo" hint="Para acompanhar o pouso (60 min de espera inclusos).">
        <input id="transfer-flight" value={flight} onChange={(e) => setFlight(e.target.value)} className={inputClass} />
      </Field>
      <Field id="transfer-price" label="Preço (R$)" hint="Sob consulta: o valor combinado com o cliente.">
        <input id="transfer-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
      </Field>
      <Field id="transfer-referrer" label="Indicado por" hint="Se a mensagem trouxe &quot;Indicação: CÓDIGO&quot;." className="sm:col-span-2">
        <select id="transfer-referrer" value={referrer} onChange={(e) => setReferrer(e.target.value)} className={inputClass}>
          <option value="" className="bg-noir">Sem indicação</option>
          {partners.data?.filter((p) => p.active).map((p) => (
            <option key={p.id} value={p.id} className="bg-noir">{p.referral_code} · {p.name}</option>
          ))}
        </select>
      </Field>
      <Field id="transfer-notes" label="Observações" className="sm:col-span-2">
        <textarea id="transfer-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </Field>
      {error && <div className="sm:col-span-2"><ErrorNote>{error}</ErrorNote></div>}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={create.isPending || !client.trim() || !origin.trim() || !destination.trim()}>
          {create.isPending ? "Salvando..." : "Registrar transfer"}
        </Button>
        <Button variant="ghost" onClick={() => onDone()}>Cancelar</Button>
      </div>
    </form>
  );
}
