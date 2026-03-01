"use client";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="my-6">
      <h2 className="text-[11px] uppercase tracking-[0.08em] text-neutral-400 mb-2">
        {title}
      </h2>
      <div className="gap-2 flex flex-col text-[14px] leading-[1.65] text-neutral-800">
        {children}
      </div>
    </section>
  );
}
