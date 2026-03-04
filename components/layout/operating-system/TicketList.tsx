"use client";

import React, { useMemo, useState, memo, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Check, Search, MoreVertical } from "lucide-react";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import { TicketItem } from "./TicketItem";

export interface TicketListProps {
  /** Session header (left sidebar top) */
  sessionTitle?: string;
  totalCount?: number;
  openCount?: number;
  resolvedCount?: number;
  skippedCount?: number;
  /** Optional: editable session title */
  isEditingSessionTitle?: boolean;
  sessionTitleDraft?: string;
  onSessionTitleChange?: (v: string) => void;
  onSessionTitleSave?: () => void;
  onSessionTitleCancel?: () => void;
  onSessionTitleEdit?: () => void;
  isSavingSessionTitle?: boolean;
  saveSessionTitleSuccess?: boolean;
  /** List */
  items: Feedback[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loadingMore?: boolean;
  hasMore?: boolean;
  hasReachedLimit?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  /** Ref for the scrollable list container (for lazy-load-on-scroll). */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  /** Called when the scroll container DOM node is attached (so hook can attach observer). */
  onScrollContainerReady?: () => void;
  /** Mark all tickets in this session as resolved. */
  onMarkAllTicketsResolved?: () => void;
  /** Mark all tickets in this session as unresolved. */
  onMarkAllTicketsUnresolved?: () => void;
}

function TicketListInner({
  sessionTitle = "Session",
  totalCount,
  openCount,
  resolvedCount,
  skippedCount,
  isEditingSessionTitle = false,
  sessionTitleDraft,
  onSessionTitleChange,
  onSessionTitleSave,
  onSessionTitleCancel,
  onSessionTitleEdit,
  isSavingSessionTitle = false,
  saveSessionTitleSuccess = false,
  items,
  selectedId,
  onSelect,
  loadingMore = false,
  hasMore = false,
  hasReachedLimit = false,
  loadMoreRef,
  scrollContainerRef,
  onScrollContainerReady,
  onMarkAllTicketsResolved,
  onMarkAllTicketsUnresolved,
}: TicketListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const sidebarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(e.target as Node)) setSidebarMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [sidebarMenuOpen]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openExpanded, setOpenExpanded] = useState(true);
  const [resolvedExpanded, setResolvedExpanded] = useState(false);
  const scrollContainerReadySent = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const total = typeof totalCount === "number" ? totalCount : items.length;
  const open =
    typeof openCount === "number"
      ? openCount
      : items.filter((i) => getTicketStatus(i) === "open").length;
  const skipped =
    typeof skippedCount === "number"
      ? skippedCount
      : items.filter((i) => getTicketStatus(i) === "skipped").length;
  const resolved =
    typeof resolvedCount === "number"
      ? resolvedCount
      : items.filter((i) => getTicketStatus(i) === "resolved").length;

  const meta =
    total > 0
      ? [
          `${total} total`,
          `${open} open`,
          ...(skipped > 0 ? [`${skipped} skipped`] : []),
          `${resolved} resolved`,
        ].join(" · ")
      : "0 total";

  const getTime = (f: Feedback): number => {
    const createdSeconds =
      typeof f.createdAt?.seconds === "number" ? f.createdAt.seconds : null;
    if (createdSeconds != null) return createdSeconds * 1000;
    if (typeof f.clientTimestamp === "number") return f.clientTimestamp;
    return 0;
  };

  const query = searchQuery.trim().toLowerCase();

  const { openItems, skippedItems, resolvedItems } = useMemo(() => {
    const sorted = [...items].sort((a, b) => getTime(b) - getTime(a));
    const filtered = query
      ? sorted.filter((f) => f.title.toLowerCase().includes(query))
      : sorted;
    return {
      openItems: filtered.filter((i) => getTicketStatus(i) === "open"),
      skippedItems: filtered.filter((i) => getTicketStatus(i) === "skipped"),
      resolvedItems: filtered.filter((i) => getTicketStatus(i) === "resolved"),
    };
  }, [items, query]);

  const [skippedExpanded, setSkippedExpanded] = useState(false);

  const canEditTitle =
    typeof onSessionTitleChange === "function" &&
    typeof onSessionTitleSave === "function" &&
    typeof onSessionTitleEdit === "function";

  return (
    <div className="flex flex-col h-full min-h-0 rounded-r-[var(--radius-lg)] bg-[var(--layer-1-bg)] shadow-[var(--shadow-level-1)] border-r border-[var(--layer-1-border)] overflow-hidden">
      {/* Session header */}
      <div className="shrink-0 px-4 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2 min-w-0">
          {isEditingSessionTitle && canEditTitle ? (
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={sessionTitleDraft ?? sessionTitle}
                onChange={(e) => onSessionTitleChange?.(e.target.value)}
                onBlur={() => onSessionTitleSave?.()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") onSessionTitleCancel?.();
                }}
                className="w-full text-[15px] font-semibold leading-tight text-[hsl(var(--text-primary-strong))] bg-[var(--layer-2-bg)] border border-[var(--layer-2-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-shadow duration-[var(--motion-duration-fast)]"
                aria-label="Edit session title"
                autoFocus
              />
              {isSavingSessionTitle && (
                <p className="mt-1.5 text-[11px] text-[hsl(var(--text-tertiary))]">
                  Saving…
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <h1 className="text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] truncate">
                  {sessionTitle}
                </h1>
                {saveSessionTitleSuccess && (
                  <Check className="h-3.5 w-3.5 text-[var(--color-success)] shrink-0" aria-hidden />
                )}
              </div>
              <div className="relative shrink-0" ref={sidebarMenuRef}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSidebarMenuOpen((v) => !v); }}
                  className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
                  aria-label="Session options"
                  aria-expanded={sidebarMenuOpen}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden />
                </button>
                {sidebarMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 py-1.5 min-w-[200px] rounded-xl bg-[var(--layer-1-bg)] border border-[var(--layer-1-border)] shadow-[var(--shadow-level-4)] z-[100]">
                    {canEditTitle && (
                      <button
                        type="button"
                        onClick={() => { onSessionTitleEdit?.(); setSidebarMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-[13px] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer rounded-xl mx-1"
                      >
                        Rename review
                      </button>
                    )}
                    {onMarkAllTicketsResolved && (
                      <button
                        type="button"
                        onClick={() => { onMarkAllTicketsResolved(); setSidebarMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-[13px] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer rounded-xl mx-1"
                      >
                        Resolve all open tickets
                      </button>
                    )}
                    {onMarkAllTicketsUnresolved && (
                      <button
                        type="button"
                        onClick={() => { onMarkAllTicketsUnresolved(); setSidebarMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-[13px] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer rounded-xl mx-1"
                      >
                        Reopen all resolved tickets
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <p className="mt-1.5 text-[12px] text-[hsl(var(--text-tertiary))] leading-relaxed">
          {meta}
        </p>
        <div className="mt-4">
          <div className="flex items-center gap-2.5 h-10 rounded-xl bg-[var(--layer-2-bg)] border border-[var(--layer-2-border)] px-3 focus-within:border-[var(--accent-operational-border)] focus-within:ring-2 focus-within:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration-fast)]">
            <Search className="h-4 w-4 shrink-0 text-[hsl(var(--text-tertiary))]" aria-hidden />
            <input
              type="search"
              placeholder="Search tickets..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 min-w-0 h-full bg-transparent border-0 text-[13px] placeholder:text-[hsl(var(--text-tertiary))] text-[hsl(var(--text-primary-strong))] focus:outline-none focus:ring-0"
              aria-label="Search tickets"
            />
          </div>
        </div>
      </div>

      {/* Status sections: Open → Skipped (if >0) → Resolved. Soft pill badges, no hard blocks. */}
      <div
        ref={(el) => {
          if (scrollContainerRef) (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (el && !scrollContainerReadySent.current) {
            scrollContainerReadySent.current = true;
            onScrollContainerReady?.();
          }
        }}
        className="flex-1 min-h-0 overflow-y-auto px-2 pb-4"
      >
        {/* Open */}
        <section className="pt-1">
          <button
            type="button"
            onClick={() => setOpenExpanded((x) => !x)}
            className="sticky top-0 z-10 flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
            aria-expanded={openExpanded}
          >
            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[var(--color-primary-soft)] text-[12px] font-semibold tabular-nums text-[var(--color-primary)]">
              {open}
            </span>
            <span className="text-[12px] font-medium text-[hsl(var(--text-primary-strong))] tracking-[-0.01em]">
              Open
            </span>
            <span className="ml-auto shrink-0 text-[hsl(var(--text-tertiary))]">
              {openExpanded ? (
                <ChevronDown className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden />
              )}
            </span>
          </button>
          {openExpanded && (
            <div className="pl-1 pr-1 pt-0.5 pb-2 space-y-0.5">
              {openItems.map((item, idx) => (
                <TicketItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  isResolved={false}
                  isSkipped={false}
                  index={idx + 1}
                  active={item.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
              {openItems.length === 0 && (
                <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                  No open tickets
                </p>
              )}
            </div>
          )}
        </section>

        {/* Skipped — only if count > 0. Soft amber pill. */}
        {skipped > 0 && (
          <section className="pt-2">
            <button
              type="button"
              onClick={() => setSkippedExpanded((x) => !x)}
              className="sticky top-0 z-10 flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
              aria-expanded={skippedExpanded}
            >
              <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[var(--color-skipped-soft)] text-[12px] font-semibold tabular-nums text-[var(--color-skipped)]">
                {skipped}
              </span>
              <span className="text-[12px] font-medium text-[hsl(var(--text-primary-strong))] tracking-[-0.01em]">
                Skipped
              </span>
              <span className="ml-auto shrink-0 text-[hsl(var(--text-tertiary))]">
                {skippedExpanded ? (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden />
                )}
              </span>
            </button>
            {skippedExpanded && (
              <div className="pl-1 pr-1 pt-0.5 pb-2 space-y-0.5">
                {skippedItems.map((item, idx) => (
                  <TicketItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    isResolved={false}
                    isSkipped={true}
                    index={openItems.length + idx + 1}
                    active={item.id === selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Resolved */}
        <section className="pt-2">
          <button
            type="button"
            onClick={() => setResolvedExpanded((x) => !x)}
            className="sticky top-0 z-10 flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
            aria-expanded={resolvedExpanded}
          >
            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[var(--color-success-soft)] text-[12px] font-semibold tabular-nums text-[var(--color-success)]">
              {resolved}
            </span>
            <span className="text-[12px] font-medium text-[hsl(var(--text-primary-strong))] tracking-[-0.01em]">
              Resolved
            </span>
            <span className="ml-auto shrink-0 text-[hsl(var(--text-tertiary))]">
              {resolvedExpanded ? (
                <ChevronDown className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden />
              )}
            </span>
          </button>
          {resolvedExpanded && (
            <div className="pl-1 pr-1 pt-0.5 pb-2 space-y-0.5">
              {resolvedItems.map((item, idx) => (
                <TicketItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  isResolved={true}
                  isSkipped={false}
                  index={openItems.length + skippedItems.length + idx + 1}
                  active={item.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
              {resolvedItems.length === 0 && !loadingMore && (
                <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                  No resolved tickets
                </p>
              )}
              {resolvedExpanded && loadingMore && (
                <div className="px-3 py-2 space-y-1.5" aria-hidden>
                  <div className="h-10 rounded-xl bg-[var(--layer-2-border)]/40 animate-pulse" />
                  <div className="h-10 rounded-xl bg-[var(--layer-2-border)]/30 animate-pulse" />
                </div>
              )}
            </div>
          )}
        </section>

        {loadMoreRef && (
          <>
            <div ref={loadMoreRef} aria-hidden />
            {loadingMore && (
              <div className="flex justify-center py-4" aria-hidden>
                <svg className="animate-spin h-5 w-5 text-[hsl(var(--text-tertiary))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const TicketList = memo(TicketListInner);
