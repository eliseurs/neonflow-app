import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContactForm } from "../components/ContactForm";
import { Overline, SectionHeading } from "../components/SectionHeading";
import { content, type Lang, type ServiceKind } from "../model/landing.content";
import { whatsappNumber, whatsappUrl } from "../model/whatsapp";

interface LandingPageProps {
  initialLang?: Lang;
  number?: string;
}

const outlineButton =
  "inline-flex items-center justify-center rounded-full border border-gold/60 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-bone transition hover:border-gold hover:bg-gold hover:text-noir";

function browserLang(): Lang {
  return typeof navigator !== "undefined" && !navigator.language.toLowerCase().startsWith("pt") ? "en" : "pt";
}

function Wordmark() {
  return (
    <span className="flex items-center gap-3">
      <img src="/brand/neonflow-simbolo.svg" alt="" className="h-9 w-9" />
      <span className="font-serif text-lg font-light tracking-[0.16em] text-bone">NEON FLOW</span>
    </span>
  );
}

export function LandingPage({ initialLang, number = whatsappNumber() }: LandingPageProps) {
  const [lang, setLang] = useState<Lang>(initialLang ?? browserLang);
  const [service, setService] = useState<ServiceKind>("aluguel");
  const t = content[lang];
  const chat = whatsappUrl(number);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = lang === "pt" ? "Neon Flow — Aluguel e transfer na Serra Gaúcha" : "Neon Flow — Car rental and transfers in the Serra Gaúcha";
  }, [lang]);

  const request = (kind: ServiceKind) => {
    setService(kind);
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-noir font-inter text-bone antialiased">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-noir/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <a href="#topo" aria-label="Neon Flow">
            <Wordmark />
          </a>
          <nav aria-label={lang === "pt" ? "Seções" : "Sections"} className="hidden items-center gap-8 text-sm text-bone/70 lg:flex">
            <a href="#aluguel" className="hover:text-bone">{t.nav.rental}</a>
            <a href="#transfer" className="hover:text-bone">{t.nav.transfer}</a>
            <a href="#frota" className="hover:text-bone">{t.nav.fleet}</a>
            <a href="#condicoes" className="hover:text-bone">{t.nav.conditions}</a>
            <a href="#contato" className="hover:text-bone">{t.nav.contact}</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              aria-label={lang === "pt" ? "Switch to English" : "Mudar para português"}
              className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-bone/80 hover:border-gold hover:text-gold"
            >
              {t.nav.switchTo}
            </button>
            <a
              href="#contato"
              className="hidden rounded-full bg-gold px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-noir hover:brightness-110 sm:inline-flex"
            >
              {t.nav.book}
            </a>
          </div>
        </div>
      </header>

      <main id="topo">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(201,168,106,0.16),transparent_55%)]"
          />
          <img
            src="/brand/neonflow-simbolo.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-24 top-1/2 hidden w-[560px] -translate-y-1/2 opacity-[0.12] md:block"
          />
          <div className="relative mx-auto flex min-h-[82vh] max-w-6xl flex-col justify-center px-4 py-24 md:px-8">
            <Overline>{t.hero.overline}</Overline>
            <h1 className="mt-6 max-w-3xl font-serif text-5xl font-light leading-[0.98] tracking-tight md:text-7xl">
              {t.hero.title} <em className="text-gold">{t.hero.titleAccent}</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/70">{t.hero.lead}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#aluguel" className={outlineButton}>{t.hero.rentalCta}</a>
              <a href="#transfer" className={outlineButton}>{t.hero.transferCta}</a>
            </div>
          </div>
        </section>

        <section aria-labelledby="servicos" className="mx-auto max-w-6xl px-4 py-24 md:px-8">
          <SectionHeading id="servicos" overline={t.services.overline} title={t.services.title} accent={t.services.titleAccent} />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[t.services.rental, t.services.transfer].map((card) => (
              <article
                key={card.service}
                id={card.service === "aluguel" ? "aluguel" : "transfer"}
                className="flex scroll-mt-24 flex-col rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-8 md:p-10"
              >
                <Overline>{card.overline}</Overline>
                <h3 className="mt-4 font-serif text-3xl font-light leading-tight">
                  {card.title} <em className="text-gold">{card.titleAccent}</em>
                </h3>
                <ul className="mt-6 flex-1 space-y-3 text-bone/75">
                  {card.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => request(card.service)} className={`${outlineButton} mt-8 self-start`}>
                  {card.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="frota" aria-labelledby="frota-titulo" className="scroll-mt-16 border-y border-white/[0.08] bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
            <SectionHeading id="frota-titulo" overline={t.fleet.overline} title={t.fleet.title} accent={t.fleet.titleAccent} />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {t.fleet.cars.map((car) => (
                <article key={car.category} className="relative overflow-hidden rounded-[14px] border border-white/[0.08] bg-noir p-8 md:p-10">
                  <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{car.category}</p>
                  <h3 className="mt-3 font-serif text-3xl font-light">{car.model}</h3>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-bone/55">{t.fleet.note}</p>
          </div>
        </section>

        <section id="condicoes" aria-labelledby="condicoes-titulo" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 md:px-8">
          <SectionHeading id="condicoes-titulo" overline={t.conditions.overline} title={t.conditions.title} accent={t.conditions.titleAccent} />
          <div className="mt-12 grid gap-12 md:grid-cols-[3fr_2fr]">
            {[t.conditions.rental, t.conditions.transfer].map((block) => (
              <div key={block.title}>
                <h3 className="font-serif text-2xl font-light">{block.title}</h3>
                <ul className="mt-6 divide-y divide-white/[0.08] border-t border-white/[0.08] text-[15px] leading-relaxed text-bone/75">
                  {block.items.map((item) => (
                    <li key={item} className="py-3">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="area-titulo" className="border-y border-white/[0.08] bg-white/[0.015]">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:grid-cols-2 md:px-8">
            <SectionHeading id="area-titulo" overline={t.area.overline} title={t.area.title} accent={t.area.titleAccent} />
            <div>
              <ul className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {t.area.places.map((place) => (
                  <li key={place} className="py-3 font-serif text-xl font-light">{place}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-gold">{t.area.onDemand}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="passos-titulo" className="mx-auto max-w-6xl px-4 py-24 md:px-8">
          <SectionHeading id="passos-titulo" overline={t.steps.overline} title={t.steps.title} accent={t.steps.titleAccent} />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {t.steps.items.map((step, i) => (
              <li key={step.title} className="rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-8">
                <span className="font-serif text-4xl font-light italic text-gold">0{i + 1}</span>
                <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em]">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-bone/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="contato" aria-labelledby="contato-titulo" className="scroll-mt-16 border-t border-white/[0.08]">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:grid-cols-[2fr_3fr] md:px-8">
            <div>
              <SectionHeading id="contato-titulo" overline={t.contact.overline} title={t.contact.title} accent={t.contact.titleAccent} />
              <p className="mt-6 leading-relaxed text-bone/70">{t.contact.lead}</p>
            </div>
            <ContactForm content={t.contact} lang={lang} number={number} service={service} onServiceChange={setService} />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-bone/55 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex flex-col gap-2">
            <Wordmark />
            <span>{t.footer.region}</span>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Link to="/login" className="hover:text-gold">{t.footer.staff}</Link>
            <span>© {new Date().getFullYear()} Neon Flow. {t.footer.rights}</span>
          </div>
        </div>
      </footer>

      {chat && (
        <a
          href={chat}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.whatsapp}
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold text-noir shadow-lg shadow-black/50 transition hover:brightness-110"
        >
          <MessageCircle className="h-6 w-6" aria-hidden />
        </a>
      )}
    </div>
  );
}
