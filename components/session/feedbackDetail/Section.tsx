"use client";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Section({ title, children, icon }: SectionProps) {
  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-5">
        {icon && <div className="text-slate-400">{icon}</div>}
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      {children}
    </div>
  );
}
