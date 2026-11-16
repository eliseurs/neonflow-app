import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiErrorMessage } from "@/app/providers/api/client";
import { ROLE_LABEL } from "@/app/layout/profiles";
import type { Role } from "@/modules/auth/model/auth.types";
import { usersService } from "@/modules/users/services/users.service";
import { formatDateTime } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge";
import { Field, inputClass } from "@/shared/ui/Field";
import { PageHeader } from "@/shared/ui/Heading";
import { EmptyState, ErrorNote, Loading, Panel } from "@/shared/ui/Panel";
import { describe, outcome } from "../model/audit.types";
import { auditService } from "../services/audit.service";

/** Trilha das rotas para o admin (RN-05.9): quem fez o quê, com qual papel, e os acessos negados. */
export function AuditPage() {
  const [userId, setUserId] = useState("");
  const [denied, setDenied] = useState(false);
  const users = useQuery({ queryKey: ["users"], queryFn: usersService.list });
  const entries = useQuery({ queryKey: ["audit", userId, denied], queryFn: () => auditService.list({ userId, denied }) });

  return (
    <section className="space-y-8">
      <PageHeader
        overline="Auditoria"
        title="Quem fez"
        accent="o quê."
        description="Toda alteração, cada entrada no painel e cada acesso negado, com o papel da pessoa naquele momento. Consultas não entram. Os 100 registros mais recentes."
      />

      <Panel className="flex flex-wrap items-end gap-6 p-5">
        <Field id="audit-user" label="Usuário">
          <select id="audit-user" value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass}>
            <option value="" className="bg-noir">Todos</option>
            {users.data?.map((u) => (
              <option key={u.id} value={u.id} className="bg-noir">{u.name}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-3 pb-3 text-sm text-bone/80">
          <input type="checkbox" checked={denied} onChange={(e) => setDenied(e.target.checked)} className="h-4 w-4 accent-[#C9A86A]" />
          Só acessos negados
        </label>
      </Panel>

      {entries.isPending && <Loading />}
      {entries.isError && <ErrorNote>{apiErrorMessage(entries.error, "Não foi possível carregar a auditoria.")}</ErrorNote>}
      {entries.data?.length === 0 && <EmptyState title="Nada registrado" text="Nenhum registro com esses filtros." />}

      {entries.data && entries.data.length > 0 && (
        <Panel className="divide-y divide-white/[0.08]">
          {entries.data.map((e) => {
            const o = outcome(e.status);
            return (
              <div key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                <p className="w-36 shrink-0 text-xs text-bone/50">{formatDateTime(e.created_at)}</p>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{describe(e)}</p>
                  <p className="truncate text-xs text-bone/50">
                    {e.user_name} · {ROLE_LABEL[e.role as Role] ?? e.role} · <span className="font-mono">{e.method} {e.path}</span>
                  </p>
                </div>
                <Badge tone={o.tone}>{o.label}</Badge>
              </div>
            );
          })}
        </Panel>
      )}
    </section>
  );
}
