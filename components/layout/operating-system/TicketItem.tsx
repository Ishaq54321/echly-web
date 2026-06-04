"use client";

import React, { memo } from "react";
import { getTicketIconFromTags } from "@/lib/utils/getTicketIconFromTags";
import { Tooltip } from "@/components/ui/Tooltip";

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
  tags?: string[] | null;
  /** When true, render an icon-only square (for the collapsed sidebar rail). */
  collapsed?: boolean;
}

function TicketItemInner({
  id,
  title,
  isResolved,
  impactLabel,
  active,
  onSelect,
  isNewTicket = false,
  tags,
  collapsed = false,
}: TicketItemProps) {
  const IconComponent = getTicketIconFromTags(tags, title);

  const handleClick = () => {
    onSelect(id);
  };

  const iconSquare = (
    <span
      className={`w-[30px] h-[30px] rounded-[var(--radius-sm)] grid place-items-center shrink-0 ${
        active
          ? 'bg-[var(--brand)] text-white'
          : isResolved
          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
          : 'bg-[var(--surface-hover)] text-[var(--text-secondary)]'
      }`}
    >
      {isResolved ? (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <IconComponent size={14} strokeWidth={2} />
      )}
    </span>
  );

  if (collapsed) {
    return (
      <Tooltip content={title?.trim() || "Untitled ticket"} position="right">
        <button
          type="button"
          onClick={handleClick}
          data-ticket-id={id}
          aria-current={active ? "true" : undefined}
          aria-label={title?.trim() || "Untitled ticket"}
          className={`tl-vrow group relative grid place-items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 p-1 rounded-[8px] border-0 bg-transparent transition-colors ${
            isNewTicket ? "echly-new-ticket-highlight" : ""
          }`}
        >
          {iconSquare}
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-ticket-id={id}
      className={`tl-vrow group relative flex w-full items-center gap-2.5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 px-3 py-2.5 rounded-[7px] text-[14px] tracking-[-0.005em] transition-colors ${
        active
          ? 'bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold'
          : isResolved
          ? 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
          : 'text-[var(--text-heading)] hover:bg-[var(--surface-hover)]'
      } ${isNewTicket ? "echly-new-ticket-highlight" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      {iconSquare}
      <span className="relative min-w-0 flex-1 truncate text-[14px] leading-[1.4]">
        {title?.trim() ? title : null}
      </span>
      {impactLabel && (
        <span className="shrink-0 text-[11px] font-medium text-[var(--text-tertiary)] tabular-nums">
          {impactLabel}
        </span>
      )}
    </button>
  );
}

export const TicketItem = memo(TicketItemInner);

