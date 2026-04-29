"use client";

// deep_data_latency_trace_phase3b_v2
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/client/workspaceStore";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import { SessionsWorkspace } from "@/components/dashboard/SessionsWorkspace";
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
import EmptySessionsCard from "@/components/dashboard/EmptySessionsCard";
import { ArchiveEmptyState } from "@/components/empty/ArchiveEmptyState";
import { ToastProvider, useToast } from "@/components/dashboard/context/ToastContext";
import { SessionsSearchProvider } from "@/components/dashboard/context/SessionsSearchContext";
import DashboardCaptureHost from "./components/DashboardCaptureHost";
import { DashboardUpgradeBanner } from "@/components/dashboard/DashboardUpgradeBanner";

const DeleteSessionModal = dynamic(
  () =>
    import("@/components/dashboard/DeleteSessionModal").then((m) => m.DeleteSessionModal),
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
import BrandLoader from "@/components/ui/BrandLoader";
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
  const { authUid, isIdentityResolved, authDisplayName, workspaceName } = useWorkspace();
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

  const handleView = (sessionId: string) => {
    router.push(`${SESSION_FEEDBACK_PATH}/${sessionId}`);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-10 pt-10">
        <SessionsHeader
          workspaceName={workspaceName ?? undefined}
          firstName={authDisplayName?.split(" ")[0] ?? undefined}
        />

        <main className="flex-1">
          <div className="pt-6">
            <div>
              <SessionsListArchiveTabs
                value={listArchiveTab}
                onChange={setListArchiveTab}
                actions={
                  <div className="flex items-center gap-3">
                    <SessionsTimeRangeFilter
                      value={sessionsTimeRange}
                      onChange={setSessionsTimeRange}
                    />

                    <button
                      type="button"
                      onClick={triggerCta}
                      disabled={startingRecorder || !isIdentityResolved}
                      aria-busy={startingRecorder}
                      className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      New Session
                    </button>

                    <SessionsViewModeToggle
                      value={sessionViewMode}
                      onChange={setSessionViewMode}
                    />
                  </div>
                }
              />

              <DashboardUpgradeBanner />

              <div>
                {isLoading ? (
                  <div
                    className="mt-12 flex justify-center py-16"
                    aria-busy="true"
                    aria-label="Loading sessions"
                  >
                    <BrandLoader />
                  </div>
                ) : listArchiveTab === "sessions" && activeSessions.length === 0 ? (
                  <EmptySessionsCard />
                ) : listArchiveTab === "archived" && archivedSessions.length === 0 ? (
                  <ArchiveEmptyState />
                ) : (
                  <>
                    <SessionsWorkspace
                      sections={workspaceSections}
                      onView={handleView}
                      onRenameSuccess={(session) =>
                        updateSession(session.id, { title: session.title })
                      }
                      onSetArchived={setSessionArchived}
                      onRequestDelete={(session) => setDeleteTarget(session)}
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
