import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { PageHeader } from "@/shared/ui/Heading";
import { Panel } from "@/shared/ui/Panel";
import { RequestForm } from "../components/RequestForm";
import type { RequestInput } from "../model/requests.types";
import { clientRequestsService } from "../services/requests.service";

/** O cliente logado pede aluguel ou transfer (RN-02.33). */
export function NewRequestPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: (input: RequestInput) => clientRequestsService.create(input),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["my-requests"] });
      toast.success("Pedido enviado. A central responde por e-mail e aqui em Minha conta.");
      navigate(`/minha-conta/pedidos/${r.id}`, { replace: true });
    },
  });

  return (
    <section className="space-y-8">
      <PageHeader overline="Novo pedido" title="Para onde" accent="vamos?" description="O pedido vai direto para a central, que confirma, pede um ajuste ou responde se não puder atender." />
      <Panel className="p-6 md:p-8">
        <RequestForm
          submitLabel="Enviar pedido"
          pending={create.isPending}
          error={create.isError ? apiErrorMessage(create.error, "Não foi possível enviar o pedido.") : null}
          onSubmit={(input) => create.mutate(input)}
        />
      </Panel>
      <Link to="/minha-conta" className="text-sm text-bone/55 hover:text-gold">← Voltar para Minha conta</Link>
    </section>
  );
}
