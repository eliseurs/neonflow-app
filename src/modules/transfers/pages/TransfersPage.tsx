import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { NewTransferForm } from "../components/NewTransferForm";
import { TRANSFER_STAGE, isOpen, offerExpired } from "../model/transfer.types";
import { transferService } from "../services/transfer.service";

type Filter = "abertos" | "concluido" | "cancelado";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "abertos", label: "Em aberto" },
  { value: "concluido", label: "Concluídos" },
  { value: "cancelado", label: "Cancelados" },
];

export function TransfersPage() {
  const navigate = useNavigate();
  const transfers = useQuery({ queryKey: ["transfers"], queryFn: transferService.list });
  const [filter, setFilter] = useState<Filter>("abertos");
  const [creating, setCreating] = useState(false);

  const list = (transfers.data ?? [])
    .filter((t) => (filter === "abertos" ? isOpen(t.stage) : t.stage === filter))
    // Em aberto: o próximo primeiro.
    .sort((a, b) => (filter === "abertos" ? a.pickup_at.localeCompare(b.pickup_at) : b.pickup_at.localeCompare(a.pickup_at)));
  const add = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="h-4 w-4" aria-hidden /> Novo transfer
    </Button>
  );

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Transfer"
        title="Cada corrida,"
        accent="um motorista."
        description="Registre o pedido com o preço combinado, abra a oferta aos motoristas e acompanhe até a conclusão."
        actions={add}
      />

      <div role="group" aria-label="Filtrar" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
              filter === f.value ? "border-gold bg-gold text-noir" : "border-white/15 text-bone/70 hover:border-gold/60",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {transfers.isPending && <Loading />}
      {transfers.isError && <ErrorNote>{apiErrorMessage(transfers.error, "Não foi possível carregar os transfers.")}</ErrorNote>}
      {transfers.isSuccess && list.length === 0 && (
        <EmptyState
          title={filter === "abertos" ? "Nenhum transfer em aberto" : "Nada por aqui"}
          text="Quando um cliente pedir transfer pelo WhatsApp, combine o preço e registre aqui."
          action={filter === "abertos" ? add : undefined}
        />
      )}

      {list.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {list.map((t) => (
            <Link key={t.id} to={`/transfers/${t.id}`} className="flex flex-wrap items-center gap-4 p-5 hover:bg-white/[0.02]">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-light">{t.origin} → {t.destination}</p>
                <p className="text-sm text-bone/55">
                  {formatDateTime(t.pickup_at)} · {t.client_name}
                  {t.driver_name && ` · ${t.driver_name}`}
                </p>
                {t.stage === "aguardando_motorista" && t.offer_cents !== null && (
                  <p className={cn("text-xs", offerExpired(t) ? "text-rose-300" : "text-bone/45")}>
                    Oferta {formatCents(t.offer_cents)} · {offerExpired(t) ? "prazo vencido, reabra com valor maior" : `até ${formatDateTime(t.offer_expires_at!)}`}
                  </p>
                )}
              </div>
              <span className="font-serif text-xl font-light text-gold">{formatCents(t.price_cents)}</span>
              <Badge tone={TRANSFER_STAGE[t.stage].tone}>{TRANSFER_STAGE[t.stage].label}</Badge>
              <ChevronRight className="h-4 w-4 text-bone/40" aria-hidden />
            </Link>
          ))}
        </Panel>
      )}

      {creating && (
        <Dialog title="Novo transfer" onClose={() => setCreating(false)}>
          <NewTransferForm
            onDone={(t) => {
              setCreating(false);
              if (t) navigate(`/transfers/${t.id}`);
            }}
          />
        </Dialog>
      )}
    </section>
  );
}
