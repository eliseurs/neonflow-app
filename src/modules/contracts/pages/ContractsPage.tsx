import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { STATUS_LABEL, STATUS_TONE, UPLOAD_ACCEPT, isTextFile, type ContractDocument } from "../model/contract.types";
import { contractService } from "../services/contract.service";

/** Os seis contratos (RN-08.1). O admin sobe cada texto por arquivo; cada envio vira uma versão nova, com hash. */
export function ContractsPage() {
  const docs = useQuery({ queryKey: ["contracts"], queryFn: contractService.list });

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Contratos"
        title="Minutas em"
        accent="revisão."
        description="Envie o texto de cada contrato em .md ou .txt. Cada envio vira uma versão nova, com o hash do texto, e começa como minuta. A aprovação vale só para a versão exata."
      />
      {docs.isPending && <Loading />}
      {docs.isError && <ErrorNote>{apiErrorMessage(docs.error, "Não foi possível carregar os contratos.")}</ErrorNote>}
      {docs.isSuccess && (
        <div className="space-y-4">
          {docs.data.map((d) => (
            <ContractRow key={d.id} doc={d} />
          ))}
        </div>
      )}
    </section>
  );
}

function ContractRow({ doc }: { doc: ContractDocument }) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [fileError, setFileError] = useState("");

  const upload = useMutation({
    mutationFn: async () => contractService.createVersion(doc.code, label, await file!.text()),
    onSuccess: (v) => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      setFile(null);
      setLabel("");
      toast.success(`Contrato ${doc.code}: versão ${v.version} enviada como minuta.`);
    },
  });

  const pick = (f: File | undefined) => {
    upload.reset();
    if (f && !isTextFile(f)) {
      setFile(null);
      setFileError("Envie um arquivo .md ou .txt.");
      return;
    }
    setFileError("");
    setFile(f ?? null);
  };

  const inputId = `contract-file-${doc.code}`;
  return (
    <Panel className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-bone/45">Contrato {doc.code}</p>
          <h2 className="font-serif text-xl font-light">{doc.title}</h2>
        </div>
        {doc.latest ? <Badge tone={STATUS_TONE[doc.latest.status]}>{STATUS_LABEL[doc.latest.status]}</Badge> : <Badge tone="muted">Sem texto</Badge>}
      </div>
      {doc.latest && (
        <p className="text-sm text-bone/60">
          Versão {doc.latest.version}
          {doc.latest.label && ` (${doc.latest.label})`} · {formatDateTime(doc.latest.created_at)} ·{" "}
          <span className="font-mono text-xs" title={doc.latest.sha256}>
            {doc.latest.sha256.slice(0, 12)}…
          </span>{" "}
          ·{" "}
          <Link to={`/contratos/versoes/${doc.latest.id}`} className="text-gold hover:underline">
            Abrir · baixar · editar
          </Link>
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-[1fr_160px_auto] md:items-end">
        <Field id={inputId} label="Arquivo (.md ou .txt)">
          <input id={inputId} type="file" accept={UPLOAD_ACCEPT} onChange={(e) => pick(e.target.files?.[0])} className={inputClass} />
        </Field>
        <Field id={`contract-label-${doc.code}`} label="Rótulo (opcional)">
          <input
            id={`contract-label-${doc.code}`}
            value={label}
            maxLength={40}
            placeholder="v0.4"
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Button onClick={() => upload.mutate()} disabled={!file || upload.isPending}>
          <FileUp className="h-4 w-4" />
          {upload.isPending ? "Enviando..." : "Enviar versão"}
        </Button>
      </div>
      {fileError && <ErrorNote>{fileError}</ErrorNote>}
      {upload.isError && <ErrorNote>{apiErrorMessage(upload.error, "Não foi possível enviar o arquivo.")}</ErrorNote>}
    </Panel>
  );
}
