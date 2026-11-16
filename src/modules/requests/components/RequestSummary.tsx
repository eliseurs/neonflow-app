import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Panel } from "@/shared/ui/Panel";
import { STATUS_LABEL, STATUS_TONE, describe, kmLabel, priceLabel, type RequestDetail } from "../model/requests.types";

/** Dados do pedido, a última mensagem da central e o histórico. */
export function RequestSummary({ request: r }: { request: RequestDetail }) {
  return (
    <div className="space-y-6">
      <Panel className="space-y-3 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
          <span className="text-sm text-bone/50">Pedido em {formatDateTime(r.created_at)}</span>
        </div>
        <p className="font-serif text-2xl font-light">{describe(r)}</p>
        {r.kind === "aluguel" ? (
          <dl className="grid gap-1 text-sm text-bone/70">
            <div>
              Valor {r.status === "confirmado" ? "" : "estimado"}: <strong className="text-gold">{priceLabel(r)}</strong>
              {r.days !== null && r.daily_rate_cents !== null && ` (${r.days} × ${formatCents(r.daily_rate_cents)})`}
            </div>
            {r.deposit_cents !== null && <div>Caução: {formatCents(r.deposit_cents)}</div>}
            <div>{kmLabel(r)}</div>
            {r.place && <div>Local de retirada: {r.place}</div>}
          </dl>
        ) : (
          <dl className="grid gap-1 text-sm text-bone/70">
            <div>{r.passengers} {r.passengers === 1 ? "passageiro" : "passageiros"}</div>
            {r.flight && <div>Voo: {r.flight}</div>}
          </dl>
        )}
        {r.notes && <p className="text-sm text-bone/70">Observações: {r.notes}</p>}
      </Panel>

      {r.central_note && r.status !== "confirmado" && (
        <Panel className="border-gold/30 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Mensagem da central</p>
          <p className="mt-2 text-bone/85">{r.central_note}</p>
        </Panel>
      )}

      <section aria-label="Histórico">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/55">Histórico</p>
        <ol className="space-y-2 text-sm text-bone/70">
          {r.events.map((e, i) => (
            <li key={i}>
              {formatDateTime(e.created_at)} · {STATUS_LABEL[e.to_status]}
              {e.note && <span className="text-bone/55"> · {e.note}</span>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
