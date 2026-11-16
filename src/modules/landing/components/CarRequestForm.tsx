import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { type GuestRequestInput } from "@/modules/requests/model/requests.types";
import { clientRequestsService, publicRequestsService } from "@/modules/requests/services/requests.service";
import { formatCents, operationInstant } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import type { Lang } from "../model/landing.content";
import { captureReferral } from "../model/whatsapp";

const COPY = {
  pt: {
    title: "Reservar este carro", start: "Retirada", end: "Devolução", pick: "Escolha a retirada e a devolução para ver o valor.",
    days: (n: number) => `${n} ${n === 1 ? "diária" : "diárias"}`, deposit: "caução", kmFree: "km livre", km: (n: number) => `${n} km por dia`,
    unavailable: "O carro já está reservado nesse período. Tente outras datas.", name: "Nome", email: "E-mail", whatsapp: "WhatsApp",
    whatsappHint: "Com DDI e DDD.", place: "Local de retirada (opcional)", submit: "Enviar pedido", sending: "Enviando...",
    note: "O carro fica reservado quando a central confirmar. Você recebe a resposta por e-mail.",
    sent: (email: string) => `Pedido recebido! Enviamos um link para ${email}. Abra o link para enviar o pedido à central.`,
    missing: "Preencha nome, e-mail e WhatsApp.", quoteError: "Não foi possível calcular o valor.", sendError: "Não foi possível enviar o pedido.",
  },
  en: {
    title: "Book this car", start: "Pick-up", end: "Return", pick: "Choose pick-up and return to see the price.",
    days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`, deposit: "deposit", kmFree: "unlimited km", km: (n: number) => `${n} km per day`,
    unavailable: "This car is already booked for these dates. Try other dates.", name: "Name", email: "E-mail", whatsapp: "WhatsApp",
    whatsappHint: "With country and area code.", place: "Pick-up place (optional)", submit: "Send request", sending: "Sending...",
    note: "The car is reserved once our team confirms. You get the answer by e-mail.",
    sent: (email: string) => `Request received! We sent a link to ${email}. Open it to send the request to our team.`,
    missing: "Fill in name, e-mail and WhatsApp.", quoteError: "Could not calculate the price.", sendError: "Could not send the request.",
  },
} as const;

interface CarRequestFormProps {
  vehicleId: string;
  lang: Lang;
}

/** Reserva na página do carro, como a LuxuryBus (RN-02.38): datas, valor, contato. Sem conta, o pedido vai para a
 * central depois do clique no e-mail; o cliente que já entrou pede direto pela conta. */
export function CarRequestForm({ vehicleId, lang }: CarRequestFormProps) {
  const c = COPY[lang];
  const navigate = useNavigate();
  const user = useAuthStore((s) => (s.isAuthenticated() ? s.user : null));
  const isClient = user?.role === "cliente";
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [place, setPlace] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const periodOk = operationInstant(end) > operationInstant(start);
  const quote = useQuery({
    queryKey: ["public-quote", vehicleId, start, end],
    queryFn: () => publicRequestsService.quote(vehicleId, start, end),
    enabled: periodOk,
    retry: false,
  });
  const send = useMutation({
    mutationFn: async (input: GuestRequestInput) => {
      if (!isClient) return publicRequestsService.guest(input);
      const r = await clientRequestsService.create({ kind: "aluguel", whatsapp: input.whatsapp, notes: "", referral_code: input.referral_code,
        vehicle_id: input.vehicle_id, start_at: input.start_at, end_at: input.end_at, place: input.place });
      navigate(`/minha-conta/pedidos/${r.id}`);
      return null;
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!quote.data?.available) return;
    if ((!isClient && (!name.trim() || !email.trim())) || whatsapp.replace(/\D/g, "").length < 10) return setProblem(c.missing);
    setProblem(null);
    send.mutate({ name, email, whatsapp, vehicle_id: vehicleId, start_at: start, end_at: end, place, referral_code: captureReferral() || undefined });
  };

  if (send.isSuccess && !isClient) {
    return (
      <p role="status" className="rounded-xl border border-gold/30 bg-gold/[0.05] p-4 text-sm leading-relaxed text-bone/85">
        {c.sent(email.trim())}
      </p>
    );
  }

  const q = quote.data;
  const error = problem ?? (send.isError ? apiErrorMessage(send.error, c.sendError) : quote.isError ? apiErrorMessage(quote.error, c.quoteError) : null);
  return (
    <form onSubmit={submit} className="space-y-4" noValidate aria-label={c.title}>
      <h2 className="font-serif text-2xl font-light">{c.title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="car-start" label={c.start}>
          <input id="car-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </Field>
        <Field id="car-end" label={c.end}>
          <input id="car-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </Field>
      </div>
      {!periodOk && <p className="text-sm text-bone/55">{c.pick}</p>}
      {q && !q.available && <p className="text-sm text-amber-200">{c.unavailable}</p>}
      {q?.available && q.total_cents !== null && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="font-serif text-3xl font-light text-gold">{formatCents(q.total_cents)}</p>
          <p className="mt-1 text-sm text-bone/60">
            {c.days(q.days ?? 1)} × {formatCents(q.daily_rate_cents ?? 0)}
            {q.deposit_cents !== null && ` · ${c.deposit} ${formatCents(q.deposit_cents)}`} · {q.km_limit_per_day === null ? c.kmFree : c.km(q.km_limit_per_day)}
          </p>
        </div>
      )}
      {q?.available && (
        <>
          {!isClient && (
            <>
              <Field id="car-name" label={c.name}>
                <input id="car-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </Field>
              <Field id="car-email" label={c.email}>
                <input id="car-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </Field>
            </>
          )}
          <Field id="car-whatsapp" label={c.whatsapp} hint={c.whatsappHint}>
            <input id="car-whatsapp" type="tel" autoComplete="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
          </Field>
          <Field id="car-place" label={c.place}>
            <input id="car-place" value={place} onChange={(e) => setPlace(e.target.value)} className={inputClass} />
          </Field>
          <p className="text-xs text-bone/50">{c.note}</p>
        </>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
      {q?.available && (
        <Button type="submit" className="w-full" disabled={send.isPending}>
          {send.isPending ? c.sending : c.submit}
        </Button>
      )}
    </form>
  );
}
