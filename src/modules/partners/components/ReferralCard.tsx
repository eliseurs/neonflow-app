import { Copy, Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { referralLink, type Partner } from "../model/partners.types";

/** Link e QR de indicação do parceiro (RN-07.2). O QR é gerado no navegador, sem serviço externo. */
export function ReferralCard({ partner }: { partner: Partner }) {
  const link = referralLink(partner.referral_code);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(link, { width: 480, margin: 2, color: { dark: "#060606", light: "#ffffff" } })
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [link]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-bone/55">Código</p>
        <p className="mt-1 font-serif text-4xl font-light tracking-[0.15em] text-gold">{partner.referral_code}</p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-bone/55">Link de indicação</p>
        <p className="mt-1 break-all rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone/85">{link}</p>
        <Button variant="outline" className="mt-3 px-4 py-2" onClick={copy}>
          <Copy className="h-4 w-4" aria-hidden /> Copiar link
        </Button>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-bone/55">QR code</p>
        {qr ? (
          <>
            <img src={qr} alt={`QR code de indicação de ${partner.name}`} className="mt-2 w-56 rounded-xl bg-white p-2" />
            <a
              href={qr}
              download={`indicacao-${partner.referral_code}.png`}
              className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold hover:gap-3"
            >
              <Download className="h-4 w-4" aria-hidden /> Baixar QR (PNG)
            </a>
          </>
        ) : (
          <p className="mt-2 text-sm text-bone/50">Gerando o QR...</p>
        )}
      </div>
      <p className="text-xs text-bone/45">
        Quem abrir o link ou ler o QR cai no site, e o código vai na mensagem do WhatsApp ("Indicação: {partner.referral_code}"). Na reserva,
        escolha este parceiro em "Indicado por".
      </p>
    </div>
  );
}
