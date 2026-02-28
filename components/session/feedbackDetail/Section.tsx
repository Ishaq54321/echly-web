"use client";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="mt-8">
      <h2 className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))] font-medium mb-3">
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-[hsl(var(--text-primary))]">
        {children}
      </div>
    </section>
  );
}
