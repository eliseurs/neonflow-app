import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { whatsappUrl } from "@/modules/landing/model/whatsapp";
import { parseReais } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { buttonClass } from "@/shared/ui/buttonClass";
import { Dialog } from "@/shared/ui/Dialog";
import { Field, inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { RequestSummary } from "../components/RequestSummary";
import { whatsappMessage } from "../model/requests.types";
import { requestsService } from "../services/requests.service";

type Action = "confirm" | "adjust" | "refuse";

const ACTION_TITLE: Record<Action, string> = { confirm: "Confirmar pedido", adjust: "Pedir ajuste", refuse: "Recusar pedido" };

/** A central responde o pedido: confirma (nasce a reserva ou o transfer), pede ajuste ou recusa (RN-02.33 a 02.37). */
export function RequestPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const request = useQuery({ queryKey: ["request", id], queryFn: () => requestsService.get(id) });
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [price, setPrice] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const r = request.data;

  const respond = useMutation({
    mutationFn: async (a: Action) => {
      if (a === "confirm") return requestsService.confirm(id, r?.kind === "transfer" ? (parseReais(price) ?? 0) : undefined);
      return a === "adjust" ? requestsService.adjust(id, note) : requestsService.refuse(id, note);
    },
    onSuccess: () => {
      setAction(null);
      setNote("");
      qc.invalidateQueries({ queryKey: ["request", id] });
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Resposta registrada. O cliente recebe por e-mail; avise também no WhatsApp se quiser.");
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!action) return;
    if (action !== "confirm" && !note.trim()) return setProblem("Escreva a mensagem para o cliente.");
    if (action === "confirm" && r?.kind === "transfer" && !parseReais(price)) return setProblem("Informe o preço do transfer.");
    setProblem(null);
    respond.mutate(action);
  };

  const open = (a: Action) => {
    respond.reset();
    setProblem(null);
    setAction(a);
  };
  const chat = r ? whatsappUrl(r.whatsapp, whatsappMessage(r)) : null;
  const error = problem ?? (respond.isError ? apiErrorMessage(respond.error, "Não foi possível registrar a resposta.") : null);

  return (
    <section className="space-y-8">
      <PageHeader overline="Pedido do site" title={r?.customer_name ?? "Pedido"} />
      {request.isPending && <Loading />}
      {request.isError && <ErrorNote>{apiErrorMessage(request.error, "Não foi possível carregar o pedido.")}</ErrorNote>}
      {r && (
        <>
          <Panel className="space-y-1 p-6 text-sm text-bone/70">
            <p>E-mail: {r.email}</p>
            <p>WhatsApp: +{r.whatsapp}</p>
            <div className="flex flex-wrap gap-3 pt-3">
              {chat && (
                <a href={chat} target="_blank" rel="noreferrer" className={buttonClass("outline")}>
                  Avisar no WhatsApp
                </a>
              )}
              <Link to={`/clientes/${r.customer_id}`} className={buttonClass("ghost")}>Ficha do cliente</Link>
              {r.booking_id && <Link to={`/reservas/${r.booking_id}`} className={buttonClass("ghost")}>Abrir a reserva</Link>}
              {r.transfer_id && <Link to={`/transfers/${r.transfer_id}`} className={buttonClass("ghost")}>Abrir o transfer</Link>}
            </div>
          </Panel>
          <RequestSummary request={r} />
          {(r.status === "solicitado" || r.status === "ajuste_pedido") && (
            <div className="flex flex-wrap gap-3">
              {r.status === "solicitado" && <Button onClick={() => open("confirm")}>Confirmar</Button>}
              {r.status === "solicitado" && <Button variant="outline" onClick={() => open("adjust")}>Pedir ajuste</Button>}
              <Button variant="danger" onClick={() => open("refuse")}>Recusar</Button>
            </div>
          )}
          {r.status === "ajuste_pedido" && <p className="text-sm text-bone/55">Aguardando o cliente alterar e reenviar o pedido.</p>}
        </>
      )}

      {action && r && (
        <Dialog title={ACTION_TITLE[action]} onClose={() => setAction(null)}>
          <form onSubmit={submit} className="space-y-5" noValidate>
            {action === "confirm" ? (
              r.kind === "transfer" ? (
                <Field id="req-price" label="Preço do transfer (R$)">
                  <input id="req-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
                </Field>
              ) : (
                <p className="text-sm text-bone/75">
                  A reserva nasce em preparação, com o carro bloqueado no período e 24 horas para o pagamento. Depois siga pela tela da reserva.
                </p>
              )
            ) : (
              <Field id="req-note" label={action === "adjust" ? "O que o cliente precisa mudar" : "Motivo da recusa"} hint="O cliente lê esta mensagem no e-mail e em Minha conta.">
                <textarea id="req-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
              </Field>
            )}
            {error && <ErrorNote>{error}</ErrorNote>}
            <Button type="submit" variant={action === "refuse" ? "danger" : "primary"} disabled={respond.isPending}>
              {respond.isPending ? "Registrando..." : ACTION_TITLE[action]}
            </Button>
          </form>
        </Dialog>
      )}
    </section>
  );
}
