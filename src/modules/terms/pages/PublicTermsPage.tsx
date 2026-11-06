import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { termsService } from "../services/terms.service";

/** Página pública (sem login) em que o cliente lê e aceita os termos da reserva (RN-02.3). */
export function PublicTermsPage() {
  const { token = "" } = useParams();
  const page = useQuery({ queryKey: ["public-terms", token], queryFn: () => termsService.public(token), retry: false });
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const accept = useMutation({ mutationFn: () => termsService.accept(token, name, page.data!.terms.version) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    accept.mutate();
  };
  const done = accept.data ?? page.data?.accepted ?? null;

  return (
    <main className="min-h-screen bg-noir px-4 py-10 text-bone">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Neon Flow · Termos do aluguel</p>
        {page.isPending && <Loading />}
        {page.isError && <ErrorNote>{apiErrorMessage(page.error, "Link inválido ou vencido. Peça um novo à central.")}</ErrorNote>}
        {page.data && (
          <>
            <Panel className="space-y-2 p-6">
              <h1 className="font-serif text-3xl font-light">{page.data.client_name}</h1>
              <p className="text-sm text-bone/70">{page.data.vehicle_name}</p>
              <p className="text-sm text-bone/70">
                Retirada {formatDateTime(page.data.start_at)} · devolução {formatDateTime(page.data.end_at)}
              </p>
              <p className="text-sm text-bone/70">Valor da reserva: {formatCents(page.data.total_cents)}</p>
            </Panel>
            <Panel className="p-6">
              <h2 className="font-serif text-2xl font-light">Termos (versão {page.data.terms.version})</h2>
              <div className="mt-4 max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-bone/85">{page.data.terms.body}</div>
            </Panel>
            {done ? (
              <Panel className="p-6">
                <p className="text-emerald-200" role="status">
                  Termos aceitos por <strong>{done.typed_name}</strong> em {formatDateTime(done.accepted_at)}. Obrigado! A central já foi avisada.
                </p>
              </Panel>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <Field id="terms-name" label="Seu nome completo">
                  <input id="terms-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
                </Field>
                <label className="flex items-start gap-3 text-sm text-bone/85">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C9A86A]" />
                  Li e aceito os termos do aluguel acima.
                </label>
                {accept.isError && <ErrorNote>{apiErrorMessage(accept.error, "Não foi possível registrar o aceite.")}</ErrorNote>}
                <Button type="submit" disabled={!agree || name.trim().length < 3 || accept.isPending}>
                  {accept.isPending ? "Registrando..." : "Aceitar os termos"}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
