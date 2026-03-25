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
  /** When true, applies a brief highlight animation (new ticket from realtime). */
  isNewTicket?: boolean;
}

function TicketItemInner({
  id,
  title,
  impactLabel,
  active,
  onSelect,
  isNewTicket = false,
}: TicketItemProps) {
  const handleClick = () => {
    onSelect(id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-ticket-id={id}
      className={`sidebar-item sidebar-row-interactive group relative flex w-full items-center gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration-fast)] hover:bg-[#F1F5F9] ${
        active
          ? "bg-[#E8F0FF]"
          : ""
      } ${isNewTicket ? "echly-new-ticket-highlight" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      <span className="relative min-w-0 flex-1 truncate text-[13px] leading-[1.4] py-0.5">
        <span
          className={`truncate block ${
            active
              ? "text-[#1D4ED8] font-medium"
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

