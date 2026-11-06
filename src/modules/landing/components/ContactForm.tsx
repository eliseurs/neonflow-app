import { ArrowUpRight, CalendarDays, MapPin, MessageSquare, User } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import type { Lang, LandingContent, ServiceKind } from "../model/landing.content";
import { composeMessage, whatsappUrl, type ContactRequest } from "../model/whatsapp";

interface ContactFormProps {
  content: LandingContent["contact"];
  lang: Lang;
  number: string;
  service: ServiceKind;
  onServiceChange: (service: ServiceKind) => void;
  /** Observação sugerida por um clique na página (ex.: o carro escolhido na frota). */
  notesPreset?: string;
}

const field =
  "h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-bone outline-none transition-all duration-300 ease-silk placeholder:text-bone/35 hover:border-white/20 focus:border-gold/70 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(201,168,106,0.12)] [color-scheme:dark]";
const label = "mb-2 block text-sm text-bone/75";

function Labeled({ id, text, icon, className, children }: { id: string; text: string; icon: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label className={label} htmlFor={id}>{text}</label>
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute left-4 top-[18px] text-bone/45">{icon}</span>
        {children}
      </div>
    </div>
  );
}

export function ContactForm({ content: c, lang, number, service, onServiceChange, notesPreset }: ContactFormProps) {
  const [form, setForm] = useState<Omit<ContactRequest, "service">>({ name: "", start: "", end: "", route: "", notes: "" });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  useEffect(() => {
    if (notesPreset) setForm((f) => ({ ...f, notes: notesPreset }));
  }, [notesPreset]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const url = whatsappUrl(number, composeMessage({ ...form, service }, c, lang));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const filled = [form.name, form.start, form.end, form.route].filter(Boolean).length;
  const progress = 20 + filled * 20;

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-6 shadow-[0_40px_120px_-60px_rgba(201,168,106,0.35)] md:p-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold transition-all duration-700 ease-silk" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-10 text-right text-[11px] tabular-nums text-bone/50">{progress}%</span>
      </div>

      <fieldset>
        <legend id="contact-service" className={label}>{c.service}</legend>
        <div role="radiogroup" aria-labelledby="contact-service" className="grid gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5 sm:grid-cols-3">
          {(Object.keys(c.services) as ServiceKind[]).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={service === key}
              onClick={() => onServiceChange(key)}
              className={cn(
                "rounded-xl px-3 py-3 text-sm transition-all duration-500 ease-silk",
                service === key ? "bg-gold text-noir shadow-[0_8px_30px_-8px_rgba(201,168,106,0.6)]" : "text-bone/70 hover:bg-white/[0.04] hover:text-bone",
              )}
            >
              {c.services[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Labeled id="contact-name" text={c.name} icon={<User className="h-4 w-4" />} className="md:col-span-2">
          <input id="contact-name" autoComplete="name" value={form.name} onChange={set("name")} className={field} />
        </Labeled>
        <Labeled id="contact-start" text={c.start} icon={<CalendarDays className="h-4 w-4" />}>
          <input id="contact-start" type="date" value={form.start} onChange={set("start")} className={field} />
        </Labeled>
        <Labeled id="contact-end" text={c.end} icon={<CalendarDays className="h-4 w-4" />}>
          <input id="contact-end" type="date" min={form.start || undefined} value={form.end} onChange={set("end")} className={field} />
        </Labeled>
        <Labeled id="contact-route" text={c.route} icon={<MapPin className="h-4 w-4" />} className="md:col-span-2">
          <input id="contact-route" value={form.route} onChange={set("route")} className={field} />
        </Labeled>
        <Labeled id="contact-notes" text={c.notes} icon={<MessageSquare className="h-4 w-4" />} className="md:col-span-2">
          <textarea id="contact-notes" rows={3} value={form.notes} onChange={set("notes")} className={cn(field, "h-auto py-4")} />
        </Labeled>
      </div>

      <div className="mt-8 rounded-[22px] border border-white/[0.06] bg-black/30 p-2">
        <button
          type="submit"
          disabled={!number}
          className="btn-gold flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {c.submit}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      {!number && (
        <p role="status" className="mt-3 text-center text-sm text-bone/55">
          {c.unavailable}
        </p>
      )}
    </form>
  );
}
