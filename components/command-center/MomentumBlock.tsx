"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MomentumBlockProps {
  /** Single line: resolution velocity trend. */
  resolutionVelocity: "up" | "flat" | "down";
}

const config = {
  up: { icon: TrendingUp, label: "Resolution velocity ↑", className: "text-[hsl(var(--text-secondary-soft))]" },
  flat: { icon: Minus, label: "Resolution velocity →", className: "text-[hsl(var(--text-tertiary))]" },
  down: { icon: TrendingDown, label: "Resolution velocity ↓", className: "text-[hsl(var(--text-tertiary))]" },
};

export function MomentumBlock({ resolutionVelocity }: MomentumBlockProps) {
  const { icon: Icon, label, className } = config[resolutionVelocity];

  return (
    <section
      className="bg-white overflow-hidden rounded-lg border border-[var(--layer-2-border)]"
      aria-label="Momentum"
    >
      <div className="px-4 py-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        <span className={`text-[13px] ${className}`}>{label}</span>
      </div>
    </section>
  );
}
