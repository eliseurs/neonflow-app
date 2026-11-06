import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote } from "@/shared/ui/Panel";
import { LANGUAGE_LABEL, type Customer, type Language } from "../model/customer.types";
import { customerService } from "../services/customer.service";

export function CustomerForm({ customer, initialName = "", onDone }: { customer?: Customer; initialName?: string; onDone: (c?: Customer) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(customer?.name ?? initialName);
  const [whatsapp, setWhatsapp] = useState(customer?.whatsapp ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [language, setLanguage] = useState<Language>(customer?.language ?? "pt");
  const [notes, setNotes] = useState(customer?.notes ?? "");

  const save = useMutation({
    mutationFn: () => {
      const req = { name: name.trim(), whatsapp: whatsapp.trim(), email: email.trim(), language, notes: notes.trim() };
      return customer ? customerService.update(customer.id, req) : customerService.create(req);
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success(customer ? "Cliente atualizado." : "Cliente cadastrado.");
      onDone(c);
    },
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field id="customer-name" label="Nome" className="sm:col-span-2">
        <input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </Field>
      <Field id="customer-whatsapp" label="WhatsApp" hint="Com DDI e DDD. Um cadastro por número.">
        <input id="customer-whatsapp" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
      </Field>
      <Field id="customer-email" label="E-mail">
        <input id="customer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </Field>
      <Field id="customer-language" label="Idioma" hint="Para falar com o cliente.">
        <select id="customer-language" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className={inputClass}>
          {(Object.keys(LANGUAGE_LABEL) as Language[]).map((l) => (
            <option key={l} value={l} className="bg-noir">{LANGUAGE_LABEL[l]}</option>
          ))}
        </select>
      </Field>
      <Field id="customer-notes" label="Observações" hint="Preferências. Sem documentos (PEN-48)." className="sm:col-span-2">
        <textarea id="customer-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </Field>
      {save.isError && <div className="sm:col-span-2"><ErrorNote>{apiErrorMessage(save.error, "Não foi possível salvar o cliente.")}</ErrorNote></div>}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={save.isPending || !name.trim()}>{save.isPending ? "Salvando..." : customer ? "Salvar" : "Cadastrar"}</Button>
        <Button variant="ghost" onClick={() => onDone()}>Cancelar</Button>
      </div>
    </form>
  );
}
