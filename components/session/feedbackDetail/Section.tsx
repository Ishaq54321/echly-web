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
          ? "text-neutral-500"
          : "text-neutral-400";
  return (
    <section className="my-6">
      <h2 className={`text-[12px] uppercase tracking-[0.08em] mb-2 ${titleClass}`}>
        {title}
      </h2>
      <div className="gap-2 flex flex-col text-[15px] leading-[1.7] text-neutral-800">
        {children}
      </div>
    </section>
  );
}
