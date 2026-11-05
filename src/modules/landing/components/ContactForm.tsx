import { useState, type FormEvent } from "react";
import type { Lang, LandingContent, ServiceKind } from "../model/landing.content";
import { composeMessage, whatsappUrl, type ContactRequest } from "../model/whatsapp";

interface ContactFormProps {
  content: LandingContent["contact"];
  lang: Lang;
  number: string;
  service: ServiceKind;
  onServiceChange: (service: ServiceKind) => void;
}

const field =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-bone outline-none transition focus:border-gold/70 [color-scheme:dark]";
const label = "block text-[11px] font-medium uppercase tracking-[0.2em] text-bone/60";

export function ContactForm({ content: c, lang, number, service, onServiceChange }: ContactFormProps) {
  const [form, setForm] = useState<Omit<ContactRequest, "service">>({ name: "", start: "", end: "", route: "", notes: "" });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const url = whatsappUrl(number, composeMessage({ ...form, service }, c, lang));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className={label} htmlFor="contact-service">{c.service}</label>
        <select
          id="contact-service"
          value={service}
          onChange={(e) => onServiceChange(e.target.value as ServiceKind)}
          className={field}
        >
          {(Object.keys(c.services) as ServiceKind[]).map((key) => (
            <option key={key} value={key} className="bg-noir">
              {c.services[key]}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={label} htmlFor="contact-name">{c.name}</label>
        <input id="contact-name" autoComplete="name" value={form.name} onChange={set("name")} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="contact-start">{c.start}</label>
        <input id="contact-start" type="date" value={form.start} onChange={set("start")} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="contact-end">{c.end}</label>
        <input id="contact-end" type="date" min={form.start || undefined} value={form.end} onChange={set("end")} className={field} />
      </div>
      <div className="md:col-span-2">
        <label className={label} htmlFor="contact-route">{c.route}</label>
        <input id="contact-route" value={form.route} onChange={set("route")} className={field} />
      </div>
      <div className="md:col-span-2">
        <label className={label} htmlFor="contact-notes">{c.notes}</label>
        <textarea id="contact-notes" rows={3} value={form.notes} onChange={set("notes")} className={field} />
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={!number}
          className="w-full rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-noir transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
        >
          {c.submit}
        </button>
        {!number && (
          <p role="status" className="mt-3 text-sm text-bone/60">
            {c.unavailable}
          </p>
        )}
      </div>
    </form>
  );
}
