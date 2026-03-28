"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ExecutionMomentum as Momentum } from "@/lib/domain/signal";

export interface ExecutionMomentumBlockProps {
  momentum: Momentum;
}

function Trend({ direction }: { direction: "up" | "flat" | "down" }) {
  const config = {
    up: { icon: TrendingUp, label: "Up", className: "text-emerald-600" },
    flat: { icon: Minus, label: "Flat", className: "text-[hsl(var(--text-tertiary))]" },
    down: { icon: TrendingDown, label: "Down", className: "text-amber-600" },
  };
  const { icon: Icon, label, className } = config[direction];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${className}`}>
      <Icon className="h-3 w-3" strokeWidth={1.5} />
      {label}
    </span>
  );
}

export function ExecutionMomentumBlock({ momentum }: ExecutionMomentumBlockProps) {
  const avgTime =
    momentum.avgResolutionTimeHours != null
      ? momentum.avgResolutionTimeHours < 1
        ? `${Math.round(momentum.avgResolutionTimeHours * 60)}m`
        : `${momentum.avgResolutionTimeHours.toFixed(1)}h`
      : null;

  return (
    <section
      className="border border-[var(--layer-1-border)] bg-white overflow-hidden"
      aria-label="Execution Momentum"
    >
      <header className="px-4 py-3 border-b border-[var(--layer-1-border)] bg-[var(--structural-gray-ticket)]">
        <h2 className="text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-primary-strong))]">
          Execution Momentum
        </h2>
      </header>
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
            Resolution velocity
          </p>
          <p className="mt-1">
            <Trend direction={momentum.resolutionVelocityTrend} />
          </p>
        </div>
        {avgTime ? (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
              Avg resolution time
            </p>
            <p className="mt-1 text-[13px] font-medium text-[hsl(var(--text-primary-strong))] tabular-nums">
              {avgTime}
            </p>
          </div>
        ) : null}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
            Confidence trend
          </p>
          <p className="mt-1">
            <Trend direction={momentum.confidenceScoreTrend} />
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
            Owner load
          </p>
          <ul className="mt-1 space-y-0.5">
            {momentum.ownerLoadBalance.slice(0, 3).map((o) => (
              <li
                key={o.ownerId}
                className="text-[12px] text-[hsl(var(--text-secondary-soft))] flex justify-between gap-2"
              >
                <span className="truncate">{o.ownerName?.trim() || ""}</span>
                <span className="tabular-nums shrink-0">{o.openCount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
