"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Check, Search, MoreVertical, Loader2, X } from "lucide-react";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import { TicketItem } from "./TicketItem";

export interface TicketListProps {
  /** Session header (left sidebar top) */
  sessionTitle?: string;
  counts: {
    total: number;
    open: number;
    resolved: number;
  };
  /** True while `/api/feedback/counts` is still loading aggregation counts. */
  countsLoading?: boolean;
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
  /** When set, the ticket with this id shows a brief highlight animation (new ticket from realtime). */
  newTicketId?: string | null;
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
  /** When set (e.g. from ?ticket= deep link), expand the section containing this id and scroll to it. */
  scrollToId?: string | null;
}

function TicketListInner({
  sessionTitle = "Session",
  counts,
  countsLoading = false,
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
  newTicketId = null,
  loadingMore = false,
  hasMore = false,
  hasReachedLimit = false,
  loadMoreRef,
  scrollContainerRef: scrollContainerRefRef,
  onScrollContainerReady,
  onMarkAllTicketsResolved,
  onMarkAllTicketsUnresolved,
  scrollToId,
}: TicketListProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const sidebarMenuRef = useRef<HTMLDivElement>(null);
  const scrollToIdApplied = useRef(false);

  useEffect(() => {
    if (!sidebarMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(e.target as Node)) setSidebarMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [sidebarMenuOpen]);
  const [openExpanded, setOpenExpanded] = useState(true);
  const [resolvedExpanded, setResolvedExpanded] = useState(false);
  const scrollContainerReadySent = useRef(false);
  const internalContainerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);
  const prevItemsLengthRef = useRef(items.length);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 100);
    return () => clearTimeout(t);
  }, [query]);

  const { total, open, resolved } = counts;

  const meta = (() => {
    // Keep header pills consistent with the "…" loading treatment.
    // The `total` value must not be derived from lazy-loaded list length.
    if (countsLoading) return `… total · loading…`;

    const base =
      total > 0
        ? [`${total} total`, `${open} open`, `${resolved} resolved`].join(" · ")
        : "0 total";

    return base;
  })();

  const loadingValueClass = countsLoading ? "animate-pulse opacity-70" : "";

  const getTime = (f: Feedback): number => {
    const createdSeconds =
      typeof f.createdAt?.seconds === "number" ? f.createdAt.seconds : null;
    if (createdSeconds != null) return createdSeconds * 1000;
    if (typeof f.clientTimestamp === "number") return f.clientTimestamp;
    return 0;
  };

  const q = debouncedQuery;

  const { loadedOpenCount, loadedResolvedCount } = useMemo(() => {
    const seen = new Set<string>();
    let openLoaded = 0;
    let resolvedLoaded = 0;
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const status = getTicketStatus(item);
      if (status === "open") openLoaded += 1;
      if (status === "resolved") resolvedLoaded += 1;
    }
    return {
      loadedOpenCount: openLoaded,
      loadedResolvedCount: resolvedLoaded,
    };
  }, [items]);

  const { openItems, resolvedItems } = useMemo(() => {
    const sorted = [...items].sort((a, b) => getTime(b) - getTime(a));
    const seen = new Set<string>();
    const deduped = sorted.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    const filtered = q
      ? (() => {
          const startsWith: Feedback[] = [];
          const contains: Feedback[] = [];

          for (const f of deduped) {
            const title = f.title.toLowerCase();
            if (title.startsWith(q)) startsWith.push(f);
            else if (title.includes(q)) contains.push(f);
          }

          return [...startsWith, ...contains];
        })()
      : deduped;
    return {
      openItems: filtered.filter((i) => getTicketStatus(i) === "open"),
      resolvedItems: filtered.filter((i) => getTicketStatus(i) === "resolved"),
    };
  }, [items, q]);

  const filteredTotalCount = openItems.length + resolvedItems.length;
  const showSearchEmpty = q.length > 0 && filteredTotalCount === 0 && !countsLoading && !loadingMore;

  const missingOpenCount = Math.max(open - loadedOpenCount, 0);
  const missingResolvedCount = Math.max(resolved - loadedResolvedCount, 0);

  const activeLoadingSection = (() => {
    if (!loadingMore) return null;
    if (missingOpenCount > 0) return "open" as const;
    if (missingResolvedCount > 0) return "resolved" as const;
    return null;
  })();

  const isLoadingOpen = activeLoadingSection === "open" && openExpanded && openItems.length > 0;
  const isLoadingResolved = activeLoadingSection === "resolved" && resolvedExpanded && resolvedItems.length > 0;

  // Deep link: expand section containing scrollToId and scroll to it (once per mount).
  useEffect(() => {
    if (!scrollToId || scrollToIdApplied.current) return;
    if (openItems.some((i) => i.id === scrollToId)) setOpenExpanded(true);
    if (resolvedItems.some((i) => i.id === scrollToId)) setResolvedExpanded(true);
    scrollToIdApplied.current = true;
  }, [scrollToId, openItems, resolvedItems]);

  useEffect(() => {
    if (!scrollToId) return;
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-ticket-id="${CSS.escape(scrollToId)}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [scrollToId]);

  const canEditTitle =
    typeof onSessionTitleChange === "function" &&
    typeof onSessionTitleSave === "function" &&
    typeof onSessionTitleEdit === "function";

  useEffect(() => {
    const container = internalContainerRef.current;
    if (!container) return;
    const rafId = requestAnimationFrame(() => {
      const prevHeight = prevScrollHeightRef.current;
      const newHeight = container.scrollHeight;
      const heightDiff = newHeight - prevHeight;

      // Preserve relative position only when the user was near the previous bottom.
      const isNearBottom = container.scrollTop + container.clientHeight >= prevHeight - 5;
      if (prevItemsLengthRef.current !== items.length && prevHeight > 0 && isNearBottom && heightDiff > 0) {
        container.scrollTop += heightDiff;
      }

      prevScrollHeightRef.current = newHeight;
      prevItemsLengthRef.current = items.length;
    });
    return () => cancelAnimationFrame(rafId);
  }, [items.length]);

  return (
    <div className="sidebar flex flex-col h-full min-h-0 rounded-none bg-[#FAFBFC] overflow-hidden">
      {/* Session header */}
      <div className="sidebar-inner">
        <div className="sidebar-header z-20 shrink-0">
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
          <div className="mt-3">
            <div className="search-container">
              <Search className="search-icon" aria-hidden />
              <input
                type="search"
                placeholder="Search tickets..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input placeholder:text-[hsl(var(--text-tertiary))] text-[hsl(var(--text-primary-strong))]"
                aria-label="Search tickets"
              />
              {query ? (
                <button
                  type="button"
                  className="clear-icon"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X className="w-4 h-4" strokeWidth={2} aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Status sections: Open → Resolved. Soft pill badges, no hard blocks. */}
      <div
        ref={(el) => {
          internalContainerRef.current = el;
          // We intentionally mutate `.current` on the passed-in ref.
          // eslint-disable-next-line react-hooks/immutability
          if (scrollContainerRefRef) (scrollContainerRefRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (el && prevScrollHeightRef.current === 0) {
            prevScrollHeightRef.current = el.scrollHeight;
          }
          if (el && !scrollContainerReadySent.current) {
            scrollContainerReadySent.current = true;
            onScrollContainerReady?.();
          }
        }}
        className="sidebar-list h-full max-h-[100vh] overflow-y-auto flex-1 min-h-0 pb-4"
      >
        {showSearchEmpty && (
          <div className="px-3 py-4 mt-3 text-[12px] font-normal text-[#9CA3AF]">
            No tickets found
          </div>
        )}

        {/* Open */}
        <section className="pt-1">
          <button
            type="button"
            onClick={() => setOpenExpanded((x) => !x)}
            className="z-10 bg-white relative flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border-none shadow-none hover:bg-white transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
            aria-expanded={openExpanded}
          >
            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[var(--color-primary-soft)] text-[12px] font-semibold tabular-nums text-[var(--color-primary)]">
              <span className={loadingValueClass}>{countsLoading ? "…" : open}</span>
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
            <div className="pl-1 pr-1 pt-0.5 pb-2 space-y-0">
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
                />
              ))}
              {openItems.length === 0 && !showSearchEmpty && (
                <>
                  {countsLoading ? (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                      Loading open tickets…
                    </p>
                  ) : open === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                      No open tickets
                    </p>
                  ) : (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                      Loading open tickets…
                    </p>
                  )}
                </>
              )}
              {isLoadingOpen && (
                <div className="mt-2 flex items-center justify-center gap-2 py-3 text-[11px] text-[hsl(var(--text-tertiary))]">
                  <Loader2 className="h-3 w-3 animate-spin opacity-70" aria-hidden />
                  <span className="opacity-80">Loading more</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Resolved */}
        <section className="pt-2">
          <button
            type="button"
            onClick={() => setResolvedExpanded((x) => !x)}
            className="z-10 bg-white relative flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border-none shadow-none hover:bg-white transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
            aria-expanded={resolvedExpanded}
          >
            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[var(--color-success-soft)] text-[12px] font-semibold tabular-nums text-[var(--color-success)]">
              <span className={loadingValueClass}>{countsLoading ? "…" : resolved}</span>
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
            <div className="pl-1 pr-1 pt-0.5 pb-2 space-y-0">
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
                />
              ))}
              {resolvedItems.length === 0 && !loadingMore && !showSearchEmpty && (
                <>
                  {countsLoading ? (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                      Loading resolved tickets…
                    </p>
                  ) : resolved === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                      No resolved tickets
                    </p>
                  ) : (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                      Loading resolved tickets…
                    </p>
                  )}
                </>
              )}
              {isLoadingResolved && (
                <div className="mt-2 flex items-center justify-center gap-2 py-3 text-[11px] text-[hsl(var(--text-tertiary))]">
                  <Loader2 className="h-3 w-3 animate-spin opacity-70" aria-hidden />
                  <span className="opacity-80">Loading more</span>
                </div>
              )}
            </div>
          )}
        </section>

        {loadMoreRef && (
          <>
            {/* Sentinel used by IntersectionObserver in `useSessionFeedbackPaginated`. Must be measurable. */}
            <div ref={loadMoreRef} aria-hidden style={{ height: "1px" }} />
          </>
        )}
      </div>
    </div>
  );
}

export const TicketList = TicketListInner;
