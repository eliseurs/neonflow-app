interface SectionHeadingProps {
  overline: string;
  title: string;
  accent: string;
  id?: string;
}

export function Overline({ children }: { children: string }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">— {children}</p>;
}

export function SectionHeading({ overline, title, accent, id }: SectionHeadingProps) {
  return (
    <div>
      <Overline>{overline}</Overline>
      <h2 id={id} className="mt-4 font-serif text-4xl font-light leading-[1.05] tracking-tight md:text-5xl">
        {title} <em className="text-gold">{accent}</em>
      </h2>
    </div>
  );
}

interface PageHeaderProps {
  overline: string;
  title: string;
  accent?: string;
  description?: string;
  actions?: React.ReactNode;
}

/** Cabeçalho das telas do painel: mesma tipografia da landing, em tamanho menor. */
export function PageHeader({ overline, title, accent, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <Overline>{overline}</Overline>
        <h1 className="mt-3 font-serif text-4xl font-light leading-tight tracking-tight md:text-5xl">
          {title}
          {accent && (
            <>
              {" "}
              <em className="text-gold">{accent}</em>
            </>
          )}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-bone/60">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
