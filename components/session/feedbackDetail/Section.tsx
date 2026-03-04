"use client";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  /** When true, label uses same size but lower emphasis (e.g. for Tags at bottom). */
  titleMuted?: boolean;
  /** Semantic header: insight (purple), attention (amber). Omit for neutral. */
  titleSemantic?: "insight" | "attention";
}

export function Section({ title, children, titleMuted, titleSemantic }: SectionProps) {
  const titleClass =
    titleSemantic === "insight"
      ? "text-semantic-insight"
      : titleSemantic === "attention"
        ? "text-semantic-attention"
        : titleMuted
          ? "text-[hsl(var(--text-tertiary))]"
          : "text-[hsl(var(--text-tertiary))]";
  return (
    <section className="my-4">
      <h2 className={`text-[11px] font-medium uppercase tracking-[0.06em] mb-1 ${titleClass}`}>
        {title}
      </h2>
      <div className="gap-2 flex flex-col text-[15px] leading-[1.7] text-[hsl(var(--text-primary-strong))]">
        {children}
      </div>
    </section>
  );
}
