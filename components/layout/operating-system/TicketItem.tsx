"use client";

import React, { memo } from "react";

interface TicketItemProps {
  id: string;
  title: string;
  isResolved?: boolean;
  index?: number;
  impactLabel?: string | null;
  active?: boolean;
  onSelect: (id: string) => void;
}

function TicketItemInner({
  id,
  title,
  isResolved,
  impactLabel,
  active,
  onSelect,
}: TicketItemProps) {
  const handleClick = () => {
    onSelect(id);
  };

  const statusDotClass = isResolved
    ? "bg-emerald-500/70"
    : "bg-amber-400/90";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group flex w-full items-center gap-3 px-3 h-12 rounded-md text-left transition-colors duration-120 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-operational)] ${
        active
          ? "bg-white text-[hsl(var(--text-primary-strong))]"
          : "hover:bg-black/[0.03] text-[hsl(var(--text-secondary-soft))]"
      }`}
      aria-current={active ? "true" : undefined}
    >
      <span className="w-5 flex items-center justify-center shrink-0" aria-hidden>
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
      </span>
      <span className="relative min-w-0 flex-1 truncate text-[13px]">
        <span
          className={`truncate ${
            active
              ? "text-[hsl(var(--text-primary-strong))] font-medium"
              : "text-[hsl(var(--text-secondary-soft))]"
          }`}
        >
          {title || "Untitled"}
        </span>
      </span>
      {impactLabel && (
        <span className="shrink-0 rounded-full border border-[var(--layer-2-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--text-tertiary))] bg-white">
          {impactLabel}
        </span>
      )}
    </button>
  );
}

export const TicketItem = memo(TicketItemInner);

