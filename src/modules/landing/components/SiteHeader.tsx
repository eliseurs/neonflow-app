import { ChevronDown, Globe, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { Wordmark } from "@/shared/ui/Brand";
import type { Lang, LandingContent } from "../model/landing.content";

interface SiteHeaderProps {
  t: LandingContent;
  lang: Lang;
  onToggleLang: () => void;
  chat: string | null;
}

function LangPill({ lang, onClick, label }: { lang: Lang; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3.5 text-[11px] font-semibold tracking-[0.2em] text-bone/85 transition-all duration-300 ease-silk hover:border-gold/60 hover:text-gold active:scale-95"
    >
      <Globe className="h-3.5 w-3.5 text-gold" aria-hidden />
      {lang.toUpperCase()}
      <ChevronDown className="h-3 w-3 opacity-60" aria-hidden />
    </button>
  );
}

/** Cabeçalho fixo: transparente no topo e cápsula com vidro fosco ao rolar. Menu em painel lateral. */
export function SiteHeader({ t, lang, onToggleLang, chat }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleLabel = lang === "pt" ? "Switch to English" : "Mudar para português";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = [
    { href: "#topo", label: t.nav.home },
    { href: "#aluguel", label: t.nav.rental },
    { href: "#transfer", label: t.nav.transfer },
    { href: "#frota", label: t.nav.fleet },
    { href: "#condicoes", label: t.nav.conditions },
    { href: "#contato", label: t.nav.contact },
  ];

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-silk", scrolled ? "py-3" : "py-6")}>
        <div className={cn("mx-auto px-4 transition-all duration-500 ease-silk sm:px-6", scrolled ? "max-w-6xl" : "max-w-7xl")}>
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-full border transition-all duration-500 ease-silk",
              scrolled
                ? "border-white/10 bg-noir/70 py-2 pl-5 pr-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                : "border-transparent py-0 pl-0 pr-0",
            )}
          >
            <a href="#topo" aria-label="Neon Flow" className="transition-opacity hover:opacity-85">
              <Wordmark />
            </a>
            <div className="flex items-center gap-2 sm:gap-3">
              <LangPill lang={lang} onClick={onToggleLang} label={toggleLabel} />
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t.nav.menu}
                aria-expanded={open}
                className="group grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.03] transition-all duration-300 ease-silk hover:border-gold/60 active:scale-95"
              >
                <span aria-hidden className="flex w-[18px] flex-col items-end gap-[5px]">
                  <span className="h-px w-full bg-bone transition-all duration-300 group-hover:bg-gold" />
                  <span className="h-px w-full bg-bone transition-all duration-300 group-hover:w-3/4 group-hover:bg-gold" />
                  <span className="h-px w-full bg-bone transition-all duration-300 group-hover:w-1/2 group-hover:bg-gold" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50">
          <div aria-hidden className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-md" onClick={() => setOpen(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            className="absolute inset-y-0 right-0 flex w-full max-w-md animate-drawer-in flex-col border-l border-white/[0.08] bg-[#0a0a0a]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-8 py-6">
              <Wordmark size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.nav.close}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-bone/80 transition-all duration-300 hover:rotate-90 hover:border-gold/60 hover:text-gold"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <nav aria-label={t.nav.menu} className="flex-1 overflow-y-auto px-8 py-6">
              <ul>
                {links.map((l, i) => (
                  <li key={l.href} className="animate-rise border-b border-white/[0.08]" style={{ animationDelay: `${120 + i * 60}ms` }}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between py-5 font-serif text-3xl font-light tracking-[-0.02em] text-bone/90 transition-colors hover:text-gold"
                    >
                      {l.label}
                      <span aria-hidden className="h-px w-0 bg-gold transition-all duration-500 ease-silk group-hover:w-10" />
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className="mt-8 inline-flex animate-rise items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-bone/55 hover:text-gold"
                style={{ animationDelay: "520ms" }}
              >
                {t.nav.staff} ↗
              </Link>
            </nav>
            <div className="flex items-end justify-between gap-4 border-t border-white/[0.08] px-8 py-6">
              <div className="space-y-4">
                <LangPill lang={lang} onClick={onToggleLang} label={toggleLabel} />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-bone/45">{t.nav.support}</p>
                  <p className="mt-1 text-sm text-bone/80">{t.nav.supportText}</p>
                </div>
              </div>
              {chat && (
                <a
                  href={chat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-whatsapp text-white shadow-lg shadow-whatsapp/30 transition-transform duration-300 hover:scale-110 active:scale-95"
                  aria-label={t.whatsapp}
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.43 9.42m8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.66L.62 23.25l5.65-1.48a11.3 11.3 0 0 0 5.78 1.47h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01" />
    </svg>
  );
}
