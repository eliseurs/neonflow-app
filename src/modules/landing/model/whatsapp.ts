import type { LandingContent, ServiceKind } from "./landing.content";

export interface ContactRequest {
  service: ServiceKind;
  name: string;
  start: string;
  end: string;
  route: string;
  notes: string;
}

// Número da central em formato internacional, só dígitos (ex.: 5554...). Vazio = canal ainda não configurado.
export function whatsappNumber(raw = import.meta.env.VITE_WHATSAPP_NUMBER): string {
  return (raw ?? "").replace(/\D/g, "");
}

export function whatsappUrl(number: string, message?: string): string | null {
  if (!number) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}

/** "5554999990000" → "+55 54 99999-0000". Fora do padrão brasileiro, só põe o "+". */
export function formatPhone(number: string): string {
  const m = number.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+55 ${m[1]} ${m[2]}-${m[3]}` : `+${number}`;
}

function formatDate(iso: string, lang: "pt" | "en"): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return lang === "pt" ? `${d}/${m}/${y}` : `${y}-${m}-${d}`;
}

// Monta a mensagem do pedido; campos vazios ficam de fora.
export function composeMessage(req: ContactRequest, c: LandingContent["contact"], lang: "pt" | "en"): string {
  const m = c.message;
  const fields: [string, string][] = [
    [m.service, c.services[req.service]],
    [m.name, req.name.trim()],
    [m.start, req.start && formatDate(req.start, lang)],
    [m.end, req.end && formatDate(req.end, lang)],
    [m.route, req.route.trim()],
    [m.notes, req.notes.trim()],
  ];
  const lines = fields.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`);
  return [m.greeting, "", ...lines].join("\n");
}
