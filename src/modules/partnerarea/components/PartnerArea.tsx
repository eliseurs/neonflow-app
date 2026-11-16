import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiErrorMessage } from "@/app/providers/api/client";
import { STAGE } from "@/modules/bookings/model/booking.types";
import { ReferralCard } from "@/modules/partners/components/ReferralCard";
import { TRANSFER_STAGE } from "@/modules/transfers/model/transfer.types";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { payoutLabel, totals, type AreaReferral, type Payout } from "../model/partnerarea.types";
import { partnerAreaService } from "../services/partnerarea.service";

function Section({ title, empty, count, children }: { title: string; empty: string; count: number; children: ReactNode }) {
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className="font-serif text-2xl font-light">{title}</h2>
      {count === 0 ? <p className="text-sm text-bone/55">{empty}</p> : <Panel className="divide-y divide-white/[0.08]">{children}</Panel>}
    </section>
  );
}

function Totals({ payouts }: { payouts: (Payout | null)[] }) {
  const t = totals(payouts);
  if (t.paid === 0 && t.pending === 0) return null;
  return (
    <p className="text-sm text-bone/70">
      Recebido: <strong className="text-gold">{formatCents(t.paid)}</strong> · Pendente: <strong className="text-bone">{formatCents(t.pending)}</strong>
    </p>
  );
}

function stageOf(r: AreaReferral) {
  return r.kind === "transfer" ? TRANSFER_STAGE[r.stage as keyof typeof TRANSFER_STAGE] : STAGE[r.stage as keyof typeof STAGE];
}

/** Área do parceiro em Minha conta, só leitura (RN-07.8 a 07.11). Cada seção aparece conforme os tipos dele. */
export function PartnerArea() {
  const area = useQuery({ queryKey: ["partner-area"], queryFn: partnerAreaService.area });
  if (area.isPending) return <Loading />;
  if (area.isError) return <ErrorNote>{apiErrorMessage(area.error, "Não foi possível carregar a sua área.")}</ErrorNote>;
  const { partner, vehicles, bookings, rides, referrals } = area.data;
  const owner = partner.kinds.includes("proprietario");
  const driver = partner.kinds.includes("motorista");

  return (
    <div className="space-y-10">
      {owner && (
        <>
          <Section title="Meus carros" empty="Nenhum carro ligado a você ainda. Fale com a central." count={vehicles.length}>
            {vehicles.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center gap-3 p-5">
                <p className="flex-1 font-serif text-xl font-light">{v.name}</p>
                <span className="font-mono text-sm text-bone/55">{v.plate}</span>
                {v.in_maintenance && <Badge tone="warn">Em manutenção</Badge>}
              </div>
            ))}
          </Section>
          <Section title="Reservas dos meus carros" empty="Nenhuma reserva ainda." count={bookings.length}>
            {bookings.map((b) => (
              <div key={b.id} className="space-y-1 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="flex-1">{b.vehicle_name}</p>
                  <Badge tone={STAGE[b.stage].tone}>{STAGE[b.stage].label}</Badge>
                </div>
                <p className="text-sm text-bone/60">
                  {formatDateTime(b.start_at)} → {formatDateTime(b.end_at)} · {b.days} {b.days === 1 ? "diária" : "diárias"}
                  {b.extra_minutes > 0 && ` · atraso de ${b.extra_minutes} min`}
                  {b.excess_km > 0 && ` · ${b.excess_km} km excedentes`}
                </p>
                <p className="text-sm text-bone/80">Repasse: {payoutLabel(b.payout)}</p>
              </div>
            ))}
          </Section>
          <Totals payouts={bookings.map((b) => b.payout)} />
        </>
      )}

      {driver && (
        <>
          <Section title="Minhas corridas" empty="Nenhuma corrida ainda." count={rides.length}>
            {rides.map((r) => (
              <div key={r.id} className="space-y-1 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="flex-1">
                    {r.origin} → {r.destination}
                  </p>
                  <Badge tone={TRANSFER_STAGE[r.stage].tone}>{TRANSFER_STAGE[r.stage].label}</Badge>
                </div>
                <p className="text-sm text-bone/60">
                  {formatDateTime(r.pickup_at)} · {r.client_name} · {r.passengers} {r.passengers === 1 ? "passageiro" : "passageiros"}
                  {r.flight && ` · voo ${r.flight}`}
                </p>
                <p className="text-sm text-bone/80">
                  Você recebe: {r.payout ? payoutLabel(r.payout) : `${formatCents(r.driver_cents)} · gerado na conclusão`}
                </p>
              </div>
            ))}
          </Section>
          <Totals payouts={rides.map((r) => r.payout)} />
        </>
      )}

      <Section title="Minhas indicações" empty="Nenhuma indicação ainda. Compartilhe o seu link ou QR abaixo." count={referrals.length}>
        {referrals.map((r) => (
          <div key={r.id} className="space-y-1 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex-1">{r.kind === "transfer" ? "Transfer" : "Aluguel"} · {formatDateTime(r.at)}</p>
              <Badge tone={stageOf(r).tone}>{stageOf(r).label}</Badge>
            </div>
            <p className="text-sm text-bone/80">Comissão: {payoutLabel(r.payout, "gerada na conclusão do serviço")}</p>
          </div>
        ))}
      </Section>
      <Totals payouts={referrals.map((r) => r.payout)} />

      <section className="space-y-3" aria-label="Meu link de indicação">
        <h2 className="font-serif text-2xl font-light">Meu link de indicação</h2>
        <Panel className="p-6">
          <ReferralCard partner={partner} centralHint={false} />
        </Panel>
      </section>
    </div>
  );
}
