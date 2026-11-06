// Espelha internal/domain/customer da API (RN-04.7). Documentos esperam a política de retenção (PEN-48).
export type Language = "pt" | "en";

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  language: Language;
  notes: string;
  anonymized_at: string | null;
  created_at: string;
  updated_at: string;
  booking_count: number;
  transfer_count: number;
}

export interface CustomerOrder {
  kind: "reserva" | "transfer";
  id: string;
  at: string;
  summary: string;
  stage: string;
  total_cents: number;
}

export interface CustomerDetail extends Customer {
  orders: CustomerOrder[];
}

export interface CustomerRequest {
  name: string;
  whatsapp: string;
  email: string;
  language: Language;
  notes: string;
}

export const LANGUAGE_LABEL: Record<Language, string> = { pt: "Português", en: "Inglês" };

/** Cliente escolhido num formulário de pedido: nome digitado e, se cadastrado, o id. */
export interface PickedCustomer {
  name: string;
  customerId: string | null;
}
