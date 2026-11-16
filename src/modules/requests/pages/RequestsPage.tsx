import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { STATUS_LABEL, STATUS_TONE, describe, priceLabel, type RequestStatus } from "../model/requests.types";
import { requestsService } from "../services/requests.service";

const FILTERS: { value: RequestStatus | "todos"; label: string }[] = [
  { value: "solicitado", label: "Aguardando" },
  { value: "ajuste_pedido", label: "Em ajuste" },
  { value: "confirmado", label: "Confirmados" },
  { value: "todos", label: "Todos" },
];

/** Pedidos feitos pelos clientes no site; a central responde cada um (RN-02.33). */
export function RequestsPage() {
  const [filter, setFilter] = useState<RequestStatus | "todos">("solicitado");
  const requests = useQuery({
    queryKey: ["requests", filter],
    queryFn: () => requestsService.list(filter === "todos" ? undefined : filter),
  });

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Pedidos do site"
        title="O cliente pediu,"
        accent="a central responde."
        description="Pedidos de aluguel e transfer feitos pelos clientes com conta. Nada fica bloqueado até você confirmar."
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
      {requests.isPending && <Loading />}
      {requests.isError && <ErrorNote>{apiErrorMessage(requests.error, "Não foi possível carregar os pedidos.")}</ErrorNote>}
      {requests.data?.length === 0 && <EmptyState title="Nenhum pedido aqui" text="Quando um cliente pedir pelo site, o pedido aparece nesta lista." />}
      {requests.data && requests.data.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {requests.data.map((r) => (
            <Link key={r.id} to={`/pedidos/${r.id}`} className="flex flex-wrap items-center gap-3 p-5 transition hover:bg-white/[0.03]">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-light">{r.customer_name}</p>
                <p className="text-sm text-bone/65">{describe(r)}</p>
                <p className="text-xs text-bone/45">
                  {priceLabel(r)} · pedido em {formatDateTime(r.created_at)}
                </p>
              </div>
              <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
              <ChevronRight className="h-4 w-4 text-bone/40" aria-hidden />
            </Link>
          ))}
        </Panel>
      )}
    </section>
  );
}
