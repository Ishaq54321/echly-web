"use client";

// deep_data_latency_trace_phase3b_v2
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "@/lib/client/workspaceOverviewContext";
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
import { ToastProvider } from "@/components/dashboard/context/ToastContext";
import { DeleteSessionModal } from "@/components/dashboard/DeleteSessionModal";
import DashboardCaptureHost from "./components/DashboardCaptureHost";
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

function filterAndSortSessions(sessions: SessionWithCounts[], search: string): SessionWithCounts[] {
  const q = search.trim().toLowerCase();
  const list = q
    ? sessions.filter(({ session }) =>
        session.title.toLowerCase().includes(q)
      )
    : [...sessions];

  return [...list].sort((a, b) => sessionSortKey(b.session) - sessionSortKey(a.session));
}

function DashboardContent() {
  const router = useRouter();
  const {
    sessions,
    loading: sessionsLoading,
    updateSession,
    setSessionArchived,
    deleteSession,
  } = useWorkspaceOverview();
  const { authUid, isIdentityResolved } = useWorkspace();
  const stableSessions = useStableState(sessions, true, authUid);
  const { search } = useSessionsSearch();
  const isLoading =
    !isIdentityResolved || (sessionsLoading && sessions.length === 0);

  const [captureOpen, setCaptureOpen] = useState(false);
  const { startingRecorder, triggerCta } = useSessionEntryCta();
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const [listArchiveTab, setListArchiveTab] = useState<SessionsListArchiveTab>("sessions");
  const [sessionViewMode, setSessionViewMode] = useState<"list" | "grid">("list");
  const [sessionsTimeRange, setSessionsTimeRange] =
    useState<SessionsTimeRange>(DEFAULT_FILTER);

  const filteredSessions = useMemo(
    () => filterAndSortSessions(stableSessions, search),
    [stableSessions, search]
  );

  const activeSessions = useMemo(
    () =>
      filteredSessions.filter(
        ({ session }) => (session.isArchived ?? session.archived) !== true
      ),
    [filteredSessions]
  );

  const archivedSessions = useMemo(
    () =>
      filteredSessions.filter(
        ({ session }) => (session.isArchived ?? session.archived) === true
      ),
    [filteredSessions]
  );

  const tabFilteredSessions = useMemo(() => {
    const pool = listArchiveTab === "sessions" ? activeSessions : archivedSessions;
    return pool.filter(({ session }) =>
      sessionPassesTimeRange(session, sessionsTimeRange)
    );
  }, [listArchiveTab, activeSessions, archivedSessions, sessionsTimeRange]);

  const workspaceSections = useMemo(
    () => [
      {
        title: "",
        markerClassName: "bg-blue-500",
        items: tabFilteredSessions,
      },
    ],
    [listArchiveTab, tabFilteredSessions]
  );

  const handleView = (sessionId: string) => {
    router.push(`${SESSION_FEEDBACK_PATH}/${sessionId}`);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-10 pt-3">
        <SessionsHeader />

        <main className="flex-1">
          <div className="pt-3">
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
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
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
                  <div className="mt-16">
                    <EmptySessionsCard />
                  </div>
                ) : listArchiveTab === "archived" && archivedSessions.length === 0 ? (
                  <div className="mt-16">
                    <ArchiveEmptyState />
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <DeleteSessionModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        sessionTitle={deleteTarget?.title ?? ""}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteSession(deleteTarget);
        }}
      />

      <DashboardCaptureHost
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
