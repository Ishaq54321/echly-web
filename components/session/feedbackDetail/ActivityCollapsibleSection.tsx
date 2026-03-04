"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface ActivityCollapsibleSectionProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  title?: string;
}

export function ActivityCollapsibleSection({
  children,
  defaultCollapsed = true,
  title = "Activity",
}: ActivityCollapsibleSectionProps) {
  const [open, setOpen] = useState(!defaultCollapsed);

  return (
    <div className="border-t border-[var(--layer-2-border)] pt-4 mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] py-1"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform duration-120 ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
