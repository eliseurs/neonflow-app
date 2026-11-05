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
