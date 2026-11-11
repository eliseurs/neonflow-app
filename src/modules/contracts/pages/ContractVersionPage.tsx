import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Pencil } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/app/providers/api/client";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Field, inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { STATUS_LABEL, STATUS_TONE, actionsFor, downloadName, type ContractAction, type ContractVersion } from "../model/contract.types";
import { contractService } from "../services/contract.service";

/** Baixa o texto da versão como .md, para editar fora e subir de novo. */
function download(v: ContractVersion) {
  const url = URL.createObjectURL(new Blob([v.body + "\n"], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = downloadName(v);
  a.click();
  URL.revokeObjectURL(url);
}

/** Edição no sistema: o texto alterado vira uma versão nova (a atual não muda, RN-08.2). */
function Editor({ v, onClose }: { v: ContractVersion; onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [body, setBody] = useState(v.body);
  const [label, setLabel] = useState("");
  const save = useMutation({
    mutationFn: () => contractService.createVersion(v.document_code, label, body),
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success(`Versão ${n.version} criada como minuta.`);
      navigate(`/contratos/versoes/${n.id}`);
    },
  });
  const unchanged = body.trim() === v.body.trim();
  return (
    <Panel className="space-y-4 p-6 md:p-8">
      <h2 className="font-serif text-2xl font-light">Editar texto</h2>
      <p className="text-sm text-bone/60">
        Ao salvar, o sistema cria a versão {v.version + 1} como minuta, com hash novo. A versão {v.version} e o histórico dela não mudam.
      </p>
      <Field id="contract-edit-label" label="Rótulo da nova versão (opcional)">
        <input id="contract-edit-label" value={label} maxLength={40} placeholder="v0.5" onChange={(e) => setLabel(e.target.value)} className={inputClass} />
      </Field>
      <Field id="contract-edit-body" label="Texto do contrato">
        <textarea id="contract-edit-body" rows={24} value={body} onChange={(e) => setBody(e.target.value)} className={`${inputClass} font-mono text-sm`} />
      </Field>
      {save.isError && <ErrorNote>{apiErrorMessage(save.error, "Não foi possível salvar a nova versão.")}</ErrorNote>}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => save.mutate()} disabled={unchanged || !body.trim() || save.isPending}>
          {save.isPending ? "Salvando..." : "Salvar como nova versão"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </Panel>
  );
}

/** Botões do andamento possíveis para a situação e o papel; a aprovação exige a confirmação do hash. */
function Workflow({ v, role }: { v: ContractVersion; role: string | undefined }) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const act = useMutation({
    mutationFn: (action: ContractAction) =>
      contractService.addEvent(v.id, action === "aprovar" ? { action, note, sha256: v.sha256, confirm } : { action, note }),
    onSuccess: (e) => {
      qc.invalidateQueries({ queryKey: ["contract-version", v.id] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
      setNote("");
      setConfirm(false);
      toast.success(`Situação: ${STATUS_LABEL[e.status]}.`);
    },
  });
  const actions = actionsFor(v.status, role);
  if (actions.length === 0) return null;
  const needsNote = actions.some((a) => a.note);
  const canApprove = actions.some((a) => a.action === "aprovar");
  return (
    <Panel className="space-y-4 p-6 md:p-8">
      <h2 className="font-serif text-2xl font-light">Andamento</h2>
      {needsNote && (
        <Field id="contract-note" label="Justificativa (obrigatória para pedir ajustes ou revogar)">
          <textarea id="contract-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </Field>
      )}
      {canApprove && (
        <label className="flex items-start gap-3 text-sm text-bone/85">
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C9A86A]" />
          <span>
            Li a íntegra da versão {v.version} e aprovo este texto exato (SHA-256 <span className="font-mono text-xs">{v.sha256.slice(0, 12)}…</span>).
          </span>
        </label>
      )}
      {act.isError && <ErrorNote>{apiErrorMessage(act.error, "Não foi possível registrar.")}</ErrorNote>}
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <Button
            key={a.action}
            variant={a.action === "revogar" || a.action === "solicitar_ajustes" ? "outline" : "primary"}
            onClick={() => act.mutate(a.action)}
            disabled={act.isPending || (a.note === true && !note.trim()) || (a.action === "aprovar" && !confirm)}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </Panel>
  );
}

/** Texto integral de uma versão, com hash, histórico, comentários, download, edição e andamento. */
export function ContractVersionPage() {
  const { id = "" } = useParams();
  const role = useAuthStore((s) => s.user?.role);
  const version = useQuery({ queryKey: ["contract-version", id], queryFn: () => contractService.version(id) });
  const [editing, setEditing] = useState(false);
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
          <Panel className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="space-y-2">
              <Badge tone={STATUS_TONE[v.status]}>{STATUS_LABEL[v.status]}</Badge>
              <p className="break-all font-mono text-xs text-bone/60">SHA-256 {v.sha256}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => download(v)}>
                <Download className="h-4 w-4" aria-hidden /> Baixar .md
              </Button>
              {role === "admin" && !editing && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" aria-hidden /> Editar texto
                </Button>
              )}
            </div>
          </Panel>
          {editing && <Editor key={v.id} v={v} onClose={() => setEditing(false)} />}
          <Workflow v={v} role={role} />
          {!editing && (
            <Panel className="p-6 md:p-8">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-bone/80">{v.body}</pre>
            </Panel>
          )}
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
