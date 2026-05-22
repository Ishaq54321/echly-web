/**
 * TicketList — marketing forklift of components/layout/operating-system/TicketList.tsx
 *
 * Modifications from source:
 * - Removed `InviteMemberModal` import (Firebase-coupled) and its render; the
 *   "Invite Team" button's onClick is now a no-op (silent, per binding decision).
 * - Replaced the `Feedback` domain type + `getTicketStatus` with a local
 *   `DemoTicket` shape + inline status check (avoids dragging the domain module;
 *   getTicketStatus is just `isResolved ? "resolved" : "open"`).
 * - Dropped the lazy-load / pagination / search / deep-link machinery that never
 *   fires with a fully-loaded static array (loadMoreRef, scrollTo, searchResults,
 *   isLoadingResolved, etc.). The visible Open/Resolved collapsible structure,
 *   hero card, header row, and skeleton component are kept verbatim.
 * - All className strings, inline styles, copy text untouched.
 *
 * Kept pure imports: lucide icons, date util not needed, Tooltip, CanvasEmptyState,
 * illustrations, TicketItem (forklifted sibling).
 */
"use client";

import React, { useState } from "react";
import { ChevronRight, Eye, UsersRound } from "lucide-react";
import { TicketItem } from "./TicketItem";
import { Tooltip } from "@/components/ui/Tooltip";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoOpenTicketsIllu } from "@/components/empty/canvasIllustrations";

export interface DemoTicket {
  id: string;
  title: string;
  isResolved: boolean;
  tags?: string[] | null;
}

export interface TicketListProps {
  counts: { total: number; open: number; resolved: number };
  items: DemoTicket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  newTicketId?: string | null;
  workspaceName?: string;
  sessionTitle?: string;
  viewCount?: number;
  viewTooltip?: string;
  isWorkspaceMember?: boolean;
  /** Controlled Open section — parent enforces mutual exclusion. */
  openExpanded: boolean;
  onOpenExpandedChange: () => void;
  resolvedExpanded: boolean;
  onResolvedExpandedChange: () => void;
}

export function TicketList({
  counts,
  items,
  selectedId,
  onSelect,
  newTicketId = null,
  workspaceName,
  sessionTitle,
  viewCount,
  viewTooltip,
  isWorkspaceMember = false,
  openExpanded,
  onOpenExpandedChange,
  resolvedExpanded,
  onResolvedExpandedChange,
}: TicketListProps) {
  const { total, open, resolved } = counts;
  const openItems = items.filter((i) => !i.isResolved);
  const resolvedItems = items.filter((i) => i.isResolved);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden p-4">
      {/* Session / Views row */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[14px] font-semibold text-[var(--text-heading)] truncate">{workspaceName || 'Workspace'}</span>
        <Tooltip content={viewTooltip ?? `${viewCount ?? 0} views`} position="bottom">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors border-0 bg-transparent cursor-pointer"
          >
            <Eye size={14} strokeWidth={2} />
            {viewCount ?? 0} {(viewCount ?? 0) === 1 ? "View" : "Views"}
          </button>
        </Tooltip>
      </div>

      {/* Hero card */}
      <div
        className="mb-4 p-4 pb-3.5 rounded-[12px] relative overflow-hidden shrink-0"
        style={{
          background: 'radial-gradient(120% 110% at 100% 0%, rgba(90,73,191,0.10) 0%, rgba(90,73,191,0) 55%), linear-gradient(180deg, var(--brand-subtle) 0%, var(--surface-card) 100%)',
          border: '1px solid rgba(90,73,191,0.10)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[18px] font-semibold text-[var(--text-heading)] tracking-[-0.012em] leading-[1.35]">
            {sessionTitle || "Untitled"}
          </h3>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.5] mb-3 max-w-[80%]">
          {total} ticket{total !== 1 ? 's' : ''} in this session. Walk through, leave notes, resolve as you go.
        </p>
        {isWorkspaceMember && (
          <button
            type="button"
            onClick={() => { /* no-op: invite is stubbed in the marketing demo */ }}
            className="session-demo-invite-btn inline-flex items-center gap-1.5 h-8 px-4 rounded-[7px] text-white text-[13px] font-semibold tracking-[-0.005em] border-0 cursor-pointer transition-colors"
          >
            <UsersRound size={14} strokeWidth={2} />
            Invite Team
          </button>
        )}
      </div>

      {/* Status sections: Open → Resolved. Soft pill badges, no hard blocks. */}
      <div className="h-full overflow-y-auto flex-1 min-h-0 pb-2 -mx-4 px-4">
        {/* Open */}
        <section className="mb-4">
          <button
            type="button"
            onClick={onOpenExpandedChange}
            className="w-full flex items-center gap-2 text-[14px] font-medium text-[var(--text-heading)] px-3 py-2 tracking-[-0.01em] border-0 bg-transparent cursor-pointer hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)] transition-colors"
            aria-expanded={openExpanded}
          >
            <ChevronRight
              size={14}
              className={`text-[var(--text-tertiary)] transition-transform duration-200 ${openExpanded ? 'rotate-90' : ''}`}
            />
            <span>Open</span>
            <span className="text-[var(--text-heading)] text-[14px] font-medium">{open}</span>
          </button>
          {openExpanded && (
            <div className="mt-1 space-y-0.5 transition-opacity duration-150 ease-out">
              {openItems.map((item, idx) => (
                <TicketItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  isResolved={false}
                  index={idx + 1}
                  active={item.id === selectedId}
                  onSelect={onSelect}
                  isNewTicket={item.id === newTicketId}
                  tags={item.tags}
                />
              ))}
              {openItems.length === 0 && open === 0 && total > 0 ? (
                <div className="px-2 py-4">
                  <CanvasEmptyState
                    density="compact"
                    illustration={<NoOpenTicketsIllu />}
                    title="All tickets resolved"
                    description="Nice work! All tickets in this session have been resolved."
                  />
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* Resolved */}
        <section className="mb-4">
          <button
            type="button"
            onClick={onResolvedExpandedChange}
            className="w-full flex items-center gap-2 text-[14px] font-medium text-[var(--text-heading)] px-3 py-2 tracking-[-0.01em] border-0 bg-transparent cursor-pointer hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)] transition-colors"
            aria-expanded={resolvedExpanded}
          >
            <ChevronRight
              size={14}
              className={`text-[var(--text-tertiary)] transition-transform duration-200 ${resolvedExpanded ? 'rotate-90' : ''}`}
            />
            <span>Resolved</span>
            <span className="text-[var(--text-heading)] text-[14px] font-medium">{resolved}</span>
          </button>
          {resolvedExpanded && (
            <div className="mt-1 space-y-0.5 transition-opacity duration-150 ease-out">
              {resolvedItems.map((item, idx) => (
                <TicketItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  isResolved={true}
                  index={openItems.length + idx + 1}
                  active={item.id === selectedId}
                  onSelect={onSelect}
                  isNewTicket={item.id === newTicketId}
                  tags={item.tags}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
