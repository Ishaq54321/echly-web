"use client";

import React, { useMemo, useState, memo, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Check, Search, MoreVertical } from "lucide-react";
import type { Feedback } from "@/lib/domain/feedback";
import { TicketItem } from "./TicketItem";

export interface TicketListProps {
  /** Session header (left sidebar top) */
  sessionTitle?: string;
  totalCount?: number;
  openCount?: number;
  resolvedCount?: number;
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
  const open = typeof openCount === "number" ? openCount : items.filter((i) => !(i.isResolved ?? false)).length;
  const resolved =
    typeof resolvedCount === "number" ? resolvedCount : items.filter((i) => i.isResolved ?? false).length;

  const meta =
    total > 0
      ? [`${total} total`, `${open} open`, `${resolved} resolved`].join(" · ")
      : "0 total";

  const getTime = (f: Feedback): number => {
    const createdSeconds =
      typeof f.createdAt?.seconds === "number" ? f.createdAt.seconds : null;
    if (createdSeconds != null) return createdSeconds * 1000;
    if (typeof f.clientTimestamp === "number") return f.clientTimestamp;
    return 0;
  };

  const query = searchQuery.trim().toLowerCase();

  const { openItems, resolvedItems } = useMemo(() => {
    const sorted = [...items].sort((a, b) => getTime(b) - getTime(a));
    const filtered = query
      ? sorted.filter((f) => f.title.toLowerCase().includes(query))
      : sorted;
    return {
      openItems: filtered.filter((i) => !(i.isResolved ?? false)),
      resolvedItems: filtered.filter((i) => i.isResolved ?? false),
    };
  }, [items, query]);

