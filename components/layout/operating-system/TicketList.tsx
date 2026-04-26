"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import { TicketItem } from "./TicketItem";

function formatRelativeTime(timestamp: any): string {
  try {
    const date = typeof timestamp === 'object' && 'seconds' in timestamp
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Just now";
  }
}

export interface TicketListProps {
  counts: {
    total: number;
    open: number;
    resolved: number;
  };
  /** True while session counter fields are not yet available (e.g. session doc loading). */
  countsLoading?: boolean;
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
  /** When set (e.g. from ?ticket= deep link), expand the section containing this id and scroll to it. */
  scrollToId?: string | null;
  /** When set with `onOpenExpandedChange`, controls the Open section (mutual exclusion is parent’s responsibility). */
  openExpanded?: boolean;
  /** Header click: parent toggles `openExpanded` (e.g. closes Resolved when opening Open). */
  onOpenExpandedChange?: () => void;
  /** When set with `onResolvedExpandedChange`, controls the Resolved section expand state (for lazy-loaded resolved data). */
  resolvedExpanded?: boolean;
  /** Header click: parent toggles `resolvedExpanded` (e.g. closes Open when opening Resolved). */
  onResolvedExpandedChange?: () => void;
  /** True while the first page of resolved tickets is being fetched. */
  isLoadingResolved?: boolean;
  /** When true, list rows come from `searchResults` (not lazy-loaded `items`). */
  isSearchMode?: boolean;
  searchResults?: Feedback[];
  /** True while `/api/feedback/search` is in flight. */
  searchLoading?: boolean;
  sessionTitle?: string;
  workspaceName?: string;
  updatedAt?: any;
  viewCount?: number;
}

