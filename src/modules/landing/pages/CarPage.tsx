import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FEATURES, FUEL_LABEL } from "@/modules/fleet/model/fleet.types";
import { Wordmark } from "@/shared/ui/Brand";
import { buttonClass } from "@/shared/ui/buttonClass";
import { CarGallery } from "../components/CarGallery";
import { WhatsAppIcon } from "../components/SiteHeader";
import { content, type Lang } from "../model/landing.content";
import { loadPublicCar, requestCarHref, type PublicCar } from "../model/fleet";
import { whatsappNumber, whatsappUrl } from "../model/whatsapp";

const COPY = {
  pt: {
    back: "Voltar para a frota", request: "Pedir este carro", whatsapp: "Falar no WhatsApp", specs: "Ficha técnica", items: "Itens",
    about: "Sobre o carro", year: "Ano", color: "Cor", fuel: "Combustível", gear: "Câmbio", doors: "Portas", seats: "Lugares",
    category: "Categoria", priceNote: "O valor da diária é informado pela central na reserva.", loading: "Carregando...",
    notFound: "Carro não encontrado ou indisponível no momento.", interest: (n: string) => `Olá! Tenho interesse no ${n}.`,
    gallery: { prev: "Foto anterior", next: "Próxima foto", open: "Ver em tela cheia", close: "Fechar", photo: "Foto" },
  },
  en: {
    back: "Back to the fleet", request: "Request this car", whatsapp: "Chat on WhatsApp", specs: "Specifications", items: "Features",
    about: "About the car", year: "Year", color: "Color", fuel: "Fuel", gear: "Transmission", doors: "Doors", seats: "Seats",
    category: "Category", priceNote: "The daily rate is quoted by our team when you book.", loading: "Loading...",
    notFound: "Car not found or not available right now.", interest: (n: string) => `Hello! I'm interested in the ${n}.`,
    gallery: { prev: "Previous photo", next: "Next photo", open: "View full screen", close: "Close", photo: "Photo" },
  },
} as const;

/** Página pública do carro, no estilo dos classificados: galeria, ficha, itens e pedido. Sem preço (como a LuxuryBus). */
export function CarPage({ loader = loadPublicCar, number = whatsappNumber() }: { loader?: (id: string) => Promise<PublicCar>; number?: string }) {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const lang: Lang = params.get("lang") === "en" || (!params.get("lang") && typeof navigator !== "undefined" && !navigator.language.toLowerCase().startsWith("pt")) ? "en" : "pt";
  const c = COPY[lang];
  const t = content[lang];
  const [car, setCar] = useState<PublicCar | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loader(id)
      .then((data) => alive && setCar(data))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [id, loader]);
  useEffect(() => {
    if (car) document.title = `${car.name} · Neon Flow`;
  }, [car]);

  const backHref = `/${lang === "en" ? "?lang=en" : ""}#frota`;
  const chat = car ? whatsappUrl(number, c.interest(car.name)) : null;
  const specs: [string, string][] = car
    ? ([
        [c.category, car.category === "premium" ? "Premium" : "Economy"],
        [c.year, car.year ? String(car.year) : ""],
        [c.color, car.color],
        [c.fuel, car.fuel ? FUEL_LABEL[car.fuel][lang] : ""],
        [c.gear, t.fleet.gear[car.gear]],
        [c.doors, car.doors ? String(car.doors) : ""],
        [c.seats, String(car.seats)],
      ] as [string, string][]).filter(([, v]) => v)
    : [];

  return (
    <div className="min-h-screen bg-noir text-bone">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-noir/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to={backHref} aria-label="Neon Flow"><Wordmark size="sm" /></Link>
          <Link to={backHref} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bone/70 hover:text-gold">
            <ArrowLeft className="h-4 w-4" aria-hidden /> {c.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        {!car && !failed && <p className="text-bone/60">{c.loading}</p>}
        {failed && (
          <div className="space-y-4">
            <p className="text-bone/70">{c.notFound}</p>
            <Link to={backHref} className={buttonClass("outline")}>{c.back}</Link>
          </div>
        )}
        {car && (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-10">
              <CarGallery photoIds={car.photo_ids ?? []} name={car.name} labels={c.gallery} />
              {car.description && (
                <section>
                  <h2 className="font-serif text-2xl font-light">{c.about}</h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-bone/75">{car.description}</p>
                </section>
              )}
              {car.features.length > 0 && (
                <section>
                  <h2 className="font-serif text-2xl font-light">{c.items}</h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {FEATURES.filter((f) => car.features.includes(f.key)).map((f) => (
                      <li key={f.key} className="flex items-center gap-3 text-bone/80">
                        <Check className="h-4 w-4 text-gold" aria-hidden /> {f[lang]}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[22px] border border-white/[0.08] bg-[#0b0b0b] p-6 md:p-8">
                <p className="text-[11px] tracking-[0.3em] text-gold">{car.category.toUpperCase()}</p>
                <h1 className="mt-2 font-serif text-4xl font-light tracking-[-0.03em]">{car.name}</h1>
                {(car.year || car.color) && <p className="mt-1 text-bone/60">{[car.year, car.color].filter(Boolean).join(" · ")}</p>}
                <div className="mt-5 flex flex-wrap gap-2">
                  {t.fleet.chips.map((chip) => (
                    <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[13px] text-bone/80">
                      <Check className="h-3.5 w-3.5 text-gold" aria-hidden /> {chip}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm text-bone/55">{c.priceNote}</p>
                <div className="mt-6 grid gap-3">
                  <Link to={requestCarHref(car.name, lang)} className={buttonClass("primary", "justify-center")}>{c.request}</Link>
                  {chat && (
                    <a href={chat} target="_blank" rel="noreferrer" className={buttonClass("outline", "justify-center")}>
                      <WhatsAppIcon className="h-4 w-4" /> {c.whatsapp}
                    </a>
                  )}
                </div>
              </div>
              <div className="rounded-[22px] border border-white/[0.08] p-6 md:p-8">
                <h2 className="font-serif text-xl font-light">{c.specs}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  {specs.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[11px] uppercase tracking-[0.18em] text-bone/45">{label}</dt>
                      <dd className="mt-1 text-bone/90">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
