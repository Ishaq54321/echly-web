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
      className={`sidebar-item sidebar-row-interactive group relative flex w-full items-center gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--surface-hover)] ${isNewTicket ? "echly-new-ticket-highlight" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      <span className="relative min-w-0 flex-1 truncate text-[14px] leading-[1.4] py-0.5">
        {title?.trim() ? (
          <span
            className={`truncate block ${
              active
                ? "text-[var(--text-heading)] font-[550]"
                : "text-[var(--text-body)] font-[450]"
            }`}
          >
            {title}
          </span>
        ) : null}
      </span>
      {impactLabel && (
        <span className="shrink-0 rounded-full border border-[var(--layer-2-border)] px-2 py-0.5 text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)] bg-[var(--layer-1-bg)]">
          {impactLabel}
        </span>
      )}
    </button>
  );
}

export const TicketItem = memo(TicketItemInner);

