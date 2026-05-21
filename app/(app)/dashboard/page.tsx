"use client";

// deep_data_latency_trace_phase3b_v2
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/client/workspaceStore";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import {
  SessionsWorkspace,
  SessionWorkspaceRow,
} from "@/components/dashboard/SessionsWorkspace";
import { authFetch } from "@/lib/authFetch";
import type { SharedSessionMembership } from "@/lib/domain/session";
import { sharedToSessionWithCounts } from "@/lib/utils/sharedSessionAdapter";
import {
  SessionsListArchiveTabs,
  type SessionsListArchiveTab,
} from "@/components/dashboard/SessionsListArchiveTabs";
import { SessionsHeader } from "@/components/dashboard/SessionsHeader";
import { SessionsTimeRangeFilter } from "@/components/dashboard/SessionsTimeRangeFilter";
import { SessionsViewModeToggle } from "@/components/dashboard/SessionsViewModeToggle";
import {
  DEFAULT_FILTER,
  sessionPassesTimeRange,
} from "@/lib/utils/sessionTimeRange";
import type { SessionsTimeRange } from "@/lib/utils/sessionTimeRange";
import { useSessionsSearch } from "@/components/dashboard/context/SessionsSearchContext";
const EmptyDashboardCarousel = dynamic(
  () => import("@/components/dashboard/EmptyDashboardCarousel"),
  { ssr: false }
);
import { ArchiveEmptyState } from "@/components/empty/ArchiveEmptyState";
import { ToastProvider, useToast } from "@/components/dashboard/context/ToastContext";
import { SessionsSearchProvider } from "@/components/dashboard/context/SessionsSearchContext";
const DashboardCaptureHost = dynamic(
  () => import("./components/DashboardCaptureHost"),
  { ssr: false }
);
import { DashboardUpgradeBanner } from "@/components/dashboard/DashboardUpgradeBanner";

const DeleteSessionModal = dynamic(
  () =>
    import("@/components/dashboard/DeleteSessionModal").then((m) => m.DeleteSessionModal),
  { ssr: false }
);
const LeaveSessionModal = dynamic(
  () =>
    import("@/components/dashboard/LeaveSessionModal").then((m) => m.LeaveSessionModal),
  { ssr: false }
);
import type { Session } from "@/lib/domain/session";

function sessionSortKey(session: Session): number {
  const u = session.updatedAt;
  if (typeof u === "string") {
    const t = new Date(u).getTime();
    return Number.isNaN(t) ? 0 : Math.floor(t / 1000);
  }
  if (u && typeof u === "object" && "seconds" in u && typeof (u as { seconds: number }).seconds === "number") {
    return (u as { seconds: number }).seconds;
  }
  return 0;
}
import { useSessionEntryCta } from "@/components/dashboard/hooks/useSessionEntryCta";
import { useStableState } from "@/lib/client/perception/useStableState";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { SessionRowSkeleton } from "@/components/dashboard/SessionRowSkeleton";
import { SESSION_FEEDBACK_PATH } from "@/utils/getSessionLink";

