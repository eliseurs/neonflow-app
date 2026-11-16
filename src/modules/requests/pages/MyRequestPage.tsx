import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { Button } from "@/shared/ui/Button";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { RequestForm } from "../components/RequestForm";
import { RequestSummary } from "../components/RequestSummary";
import { isOpen, type RequestInput } from "../model/requests.types";
import { clientRequestsService } from "../services/requests.service";

/** O cliente acompanha o pedido; em ajuste, altera e reenvia (RN-02.37). */
export function MyRequestPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const request = useQuery({ queryKey: ["my-request", id], queryFn: () => clientRequestsService.get(id) });
  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["my-request", id] });
    qc.invalidateQueries({ queryKey: ["my-requests"] });
  };
  const resubmit = useMutation({
    mutationFn: (input: RequestInput) => clientRequestsService.resubmit(id, input),
    onSuccess: () => {
      setEditing(false);
      refresh();
      toast.success("Pedido reenviado para a central.");
    },
  });
  const cancel = useMutation({
    mutationFn: () => clientRequestsService.cancel(id),
    onSuccess: refresh,
    onError: (err) => toast.error(apiErrorMessage(err, "Não foi possível cancelar o pedido.")),
  });

  const r = request.data;
  return (
    <section className="space-y-8">
      <PageHeader overline="Meu pedido" title="Acompanhe" accent="o pedido." />
      {request.isPending && <Loading />}
      {request.isError && <ErrorNote>{apiErrorMessage(request.error, "Não foi possível carregar o pedido.")}</ErrorNote>}
      {r && (
        <>
          <RequestSummary request={r} />
          {r.status === "ajuste_pedido" && !editing && (
            <Button onClick={() => setEditing(true)}>Alterar e reenviar</Button>
          )}
          {editing && (
            <Panel className="p-6 md:p-8">
              <RequestForm
                initial={r}
                submitLabel="Reenviar pedido"
                pending={resubmit.isPending}
                error={resubmit.isError ? apiErrorMessage(resubmit.error, "Não foi possível reenviar o pedido.") : null}
                onSubmit={(input) => resubmit.mutate(input)}
              />
            </Panel>
          )}
          {isOpen(r.status) && (
            <Button
              variant={confirmCancel ? "danger" : "ghost"}
              disabled={cancel.isPending}
              onClick={() => (confirmCancel ? cancel.mutate() : setConfirmCancel(true))}
            >
              {confirmCancel ? "Confirmar o cancelamento" : "Cancelar pedido"}
            </Button>
          )}
        </>
      )}
      <Link to="/minha-conta" className="block text-sm text-bone/55 hover:text-gold">← Voltar para Minha conta</Link>
    </section>
  );
}
