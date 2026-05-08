"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, Eye, UsersRound, PencilLine } from "lucide-react";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";
import { formatDistanceToNow } from "date-fns";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import { TicketItem } from "./TicketItem";
import { Tooltip } from "@/components/ui/Tooltip";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import {
  NoTicketsIllu,
  TicketSearchEmptyIllu,
  NoOpenTicketsIllu,
  NoResolvedTicketsIllu,
} from "@/components/empty/canvasIllustrations";

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
  /** True once the session document has loaded — gates hero card skeleton vs real content. */
  sessionLoaded?: boolean;
  workspaceName?: string;
  updatedAt?: any;
  viewCount?: number;
  recentViewers?: Array<{ id: string; displayName: string | null; avatarUrl: string | null; isAnonymous: boolean; viewedAt: number }>;
  canRenameTitle?: boolean;
  onRenameTitle?: (title: string) => Promise<void>;
  /** True for workspace owners and members; false for cross-workspace invitees and anonymous viewers. */
  isWorkspaceMember?: boolean;
}

/** Skeleton list for Open / Resolved section bodies while loading.
 *  Mirrors real TicketItem dims (px-3 py-2.5, 30x30 icon, gap 10px, text 14px).
 *  First row is blue-tinted to mirror the active/selected state. */
const TICKET_SKEL_WIDTHS = ["70%", "60%", "50%", "65%", "55%", "72%", "48%", "63%"] as const;
function TicketListSectionLoading() {
  return (
    <div className="flex flex-col gap-0" aria-busy="true">
      {TICKET_SKEL_WIDTHS.map((width, i) => (
        <div key={i} className={`tl-skel-row ${i === 0 ? "tl-skel-row-active" : ""}`}>
          <div className={`tl-skel-ticket-icon ${i === 0 ? "skel-blue-strong" : "skel-block"}`} />
          <div
            className={`tl-skel-ticket-text ${i === 0 ? "skel-blue" : "skel-block"}`}
            style={{ width }}
          />
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
  sessionLoaded = false,
  workspaceName,
  updatedAt,
  viewCount,
  recentViewers,
  canRenameTitle,
  onRenameTitle,
  isWorkspaceMember = false,
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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(sessionTitle || '');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditingTitle) setTitleDraft(sessionTitle || '');
  }, [sessionTitle, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = async () => {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === sessionTitle) {
      setIsEditingTitle(false);
      setTitleDraft(sessionTitle || '');
      return;
    }
    setIsEditingTitle(false);
    await onRenameTitle?.(trimmed);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleDraft(sessionTitle || '');
    }
  };

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

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const namedViewers = (recentViewers ?? []).filter((v) => !v.isAnonymous && v.displayName);
  const anonCount = (recentViewers ?? []).filter((v) => v.isAnonymous).length;
  const totalTracked = recentViewers?.length ?? 0;
  const remainingViewers = Math.max((viewCount ?? 0) - totalTracked, 0);

  let viewTooltip: string;

  if ((viewCount ?? 0) === 0 || (namedViewers.length === 0 && anonCount === 0)) {
    viewTooltip = `${viewCount ?? 0} ${(viewCount ?? 0) === 1 ? "view" : "views"}`;
  } else {
    const lines: string[] = [];

    const maxNamed = Math.min(namedViewers.length, 5);
    for (let i = 0; i < maxNamed; i++) {
      lines.push(namedViewers[i].displayName!);
    }

    if (anonCount > 0) {
      lines.push(anonCount === 1 ? "1 anonymous viewer" : `${anonCount} anonymous viewers`);
    }

    const namedBeyond5 = Math.max(namedViewers.length - 5, 0);
    const totalRemaining = namedBeyond5 + remainingViewers;
    if (totalRemaining > 0) {
      lines.push(`${totalRemaining} more`);
    }

    viewTooltip = lines.join("\n");
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden p-4">
      {/* Session / Views row */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[14px] font-semibold text-[var(--text-heading)] truncate">{workspaceName || 'Workspace'}</span>
        <Tooltip content={viewTooltip} position="bottom">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors border-0 bg-transparent cursor-pointer"
          >
            <Eye size={14} strokeWidth={2} />
            {viewCount ?? 0} {(viewCount ?? 0) === 1 ? "View" : "Views"}
          </button>
        </Tooltip>
      </div>

      {/* Hero card — always rendered to keep layout stable; shows skeleton while session loads. */}
      <div
        className="mb-4 p-4 pb-3.5 rounded-[12px] relative overflow-hidden shrink-0"
        style={{
          background: 'radial-gradient(120% 110% at 100% 0%, rgba(90,73,191,0.10) 0%, rgba(90,73,191,0) 55%), linear-gradient(180deg, var(--brand-subtle) 0%, var(--surface-card) 100%)',
          border: '1px solid rgba(90,73,191,0.10)',
        }}
      >
        {sessionLoaded ? (
          <>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-[18px] font-semibold text-[var(--text-heading)] tracking-[-0.012em] leading-[1.35] mb-1 w-full bg-transparent border-0 border-b-2 border-[var(--brand)] outline-none px-0 py-0"
              />
            ) : (
              <div
                className={`group/title flex items-center gap-2 mb-1 ${canRenameTitle ? 'cursor-pointer' : ''}`}
                onClick={() => canRenameTitle && setIsEditingTitle(true)}
              >
                <h3 className={`text-[18px] font-semibold text-[var(--text-heading)] tracking-[-0.012em] leading-[1.35] transition-colors ${canRenameTitle ? 'group-hover/title:text-[var(--brand)]' : ''}`}>
                  {sessionTitle || "Untitled"}
                </h3>
                {canRenameTitle && (
                  <PencilLine
                    size={14}
                    strokeWidth={1.5}
                    className="shrink-0 text-[var(--text-tertiary)] opacity-0 group-hover/title:opacity-100 group-hover/title:text-[var(--brand)] transition-all"
                  />
                )}
              </div>
            )}
            <p className="text-[14px] text-[var(--text-secondary)] leading-[1.5] mb-3 max-w-[80%]">
              {total} ticket{total !== 1 ? 's' : ''} in this session. Walk through, leave notes, resolve as you go.
            </p>
            {isWorkspaceMember && (
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[7px] bg-[var(--text-heading)] text-white text-[13px] font-semibold tracking-[-0.005em] border-0 cursor-pointer hover:bg-black transition-colors"
              >
                <UsersRound size={14} strokeWidth={2} />
                Invite Team
              </button>
            )}
          </>
        ) : (
          <div aria-busy="true" aria-label="Loading session">
            <div className="tl-skel-title skel-blue" />
            <div className="tl-skel-desc skel-blue" />
            <div className="tl-skel-desc-2 skel-blue" />
            <div className="tl-skel-btn skel-blue" />
          </div>
        )}
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
        className="h-full overflow-y-auto flex-1 min-h-0 pb-2 -mx-4 px-4"
      >
        {showSearchEmpty && (
          <div className="px-3 py-8 mt-2">
            <CanvasEmptyState
              density="compact"
              illustration={<TicketSearchEmptyIllu />}
              title="No tickets match your search"
              description="Try a different keyword or clear the search."
            />
          </div>
        )}

        {!isSearchMode && !countsLoading && total === 0 && (
          <div className="px-3 py-8 mt-2">
            <CanvasEmptyState
              density="compact"
              illustration={<NoTicketsIllu />}
              title="No tickets yet"
              description="Capture your first screenshot or recording to create a ticket."
            />
          </div>
        )}

        {/* Open */}
        <section className="mb-4">
          <button
            type="button"
            onClick={() => {
              if (countsLoading) return;
              if (openExpandedControlled) onOpenExpandedChange?.();
              else setOpenExpandedInternal((x) => !x);
            }}
            className="w-full flex items-center gap-2 text-[14px] font-medium text-[var(--text-heading)] px-3 py-2 tracking-[-0.01em] border-0 bg-transparent cursor-pointer hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)] transition-colors"
            aria-expanded={openExpanded}
            aria-busy={countsLoading || undefined}
            disabled={countsLoading}
          >
            <ChevronRight
              size={14}
              className={`text-[var(--text-tertiary)] transition-transform duration-200 ${openExpanded ? 'rotate-90' : ''}`}
            />
            <span>Open</span>
            {countsLoading ? (
              <span className="tl-skel-count skel-block" aria-hidden />
            ) : (
              <span className="text-[var(--text-heading)] text-[14px] font-medium">{open}</span>
            )}
          </button>
          {openExpanded && (
            <div className="mt-1 space-y-0.5 transition-opacity duration-150 ease-out">
              {countsLoading && openItems.length === 0 ? (
                <TicketListSectionLoading />
              ) : (
                <>
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
                      suggestedTags={item.suggestedTags}
                    />
                  ))}
                  {openItems.length === 0 && !showSearchEmpty && !countsLoading && (
                    <>
                      {open === 0 && total > 0 ? (
                        <div className="px-2 py-4">
                          <CanvasEmptyState
                            density="compact"
                            illustration={<NoOpenTicketsIllu />}
                            title="All tickets resolved"
                            description="Nice work! All tickets in this session have been resolved."
                          />
                        </div>
                      ) : open === 0 ? null : isSearchMode && searchLoading ? null : (
                        <TicketListSectionLoading />
                      )}
                    </>
                  )}
                  {isLoadingOpen && <TicketListSectionLoading />}
                </>
              )}
            </div>
          )}
        </section>

        {/* Resolved */}
        <section className="mb-4">
          <button
            type="button"
            onClick={() => {
              if (countsLoading) return;
              if (resolvedExpandedControlled) onResolvedExpandedChange?.();
              else setResolvedExpandedInternalOnly(!resolvedExpanded);
            }}
            className="w-full flex items-center gap-2 text-[14px] font-medium text-[var(--text-heading)] px-3 py-2 tracking-[-0.01em] border-0 bg-transparent cursor-pointer hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)] transition-colors"
            aria-expanded={resolvedExpanded}
            aria-busy={countsLoading || undefined}
            disabled={countsLoading}
          >
            <ChevronRight
              size={14}
              className={`text-[var(--text-tertiary)] transition-transform duration-200 ${resolvedExpanded ? 'rotate-90' : ''}`}
            />
            <span>Resolved</span>
            {countsLoading ? (
              <span className="tl-skel-count skel-block" aria-hidden />
            ) : (
              <span className="text-[var(--text-heading)] text-[14px] font-medium">{resolved}</span>
            )}
          </button>
          {resolvedExpanded && (
            <div className="mt-1 space-y-0.5 transition-opacity duration-150 ease-out">
              {countsLoading && resolvedItems.length === 0 ? (
                <TicketListSectionLoading />
              ) : (
                <>
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
                      suggestedTags={item.suggestedTags}
                    />
                  ))}
                  {resolvedItems.length === 0 && !showSearchEmpty && !(isSearchMode && searchLoading) && (
                    <>
                      {resolved === 0 && total > 0 ? (
                        <div className="px-2 py-4">
                          <CanvasEmptyState
                            density="compact"
                            illustration={<NoResolvedTicketsIllu />}
                            title="No resolved tickets yet"
                            description="Resolved tickets will appear here as your team works through feedback."
                          />
                        </div>
                      ) : null}
                    </>
                  )}
                  {showResolvedListLoading && <TicketListSectionLoading />}
                </>
              )}
            </div>
          )}
        </section>

        {loadMoreRef && (
          <>
            {/* Optional pagination sentinel. Self-disables when `loadMoreRef` is unset. */}
            <div ref={loadMoreRef} aria-hidden style={{ height: "1px" }} />
          </>
        )}
      </div>
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInviteSent={() => setInviteModalOpen(false)}
      />
    </div>
  );
}

export const TicketList = TicketListInner;
