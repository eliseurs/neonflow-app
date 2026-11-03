interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  pending: string[];
}

export function PlaceholderPage({ eyebrow, title, description, pending }: PlaceholderPageProps) {
  return (
    <section className="max-w-3xl">
      <p className="text-xs font-semibold tracking-widest text-mint">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-slate-400">{description}</p>
      <div className="mt-8 rounded-xl border border-ink-line bg-ink-soft p-5">
        <h2 className="text-sm font-semibold text-slate-200">Antes de implementar</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-400">
          {pending.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
