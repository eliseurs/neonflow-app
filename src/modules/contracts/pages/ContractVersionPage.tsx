import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiErrorMessage } from "@/app/providers/api/client";
import { formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { STATUS_LABEL, STATUS_TONE } from "../model/contract.types";
import { contractService } from "../services/contract.service";

/** Texto integral de uma versão, com hash, histórico de decisões e comentários. */
export function ContractVersionPage() {
  const { id = "" } = useParams();
  const version = useQuery({ queryKey: ["contract-version", id], queryFn: () => contractService.version(id) });
  const v = version.data;

  return (
    <section className="space-y-8">
      <Link to="/contratos" className="text-[11px] uppercase tracking-[0.2em] text-bone/60 hover:text-bone">
        ← Contratos
      </Link>
      {version.isPending && <Loading />}
      {version.isError && <ErrorNote>{apiErrorMessage(version.error, "Não foi possível carregar a versão.")}</ErrorNote>}
      {v && (
        <>
          <PageHeader
            overline={`Contrato ${v.document_code} · versão ${v.version}${v.label ? ` (${v.label})` : ""}`}
            title={v.document_title}
            description={`Enviada em ${formatDateTime(v.created_at)}.`}
          />
          <Panel className="space-y-2 p-6">
            <Badge tone={STATUS_TONE[v.status]}>{STATUS_LABEL[v.status]}</Badge>
            <p className="break-all font-mono text-xs text-bone/60">SHA-256 {v.sha256}</p>
          </Panel>
          <Panel className="p-6 md:p-8">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-bone/80">{v.body}</pre>
          </Panel>
          <Panel className="p-6 md:p-8">
            <h2 className="font-serif text-2xl font-light">Histórico</h2>
            {v.events.length === 0 ? (
              <p className="mt-4 text-sm text-bone/60">Nenhuma decisão ainda.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-bone/70">
                {v.events.map((e) => (
                  <li key={e.id}>
                    {formatDateTime(e.created_at)} · {STATUS_LABEL[e.status]} · {e.user_name} ({e.role}){e.note && ` · ${e.note}`}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          {v.comments.length > 0 && (
            <Panel className="p-6 md:p-8">
              <h2 className="font-serif text-2xl font-light">Comentários</h2>
              <ul className="mt-4 space-y-4 text-sm text-bone/70">
                {v.comments.map((c) => (
                  <li key={c.id}>
                    <p>
                      Cláusula {c.clause} · {c.kind === "correcao" ? "correção" : "observação"} · {c.user_name} · {formatDateTime(c.created_at)}
                    </p>
                    <p className="mt-1 text-bone/80">{c.body}</p>
                    {c.proposed_text && <p className="mt-1 italic text-bone/60">Redação proposta: {c.proposed_text}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </section>
  );
}
