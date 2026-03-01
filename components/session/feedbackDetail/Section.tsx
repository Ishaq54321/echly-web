"use client";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  /** When true, label uses same size but lower emphasis (e.g. for Tags at bottom). */
  titleMuted?: boolean;
}

export function Section({ title, children, titleMuted }: SectionProps) {
  return (
    <section className="my-6">
      <h2 className={`text-[11px] uppercase tracking-[0.08em] mb-2 ${titleMuted ? "text-neutral-500" : "text-neutral-400"}`}>
        {title}
      </h2>
      <div className="gap-2 flex flex-col text-[14px] leading-[1.65] text-neutral-800">
        {children}
      </div>
    </section>
  );
}
