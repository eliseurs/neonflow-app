import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatCents, formatDateTime, parseReais } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { DriverPanel } from "../components/DriverPanel";
import { EVENT_LABEL, TRANSFER_STAGE, cancelFee, isCancellable, type Transfer } from "../model/transfer.types";
import { transferService } from "../services/transfer.service";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-bone/45">{label}</dt>
      <dd className="mt-1 text-bone/85">{children}</dd>
    </div>
  );
}

export function TransferDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const transfer = useQuery({ queryKey: ["transfers", id], queryFn: () => transferService.get(id) });
  const events = useQuery({ queryKey: ["transfers", id, "events"], queryFn: () => transferService.events(id) });

  const [extraWait, setExtraWait] = useState("");
  const [flightCancelled, setFlightCancelled] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const refresh = (t: Transfer) => {
    qc.setQueryData(["transfers", id], t);
    qc.invalidateQueries({ queryKey: ["transfers"], exact: true });
    qc.invalidateQueries({ queryKey: ["transfers", id, "events"] });
    qc.invalidateQueries({ queryKey: ["payouts"] });
  };
  const act = useMutation({
    mutationFn: (fn: () => Promise<Transfer>) => fn(),
    onSuccess: (t) => {
      refresh(t);
      setProblem(null);
      setConfirmCancel(false);
    },
  });

  const back = (
    <Link to="/transfers" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bone/60 hover:text-gold">
      <ArrowLeft className="h-4 w-4" aria-hidden /> Transfers
    </Link>
  );
  if (transfer.isPending) return <section className="space-y-6">{back}<Loading /></section>;
  if (transfer.isError) {
    return <section className="space-y-6">{back}<ErrorNote>{apiErrorMessage(transfer.error, "Transfer não encontrado.")}</ErrorNote></section>;
  }
  const t = transfer.data;
  const error = problem ?? (act.isError ? apiErrorMessage(act.error, "Não foi possível concluir a ação.") : null);
  const run = (fn: () => Promise<Transfer>) => act.mutate(fn);

  const complete = () => {
    const cents = extraWait.trim() ? parseReais(extraWait) : 0;
    if (cents === null) return setProblem("Informe a espera extra em reais, ou deixe em branco.");
    run(() => transferService.complete(id, cents));
  };
  const fee = cancelFee(t, flightCancelled);

  return (
    <section className="space-y-8">
      {back}
      <PageHeader
        overline={formatDateTime(t.pickup_at)}
        title={`${t.origin} →`}
        accent={t.destination}
        description={`${t.client_name} · ${t.passengers === 1 ? "1 passageiro" : `${t.passengers} passageiros`}${t.flight ? ` · voo ${t.flight}` : ""}`}
        actions={<Badge tone={TRANSFER_STAGE[t.stage].tone}>{TRANSFER_STAGE[t.stage].label}</Badge>}
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {t.stage === "aguardando_motorista" && <DriverPanel transfer={t} onChange={refresh} />}

          {(t.stage === "com_motorista" || t.stage === "em_andamento") && (
            <Panel className="space-y-5 p-6 md:p-8">
              <h2 className="font-serif text-2xl font-light">{t.driver_name}</h2>
              <p className="text-sm text-bone/60">
                Recebe {formatCents(t.driver_cents ?? 0)} pela corrida, mais a espera extra.
                {t.vehicle_name && ` Carro: ${t.vehicle_name}.`}
              </p>
              <label className="flex items-center gap-3 text-sm text-bone/80">
                <input
                  type="checkbox"
                  checked={t.paid_at !== null}
                  // O próximo estado vem da corrida, não do evento: evita marcar duas vezes num clique duplo.
                  onChange={() => run(() => transferService.setPaid(id, t.paid_at === null))}
                  className="h-4 w-4 accent-[#C9A86A]"
                />
                Cliente pagou{t.paid_at && ` (${formatDateTime(t.paid_at)})`}
              </label>
              {t.stage === "com_motorista" ? (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => run(() => transferService.start(id))} disabled={act.isPending}>Iniciar corrida</Button>
                  <Button variant="outline" className="px-4 py-2" onClick={() => run(() => transferService.release(id))} disabled={act.isPending}>
                    Motorista desistiu
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 border-t border-white/[0.08] pt-5">
                  <Field id="extra-wait" label="Espera extra (R$)" hint="Além dos 60 minutos inclusos no aeroporto. Vai para o motorista.">
                    <input id="extra-wait" inputMode="decimal" value={extraWait} onChange={(e) => setExtraWait(e.target.value)} className={inputClass} />
                  </Field>
                  <Button onClick={complete} disabled={act.isPending || t.paid_at === null}>Concluir corrida</Button>
                  {t.paid_at === null && <p className="text-xs text-amber-200">Marque o pagamento do cliente antes de concluir.</p>}
                </div>
              )}
            </Panel>
          )}

          {isCancellable(t.stage) && (
            <Panel className="space-y-4 p-6 md:p-8">
              {!confirmCancel ? (
                <Button variant="ghost" onClick={() => setConfirmCancel(true)}>Cancelar transfer</Button>
              ) : (
                <>
                  <label className="flex items-center gap-3 text-sm text-bone/80">
                    <input type="checkbox" checked={flightCancelled} onChange={(e) => setFlightCancelled(e.target.checked)} className="h-4 w-4 accent-[#C9A86A]" />
                    A companhia aérea cancelou o voo
                  </label>
                  <p className="text-sm text-bone/70">
                    {fee === 0 ? "Sem multa." : `Dentro das 24 horas: multa de ${formatCents(fee)} (50%).`} O estorno é feito pela central.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => run(() => transferService.cancel(id, flightCancelled))} disabled={act.isPending}>Confirmar cancelamento</Button>
                    <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Voltar</Button>
                  </div>
                </>
              )}
            </Panel>
          )}

          <Panel className="p-6 md:p-8">
            <h2 className="font-serif text-2xl font-light">Histórico</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(events.data ?? []).map((e, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2">
                  <span>
                    {EVENT_LABEL[e.action] ?? e.action}
                    {e.detail && <span className="text-bone/45"> · {e.detail}</span>}
                  </span>
                  <span className="text-bone/45">{formatDateTime(e.created_at)}{e.user_name && ` · ${e.user_name}`}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="h-fit p-6 md:p-8">
          <dl className="space-y-5 text-sm">
            <Row label="Cliente">
              {t.customer_id ? (
                <Link to={`/clientes/${t.customer_id}`} className="text-gold hover:underline">{t.client_name}</Link>
              ) : (
                `${t.client_name} (sem cadastro)`
              )}
            </Row>
            <Row label="Preço da corrida">{formatCents(t.price_cents)}</Row>
            {t.driver_cents !== null && <Row label="Motorista">{formatCents(t.driver_cents + t.extra_wait_cents)}</Row>}
            {t.vehicle_name && <Row label="Carro">{t.vehicle_name}</Row>}
            {t.extra_wait_cents > 0 && <Row label="Espera extra">{formatCents(t.extra_wait_cents)}</Row>}
            {t.stage === "cancelado" && (
              <Row label="Cancelamento">
                {t.cancel_fee_cents > 0 ? `Multa ${formatCents(t.cancel_fee_cents)}` : "Sem multa"}
                {t.flight_cancelled && " · voo cancelado"}
              </Row>
            )}
            <Row label="Pagamento">{t.paid_at ? `Pago em ${formatDateTime(t.paid_at)}` : "Não pago"}</Row>
            {t.notes && <Row label="Observações">{t.notes}</Row>}
          </dl>
        </Panel>
      </div>
    </section>
  );
}
