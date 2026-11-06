import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatPhone } from "@/modules/landing/model/whatsapp";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import type { PickedCustomer } from "../model/customer.types";
import { customerService } from "../services/customer.service";

/**
 * Campo "Cliente" dos pedidos: busca no cadastro por nome, WhatsApp ou e-mail, ou cadastra na hora com
 * nome e WhatsApp. Sem cadastro, o pedido segue só com o nome.
 */
export function CustomerPicker({ id, value, onChange, className }: {
  id: string; value: PickedCustomer; onChange: (v: PickedCustomer) => void; className?: string;
}) {
  const qc = useQueryClient();
  const [query, setQuery] = useState(value.name);
  const [debounced, setDebounced] = useState("");
  const [creating, setCreating] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const search = useQuery({
    queryKey: ["customers", "search", debounced],
    queryFn: () => customerService.list(debounced),
    enabled: !value.customerId && debounced.length >= 2,
  });
  const create = useMutation({
    mutationFn: () => customerService.create({ name: query.trim(), whatsapp: whatsapp.trim(), email: "", language: "pt", notes: "" }),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setCreating(false);
      onChange({ name: c.name, customerId: c.id });
    },
  });

  if (value.customerId) {
    return (
      <Field id={id} label="Cliente" className={className}>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/[0.05] px-4 py-3">
          <span id={id} className="text-bone/90">{value.name}</span>
          <button
            type="button"
            onClick={() => {
              onChange({ name: value.name, customerId: null });
              setQuery(value.name);
            }}
            aria-label="Trocar cliente"
            className="text-bone/50 hover:text-gold"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </Field>
    );
  }

  const matches = (search.data ?? []).filter((c) => !c.anonymized_at).slice(0, 6);
  return (
    <div className={className}>
      <Field id={id} label="Cliente" hint="Busque pelo nome, WhatsApp ou e-mail, ou cadastre na hora.">
        <input
          id={id}
          value={query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            onChange({ name: e.target.value, customerId: null });
          }}
          className={inputClass}
        />
      </Field>
      {matches.length > 0 && (
        <ul aria-label="Clientes encontrados" className="mt-2 divide-y divide-white/[0.06] rounded-xl border border-white/10">
          {matches.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onChange({ name: c.name, customerId: c.id })}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/[0.04]"
              >
                <span className="text-bone/90">{c.name}</span>
                <span className="text-xs text-bone/45">{c.whatsapp ? formatPhone(c.whatsapp) : c.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && !creating && (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold hover:gap-3"
        >
          <UserPlus className="h-4 w-4" aria-hidden /> Cadastrar "{query.trim()}" como cliente
        </button>
      )}
      {creating && (
        <div className="mt-3 space-y-3 rounded-2xl border border-gold/30 bg-gold/[0.04] p-4">
          <Field id={`${id}-whatsapp`} label="WhatsApp do cliente" hint="Com DDI e DDD.">
            <input id={`${id}-whatsapp`} inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
          </Field>
          {create.isError && <p role="alert" className="text-sm text-rose-300">{apiErrorMessage(create.error, "Não foi possível cadastrar.")}</p>}
          <div className="flex gap-3">
            <Button onClick={() => create.mutate()} disabled={create.isPending}>{create.isPending ? "Salvando..." : "Cadastrar cliente"}</Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Voltar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
