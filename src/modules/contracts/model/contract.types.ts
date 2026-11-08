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