function DashboardContent() {
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const raw = sessionStorage.getItem("joined_workspace");
    if (!raw) return;
    sessionStorage.removeItem("joined_workspace");
    try {
      const { workspaceName } = JSON.parse(raw) as { workspaceName?: string };
      if (workspaceName) showToast(`You've joined ${workspaceName}`);
    } catch { /* ignore */ }
  }, [showToast]);

  const {
    sessions,
    loading: sessionsLoading,
    hasMoreSessions,
    loadingMoreSessions,
    loadMoreSessions,
    updateSession,
    setSessionArchived,
    deleteSession,
  } = useWorkspaceStore();
  const { authUid, isIdentityResolved, firstName, workspaceName } = useWorkspace();
  const stableSessions = useStableState(sessions, true, authUid);
  const { search } = useSessionsSearch();
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const isLoading =
    !isIdentityResolved || (sessionsLoading && sessions.length === 0);

  const [captureOpen, setCaptureOpen] = useState(false);
  const { startingRecorder, triggerCta } = useSessionEntryCta();
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const [listArchiveTab, setListArchiveTab] = useState<SessionsListArchiveTab>("sessions");
  const [sessionViewMode, setSessionViewMode] = useState<"list" | "grid">("list");
  const [sessionsTimeRange, setSessionsTimeRange] =
    useState<SessionsTimeRange>(DEFAULT_FILTER);
  const [sharedSessions, setSharedSessions] = useState<SharedSessionMembership[]>([]);
  const [leaveModalSessionId, setLeaveModalSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!authUid) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await authFetch("/api/sessions/shared");
        if (!res || !res.ok || cancelled) return;
        const json = (await res.json()) as {
          success?: boolean;
          data?: { sessions?: SharedSessionMembership[] };
        };
        const list = json?.data?.sessions ?? [];
        if (!cancelled) {
          setSharedSessions(list.filter((s) => !s.isArchived));
        }
      } catch {
        // shared sessions are supplementary — silent failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUid]);

  const handleLeaveSession = useCallback((sessionId: string) => {
    setLeaveModalSessionId(sessionId);
  }, []);

  const leaveModalSession = useMemo(
    () =>
      leaveModalSessionId
        ? sharedSessions.find((s) => s.sessionId === leaveModalSessionId) ?? null
        : null,
    [leaveModalSessionId, sharedSessions]
  );

  const confirmLeaveSession = useCallback(async () => {
    if (!leaveModalSessionId) return;
    const sessionId = leaveModalSessionId;
    const removed = sharedSessions.find((s) => s.sessionId === sessionId);

    setSharedSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    setLeaveModalSessionId(null);
    showToast("You left the session");

    void (async () => {
      try {
        const res = await authFetch(`/api/sessions/shared/${sessionId}`, {
          method: "DELETE",
        });
        if (!res || !res.ok) throw new Error("Failed to leave session");
      } catch {
        if (removed) {
          setSharedSessions((prev) => [...prev, removed]);
        }
        showToast("Couldn't leave the session");
      }
    })();
  }, [leaveModalSessionId, sharedSessions, showToast]);

  const handleViewShared = useCallback(
    (sessionId: string) => {
      router.push(`/session/${sessionId}`);
    },
    [router]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const { activeSessions, archivedSessions, tabFilteredSessions } = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const sortedSessions = [...stableSessions].sort(
      (a, b) => sessionSortKey(b.session) - sessionSortKey(a.session)
    );
    const nextActiveSessions: SessionWithCounts[] = [];
    const nextArchivedSessions: SessionWithCounts[] = [];
    const nextTabFilteredSessions: SessionWithCounts[] = [];

    for (const item of sortedSessions) {
      const title = item.session.title ?? "";
      if (q && !title.toLowerCase().includes(q)) {
        continue;
      }

      const isArchived = (item.session.isArchived ?? item.session.archived) === true;
      if (isArchived) {
        nextArchivedSessions.push(item);
      } else {
        nextActiveSessions.push(item);
      }

      const inSelectedTab =
        listArchiveTab === "sessions" ? !isArchived : isArchived;
      if (!inSelectedTab) continue;
      if (!sessionPassesTimeRange(item.session, sessionsTimeRange)) continue;
      nextTabFilteredSessions.push(item);
    }

    return {
      activeSessions: nextActiveSessions,
      archivedSessions: nextArchivedSessions,
      tabFilteredSessions: nextTabFilteredSessions,
    };
  }, [debouncedSearch, listArchiveTab, sessionsTimeRange, stableSessions]);

  // PERF R-013: removed redundant `listArchiveTab` dep — tabFilteredSessions
  // is already derived from listArchiveTab, so adding it directly was causing
  // an extra recompute on every tab switch before tabFilteredSessions settled.
  const workspaceSections = useMemo(
    () => [
      {
        title: "",
        markerClassName: "bg-[var(--brand)]",
        items: tabFilteredSessions,
      },
    ],
    [tabFilteredSessions]
  );

  const handleView = useCallback((sessionId: string) => {
    router.push(`${SESSION_FEEDBACK_PATH}/${sessionId}`);
  }, [router]);

  const handleRenameSuccess = useCallback(
    (session: { id: string; title: string; updatedAt?: unknown }) => {
      updateSession(session.id, { title: session.title });
    },
    [updateSession]
  );

  const handleRequestDelete = useCallback((session: Session) => {
    setDeleteTarget(session);
  }, []);

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-6 md:px-6 md:pt-10">
        <SessionsHeader
          workspaceName={workspaceName ?? undefined}
          firstName={firstName || undefined}
        />

        <main className="flex-1">
          <div className="pt-6">
            <div>
              <SessionsListArchiveTabs
                value={listArchiveTab}
                onChange={setListArchiveTab}
                actions={
                  <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-3">
                    <SessionsTimeRangeFilter
                      value={sessionsTimeRange}
                      onChange={setSessionsTimeRange}
                    />

                    <SessionsViewModeToggle
                      value={sessionViewMode}
                      onChange={setSessionViewMode}
                    />

                    <button
                      type="button"
                      onClick={triggerCta}
                      disabled={startingRecorder || !isIdentityResolved}
                      aria-busy={startingRecorder}
                      className="ml-auto hidden md:inline-flex h-11 md:h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      New Session
                    </button>
                  </div>
                }
              />

              <DashboardUpgradeBanner />

              <div>
                {isLoading ? (
                  <SessionRowSkeleton count={2} />
                ) : listArchiveTab === "archived" && archivedSessions.length === 0 ? (
                  <ArchiveEmptyState />
                ) : listArchiveTab === "archived" ? (
                  <>
                    <SessionsWorkspace
                      sections={workspaceSections}
                      onView={handleView}
                      onRenameSuccess={handleRenameSuccess}
                      onSetArchived={setSessionArchived}
                      onRequestDelete={handleRequestDelete}
                      onDeleteSession={deleteSession}
                      viewMode={sessionViewMode}
                      onViewModeChange={setSessionViewMode}
                    />
                    {hasMoreSessions && !debouncedSearch.trim() ? (
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => void loadMoreSessions()}
                          disabled={loadingMoreSessions}
                          className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-body)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loadingMoreSessions ? "Loading..." : "Load more sessions"}
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    {activeSessions.length === 0 ? (
                      <EmptyDashboardCarousel />
                    ) : (
                      <>
                        <SessionsWorkspace
                          sections={workspaceSections}
                          onView={handleView}
                          onRenameSuccess={handleRenameSuccess}
                          onSetArchived={setSessionArchived}
                          onRequestDelete={handleRequestDelete}
                          onDeleteSession={deleteSession}
                          viewMode={sessionViewMode}
                          onViewModeChange={setSessionViewMode}
                        />
                        {hasMoreSessions && !debouncedSearch.trim() ? (
                          <div className="mt-6 flex justify-center">
                            <button
                              type="button"
                              onClick={() => void loadMoreSessions()}
                              disabled={loadingMoreSessions}
                              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-body)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {loadingMoreSessions ? "Loading..." : "Load more sessions"}
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}

                    {sharedSessions.length > 0 ? (
                      <div className="mt-8">
                        <h3 className="mb-3 px-1 text-[13px] font-medium text-[var(--text-secondary)]">
                          Shared with me
                        </h3>
                        <div className="space-y-3">
                          {sharedSessions.map((m) => (
                            <SessionWorkspaceRow
                              key={m.sessionId}
                              item={sharedToSessionWithCounts(m)}
                              onView={handleViewShared}
                              isSharedSession
                              sharedByName={m.addedByName ?? undefined}
                              onLeaveSession={handleLeaveSession}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {deleteTarget ? (
        <DeleteSessionModal
          open
          onClose={() => setDeleteTarget(null)}
          sessionTitle={deleteTarget.title ?? ""}
          onConfirm={async () => {
            await deleteSession(deleteTarget);
          }}
        />
      ) : null}

      {leaveModalSessionId ? (
        <LeaveSessionModal
          open
          onClose={() => setLeaveModalSessionId(null)}
          sessionTitle={leaveModalSession?.sessionName ?? ""}
          onConfirm={confirmLeaveSession}
        />
      ) : null}

      <DashboardCaptureHost
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SessionsSearchProvider>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </SessionsSearchProvider>
  );
}
