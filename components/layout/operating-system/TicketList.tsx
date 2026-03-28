"use client";

import React, { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  /** Controlled sidebar search (SessionPageClient owns query + API). */
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  /** When true, list rows come from `searchResults` (not lazy-loaded `items`). */
  isSearchMode?: boolean;
  searchResults?: Feedback[];
  /** True while `/api/feedback/search` is in flight. */
  searchLoading?: boolean;
  /** When false, hides ticket search (e.g. public share). Default true. */
  showTicketSearch?: boolean;
  /** When false, hides session ⋮ overflow menu. Default true. */
  showSessionOverflowMenu?: boolean;
}

/** Unified spinner-only loading row for Open / Resolved section bodies (identical everywhere). */
function TicketListSectionLoading() {
  return (
    <div
      className="flex min-h-[40px] items-center justify-center py-4"
      aria-busy="true"
    >
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}

function TicketListInner({
  sessionTitle = "",
  counts,
  countsLoading = false,
  isEditingSessionTitle = false,
  sessionTitleDraft,
  onSessionTitleChange,
  onSessionTitleSave,
  onSessionTitleCancel,
  onSessionTitleEdit,
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
  openExpanded: openExpandedProp,
  onOpenExpandedChange,
  resolvedExpanded: resolvedExpandedProp,
  onResolvedExpandedChange,
  isLoadingResolved: isLoadingResolvedFromParent,
  searchQuery,
  onSearchQueryChange,
  isSearchMode = false,
  searchResults = [],
  searchLoading = false,
  showTicketSearch = true,
  showSessionOverflowMenu = true,
}: TicketListProps) {
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [sidebarMenuRect, setSidebarMenuRect] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const sidebarMenuRef = useRef<HTMLDivElement>(null);
  const sidebarMenuPortalRef = useRef<HTMLDivElement>(null);
  const sidebarMenuButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const skipTitleBlurSaveRef = useRef(false);
  const scrollToIdApplied = useRef(false);

  const updateSidebarMenuPosition = () => {
    const el = sidebarMenuButtonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSidebarMenuRect({ top: r.bottom, right: r.right });
  };

  useLayoutEffect(() => {
    if (!sidebarMenuOpen) {
      setSidebarMenuRect(null);
      return;
    }
    updateSidebarMenuPosition();
    const onReposition = () => updateSidebarMenuPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [sidebarMenuOpen]);

  useEffect(() => {
    if (!sidebarMenuOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sidebarMenuRef.current?.contains(t)) return;
      if (sidebarMenuPortalRef.current?.contains(t)) return;
      setSidebarMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sidebarMenuOpen]);
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

  const meta = (() => {
    if (countsLoading) return null;
    const base =
      total > 0
        ? [`${total} total`, `${open} open`, `${resolved} resolved`].join(" · ")
        : "0 total";
    return base;
  })();


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

  const canEditTitle =
    typeof onSessionTitleChange === "function" &&
    typeof onSessionTitleSave === "function" &&
    typeof onSessionTitleEdit === "function";

  useEffect(() => {
    if (!isEditingSessionTitle || !canEditTitle) return;
    const el = titleInputRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.focus();
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isEditingSessionTitle, canEditTitle]);

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
    <div className="sidebar flex flex-col h-full min-h-0 rounded-none bg-[#FAFBFC] overflow-hidden">
      {/* Session header */}
      <div className="sidebar-inner">
        <div className="sidebar-header z-20 shrink-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            {isEditingSessionTitle && canEditTitle ? (
              <div className="min-w-0 flex-1 flex items-center gap-1.5 text-[hsl(var(--text-primary-strong))]">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={sessionTitleDraft ?? sessionTitle ?? ""}
                  onChange={(e) => onSessionTitleChange?.(e.target.value)}
                  onBlur={() => {
                    if (skipTitleBlurSaveRef.current) {
                      skipTitleBlurSaveRef.current = false;
                      return;
                    }
                    onSessionTitleSave?.();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.target as HTMLInputElement).blur();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      skipTitleBlurSaveRef.current = true;
                      onSessionTitleCancel?.();
                    }
                  }}
                  className="session-title-input session-title-input--light-surface min-w-0 flex-1 min-h-[1.875rem] border-0 appearance-none truncate"
                  aria-label="Edit session title"
                />
                <button
                  type="button"
                  aria-label="Save title"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSessionTitleSave?.()}
                  className="shrink-0 inline-flex size-7 items-center justify-center rounded-md text-neutral-900 opacity-70 hover:opacity-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFBFC]"
                >
                  <Check className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
                </button>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  {canEditTitle ? (
                    <button
                      type="button"
                      onClick={() => onSessionTitleEdit?.()}
                      className="min-w-0 flex-1 min-h-[1.35rem] text-left truncate bg-transparent border-0 p-0 shadow-none cursor-text text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFBFC] rounded-sm"
                    >
                      {sessionTitle?.trim() ? sessionTitle : null}
                    </button>
                  ) : sessionTitle?.trim() ? (
                    <h1 className="text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] truncate">
                      {sessionTitle}
                    </h1>
                  ) : null}
                  {saveSessionTitleSuccess && (
                    <Check className="h-3.5 w-3.5 text-[var(--color-success)] shrink-0" aria-hidden />
                  )}
                </div>
                {showSessionOverflowMenu ? (
                  <div className="relative shrink-0" ref={sidebarMenuRef}>
                    <button
                      ref={sidebarMenuButtonRef}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sidebarMenuOpen) {
                          setSidebarMenuOpen(false);
                          return;
                        }
                        const el = sidebarMenuButtonRef.current;
                        if (el) {
                          const r = el.getBoundingClientRect();
                          setSidebarMenuRect({ top: r.bottom, right: r.right });
                        }
                        setSidebarMenuOpen(true);
                      }}
                      className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
                      aria-label="Session options"
                      aria-expanded={sidebarMenuOpen}
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </button>
                    {typeof document !== "undefined" &&
                      sidebarMenuOpen &&
                      sidebarMenuRect != null &&
                      createPortal(
                        <div
                          ref={sidebarMenuPortalRef}
                          className="p-[6px] w-max min-w-[180px] max-w-[240px] rounded-xl bg-[var(--layer-1-bg)] border border-[var(--layer-1-border)] shadow-[var(--shadow-level-4)] overflow-hidden"
                          style={{
                            position: "fixed",
                            zIndex: 9999,
                            top: sidebarMenuRect.top + 6,
                            right: Math.max(8, window.innerWidth - sidebarMenuRect.right),
                          }}
                          role="menu"
                        >
                          {onMarkAllTicketsResolved && (
                            <button
                              type="button"
                              onClick={() => {
                                onMarkAllTicketsResolved();
                                setSidebarMenuOpen(false);
                              }}
                              className="block w-full my-0.5 rounded-lg text-left whitespace-nowrap py-2 px-2.5 text-[13px] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] cursor-pointer border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:ring-inset"
                            >
                              Resolve all open tickets
                            </button>
                          )}
                          {onMarkAllTicketsUnresolved && (
                            <button
                              type="button"
                              onClick={() => {
                                onMarkAllTicketsUnresolved();
                                setSidebarMenuOpen(false);
                              }}
                              className="block w-full my-0.5 rounded-lg text-left whitespace-nowrap py-2 px-2.5 text-[13px] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] cursor-pointer border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:ring-inset"
                            >
                              Reopen all resolved tickets
                            </button>
                          )}
                        </div>,
                        document.body
                      )}
                  </div>
                ) : null}
              </>
            )}
          </div>
          {meta ? (
            <p className="mt-1.5 text-[12px] text-[hsl(var(--text-tertiary))] leading-relaxed">
              {meta}
            </p>
          ) : null}
          {showTicketSearch ? (
            <div className="mt-3">
              <div className="search-container">
                <Search className="search-icon" aria-hidden />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="search-input placeholder:text-[hsl(var(--text-tertiary))] text-[hsl(var(--text-primary-strong))]"
                  aria-label="Search tickets"
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    className="clear-icon"
                    aria-label="Clear search"
                    onClick={() => onSearchQueryChange("")}
                  >
                    <X className="w-4 h-4" strokeWidth={2} aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

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
          <div className="px-3 py-4 mt-3 text-[12px] font-normal text-[#9CA3AF]">
            No tickets found
          </div>
        )}

        {/* Open */}
        <section className="pt-1">
          <button
            type="button"
            onClick={() => {
              if (openExpandedControlled) onOpenExpandedChange?.();
              else setOpenExpandedInternal((x) => !x);
            }}
            className="z-10 bg-white relative flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border-none shadow-none hover:bg-white transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
            aria-expanded={openExpanded}
          >
            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[var(--color-primary-soft)] text-[12px] font-semibold tabular-nums text-[var(--color-primary)]">
              <span>{countsLoading ? "" : open}</span>
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
            <div className="pl-1 pr-1 pt-0.5 pb-2 space-y-0 transition-opacity duration-150 ease-out">
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
                  {countsLoading && !(isSearchMode && searchLoading) ? (
                    <TicketListSectionLoading />
                  ) : open === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
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
        </section>

        {/* Resolved */}
        <section className="pt-2">
          <button
            type="button"
            onClick={() => {
              if (resolvedExpandedControlled) onResolvedExpandedChange?.();
              else setResolvedExpandedInternalOnly(!resolvedExpanded);
            }}
            className="z-10 bg-white relative flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border-none shadow-none hover:bg-white transition-colors duration-[var(--motion-duration-fast)] cursor-pointer"
            aria-expanded={resolvedExpanded}
          >
            <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-[var(--color-success-soft)] text-[12px] font-semibold tabular-nums text-[var(--color-success)]">
              <span>{countsLoading ? "" : resolved}</span>
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
            <div className="pl-1 pr-1 pt-0.5 pb-2 space-y-0 transition-opacity duration-150 ease-out">
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
                  {countsLoading && !(isSearchMode && searchLoading) ? (
                    <TicketListSectionLoading />
                  ) : resolved === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-[hsl(var(--text-tertiary))]">
                      No resolved tickets
                    </p>
                  ) : null}
                </>
              )}
              {showResolvedListLoading && <TicketListSectionLoading />}
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
