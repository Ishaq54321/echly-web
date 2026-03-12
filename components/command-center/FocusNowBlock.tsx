"use client";

import React from "react";

export interface FocusItem {
  id: string;
  sessionId: string;
  title: string;
  impactScore: number;
}

export interface FocusNowBlockProps {
  items: FocusItem[];
  onSelect: (id: string, sessionId: string) => void;
}

export function FocusNowBlock({ items, onSelect }: FocusNowBlockProps) {
  const top = items.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <section
      className="bg-white overflow-hidden rounded-lg border border-[var(--layer-2-border)]"
      aria-label="Focus now"
    >
      <header className="px-4 py-3 border-b border-[var(--layer-2-border)]">
        <h2 className="text-[12px] font-medium uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
          Focus now
        </h2>
      </header>
      <ul className="divide-y divide-[var(--layer-2-border)]">
        {top.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id, item.sessionId)}
              className="w-full text-left px-4 py-2.5 text-[13px] text-[hsl(var(--text-primary-strong))] hover:bg-black/[0.02] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-300"
            >
              <span className="tabular-nums text-[hsl(var(--text-tertiary))] mr-2 text-[11px]">
                {item.impactScore}
              </span>
              <span className="truncate">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
