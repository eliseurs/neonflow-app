import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatPlate } from "@/modules/fleet/model/fleet.types";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { cn } from "@/shared/lib/cn";
import { formatCents, formatDate, formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Accent, PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { StageBadge } from "../components/StageBadge";
import { activeItems } from "@/modules/checklist/model/checklist.types";
import { checklistService } from "@/modules/checklist/services/checklist.service";
import { FLOW, STAGE, isCancelable, nextStage, pendingChecks, stageChecks, type Booking } from "../model/booking.types";
import { bookingService } from "../services/booking.service";

function Stepper({ booking }: { booking: Booking }) {
  const current = FLOW.indexOf(booking.stage);
  return (
    <ol aria-label="Etapas" className="grid grid-cols-5 gap-2">
      {FLOW.map((stage, i) => {
        const done = booking.stage !== "cancelada" && i < current;
        const now = i === current;
        return (
          <li key={stage} aria-current={now ? "step" : undefined} className="flex flex-col gap-2">
            <span className={cn("h-px w-full", done || now ? "bg-gold" : "bg-white/15")} />
            <span
              className={cn(
                "whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] md:truncate",
                now ? "text-gold" : done ? "hidden text-bone/70 md:block" : "hidden text-bone/35 md:block",
              )}
            >
              {STAGE[stage].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function BookingDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const booking = useQuery({ queryKey: ["bookings", id], queryFn: () => bookingService.get(id) });
  const events = useQuery({ queryKey: ["bookings", id, "events"], queryFn: () => bookingService.events(id) });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fleetService.list });
  // Em "devolvida", o checklist de devolução configurado pela central entra nas conferências (RN-01.6).
  const returnChecklist = useQuery({
    queryKey: ["checklist-items"],
    queryFn: checklistService.list,
    enabled: booking.data?.stage === "devolvida",
  });
  const [confirmCancel, setConfirmCancel] = useState(false);

  const refresh = (b: Booking) => {
    qc.setQueryData(["bookings", id], b);
    qc.invalidateQueries({ queryKey: ["bookings"], exact: true });
    qc.invalidateQueries({ queryKey: ["bookings", id, "events"] });
  };

  const check = useMutation({
    mutationFn: (c: Record<string, boolean>) => bookingService.setChecks(id, c),
    onSuccess: refresh,
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const advance = useMutation({
    mutationFn: () => bookingService.advance(id),
    onSuccess: (b) => { refresh(b); toast.success(`Reserva em ${STAGE[b.stage].label.toLowerCase()}.`); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const cancel = useMutation({
    mutationFn: () => bookingService.cancel(id),
    onSuccess: (b) => { refresh(b); setConfirmCancel(false); toast.success("Reserva cancelada. O período foi liberado."); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const back = (
    <Link to="/reservas" className="inline-flex items-center gap-2 text-sm text-bone/60 hover:text-gold">
      <ArrowLeft className="h-4 w-4" aria-hidden /> Reservas
    </Link>
  );

  if (booking.isPending) return <Loading />;
  if (booking.isError) return <div className="space-y-6">{back}<ErrorNote>{apiErrorMessage(booking.error, "Reserva não encontrada.")}</ErrorNote></div>;

  const b = booking.data;
  const vehicle = vehicles.data?.find((v) => v.id === b.vehicle_id);
  const returnItems = activeItems(returnChecklist.data).map((i) => ({ key: i.key, label: i.label }));
  const checks = stageChecks(b.stage, returnItems);
  const pending = pendingChecks(b, returnItems);
  const next = nextStage(b.stage);
  const busy = check.isPending || advance.isPending || cancel.isPending;
  // RN-01.6: o carro só sai para nova locação com o checklist da devolução anterior aprovado.
  const awaitingChecklist = b.stage === "confirmada" && vehicle?.status === "aguardando_checklist";
  const loadingChecklist = b.stage === "devolvida" && returnChecklist.isPending;

  return (
    <section className="space-y-8">
      {back}
      <PageHeader overline="Reserva" title={b.client_name} actions={<StageBadge stage={b.stage} />} />
      {b.stage !== "cancelada" ? <Stepper booking={b} /> : <p className="text-sm text-bone/55">Reserva cancelada. O período do veículo está livre.</p>}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          {checks.length > 0 && (
            <Panel className="p-6 md:p-8">
              <h2 className="font-serif text-2xl font-light">
                {b.stage === "devolvida" ? (
                  <>
                    Checklist de <Accent>devolução</Accent>
                  </>
                ) : (
                  <>
                    Conferências de <Accent>{STAGE[b.stage].label.toLowerCase()}</Accent>
                  </>
                )}
              </h2>
              {b.stage === "devolvida" && (
                <p className="mt-2 text-sm text-bone/55">O carro só volta a ficar disponível com todos os itens conferidos.</p>
              )}
              {loadingChecklist && <div className="mt-4"><Loading label="Carregando o checklist..." /></div>}
              {awaitingChecklist && (
                <p role="status" className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/[0.05] px-4 py-3 text-sm text-amber-100">
                  O carro aguarda o checklist de devolução da reserva anterior. A entrega fica liberada depois que ele for aprovado.
                </p>
              )}
              <ul className="mt-6 space-y-3">
                {checks.map((c) => {
                  const on = Boolean(b.checks?.[c.key]);
                  return (
                    <li key={c.key}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        disabled={busy}
                        onClick={() => check.mutate({ [c.key]: !on })}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition disabled:opacity-60",
                          on ? "border-gold/50 bg-gold/[0.06]" : "border-white/10 hover:border-gold/40",
                        )}
                      >
                        <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border", on ? "border-gold bg-gold text-noir" : "border-white/25")}>
                          {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                        </span>
                        <span className={on ? "text-bone" : "text-bone/75"}>{c.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {next && (
                  <Button disabled={busy || pending.length > 0 || awaitingChecklist || loadingChecklist} onClick={() => advance.mutate()}>
                    Avançar para {STAGE[next].label.toLowerCase()}
                  </Button>
                )}
                {isCancelable(b.stage) &&
                  (confirmCancel ? (
                    <>
                      <Button variant="danger" disabled={busy} onClick={() => cancel.mutate()}>Confirmar cancelamento</Button>
                      <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Manter</Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => setConfirmCancel(true)}>Cancelar reserva</Button>
                  ))}
              </div>
              {pending.length > 0 && <p className="mt-4 text-sm text-bone/50">Falta: {pending.join(", ")}.</p>}
            </Panel>
          )}

          <Panel className="p-6 md:p-8">
            <h2 className="font-serif text-2xl font-light">Histórico</h2>
            {events.isPending && <div className="mt-4"><Loading /></div>}
            <ol className="mt-6 space-y-4 border-l border-white/10 pl-5">
              {events.data?.map((e, i) => (
                <li key={i} className="relative">
                  <span aria-hidden className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-gold" />
                  <p className="text-bone/85">
                    {e.from_stage ? `${STAGE[e.from_stage].label} → ${STAGE[e.to_stage].label}` : `Criada em ${STAGE[e.to_stage].label.toLowerCase()}`}
                  </p>
                  <p className="text-xs text-bone/45">
                    {formatDateTime(e.created_at)}{!e.user_id && e.from_stage && " · automático (prazo de pagamento)"}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <Panel className="order-first h-fit p-6 md:p-8 lg:order-none">
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="text-bone/45">Veículo</dt>
              <dd className="mt-1 font-serif text-xl font-light">{vehicle?.name ?? "—"}</dd>
              {vehicle && <dd className="text-bone/55 tracking-[0.12em]">{formatPlate(vehicle.plate)}</dd>}
            </div>
            <div>
              <dt className="text-bone/45">Período</dt>
              <dd className="mt-1 text-bone/85">{formatDate(b.start_date)} → {formatDate(b.end_date)} · {b.days} {b.days === 1 ? "diária" : "diárias"}</dd>
            </div>
            {b.place && (
              <div>
                <dt className="text-bone/45">Local de retirada</dt>
                <dd className="mt-1 text-bone/85">{b.place}</dd>
              </div>
            )}
            <div>
              <dt className="text-bone/45">Diária na reserva</dt>
              <dd className="mt-1 text-bone/85">{formatCents(b.daily_rate_cents)}</dd>
            </div>
            <div className="border-t border-white/[0.08] pt-5">
              <dt className="text-bone/45">Total</dt>
              <dd className="mt-1 font-serif text-3xl font-light text-gold">{formatCents(b.total_cents)}</dd>
            </div>
            {b.stage === "preparacao" && (
              <div className="rounded-xl border border-amber-300/30 bg-amber-300/[0.05] px-4 py-3 text-amber-100">
                Sem pagamento até {formatDateTime(b.expires_at)}, a pré-reserva é cancelada.
              </div>
            )}
          </dl>
        </Panel>
      </div>
    </section>
  );
}
