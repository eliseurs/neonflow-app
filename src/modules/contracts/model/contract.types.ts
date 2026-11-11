// Espelha internal/domain/contract da API (RN-08, ADR-0015).
import type { Tone } from "@/shared/ui/Badge";

export type ContractStatus =
  | "minuta"
  | "enviado_para_revisao"
  | "ajustes_solicitados"
  | "aprovado_pela_revisora"
  | "liberacao_administrativa"
  | "publicado";

export interface ContractSummary {
  id: string;
  version: number;
  label: string;
  sha256: string;
  status: ContractStatus;
  created_at: string;
}

export interface ContractDocument {
  id: string;
  code: string;
  title: string;
  latest: ContractSummary | null;
}

export interface ContractEvent {
  id: string;
  action: string;
  status: ContractStatus;
  note: string;
  sha256: string;
  user_id: string;
  user_name: string;
  role: string;
  created_at: string;
}

export interface ContractComment {
  id: string;
  clause: string;
  kind: "observacao" | "correcao";
  body: string;
  proposed_text: string;
  user_id: string;
  user_name: string;
  role: string;
  created_at: string;
}

export interface ContractVersion extends ContractSummary {
  document_code: string;
  document_title: string;
  body: string;
  events: ContractEvent[];
  comments: ContractComment[];
}

export const STATUS_LABEL: Record<ContractStatus, string> = {
  minuta: "Minuta",
  enviado_para_revisao: "Em revisão",
  ajustes_solicitados: "Ajustes solicitados",
  aprovado_pela_revisora: "Aprovado",
  liberacao_administrativa: "Liberado",
  publicado: "Publicado",
};

export const STATUS_TONE: Record<ContractStatus, Tone> = {
  minuta: "muted",
  enviado_para_revisao: "neutral",
  ajustes_solicitados: "warn",
  aprovado_pela_revisora: "ok",
  liberacao_administrativa: "gold",
  publicado: "gold",
};

/** Arquivos aceitos no upload: texto puro ou Markdown. */
export const UPLOAD_ACCEPT = ".md,.txt,text/plain,text/markdown";

export function isTextFile(file: File): boolean {
  return /\.(md|txt)$/i.test(file.name);
}

export type ContractAction = "enviar" | "solicitar_ajustes" | "aprovar" | "revogar" | "liberar" | "publicar";

/** Espelho da RN-08.3/08.4 para mostrar só os botões possíveis; quem decide é a API. */
const ACTIONS: { action: ContractAction; label: string; from: ContractStatus[]; roles: string[]; note?: boolean }[] = [
  { action: "enviar", label: "Enviar para revisão", from: ["minuta"], roles: ["admin"] },
  { action: "aprovar", label: "Aprovar esta versão", from: ["enviado_para_revisao"], roles: ["legal_reviewer", "admin"] },
  { action: "solicitar_ajustes", label: "Pedir ajustes", from: ["enviado_para_revisao"], roles: ["legal_reviewer", "admin"], note: true },
  { action: "liberar", label: "Liberar", from: ["aprovado_pela_revisora"], roles: ["admin"] },
  { action: "publicar", label: "Publicar", from: ["liberacao_administrativa"], roles: ["admin"] },
  { action: "revogar", label: "Revogar aprovação", from: ["aprovado_pela_revisora", "liberacao_administrativa"], roles: ["legal_reviewer", "admin"], note: true },
];

export function actionsFor(status: ContractStatus, role: string | undefined) {
  return ACTIONS.filter((a) => a.from.includes(status) && role !== undefined && a.roles.includes(role));
}

/** "contrato-04-v2-v0.5.md": código, número da versão e rótulo, sem caracteres estranhos. */
export function downloadName(v: Pick<ContractVersion, "document_code" | "version" | "label">): string {
  const label = v.label.trim().replace(/[^\w.-]+/g, "-");
  return `contrato-${v.document_code}-v${v.version}${label ? `-${label}` : ""}.md`;
}
