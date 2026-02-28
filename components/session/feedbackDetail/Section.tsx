"use client";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="mt-7">
      <h2 className="text-[11px] uppercase tracking-wide text-[hsl(var(--text-muted))] font-medium mb-3">
        {title}
      </h2>
      <div className="gap-2.5 flex flex-col text-[14px] leading-[1.6] text-[hsl(var(--text-primary))]">
        {children}
      </div>
    </section>
  );
}
