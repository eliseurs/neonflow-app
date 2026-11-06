import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { termsService } from "../services/terms.service";

/** O admin publica o texto dos termos (escrito pelo jurídico). Cada publicação é uma versão nova. */
export function TermsAdminPage() {
  const qc = useQueryClient();
  const versions = useQuery({ queryKey: ["terms"], queryFn: termsService.versions });
  const current = versions.data?.[0];
  const [body, setBody] = useState("");
  useEffect(() => {
    if (current) setBody(current.body);
  }, [current]);

  const publish = useMutation({
    mutationFn: () => termsService.publish(body),
    onSuccess: (v) => {
      qc.invalidateQueries({ queryKey: ["terms"] });
      toast.success(`Versão ${v.version} publicada. Os próximos links usam este texto.`);
    },
  });
  const unchanged = current !== undefined && body.trim() === current.body;

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Termos do aluguel"
        title="O que o cliente"
        accent="aceita."
        description="Cole aqui o texto revisado pelo jurídico. Cada publicação vira uma versão, e o aceite registra qual versão o cliente leu."
      />
      {versions.isPending && <Loading />}
      {versions.isError && <ErrorNote>{apiErrorMessage(versions.error, "Não foi possível carregar os termos.")}</ErrorNote>}
      {versions.isSuccess && (
        <Panel className="space-y-4 p-6 md:p-8">
          <p className="text-sm text-bone/60">
            {current ? `Versão atual: ${current.version}, publicada em ${formatDateTime(current.created_at)}.` : "Nenhuma versão publicada. Sem texto, a central não gera link de aceite."}
          </p>
          <Field id="terms-body" label="Texto dos termos">
            <textarea id="terms-body" rows={18} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
          </Field>
          {publish.isError && <ErrorNote>{apiErrorMessage(publish.error, "Não foi possível publicar.")}</ErrorNote>}
          <Button onClick={() => publish.mutate()} disabled={publish.isPending || !body.trim() || unchanged}>
            {publish.isPending ? "Publicando..." : current ? "Publicar nova versão" : "Publicar"}
          </Button>
        </Panel>
      )}
      {(versions.data?.length ?? 0) > 1 && (
        <Panel className="p-6 md:p-8">
          <h2 className="font-serif text-2xl font-light">Versões anteriores</h2>
          <ul className="mt-4 space-y-2 text-sm text-bone/70">
            {versions.data!.slice(1).map((v) => (
              <li key={v.id}>Versão {v.version} · {formatDateTime(v.created_at)}</li>
            ))}
          </ul>
        </Panel>
      )}
    </section>
  );
}
