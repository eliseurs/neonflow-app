import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { KIND_BASE, KIND_TITLE, totalsByPartner, type Payout, type PayoutKind, type PayoutStatus } from "../model/payouts.types";
import { payoutsService } from "../services/payouts.service";

const KINDS: PayoutKind[] = ["repasse", "comissao"];
const STATUSES: { value: PayoutStatus; label: string }[] = [
  { value: "pendente", label: "A pagar" },
  { value: "paga", label: "Pagos" },
];

function Tabs<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
            value === o.value ? "border-gold bg-gold text-noir" : "border-white/15 text-bone/70 hover:border-gold/60",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Comissões dos indicadores e repasses aos donos dos carros parceiros (RN-03.12, RN-03.13). */
export function PayoutsPage() {
  const qc = useQueryClient();
  const [kind, setKind] = useState<PayoutKind>("repasse");
  const [status, setStatus] = useState<PayoutStatus>("pendente");
  const [paying, setPaying] = useState<Payout | null>(null);
  const list = useQuery({ queryKey: ["payouts", kind, status], queryFn: () => payoutsService.list(kind, status) });

  const pay = useMutation({
    mutationFn: (id: string) => payoutsService.pay(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payouts"] });
      toast.success("Marcado como pago.");
      setPaying(null);
    },
  });

  const items = list.data ?? [];
  const totals = status === "pendente" ? totalsByPartner(items) : [];

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Repasses"
        title="O que é"
        accent="de cada parceiro."
        description="Gerados quando a reserva é encerrada. O Neon Flow fica com a participação administrativa; a comissão do indicador sai dela. Pague por Pix e marque como pago."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs label="Tipo" value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k, label: KIND_TITLE[k] }))} />
        <Tabs label="Situação" value={status} onChange={setStatus} options={STATUSES} />
      </div>

      {list.isPending && <Loading />}
      {list.isError && <ErrorNote>{apiErrorMessage(list.error, "Não foi possível carregar os repasses.")}</ErrorNote>}
      {list.isSuccess && items.length === 0 && (
        <EmptyState
          title={status === "pendente" ? "Nada a pagar" : "Nenhum pagamento registrado"}
          text={kind === "repasse"
            ? "O repasse aparece quando uma reserva de carro de parceiro é encerrada."
            : "A comissão aparece quando uma reserva com \"Indicado por\" é encerrada."}
        />
      )}

      {totals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {totals.map((t) => (
            <Panel key={t.partnerId} className="p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-bone/55">{t.partnerName}</p>
              <p className="mt-1 font-serif text-3xl font-light text-gold">{formatCents(t.amountCents)}</p>
              <p className="text-xs text-bone/50">
                {t.count} {t.count === 1 ? "reserva" : "reservas"}
                {t.undefinedCount > 0 && ` · ${t.undefinedCount} com percentual a definir`}
              </p>
            </Panel>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {items.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-light">{p.partner_name}</p>
                <p className="text-sm text-bone/55">
                  <Link to={`/reservas/${p.booking_id}`} className="underline-offset-4 hover:text-gold hover:underline">
                    {p.client_name}
                  </Link>{" "}
                  · {p.vehicle_name} · até {formatDateTime(p.end_at)}
                </p>
                <p className="text-xs text-bone/45">
                  {p.percent === null ? "Percentual a definir" : `${String(p.percent).replace(".", ",")}%`} {KIND_BASE[p.kind]} de {formatCents(p.base_cents)}
                </p>
                {p.paid_at && (
                  <p className="text-xs text-bone/45">Pago em {formatDateTime(p.paid_at)}{p.paid_by_name && ` por ${p.paid_by_name}`}</p>
                )}
              </div>
              <span className="font-serif text-2xl font-light text-gold">
                {p.amount_cents === null ? "—" : formatCents(p.amount_cents)}
              </span>
              {p.status === "paga" ? (
                <Badge tone="ok">Pago</Badge>
              ) : p.amount_cents === null ? (
                <Badge tone="warn">Percentual a definir</Badge>
              ) : (
                <Button variant="outline" className="px-4 py-2" onClick={() => setPaying(p)} aria-label={`Marcar como pago: ${p.partner_name}, ${p.client_name}`}>
                  <Check className="h-4 w-4" aria-hidden /> Marcar como pago
                </Button>
              )}
            </div>
          ))}
        </Panel>
      )}

      {paying && (
        <Dialog title="Confirmar pagamento" onClose={() => setPaying(null)}>
          <div className="space-y-5">
            <p className="text-bone/80">
              Você pagou <strong className="text-gold">{formatCents(paying.amount_cents ?? 0)}</strong> a {paying.partner_name} (
              {paying.kind === "repasse" ? "repasse" : "comissão"} da reserva de {paying.client_name})?
            </p>
            <p className="text-xs text-bone/45">O pagamento é feito fora do sistema, por Pix. Aqui fica o registro de quando e quem marcou.</p>
            {pay.isError && <ErrorNote>{apiErrorMessage(pay.error, "Não foi possível marcar como pago.")}</ErrorNote>}
            <div className="flex gap-3">
              <Button onClick={() => pay.mutate(paying.id)} disabled={pay.isPending}>
                {pay.isPending ? "Salvando..." : "Sim, marcar como pago"}
              </Button>
              <Button variant="ghost" onClick={() => setPaying(null)}>Cancelar</Button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
