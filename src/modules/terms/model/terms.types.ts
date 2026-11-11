// Espelha internal/domain/terms da API (RN-02.3, q38).
import { content } from "@/modules/landing/model/landing.content";

export interface TermsVersion {
  id: string;
  version: number;
  body: string;
  created_at: string;
}

export interface TermsAcceptance {
  /** "termos" (texto antigo) ou "ordem_04" (Ordem de Locação publicada, RN-08). */
  document: "termos" | "ordem_04";
  version: number;
  sha256?: string;
  typed_name: string;
  accepted_at: string;
}

export interface TermsLink {
  token: string;
  path: string;
  expires_at: string;
}

/** Versão publicada da Ordem 04 que o cliente lê. */
export interface TermsOrder {
  version_id: string;
  version: number;
  label: string;
  title: string;
  body: string;
  sha256: string;
}

/** Quadro da reserva + a Ordem 04 publicada ou, sem ela, os termos antigos (um dos dois). */
export interface PublicTerms {
  client_name: string;
  vehicle_name: string;
  place: string;
  start_at: string;
  end_at: string;
  total_cents: number;
  deposit_cents: number | null;
  km_limit_per_day: number | null;
  extra_km_cents: number | null;
  quadro_sha256: string;
  order: TermsOrder | null;
  terms: TermsVersion | null;
  accepted: TermsAcceptance | null;
  expires_at: string;
}

/** Mensagem para a central mandar o link ao cliente. */
export function termsMessage(clientName: string, url: string): string {
  const first = clientName.trim().split(/\s+/)[0] || "";
  return `Olá${first ? `, ${first}` : ""}! Aqui é a central da Neon Flow. Para confirmar a sua reserva, leia e aceite os termos do aluguel neste link: ${url}`;
}

/**
 * Texto sugerido para a primeira versão dos termos: as condições do aluguel que o site já mostra
 * (seção "Condições"), para o que o cliente aceita bater com o que ele leu no site. O admin revisa e publica.
 */
export function suggestedTermsBody(): string {
  const rental = content.pt.conditions.rental;
  return [`Condições do ${rental.title.toLowerCase()}`, "", ...rental.items.map((item, i) => `${i + 1}. ${item}`)].join("\n");
}
