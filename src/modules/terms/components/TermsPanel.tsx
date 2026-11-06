import { useMutation, useQuery } from "@tanstack/react-query";
import { Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { customerService } from "@/modules/customers/services/customer.service";
import { whatsappUrl } from "@/modules/landing/model/whatsapp";
import { formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { ErrorNote, Panel } from "@/shared/ui/Panel";
import { termsMessage, type TermsLink } from "../model/terms.types";
import { termsService } from "../services/terms.service";

/** Na reserva: gera o link de aceite para a central mandar pelo WhatsApp e mostra o aceite registrado. */
export function TermsPanel({ bookingId, clientName, customerId, canSend }: {
  bookingId: string; clientName: string; customerId: string | null; canSend: boolean;
}) {
  const acceptance = useQuery({ queryKey: ["bookings", bookingId, "terms"], queryFn: () => termsService.acceptance(bookingId) });
  const customer = useQuery({ queryKey: ["customers", customerId], queryFn: () => customerService.get(customerId!), enabled: Boolean(customerId) });
  const [link, setLink] = useState<TermsLink | null>(null);
  const create = useMutation({ mutationFn: () => termsService.createLink(bookingId), onSuccess: setLink });

  const url = link ? `${window.location.origin}${link.path}` : "";
  const message = termsMessage(clientName, url);
  const zap = link ? whatsappUrl(customer.data?.whatsapp ?? "", message) ?? `https://wa.me/?text=${encodeURIComponent(message)}` : null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };
  const a = acceptance.data;

  return (
    <Panel className="space-y-4 p-6 md:p-8">
      <h2 className="font-serif text-2xl font-light">Termos do aluguel</h2>
      {a ? (
        <p className="text-sm text-emerald-200">
          Aceitos por <strong>{a.typed_name}</strong> em {formatDateTime(a.accepted_at)} (versão {a.version}).
        </p>
      ) : (
        <p className="text-sm text-bone/60">O cliente ainda não aceitou. Mande o link: ao aceitar, a conferência "Termos" é marcada sozinha.</p>
      )}
      {canSend && !link && (
        <Button variant={a ? "ghost" : "primary"} onClick={() => create.mutate()} disabled={create.isPending}>
          {a ? "Gerar novo link" : "Gerar link de aceite"}
        </Button>
      )}
      {create.isError && <ErrorNote>{apiErrorMessage(create.error, "Não foi possível gerar o link.")}</ErrorNote>}
      {link && (
        <div className="space-y-3">
          <p className="break-all rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone/85">{url}</p>
          <p className="text-xs text-bone/45">Vale até {formatDateTime(link.expires_at)}.</p>
          <div className="flex flex-wrap gap-3">
            {zap && (
              <a href={zap} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-noir">
                <MessageCircle className="h-4 w-4" aria-hidden /> Enviar no WhatsApp
              </a>
            )}
            <Button variant="outline" className="px-4 py-2" onClick={copy}>
              <Copy className="h-4 w-4" aria-hidden /> Copiar link
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
