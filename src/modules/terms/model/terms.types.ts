// Espelha internal/domain/terms da API (RN-02.3, q38).
export interface TermsVersion {
  id: string;
  version: number;
  body: string;
  created_at: string;
}

export interface TermsAcceptance {
  version: number;
  typed_name: string;
  accepted_at: string;
}

export interface TermsLink {
  token: string;
  path: string;
  expires_at: string;
}

export interface PublicTerms {
  client_name: string;
  vehicle_name: string;
  start_at: string;
  end_at: string;
  total_cents: number;
  terms: TermsVersion;
  accepted: TermsAcceptance | null;
  expires_at: string;
}

/** Mensagem para a central mandar o link ao cliente. */
export function termsMessage(clientName: string, url: string): string {
  const first = clientName.trim().split(/\s+/)[0] || "";
  return `Olá${first ? `, ${first}` : ""}! Aqui é a central da Neon Flow. Para confirmar a sua reserva, leia e aceite os termos do aluguel neste link: ${url}`;
}
