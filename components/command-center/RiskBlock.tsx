"use client";

import React from "react";
import type { RiskLevel } from "@/lib/domain/signal";

export interface RiskItem {
  id: string;
  sessionId: string;
  title: string;
  riskLevel: RiskLevel;
}

export interface RiskBlockProps {
  items: RiskItem[];
  onSelect: (id: string, sessionId: string) => void;
}

export function RiskBlock({ items, onSelect }: RiskBlockProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="bg-white overflow-hidden rounded-lg border border-[var(--layer-2-border)] border-l-2 border-l-red-500/80"
      aria-label="Risk"
    >
      <header className="px-4 py-3 border-b border-[var(--layer-2-border)]">
        <h2 className="text-[12px] font-medium uppercase tracking-wider text-red-600/90">
          Risk
        </h2>
      </header>
      <ul className="divide-y divide-[var(--layer-2-border)]">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id, item.sessionId)}
              className="w-full text-left px-4 py-2.5 text-[13px] text-[hsl(var(--text-primary-strong))] hover:bg-black/[0.02] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--accent-operational)]"
            >
              <span className="truncate">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
