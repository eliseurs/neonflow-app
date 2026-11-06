import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatPlate, kmPlanLabel } from "@/modules/fleet/model/fleet.types";
import { fleetService } from "@/modules/fleet/services/fleet.service";
import { partnersService } from "@/modules/partners/services/partners.service";
import { PhotoGallery } from "@/modules/photos/components/PhotoGallery";
import { STAGE_LABEL, photoStageOpen } from "@/modules/photos/model/photo.types";
import { TermsPanel } from "@/modules/terms/components/TermsPanel";
import { cn } from "@/shared/lib/cn";
import { formatCents, formatDateTime, operationInstant, operationNowInput } from "@/shared/lib/format";
import { Field, inputClass } from "@/shared/ui/Field";
import { Button } from "@/shared/ui/Button";
import { Accent, PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { StageBadge } from "../components/StageBadge";
import { activeItems } from "@/modules/checklist/model/checklist.types";
import { checklistService } from "@/modules/checklist/services/checklist.service";
import {
    FLOW, STAGE, excessKm, extrasCents, formatMinutes, isCancelable, isOverdue, lateCents, lateMinutes, nextStage, pendingChecks, stageChecks, type Booking,
} from "../model/booking.types";
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
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => partnersService.list(), enabled: Boolean(booking.data?.referred_by_partner_id) });
  // Em "devolvida", o checklist de devolução configurado pela central entra nas conferências (RN-01.6).
  const returnChecklist = useQuery({
    queryKey: ["checklist-items"],
    queryFn: checklistService.list,
    enabled: booking.data?.stage === "devolvida",
  });
  const [confirmCancel, setConfirmCancel] = useState(false);
  // Hora real da entrega ou da devolução (RN-02.19). Começa em "agora", no horário de Gramado.
    const [actualAt, setActualAt] = useState(operationNowInput);
  // Odômetro na entrega e na devolução (RN-02.18).
  const [odometer, setOdometer] = useState("");

  const refresh = (b: Booking) => {
    qc.setQueryData(["bookings", id], b);
    qc.invalidateQueries({ queryKey: ["bookings"], exact: true });
        qc.invalidateQueries({ queryKey: ["bookings", id, "events"] });
    // Pagamento, entrega e encerramento mudam os indicadores e os repasses.
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["payouts"] });
  };

  const check = useMutation({
    mutationFn: (c: Record<string, boolean>) => bookingService.setChecks(id, c),
    onSuccess: refresh,
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const advance = useMutation({
        mutationFn: ({ at, km }: { at?: string; km?: number }) => bookingService.advance(id, at, km),
    onSuccess: (b) => {
      setOdometer("");
      refresh(b);
      setActualAt(operationNowInput());
      toast.success(`Reserva em ${STAGE[b.stage].label.toLowerCase()}.`);
    },
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
  // O carro ainda com outro cliente não pode ser entregue.
  const vehicleInUse = b.stage === "confirmada" && vehicle?.status === "em_locacao";
  const loadingChecklist = b.stage === "devolvida" && returnChecklist.isPending;
  // Entrega (confirmada → em locação) e devolução (em locação → devolvida) pedem a hora real.
  const asksTime = b.stage === "confirmada" || b.stage === "em_locacao";
  const actualMs = operationInstant(actualAt);
  const validTime = Number.isFinite(actualMs);
    const previewLate = b.stage === "em_locacao" && validTime ? lateMinutes(b.end_at, actualMs) : 0;
    const limited = b.km_limit_per_day !== null;
  const km = odometer.trim() === "" ? undefined : Number(odometer);
  const validKm = km === undefined ? !limited : Number.isInteger(km) && km >= 0;
  const kmBeforeDelivery = b.stage === "em_locacao" && km !== undefined && b.delivered_km !== null && km < b.delivered_km;
  const previewExcess =
    b.stage === "em_locacao" && limited && km !== undefined && b.delivered_km !== null && !kmBeforeDelivery
            ? excessKm(b.km_limit_per_day!, b.days, km - b.delivered_km)
      : 0;
  const extras = extrasCents(b);
    // O aviso segue a hora informada: registrar uma devolução dentro do combinado não mostra atraso.
  const overdue = isOverdue(b) && (!validTime || previewLate > 0);

  return (
    <section className="space-y-8">
      {back}
      <PageHeader
        overline="Reserva"
        title={b.client_name}
        description={b.customer_id ? undefined : "Cliente sem cadastro."}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {b.customer_id && (
              <Link to={`/clientes/${b.customer_id}`} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold hover:underline">
                Ficha do cliente
              </Link>
            )}
            <StageBadge stage={b.stage} />
          </div>
        }
      />
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
              {vehicleInUse && (
                <p role="status" className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/[0.05] px-4 py-3 text-sm text-amber-100">
                  O carro ainda está em locação em outra reserva. A entrega fica liberada depois da devolução e do checklist.
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
              {overdue && (
                <p role="status" className="mt-6 rounded-xl border border-rose-400/30 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">
                  Devolução atrasada: o combinado era {formatDateTime(b.end_at)}. Passada 1 hora de tolerância, cada minuto custa a diária ÷ 1440.
                </p>
              )}
              {asksTime && next && (
                <div className="mt-6">
                  <Field
                    id="actual-at"
                    label={b.stage === "confirmada" ? "Hora real da entrega" : "Hora real da devolução"}
                    hint="Horário de Gramado. Já vem com a hora de agora; ajuste se o registro for feito depois."
                  >
                    <input
                      id="actual-at"
                      type="datetime-local"
                      value={actualAt}
                      onChange={(e) => setActualAt(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                                    <Field
                    id="odometer"
                    label="Quilometragem (odômetro)"
                    className="mt-4"
                    hint={
                      limited
                        ? `Obrigatória: plano de ${b.km_limit_per_day} km/dia.${b.stage === "em_locacao" && b.delivered_km !== null ? ` Na entrega: ${b.delivered_km} km.` : ""}`
                        : "Opcional: km livre."
                    }
                  >
                    <input
                      id="odometer"
                      inputMode="numeric"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value.replace(/\D/g, ""))}
                      className={inputClass}
                    />
                  </Field>
                  {kmBeforeDelivery && (
                    <p className="mt-2 text-sm text-rose-300">A quilometragem da devolução não pode ser menor que a da entrega.</p>
                  )}
                  {previewExcess > 0 && (
                    <p className="mt-2 text-sm text-amber-200">
                                            Km excedente: {previewExcess} km ·{" "}
                      {b.extra_km_cents !== null ? formatCents(previewExcess * b.extra_km_cents) : "valor a definir pela central"}
                    </p>
                  )}
                  {b.stage === "em_locacao" && validTime && (
                    <p className={cn("mt-3 text-sm", previewLate > 0 ? "text-amber-200" : "text-bone/55")}>
                      {previewLate > 0
                                                ? `Atraso: ${formatMinutes(previewLate)} ·  ${formatCents(lateCents(previewLate, b.daily_rate_cents))}`
                        : "Dentro do combinado (até 1 hora de tolerância): sem cobrança de atraso."}
                    </p>
                  )}
                </div>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {next && (
                  <Button
                                        disabled={
                      busy || pending.length > 0 || awaitingChecklist || vehicleInUse || loadingChecklist ||
                      (asksTime && (!validTime || !validKm || kmBeforeDelivery))
                    }
                    onClick={() => advance.mutate(asksTime ? { at: actualAt, km } : {})}
                  >
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

          {(b.stage === "preparacao" || b.stage === "confirmada") && (
            <TermsPanel bookingId={b.id} clientName={b.client_name} customerId={b.customer_id} canSend />
          )}

          {b.stage !== "preparacao" && b.stage !== "cancelada" && (
            <Panel className="space-y-6 p-6 md:p-8">
              <h2 className="font-serif text-2xl font-light">Fotos do carro</h2>
              {(["entrega", "devolucao"] as const).map((st) => (
                <div key={st} className="space-y-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/55">{STAGE_LABEL[st]}</h3>
                  <PhotoGallery
                    target={{ kind: "reserva", id: b.id, stage: st }}
                    canUpload={photoStageOpen(st, b.stage)}
                    label={`Foto da ${STAGE_LABEL[st].toLowerCase()}`}
                  />
                </div>
              ))}
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
              <dt className="text-bone/45">Retirada e devolução</dt>
              <dd className="mt-1 text-bone/85">{formatDateTime(b.start_at)} → {formatDateTime(b.end_at)}</dd>
              <dd className="text-bone/55">{b.days} {b.days === 1 ? "diária" : "diárias"} de 24 h</dd>
            </div>
                        {b.place && (
              <div>
                <dt className="text-bone/45">Local de retirada</dt>
                <dd className="mt-1 text-bone/85">{b.place}</dd>
              </div>
            )}
            {b.referred_by_partner_id && (
              <div>
                <dt className="text-bone/45">Indicado por</dt>
                <dd className="mt-1 text-bone/85">
                  {(() => {
                    const p = partners.data?.find((x) => x.id === b.referred_by_partner_id);
                    return p ? `${p.name} · ${p.referral_code}` : "Parceiro";
                  })()}
                </dd>
              </div>
            )}
                        <div>
              <dt className="text-bone/45">Diária na reserva</dt>
              <dd className="mt-1 text-bone/85">{formatCents(b.daily_rate_cents)}</dd>
            </div>
            <div>
              <dt className="text-bone/45">Quilometragem</dt>
              <dd className="mt-1 text-bone/85">{kmPlanLabel(b.km_limit_per_day, b.extra_km_cents, formatCents)}</dd>
              {limited && <dd className="text-bone/55">Franquia de {b.km_limit_per_day! * b.days} km no período</dd>}
              {(b.delivered_km !== null || b.returned_km !== null) && (
                <dd className="text-bone/55">
                  Odômetro: {b.delivered_km ?? "—"} → {b.returned_km ?? "—"} km
                  {b.delivered_km !== null && b.returned_km !== null && ` (${b.returned_km - b.delivered_km} km rodados)`}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-bone/45">Caução</dt>
              <dd className="mt-1 text-bone/85">{b.deposit_cents ? `${formatCents(b.deposit_cents)} (pré-autorização)` : "Não cadastrada"}</dd>
            </div>
            {(b.delivered_at || b.returned_at) && (
              <div>
                <dt className="text-bone/45">Hora real</dt>
                {b.delivered_at && <dd className="mt-1 text-bone/85">Entregue em {formatDateTime(b.delivered_at)}</dd>}
                {b.returned_at && <dd className="text-bone/85">Devolvido em {formatDateTime(b.returned_at)}</dd>}
              </div>
            )}
            {b.extra_cents > 0 && (
              <div>
                <dt className="text-bone/45">Atraso na devolução</dt>
                <dd className="mt-1 text-amber-200">
                                    {formatMinutes(b.extra_minutes)} · {formatCents(b.extra_cents)}
                </dd>
              </div>
            )}
                                    {b.excess_km > 0 && (
              <div>
                <dt className="text-bone/45">Km excedente</dt>
                <dd className="mt-1 text-amber-200">
                  {b.excess_km} km · {b.extra_km_cents !== null ? formatCents(b.excess_km_cents) : "valor a definir pela central"}
                </dd>
              </div>
            )}
            <div className="border-t border-white/[0.08] pt-5">
              <dt className="text-bone/45">{extras > 0 ? "Total com extras" : "Total"}</dt>
              <dd className="mt-1 font-serif text-3xl font-light text-gold">{formatCents(b.total_cents + extras)}</dd>
              {extras > 0 && (
                <dd className="text-xs text-bone/45">
                  Reserva {formatCents(b.total_cents)}
                  {b.extra_cents > 0 && ` + atraso ${formatCents(b.extra_cents)}`}
                  {b.excess_km_cents > 0 && ` + km ${formatCents(b.excess_km_cents)}`}
                </dd>
              )}
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
