import { cn } from "@/shared/lib/cn";

interface OverlineProps {
  children: string;
  /** "line": traço à esquerda (seções). "plain": só o texto (hero, centralizado). */
  variant?: "line" | "plain";
  className?: string;
}

export function Overline({ children, variant = "line", className }: OverlineProps) {
  return (
    <p className={cn("flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-gold", className)}>
      {variant === "line" && <span aria-hidden className="h-px w-6 bg-gold/70" />}
      {children}
    </p>
  );
}

/** Acento do título: itálico com degradê dourado. */
export function Accent({ children }: { children: string }) {
  return <em className="text-gold-grad pr-1 italic">{children}</em>;
}

interface SectionHeadingProps {
  overline: string;
  title: string;
  accent: string;
  id?: string;
  /** Texto de apoio; no desktop fica à direita do título. */
  lead?: string;
  center?: boolean;
}

export function SectionHeading({ overline, title, accent, id, lead, center }: SectionHeadingProps) {
  if (center) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <Overline variant="plain" className="justify-center">{overline}</Overline>
        <h2 id={id} className="mt-5 font-serif text-4xl font-light leading-[1.05] tracking-[-0.035em] md:text-5xl">
          {title} <Accent>{accent}</Accent>
        </h2>
        {lead && <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-bone/60">{lead}</p>}
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:items-end">
      <div>
        <Overline>{overline}</Overline>
        <h2 id={id} className="mt-5 font-serif text-4xl font-light leading-[1.05] tracking-[-0.035em] md:text-6xl">
          {title} <Accent>{accent}</Accent>
        </h2>
      </div>
      {lead && <p className="text-lg leading-relaxed text-bone/55 md:pb-2">{lead}</p>}
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
        <h1 className="mt-4 font-serif text-4xl font-light leading-tight tracking-[-0.035em] md:text-5xl">
          {title}
          {accent && (
            <>
              {" "}
              <Accent>{accent}</Accent>
            </>
          )}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-bone/60">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
