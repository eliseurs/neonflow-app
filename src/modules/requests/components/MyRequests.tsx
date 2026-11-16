import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { buttonClass } from "@/shared/ui/buttonClass";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { STATUS_LABEL, STATUS_TONE, describe, priceLabel } from "../model/requests.types";
import { clientRequestsService } from "../services/requests.service";

/** Pedidos do cliente em Minha conta, com o atalho para pedir. */
export function MyRequests() {
  const list = useQuery({ queryKey: ["my-requests"], queryFn: clientRequestsService.list });
  const add = (
    <Link to="/minha-conta/pedidos/novo" className={buttonClass()}>
      <Plus className="h-4 w-4" aria-hidden /> Novo pedido
    </Link>
  );

  return (
    <section className="space-y-4" aria-label="Meus pedidos">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-light">Meus pedidos</h2>
        {list.data && list.data.length > 0 && add}
      </div>
      {list.isPending && <Loading />}
      {list.isError && <ErrorNote>{apiErrorMessage(list.error, "Não foi possível carregar os pedidos.")}</ErrorNote>}
      {list.data?.length === 0 && (
        <EmptyState title="Nenhum pedido ainda" text="Peça um carro ou um transfer. A central confirma e avisa você por e-mail." action={add} />
      )}
      {list.data && list.data.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {list.data.map((r) => (
            <Link key={r.id} to={`/minha-conta/pedidos/${r.id}`} className="flex flex-wrap items-center gap-3 p-5 transition hover:bg-white/[0.03]">
              <div className="min-w-0 flex-1">
                <p className="text-bone">{describe(r)}</p>
                <p className="text-sm text-bone/50">
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
