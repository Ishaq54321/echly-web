"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeedbackDetailView, TicketList } from "@/components/layout/operating-system";
import { PublicShareGateModal } from "@/components/share/PublicShareGateModal";
import type { PublicShareGateDetail } from "@/components/share/PublicShareGateModal";
import { PublicShareSidebarShell } from "@/components/share/PublicShareSidebarShell";
import { PublicShareTopBar } from "@/components/share/PublicShareTopBar";
import { usePublicSessionRealtime } from "@/components/share/usePublicSessionRealtime";
import type { Feedback } from "@/lib/domain/feedback";
import { getTicketStatus } from "@/lib/domain/feedback";
import type { ResolvedPublicSharePermissions } from "@/lib/permissions/publicSharePermissions";
import {
  mapPublicFeedbackToFeedback,
  mapSanitizedToDetailItem,
} from "@/lib/share/mapPublicShareToSessionUi";
import type {
  SanitizedPublicFeedback,
  SanitizedPublicSession,
} from "@/lib/server/publicShareSanitize";

export type PublicSharePayload = {
  session: SanitizedPublicSession;
  feedback: SanitizedPublicFeedback[];
  permissions: ResolvedPublicSharePermissions;
};

export function PublicShareSessionView({
  initial,
}: {
  initial: PublicSharePayload;
}) {
  const session = initial.session;
  const [sanitizedFeedback, setSanitizedFeedback] = useState<SanitizedPublicFeedback[]>(
    initial.feedback
  );
  const [permissions] = useState<ResolvedPublicSharePermissions>(initial.permissions);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const [gateDetail, setGateDetail] = useState<PublicShareGateDetail | null>(null);

  const sessionId = session.id;
  const realtime = usePublicSessionRealtime(sessionId);
  const sessionTitle = (session.title ?? "").trim() || "Untitled Session";

  const feedbackRows: Feedback[] = useMemo(
    () => sanitizedFeedback.map((f) => mapPublicFeedbackToFeedback(sessionId, f)),
    [sanitizedFeedback, sessionId]
  );

  const total = feedbackRows.length;
  const openCount = feedbackRows.filter((f) => getTicketStatus(f) === "open").length;
  const resolvedCount = feedbackRows.filter((f) => getTicketStatus(f) === "resolved").length;

  const [selectedId, setSelectedId] = useState<string | null>(() =>
    sanitizedFeedback[0]?.id ?? null
  );
  const [openExpanded, setOpenExpanded] = useState(true);
  const [resolvedExpanded, setResolvedExpanded] = useState(false);
  const [isTicketNavigatorOpen, setIsTicketNavigatorOpen] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const onOpenExpandedChange = useCallback(() => {
    setOpenExpanded((prev) => {
      const next = !prev;
      if (next) setResolvedExpanded(false);
      return next;
    });
  }, []);

  const onResolvedExpandedChange = useCallback(() => {
    setResolvedExpanded((prev) => {
      const next = !prev;
      if (next) setOpenExpanded(false);
      return next;
    });
  }, []);

  useEffect(() => {
    if (sanitizedFeedback.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev != null && sanitizedFeedback.some((f) => f.id === prev)
        ? prev
        : sanitizedFeedback[0]!.id
    );
  }, [sanitizedFeedback]);

  const selectedSanitized = useMemo(
    () => sanitizedFeedback.find((f) => f.id === selectedId) ?? null,
    [sanitizedFeedback, selectedId]
  );

  const selectedIndex = useMemo(() => {
    if (!selectedId) return -1;
    return sanitizedFeedback.findIndex((f) => f.id === selectedId);
  }, [sanitizedFeedback, selectedId]);

  const selectedItem = useMemo(() => {
    if (!selectedSanitized || total === 0) return null;
    const idx = selectedIndex >= 0 ? selectedIndex + 1 : 1;
    return mapSanitizedToDetailItem(selectedSanitized, idx, total);
  }, [selectedSanitized, selectedIndex, total]);

  useEffect(() => {
    if (realtime.loading || realtime.error) return;
    if (realtime.changes.length === 0) return;
    setSanitizedFeedback((current) => {
      const byId = new Map(current.map((item) => [item.id, item]));
      for (const change of realtime.changes) {
        if (change.type === "removed") {
          byId.delete(change.id);
          continue;
        }
        byId.set(change.item.id, change.item);
      }
      const ordered = realtime.items.map((item) => byId.get(item.id) ?? item);
      return ordered;
    });
  }, [realtime.changes, realtime.error, realtime.items, realtime.loading]);

  const ticketListProps = {
    sessionTitle,
    counts: { total, open: openCount, resolved: resolvedCount },
    countsLoading: false,
    items: feedbackRows,
    selectedId,
    onSelect: setSelectedId,
    newTicketId: null as string | null,
    loadingMore: false,
    hasMore: false,
    hasReachedLimit: false,
    openExpanded,
    onOpenExpandedChange,
    resolvedExpanded,
    onResolvedExpandedChange,
    isLoadingResolved: false,
    searchQuery: "",
    onSearchQueryChange: (_value: string) => {},
    isSearchMode: false,
    searchResults: [] as Feedback[],
    searchLoading: false,
    showTicketSearch: false,
    showSessionOverflowMenu: false,
  };

  const detail = (
    <FeedbackDetailView
      item={selectedItem}
      shareGating={{
        permissions,
        onBlocked: (d) => setGateDetail(d),
      }}
      readOnlyDescription={null}
      setIsImageExpanded={setIsImageExpanded}
      isCommentMode={false}
      comments={[]}
    />
  );

  return (
    <>
      <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-[#FCFDFE]">
        <aside className="sidebar hidden lg:flex w-[300px] h-screen overflow-hidden shrink-0 self-start min-h-0 flex-col sticky top-0 border-r border-[#EEF2F6] shadow-[1px_0_0_rgba(15,23,42,0.02)]">
          <PublicShareSidebarShell>
            <TicketList {...ticketListProps} />
          </PublicShareSidebarShell>
        </aside>

        <div className="content-divider hidden shrink-0 lg:block" aria-hidden />

        <div className="main-area flex min-h-0 min-w-0 flex-1 flex-col">
          <PublicShareTopBar shareUrl={shareUrl} />
          <div className="flex flex-1 min-h-0 min-w-0 flex-col">
            <main className="surface-main flex-1 min-h-0 overflow-y-auto flex flex-col min-w-0">
              <div className="h-full flex flex-col min-w-0">
                <div className="z-20 shrink-0 flex items-center gap-2 px-4 py-3 lg:hidden bg-[var(--layer-1-bg)]">
                  <button
                    type="button"
                    onClick={() => setIsTicketNavigatorOpen(true)}
                    className="h-9 inline-flex items-center px-4 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-200"
                  >
                    Tickets
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
                  <div className="max-w-[1000px] mx-auto w-full px-6 py-6 flex-1 min-h-0 flex flex-col">
                    {feedbackRows.length === 0 ? (
                      <div className="mt-16">
                        <div className="text-[16px] font-medium text-[hsl(var(--text-primary-strong))]">
                          No feedback yet
                        </div>
                        <div className="mt-2 text-[14px] text-[hsl(var(--text-tertiary))]">
                          Items shared in this session will appear here.
                        </div>
                      </div>
                    ) : (
                      detail
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {isTicketNavigatorOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-200 cursor-pointer"
            onClick={() => setIsTicketNavigatorOpen(false)}
            aria-hidden
          />
          <div
            className="relative w-full max-w-[300px] h-full min-h-0 flex flex-col shadow-[var(--shadow-level-4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <TicketList
              {...ticketListProps}
              onSelect={(id) => {
                setSelectedId(id);
                setIsTicketNavigatorOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}

      {isImageExpanded && selectedItem?.screenshotUrl ? (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-10 cursor-pointer"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image
              src={selectedItem.screenshotUrl}
              alt="Expanded Screenshot"
              fill
              className="object-contain rounded-xl"
            />
          </div>
        </div>
      ) : null}

      <PublicShareGateModal detail={gateDetail} onClose={() => setGateDetail(null)} />
    </>
  );
}