/** Skeleton list for Open / Resolved section bodies while loading. */
function TicketListSectionLoading() {
  return (
    <div className="flex flex-col gap-0" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1 px-6 py-2.5">
          <div
            className="h-3.5 rounded-md bg-muted-foreground/15 animate-pulse"
            style={{ width: `${55 + (i % 4) * 10}%` }}
          />
          <div className="h-3 w-20 rounded-md bg-muted-foreground/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function TicketListInner({
  counts,
  countsLoading = false,
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
  scrollToId,
  openExpanded: openExpandedProp,
  onOpenExpandedChange,
  resolvedExpanded: resolvedExpandedProp,
  onResolvedExpandedChange,
  isLoadingResolved: isLoadingResolvedFromParent,
  isSearchMode = false,
  searchResults = [],
  searchLoading = false,
  sessionTitle,
  workspaceName,
  updatedAt,
  viewCount,
}: TicketListProps) {
  const scrollToIdApplied = useRef(false);
  const [openExpandedInternal, setOpenExpandedInternal] = useState(true);
  const openExpandedControlled =
    typeof openExpandedProp === "boolean" && typeof onOpenExpandedChange === "function";
  const openExpanded = openExpandedControlled ? openExpandedProp : openExpandedInternal;
  const [resolvedExpandedInternal, setResolvedExpandedInternal] = useState(false);
  const resolvedExpandedControlled =
    typeof resolvedExpandedProp === "boolean" && typeof onResolvedExpandedChange === "function";
  const resolvedExpanded = resolvedExpandedControlled
    ? resolvedExpandedProp
    : resolvedExpandedInternal;
  const setResolvedExpandedInternalOnly = useCallback(
    (next: boolean) => {
      if (!resolvedExpandedControlled) setResolvedExpandedInternal(next);
    },
    [resolvedExpandedControlled]
  );
  const scrollContainerReadySent = useRef(false);
  const internalContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);

  const { total, open, resolved } = counts;

  // Detect user-driven scroll so we don't fight the browser during manual navigation.
  useEffect(() => {
    const el = internalContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      // Ignore scroll events caused by our own "pin to TOP" behavior.
      if (el.scrollTop > 0) isUserScrollingRef.current = true;
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Optional: reset the "user scrolling" latch when we enter an empty loading state
  // (typically session change / initial load), so the list can be pinned to TOP.
  useEffect(() => {
    if (countsLoading && items.length === 0) {
      isUserScrollingRef.current = false;
    }
  }, [countsLoading, items.length]);

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
    const source = isSearchMode ? searchResults : items;
    return {
      openItems: source.filter((i) => getTicketStatus(i) === "open"),
      resolvedItems: source.filter((i) => getTicketStatus(i) === "resolved"),
    };
  }, [isSearchMode, items, searchResults]);

  const filteredTotalCount = openItems.length + resolvedItems.length;
  const showSearchEmpty =
    isSearchMode &&
    !searchLoading &&
    filteredTotalCount === 0 &&
    !countsLoading &&
    !loadingMore;

  const missingOpenCount = Math.max(open - loadedOpenCount, 0);
  const missingResolvedCount = Math.max(resolved - loadedResolvedCount, 0);

  const activeLoadingSection = (() => {
    if (!loadingMore) return null;
    if (missingOpenCount > 0) return "open" as const;
    if (missingResolvedCount > 0) return "resolved" as const;
    return null;
  })();

  const isLoadingOpenPagination =
    activeLoadingSection === "open" && openExpanded && openItems.length > 0;
  const isLoadingOpen =
    isLoadingOpenPagination || (isSearchMode && searchLoading && openExpanded);

  const isLoadingResolvedMore =
    activeLoadingSection === "resolved" && resolvedExpanded && resolvedItems.length > 0;
  const isLoadingResolvedFirst =
    Boolean(isLoadingResolvedFromParent) && resolvedExpanded && resolvedItems.length === 0 && resolved > 0;
  const isLoadingResolvedSearch = isSearchMode && searchLoading && resolvedExpanded;
  const showResolvedPendingLoader =
    (isLoadingResolvedFirst && !countsLoading) || isLoadingResolvedSearch;
  const showResolvedListLoading = showResolvedPendingLoader || isLoadingResolvedMore;

  // Deep link: expand section containing scrollToId (uncontrolled only; parent handles controlled `scrollToId`).
  useEffect(() => {
    if (!scrollToId || scrollToIdApplied.current) return;
    if (openItems.some((i) => i.id === scrollToId) && !openExpandedControlled) {
      setOpenExpandedInternal(true);
    }
    if (resolvedItems.some((i) => i.id === scrollToId) && !resolvedExpandedControlled) {
      setResolvedExpandedInternalOnly(true);
    }
    scrollToIdApplied.current = true;
  }, [
    scrollToId,
    openItems,
    resolvedItems,
    openExpandedControlled,
    resolvedExpandedControlled,
    setResolvedExpandedInternalOnly,
  ]);

  useEffect(() => {
    if (!scrollToId) return;
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-ticket-id="${CSS.escape(scrollToId)}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [scrollToId, openExpanded, resolvedExpanded]);

  useEffect(() => {
    const container = internalContainerRef.current;
    if (!container) return;
    const rafId = requestAnimationFrame(() => {
      // Don't override deep-link scrolling behavior.
      if (scrollToId) return;

      if (!isUserScrollingRef.current) {
        // Force scroll to top if user hasn't interacted
        internalContainerRef.current!.scrollTop = 0;
        return;
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [items.length, scrollToId]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Session Info Header */}
      {sessionTitle && (
        <div className="shrink-0 px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[16px] font-semibold text-[var(--text-heading)] leading-[1.3] truncate flex-1 min-w-0">
              {sessionTitle}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-xs)] border border-[var(--border)] text-[12px] font-medium text-[var(--text-body)] tabular-nums shrink-0">
              {viewCount ?? 0} views
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-[var(--text-tertiary)]">
            <span className="font-medium text-[var(--text-tertiary)]">{workspaceName}</span>
            <span>·</span>
            <span title={updatedAt ? new Date(typeof updatedAt === 'object' && 'seconds' in updatedAt ? updatedAt.seconds * 1000 : updatedAt).toLocaleString() : undefined}>
              {updatedAt ? formatRelativeTime(updatedAt) : "Just now"}
            </span>
          </div>
        </div>
      )}
      {/* Status sections: Open → Resolved. Soft pill badges, no hard blocks. */}
      <div
        ref={(el) => {
          internalContainerRef.current = el;
          // We intentionally mutate `.current` on the passed-in ref.
          // eslint-disable-next-line react-hooks/immutability
          if (scrollContainerRefRef) (scrollContainerRefRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (el && !scrollContainerReadySent.current) {
            scrollContainerReadySent.current = true;
            onScrollContainerReady?.();
          }
        }}
        className="sidebar-list h-full max-h-[100vh] overflow-y-auto flex-1 min-h-0 pb-4"
      >
        {showSearchEmpty && (
          <div className="px-3 py-4 mt-3 text-[12px] font-normal text-[var(--text-tertiary)]">
            No tickets found
          </div>
        )}

        {/* Open */}
        <section className="pt-3">
          {!countsLoading && (
            <>
              <button
                  type="button"
                  onClick={() => {
                    if (openExpandedControlled) onOpenExpandedChange?.();
                    else setOpenExpandedInternal((x) => !x);
                  }}
                  className="z-10 bg-transparent relative flex w-full items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-sm)] text-left border-none shadow-none hover:bg-[var(--surface-hover)] transition-colors duration-150 cursor-pointer"
                  aria-expanded={openExpanded}
                >
                  <span className="min-w-[20px] h-[20px] rounded-[var(--radius-xs)] flex items-center justify-center text-[12px] font-bold tabular-nums bg-[var(--brand-subtle)] text-[var(--brand)]">
                    {open}
                  </span>
                  <span className="text-[14px] font-semibold text-[var(--text-heading)] flex-1">
                    Open
                  </span>
                  <span className="ml-auto shrink-0 text-[var(--text-heading)] h-4 w-4">
                    {openExpanded ? (
                      <ChevronDown className="text-[var(--text-heading)] h-4 w-4" aria-hidden />
                    ) : (
                      <ChevronRight className="text-[var(--text-heading)] h-4 w-4" aria-hidden />
                    )}
                  </span>
                </button>
                {openExpanded && (
                  <div className="px-2 pt-0.5 pb-2 space-y-0 transition-opacity duration-150 ease-out">
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
                        {open === 0 ? (
                          <p className="px-3 py-3 text-[12px] text-[var(--text-tertiary)]">
                            No open tickets
                          </p>
                        ) : isSearchMode && searchLoading ? null : (
                          <TicketListSectionLoading />
                        )}
                      </>
                    )}
                    {isLoadingOpen && <TicketListSectionLoading />}
                  </div>
                )}
              </>
          )}
        </section>

        {/* Resolved */}
        <section className="pt-2">
          {!countsLoading && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (resolvedExpandedControlled) onResolvedExpandedChange?.();
                  else setResolvedExpandedInternalOnly(!resolvedExpanded);
                }}
                  className="z-10 bg-transparent relative flex w-full items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-sm)] text-left border-none shadow-none hover:bg-[var(--surface-hover)] transition-colors duration-150 cursor-pointer"
                  aria-expanded={resolvedExpanded}
                >
                  <span className="min-w-[20px] h-[20px] rounded-[var(--radius-xs)] flex items-center justify-center text-[12px] font-bold tabular-nums bg-[var(--color-success-bg)] text-[var(--color-success)]">
                    {resolved}
                  </span>
                  <span className="text-[14px] font-semibold text-[var(--text-heading)] flex-1">
                    Resolved
                  </span>
                  <span className="ml-auto shrink-0 text-[var(--text-heading)] h-4 w-4">
                    {resolvedExpanded ? (
                      <ChevronDown className="text-[var(--text-heading)] h-4 w-4" aria-hidden />
                    ) : (
                      <ChevronRight className="text-[var(--text-heading)] h-4 w-4" aria-hidden />
                    )}
                  </span>
                </button>
                {resolvedExpanded && (
                  <div className="px-2 pt-0.5 pb-2 space-y-0 transition-opacity duration-150 ease-out">
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
                    {resolvedItems.length === 0 && !showSearchEmpty && !(isSearchMode && searchLoading) && (
                      <>
                        {resolved === 0 ? (
                          <p className="px-3 py-3 text-[12px] text-[var(--text-tertiary)]">
                            No resolved tickets
                          </p>
                        ) : null}
                      </>
                    )}
                    {showResolvedListLoading && <TicketListSectionLoading />}
                  </div>
                )}
              </>
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
