import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { STAGE, type Stage } from "@/modules/bookings/model/booking.types";
import { formatPhone, whatsappUrl } from "@/modules/landing/model/whatsapp";
import { TRANSFER_STAGE, type TransferStage } from "@/modules/transfers/model/transfer.types";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { CustomerForm } from "../components/CustomerForm";
import { LANGUAGE_LABEL, type CustomerOrder } from "../model/customer.types";
import { customerService } from "../services/customer.service";

function stageBadge(o: CustomerOrder) {
  const s = o.kind === "reserva" ? STAGE[o.stage as Stage] : TRANSFER_STAGE[o.stage as TransferStage];
  return s ? <Badge tone={s.tone}>{s.label}</Badge> : <Badge tone="muted">{o.stage}</Badge>;
}

export function CustomerDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const customer = useQuery({ queryKey: ["customers", id], queryFn: () => customerService.get(id) });
  const [editing, setEditing] = useState(false);
  const [confirmAnon, setConfirmAnon] = useState(false);

  const anonymize = useMutation({
    mutationFn: () => customerService.anonymize(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["transfers"] });
      setConfirmAnon(false);
      toast.success("Dados do cliente anonimizados.");
    },
  });

  const back = (
    <Link to="/clientes" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bone/60 hover:text-gold">
      <ArrowLeft className="h-4 w-4" aria-hidden /> Clientes
    </Link>
  );
  if (customer.isPending) return <section className="space-y-6">{back}<Loading /></section>;
  if (customer.isError) {
    return <section className="space-y-6">{back}<ErrorNote>{apiErrorMessage(customer.error, "Cliente não encontrado.")}</ErrorNote></section>;
  }
  const c = customer.data;
  const zap = c.whatsapp ? whatsappUrl(c.whatsapp) : null;
  const anonymized = c.anonymized_at !== null;

  return (
    <section className="space-y-8">
      {back}
      <PageHeader
        overline={anonymized ? "Cliente anonimizado" : LANGUAGE_LABEL[c.language]}
        title={c.name}
        accent=""
        description={[c.whatsapp && formatPhone(c.whatsapp), c.email].filter(Boolean).join(" · ") || "Sem contato"}
        actions={
          !anonymized && (
            <div className="flex flex-wrap gap-3">
              {zap && (
                <a href={zap} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/80 hover:border-gold/60 hover:text-gold">
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              )}
              <Button variant="outline" className="px-4 py-2" onClick={() => setEditing(true)}>Editar</Button>
            </div>
          )
        }
      />

      {c.notes && <Panel className="p-6 text-sm text-bone/75">{c.notes}</Panel>}

      <Panel className="p-6 md:p-8">
        <h2 className="font-serif text-2xl font-light">Histórico</h2>
        {c.orders.length === 0 ? (
          <p className="mt-4 text-sm text-bone/50">Nenhum pedido ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/[0.08]">
            {c.orders.map((o) => (
              <li key={`${o.kind}-${o.id}`}>
                <Link to={o.kind === "reserva" ? `/reservas/${o.id}` : `/transfers/${o.id}`} className="flex flex-wrap items-center gap-4 py-3 hover:text-gold">
                  <span className="min-w-0 flex-1">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-bone/45">{o.kind === "reserva" ? "Aluguel" : "Transfer"}</span>
                    <span className="block">{o.summary}</span>
                    <span className="block text-xs text-bone/45">{formatDateTime(o.at)}</span>
                  </span>
                  <span className="text-gold">{formatCents(o.total_cents)}</span>
                  {stageBadge(o)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {isAdmin && !anonymized && (
        <Panel className="space-y-3 p-6 md:p-8">
          <h2 className="font-serif text-xl font-light">Proteção de dados</h2>
          <p className="text-sm text-bone/60">
            A pedido do cliente (LGPD), apaga nome e contatos, também nos pedidos. Datas e valores ficam, como registro financeiro. Não tem volta.
          </p>
          <Button variant="ghost" onClick={() => setConfirmAnon(true)}>Anonimizar cliente</Button>
        </Panel>
      )}

      {editing && (
        <Dialog title="Editar cliente" onClose={() => setEditing(false)}>
          <CustomerForm
            customer={c}
            onDone={(saved) => {
              setEditing(false);
              if (saved) qc.invalidateQueries({ queryKey: ["customers", id] });
            }}
          />
        </Dialog>
      )}
      {confirmAnon && (
        <Dialog title="Anonimizar cliente" onClose={() => setConfirmAnon(false)}>
          <div className="space-y-5">
            <p className="text-bone/80">Apagar o nome e os contatos de <strong className="text-gold">{c.name}</strong>? Não dá para desfazer.</p>
            {anonymize.isError && <ErrorNote>{apiErrorMessage(anonymize.error, "Não foi possível anonimizar.")}</ErrorNote>}
            <div className="flex gap-3">
              <Button onClick={() => anonymize.mutate()} disabled={anonymize.isPending}>Sim, anonimizar</Button>
              <Button variant="ghost" onClick={() => setConfirmAnon(false)}>Cancelar</Button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