  const canEditTitle =
    typeof onSessionTitleChange === "function" &&
    typeof onSessionTitleSave === "function" &&
    typeof onSessionTitleEdit === "function";

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--canvas-base)]">
      {/* Session header: static title or inline rename (from kebab), 3-dot menu */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-[var(--layer-1-border)]">
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
                className="w-full text-[15px] font-semibold leading-tight text-[hsl(var(--text-primary-strong))] bg-[#f5f5f5] border border-neutral-200/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent-operational)]/20 transition-[box-shadow] duration-[120ms]"
                aria-label="Edit session title"
                autoFocus
              />
              {isSavingSessionTitle && (
                <p className="mt-1 text-[11px] text-[hsl(var(--text-tertiary))]">
                  Saving…
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <h1 className="text-[15px] font-semibold leading-tight text-[hsl(var(--text-primary-strong))] truncate">
                  {sessionTitle}
                </h1>
                {saveSessionTitleSuccess && (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden />
                )}
              </div>
              <div className="relative shrink-0" ref={sidebarMenuRef}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSidebarMenuOpen((v) => !v); }}
                  className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:bg-neutral-100 hover:text-[hsl(var(--text-primary-strong))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-operational)]/20 transition-colors duration-150 cursor-pointer"
                  aria-label="Session options"
                  aria-expanded={sidebarMenuOpen}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden />
                </button>
                {sidebarMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1.5 min-w-[200px] rounded-lg bg-white border border-neutral-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-[100]">
                    {canEditTitle && (
                      <button
                        type="button"
                        onClick={() => { onSessionTitleEdit?.(); setSidebarMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-[12px] text-[hsl(var(--text-primary-strong))] hover:bg-neutral-50 transition-colors duration-150 cursor-pointer"
                      >
                        Rename review
                      </button>
                    )}
                    {onMarkAllTicketsResolved && (
                      <button
                        type="button"
                        onClick={() => { onMarkAllTicketsResolved(); setSidebarMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-[12px] text-[hsl(var(--text-primary-strong))] hover:bg-neutral-50 transition-colors duration-150 cursor-pointer"
                      >
                        Resolve all open tickets
                      </button>
                    )}
                    {onMarkAllTicketsUnresolved && (
                      <button
                        type="button"
                        onClick={() => { onMarkAllTicketsUnresolved(); setSidebarMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-[12px] text-[hsl(var(--text-primary-strong))] hover:bg-neutral-50 transition-colors duration-150 cursor-pointer"
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
        <p className="mt-1 text-[11px] text-[hsl(var(--text-tertiary))]">
          {meta}
        </p>
        <div className="mt-3 pt-3 border-t border-[var(--layer-2-border)]">
          <div className="flex items-center gap-2 h-9 rounded-lg bg-[#f5f5f5] border border-neutral-200/80 px-2.5 focus-within:border-neutral-300 focus-within:ring-1 focus-within:ring-[var(--accent-operational)]/20 transition-all duration-[120ms] ease-out">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
            <input
              type="search"
              placeholder="Search tickets..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 min-w-0 h-full bg-transparent border-0 text-[13px] placeholder:text-neutral-400 text-[hsl(var(--text-primary-strong))] focus:outline-none focus:ring-0"
              aria-label="Search tickets"
            />
          </div>
        </div>
      </div>

      {/* Collapsible OPEN / RESOLVED */}
      <div
        ref={(el) => {
          if (scrollContainerRef) (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (el && !scrollContainerReadySent.current) {
            scrollContainerReadySent.current = true;
            onScrollContainerReady?.();
          }
          // Do not reset scrollContainerReadySent when el is null (React ref cleanup), or
          // the next ref callback would notify again and cause an infinite loop.
        }}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <section className="border-b border-[var(--layer-2-border)]">
          <button
            type="button"
            onClick={() => setOpenExpanded((x) => !x)}
            className="sticky top-0 z-10 flex w-full items-center gap-2 px-3 py-2 text-left bg-amber-50/80 border-b border-amber-100/80 cursor-pointer"
            aria-expanded={openExpanded}
          >
            <span className="text-[12px] font-semibold tabular-nums text-amber-900/95">
              {open}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-amber-700/90">
              Open
            </span>
            <span className="ml-auto shrink-0">
              {openExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-amber-700/80" aria-hidden />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-amber-700/80" aria-hidden />
              )}
            </span>
          </button>
          {openExpanded && (
            <div className="px-2 py-1.5 space-y-0.5 bg-[var(--canvas-base)]">
              {openItems.map((item, idx) => (
                <TicketItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  isResolved={item.isResolved}
                  index={idx + 1}
                  active={item.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
              {openItems.length === 0 && (
                <p className="px-3 py-2 text-[12px] text-[hsl(var(--text-tertiary))]">
                  No open tickets
                </p>
              )}
            </div>
          )}
        </section>

        <section>
          <button
            type="button"
            onClick={() => setResolvedExpanded((x) => !x)}
            className="sticky top-0 z-10 flex w-full items-center gap-2 px-3 py-2 text-left bg-emerald-50/80 border-b border-emerald-100/80 cursor-pointer"
            aria-expanded={resolvedExpanded}
          >
            <span className="text-[12px] font-semibold tabular-nums text-emerald-900/95">
              {resolved}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-emerald-700/90">
              Resolved
            </span>
            <span className="ml-auto shrink-0">
              {resolvedExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-emerald-700/80" aria-hidden />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-emerald-700/80" aria-hidden />
              )}
            </span>
          </button>
          {resolvedExpanded && (
            <div className="px-2 py-1.5 space-y-0.5 bg-[var(--canvas-base)]">
              {resolvedItems.map((item, idx) => (
                <TicketItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  isResolved={item.isResolved}
                  index={openItems.length + idx + 1}
                  active={item.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
              {resolvedItems.length === 0 && !loadingMore && (
                <p className="px-3 py-2 text-[12px] text-[hsl(var(--text-tertiary))]">
                  No resolved tickets
                </p>
              )}
              {resolvedExpanded && loadingMore && (
                <div className="px-3 py-2 space-y-1.5" aria-hidden>
                  <div className="h-10 rounded bg-[var(--layer-2-border)]/40 animate-pulse" />
                  <div className="h-10 rounded bg-[var(--layer-2-border)]/30 animate-pulse" />
                </div>
              )}
            </div>
          )}
        </section>

        {loadMoreRef && (
          <>
            <div ref={loadMoreRef} aria-hidden />
            {loadingMore && (
              <div className="flex justify-center py-3" aria-hidden>
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
