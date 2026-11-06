import { ArrowDown, ArrowUp, ArrowUpRight, CalendarCheck, Check, Clock, MapPin, Plane, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { Wordmark } from "@/shared/ui/Brand";
import { buttonClass } from "@/shared/ui/buttonClass";
import { Accent, Overline, SectionHeading } from "@/shared/ui/Heading";
import { Reveal } from "@/shared/ui/Reveal";
import { ContactForm } from "../components/ContactForm";
import { SiteHeader, WhatsAppIcon } from "../components/SiteHeader";
import { content, type Lang, type ServiceKind } from "../model/landing.content";
import { formatPhone, whatsappNumber, whatsappUrl } from "../model/whatsapp";

interface LandingPageProps {
  initialLang?: Lang;
  number?: string;
}

const TRUST_ICONS = [Plane, ShieldCheck, Clock, CalendarCheck];

const linkCta =
  "group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold transition-all duration-300 ease-silk hover:gap-3";

const chip = "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] text-bone/80";

function browserLang(): Lang {
  return typeof navigator !== "undefined" && !navigator.language.toLowerCase().startsWith("pt") ? "en" : "pt";
}

export function LandingPage({ initialLang, number = whatsappNumber() }: LandingPageProps) {
  const [lang, setLang] = useState<Lang>(initialLang ?? browserLang);
  const [service, setService] = useState<ServiceKind>("aluguel");
  const [notesPreset, setNotesPreset] = useState<string>();
  const t = content[lang];
  const chat = whatsappUrl(number);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = lang === "pt" ? "Neon Flow — Aluguel e transfer na Serra Gaúcha" : "Neon Flow — Car rental and transfers in the Serra Gaúcha";
  }, [lang]);

  const goToContact = () => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });

  const request = (kind: ServiceKind, notes?: string) => {
    setService(kind);
    if (notes) setNotesPreset(notes);
    goToContact();
  };

  const heroOptions: { kind: ServiceKind; label: string }[] = [
    { kind: "aluguel", label: t.nav.rental },
    { kind: "transfer", label: t.nav.transfer },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-noir font-inter text-bone antialiased">
      <SiteHeader t={t} lang={lang} onToggleLang={() => setLang(lang === "pt" ? "en" : "pt")} chat={chat} />

      <main id="topo">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-24 pt-40 sm:px-6 md:pt-48">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[820px] -translate-x-1/2 animate-ambient-glow rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,168,106,0.16),transparent_65%)] blur-2xl"
          />
          <div className="relative mx-auto max-w-5xl text-center">
            <Overline variant="plain" className="animate-rise justify-center">{t.hero.overline}</Overline>
            <h1 className="mx-auto mt-6 max-w-4xl animate-rise font-serif text-5xl font-light leading-[1.02] tracking-[-0.035em] [animation-delay:100ms] sm:text-6xl md:text-7xl">
              {t.hero.title} <Accent>{t.hero.titleAccent}</Accent>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl animate-rise text-lg leading-relaxed text-bone/65 [animation-delay:200ms]">{t.hero.lead}</p>
          </div>

          {/* Cartão de início do pedido */}
          <div className="relative mx-auto mt-16 max-w-3xl animate-rise rounded-[28px] border border-gold/20 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 text-center shadow-[0_40px_120px_-40px_rgba(201,168,106,0.35)] [animation-delay:320ms] md:p-8">
            <div className="flex items-center justify-center gap-3">
              <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-noir">{t.hero.step}</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-bone/45">{t.hero.stepHint}</span>
            </div>
            <h2 className="mt-5 font-serif text-2xl font-light tracking-[-0.03em] md:text-3xl">{t.hero.cardTitle}</h2>
            <p className="mt-2 text-sm text-bone/55">{t.hero.cardLead}</p>
            <div role="radiogroup" aria-label={t.hero.choose} className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5 sm:grid-cols-2">
              {heroOptions.map((o) => (
                <button
                  key={o.kind}
                  type="button"
                  role="radio"
                  aria-checked={service === o.kind}
                  onClick={() => setService(o.kind)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-4 text-[15px] transition-all duration-500 ease-silk",
                    service === o.kind ? "bg-gold text-noir shadow-[0_10px_30px_-10px_rgba(201,168,106,0.7)]" : "text-bone/70 hover:bg-white/[0.04] hover:text-bone",
                  )}
                >
                  {o.kind === "transfer" ? <Plane className="h-4 w-4" aria-hidden /> : <MapPin className="h-4 w-4" aria-hidden />}
                  {o.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={goToContact}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/25 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold transition-all duration-300 ease-silk hover:border-gold/60 hover:bg-gold/[0.06]"
            >
              {t.hero.continue}
              <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
            </button>
            <nav aria-label={t.services.overline} className="mt-5 flex justify-center gap-6 text-sm text-bone/50">
              <a href="#aluguel" className="hover:text-gold">{t.hero.rentalCta}</a>
              <span aria-hidden>·</span>
              <a href="#transfer" className="hover:text-gold">{t.hero.transferCta}</a>
            </nav>
          </div>
        </section>

        {/* Faixa de garantias */}
        <section className="border-y border-white/[0.06] bg-white/[0.02] px-4 py-12 sm:px-6">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 md:grid-cols-4">
            {t.trust.map((item, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <Reveal as="li" key={item.title} delay={i * 90} className="flex flex-col items-center gap-2 px-2 text-center">
                  <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden />
                  <p className="mt-1 font-medium text-bone">{item.title}</p>
                  <p className="text-[13px] text-bone/50">{item.text}</p>
                </Reveal>
              );
            })}
          </ul>
        </section>

        {/* Serviços */}
        <section aria-labelledby="servicos" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <Reveal>
            <SectionHeading id="servicos" overline={t.services.overline} title={t.services.title} accent={t.services.titleAccent} lead={t.services.lead} />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[t.services.rental, t.services.transfer].map((card, i) => (
              <Reveal
                as="article"
                key={card.service}
                delay={i * 120}
                id={card.service === "aluguel" ? "aluguel" : "transfer"}
                className="group relative flex scroll-mt-28 flex-col overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 transition-[border-color,transform,box-shadow] duration-500 ease-silk hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_30px_80px_-40px_rgba(201,168,106,0.45)] md:p-10"
              >
                <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
                <p className="text-[11px] tracking-[0.3em] text-gold">{card.counter}</p>
                <h3 className="mt-4 font-serif text-4xl font-light leading-tight tracking-[-0.035em]">
                  {card.title} <Accent>{card.titleAccent}</Accent>
                </h3>
                <div className="mt-6 flex flex-wrap gap-2">
                  {card.chips.map((c) => (
                    <span key={c} className={chip}>{c}</span>
                  ))}
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-[15px] text-bone/75">
                  {card.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => request(card.service)} className={cn(linkCta, "mt-8 self-start")}>
                  {card.cta}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Frota */}
        <section id="frota" aria-labelledby="frota-titulo" className="scroll-mt-20 px-4 pb-24 sm:px-6 md:pb-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading id="frota-titulo" overline={t.fleet.overline} title={t.fleet.title} accent={t.fleet.titleAccent} lead={t.fleet.note} />
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {t.fleet.cars.map((car, i) => (
                <Reveal
                  as="article"
                  key={car.category}
                  delay={i * 120}
                  className="group overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b0b0b] transition-[border-color,box-shadow] duration-500 ease-silk hover:border-gold/30 hover:shadow-[0_30px_80px_-40px_rgba(201,168,106,0.4)]"
                >
                  {/* Palco com luz de cima, no lugar da foto (PEN-65). */}
                  <div className="relative grid h-56 place-items-center overflow-hidden border-b border-white/[0.06] md:h-64">
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(232,207,158,0.28),transparent_60%)] transition-transform duration-700 ease-silk group-hover:scale-110" />
                    <div aria-hidden className="absolute inset-x-10 bottom-10 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                    <img src="/brand/neonflow-simbolo.svg" alt="" aria-hidden className="relative w-24 animate-slow-float opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="p-8 md:p-10">
                    <p className="text-[11px] tracking-[0.3em] text-gold">
                      0{i + 1} / 0{t.fleet.cars.length} · {car.category.toUpperCase()}
                    </p>
                    <h3 className="mt-3 font-serif text-4xl font-light tracking-[-0.035em]">{car.model}</h3>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {car.chips.map((c) => (
                        <span key={c} className={chip}>
                          <Check className="h-3.5 w-3.5 text-gold" aria-hidden />
                          {c}
                        </span>
                      ))}
                    </div>
                    <button type="button" onClick={() => request("aluguel", car.model)} className={cn(linkCta, "mt-8")}>
                      {t.fleet.cta}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Condições */}
        <section id="condicoes" aria-labelledby="condicoes-titulo" className="scroll-mt-20 border-y border-white/[0.06] bg-white/[0.015] px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading id="condicoes-titulo" overline={t.conditions.overline} title={t.conditions.title} accent={t.conditions.titleAccent} />
            </Reveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-[3fr_2fr]">
              {[t.conditions.rental, t.conditions.transfer].map((block, i) => (
                <Reveal key={block.title} delay={i * 120} className="rounded-[22px] border border-white/[0.08] bg-noir/60 p-8 md:p-10">
                  <h3 className="font-serif text-2xl font-light tracking-[-0.03em]">{block.title}</h3>
                  <ul className="mt-6 divide-y divide-white/[0.06] text-[15px] leading-relaxed text-bone/75">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3 py-3.5">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Área e passos */}
        <section aria-labelledby="area-titulo" className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 md:py-32 lg:grid-cols-2">
          <Reveal>
            <Overline>{t.area.overline}</Overline>
            <h2 id="area-titulo" className="mt-5 font-serif text-4xl font-light leading-[1.05] tracking-[-0.035em] md:text-5xl">
              {t.area.title} <Accent>{t.area.titleAccent}</Accent>
            </h2>
            <ul className="mt-10 border-t border-white/[0.08]">
              {t.area.places.map((place) => (
                <li key={place} className="group flex items-center justify-between border-b border-white/[0.08] py-4 font-serif text-xl font-light transition-colors hover:text-gold">
                  {place}
                  <MapPin className="h-4 w-4 text-bone/30 transition-colors group-hover:text-gold" aria-hidden />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gold">{t.area.onDemand}</p>
          </Reveal>
          <Reveal delay={120}>
            <Overline>{t.steps.overline}</Overline>
            <h2 className="mt-5 font-serif text-4xl font-light leading-[1.05] tracking-[-0.035em] md:text-5xl">
              {t.steps.title} <Accent>{t.steps.titleAccent}</Accent>
            </h2>
            <ol className="mt-10 space-y-4">
              {t.steps.items.map((step, i) => (
                <li key={step.title} className="flex gap-6 rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-6 transition-colors duration-500 hover:border-gold/30">
                  <span className="text-gold-grad font-serif text-4xl font-light italic">0{i + 1}</span>
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em]">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-bone/65">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* Contato */}
        <section id="contato" aria-labelledby="contato-titulo" className="scroll-mt-20 border-t border-white/[0.06] px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <SectionHeading id="contato-titulo" center overline={t.contact.overline} title={t.contact.title} accent={t.contact.titleAccent} lead={t.contact.lead} />
            </Reveal>
            <Reveal delay={120} className="mt-12">
              <ContactForm content={t.contact} lang={lang} number={number} service={service} onServiceChange={setService} notesPreset={notesPreset} />
            </Reveal>
          </div>
        </section>

        {/* Chamada final */}
        <section className="relative overflow-hidden px-4 py-24 text-center sm:px-6 md:py-32">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <Reveal>
            <h2 className="font-serif text-4xl font-light tracking-[-0.035em] md:text-5xl">
              {t.final.title} <Accent>{t.final.titleAccent}</Accent>
            </h2>
            <p className="mt-4 text-lg text-bone/60">{t.final.lead}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={goToContact} className={buttonClass("primary", "px-8 py-4")}>
                {t.final.cta}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </button>
              <a href="#topo" className={buttonClass("outline", "px-8 py-4")}>{t.final.back}</a>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] px-4 sm:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-12 py-20 lg:grid-cols-[3fr_2fr]">
          <div>
            <Wordmark size="lg" />
            <p className="mt-6 max-w-md leading-relaxed text-bone/65">{t.footer.about}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {t.footer.pills.map((p) => (
                <li key={p} className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-bone/70">{p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8">
            <Overline variant="plain">{t.footer.contact}</Overline>
            <p className="mt-4 font-serif text-2xl font-light tracking-[-0.03em]">
              {t.contact.title} <Accent>{t.contact.titleAccent}</Accent>
            </p>
            <ul className="mt-6 space-y-3">
              {chat && (
                <li>
                  <a href={chat} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-white/[0.03]">
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 text-gold">
                      <WhatsAppIcon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[10px] uppercase tracking-[0.25em] text-bone/45">{t.footer.whatsapp}</span>
                      <span className="text-bone/85">{formatPhone(number)}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-bone/40 transition-colors group-hover:text-gold" aria-hidden />
                  </a>
                </li>
              )}
              <li className="flex items-center gap-4 p-2">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 text-gold">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.25em] text-bone/45">{t.area.overline}</span>
                  <span className="text-bone/85">{t.footer.region}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 border-t border-white/[0.06] py-12 sm:grid-cols-2">
          <div>
            <Overline>{t.footer.explore}</Overline>
            <ul className="mt-6 grid grid-cols-2 gap-y-3 text-bone/75">
              {[
                ["#aluguel", t.nav.rental],
                ["#transfer", t.nav.transfer],
                ["#frota", t.nav.fleet],
                ["#condicoes", t.nav.conditions],
                ["#contato", t.nav.contact],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="transition-colors hover:text-gold">{label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 sm:items-end sm:justify-end">
            <Link to="/login" className="text-sm text-bone/55 transition-colors hover:text-gold">{t.footer.staff}</Link>
            <a
              href="#topo"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-bone/80 transition-all duration-300 hover:border-gold/60 hover:text-gold"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden /> {t.footer.top}
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-gold/20 py-8 text-sm text-bone/45">
          © {new Date().getFullYear()} Neon Flow · {t.footer.region}. {t.footer.rights}
        </div>
      </footer>

      {chat && (
        <a
          href={chat}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.whatsapp}
          className="group fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-2xl shadow-whatsapp/30 transition-transform duration-300 hover:scale-110 active:scale-95 sm:bottom-8 sm:right-8"
        >
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-whatsapp/40 [animation-duration:2.4s]" />
          <WhatsAppIcon className="relative h-6 w-6" />
        </a>
      )}
    </div>
  );
}
