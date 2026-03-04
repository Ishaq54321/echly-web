"use client";

import React, { memo } from "react";

interface TicketItemProps {
  id: string;
  title: string;
  isResolved?: boolean;
  /** When true, shows skipped (deferred) styling. Takes precedence over isResolved for display. */
  isSkipped?: boolean;
  index?: number;
  impactLabel?: string | null;
  active?: boolean;
  onSelect: (id: string) => void;
}

function TicketItemInner({
  id,
  title,
  impactLabel,
  active,
  onSelect,
}: TicketItemProps) {
  const handleClick = () => {
    onSelect(id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-[var(--motion-duration)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] ${
        active
          ? "bg-[var(--color-primary-soft)] shadow-[0_0_0_1px_rgba(26,86,219,0.15)]"
          : "hover:bg-[var(--layer-2-hover-bg)]"
      }`}
      aria-current={active ? "true" : undefined}
    >
      {/* Selected: vertical bar on left (not a status dot) */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full h-5 bg-[var(--color-primary)]"
          aria-hidden
        />
      )}
      <span className="relative min-w-0 flex-1 truncate text-[13px] leading-[1.4] py-0.5">
        <span
          className={`truncate block ${
            active
              ? "text-[hsl(var(--text-primary-strong))] font-medium"
              : "text-[hsl(var(--text-secondary-soft))]"
          }`}
        >
          {title || "Untitled"}
        </span>
      </span>
      {impactLabel && (
        <span className="shrink-0 rounded-full border border-[var(--layer-2-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--text-tertiary))] bg-[var(--layer-1-bg)]">
          {impactLabel}
        </span>
      )}
    </button>
  );
}

export const TicketItem = memo(TicketItemInner);

