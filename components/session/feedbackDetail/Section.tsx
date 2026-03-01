"use client";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="my-6">
      <h2 className="text-[11px] font-semibold tracking-[0.08em] text-neutral-400 uppercase mb-3">
        {title}
      </h2>
      <div className="gap-2 flex flex-col text-[14px] leading-[1.6] text-neutral-900">
        {children}
      </div>
    </section>
  );
}
