import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass, labelClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import { KIND_LABEL, formatPercent, parsePercent, type Partner, type PartnerKind } from "../model/partners.types";
import { partnersService } from "../services/partners.service";

const KINDS: PartnerKind[] = ["proprietario", "motorista", "indicador"];

export function PartnerForm({ partner, onDone }: { partner?: Partner; onDone: (p?: Partner) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(partner?.name ?? "");
  const [kinds, setKinds] = useState<PartnerKind[]>(partner?.kinds ?? ["indicador"]);
  const [whatsapp, setWhatsapp] = useState(partner?.whatsapp ?? "");
  const [email, setEmail] = useState(partner?.email ?? "");
  const [city, setCity] = useState(partner?.city ?? "");
  const [notes, setNotes] = useState(partner?.notes ?? "");
  // Percentuais configuráveis por parceiro, sem valor sugerido (RN-03.4, 03.7, 03.9).
  const [commission, setCommission] = useState(formatPercent(partner?.commission_percent ?? null));
  const [ownerShare, setOwnerShare] = useState(formatPercent(partner?.owner_share_percent ?? null));
  const [driverShare, setDriverShare] = useState(formatPercent(partner?.driver_share_percent ?? null));
  const [active, setActive] = useState(partner?.active ?? true);
  const [problem, setProblem] = useState<string | null>(null);

  const toggle = (k: PartnerKind) => setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));

  const save = useMutation({
    mutationFn: (req: Parameters<typeof partnersService.create>[0]) =>
      partner ? partnersService.update(partner.id, req) : partnersService.create(req),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success(partner ? "Parceiro atualizado." : "Parceiro cadastrado. O link de indicação já está pronto.");
      onDone(p);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (kinds.length === 0) return setProblem("Escolha ao menos um tipo de parceiro.");
    const c = parsePercent(commission);
    const o = kinds.includes("proprietario") ? parsePercent(ownerShare) : null;
    const d = kinds.includes("motorista") ? parsePercent(driverShare) : null;
    if (c === undefined || o === undefined || d === undefined) return setProblem("Percentuais entre 0 e 100, com até duas casas (ex.: 12,5).");
    setProblem(null);
    save.mutate({
      name: name.trim(), kinds, whatsapp: whatsapp.trim(), email: email.trim(), city: city.trim(), notes: notes.trim(),
      commission_percent: c, owner_share_percent: o, driver_share_percent: d, ...(partner ? { active } : {}),
    });
  };

  const error = problem ?? (save.isError ? apiErrorMessage(save.error, "Não foi possível salvar o parceiro.") : null);

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field id="partner-name" label="Nome" hint="Pessoa, hotel ou empresa." className="sm:col-span-2">
        <input id="partner-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className={labelClass}>Tipo</legend>
        <p className="mt-1 text-xs text-bone/45">Todo parceiro pode indicar pelo link ou QR. Marque também o que mais ele faz.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              role="checkbox"
              aria-checked={kinds.includes(k)}
              onClick={() => toggle(k)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                kinds.includes(k) ? "border-gold bg-gold text-noir" : "border-white/15 text-bone/70 hover:border-gold/60",
              )}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </fieldset>
      <Field id="partner-whatsapp" label="WhatsApp">
        <input id="partner-whatsapp" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
      </Field>
      <Field id="partner-email" label="E-mail">
        <input id="partner-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </Field>
      <Field id="partner-city" label="Cidade" className="sm:col-span-2">
        <input id="partner-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
      </Field>
      <Field id="partner-commission" label="Comissão de indicação (%)" hint="Sobre as diárias, sai da parte do Neon Flow. Em branco: a definir.">
        <input id="partner-commission" inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} className={inputClass} />
      </Field>
      {kinds.includes("proprietario") && (
        <Field id="partner-owner-share" label="Repasse ao proprietário (%)"
          hint={(() => {
            const p = parsePercent(ownerShare);
            return typeof p === "number"
              ? `Sobre diárias, atraso e km. O Neon Flow fica com ${String(Math.round((100 - p) * 100) / 100).replace(".", ",")}% de participação administrativa.`
              : "Sobre diárias, atraso e km. O restante é a participação administrativa do Neon Flow.";
          })()}>
          <input id="partner-owner-share" inputMode="decimal" value={ownerShare} onChange={(e) => setOwnerShare(e.target.value)} className={inputClass} />
        </Field>
      )}
      {kinds.includes("motorista") && (
        <Field id="partner-driver-share" label="Percentual do motorista (%)" hint="Parte da corrida.">
          <input id="partner-driver-share" inputMode="decimal" value={driverShare} onChange={(e) => setDriverShare(e.target.value)} className={inputClass} />
        </Field>
      )}
      <Field id="partner-notes" label="Observações" hint="Sem documentos (CPF, CNPJ, Pix) por enquanto (PEN-48)." className="sm:col-span-2">
        <textarea id="partner-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </Field>
      {partner && (
        <label className="flex items-center gap-3 text-sm text-bone/80 sm:col-span-2">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#C9A86A]" />
          Ativo
        </label>
      )}
      {error && <div className="sm:col-span-2"><ErrorNote>{error}</ErrorNote></div>}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={save.isPending || !name.trim()}>
          {save.isPending ? "Salvando..." : partner ? "Salvar" : "Cadastrar"}
        </Button>
        <Button variant="ghost" onClick={() => onDone()}>Cancelar</Button>
      </div>
    </form>
  );
}
