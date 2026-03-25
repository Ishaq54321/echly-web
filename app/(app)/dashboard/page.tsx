"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import { SessionsWorkspace } from "@/components/dashboard/SessionsWorkspace";
import {
  SessionsListArchiveTabs,
  type SessionsListArchiveTab,
} from "@/components/dashboard/SessionsListArchiveTabs";
import { SessionsHeader } from "@/components/dashboard/SessionsHeader";
import { SessionsTimeRangeFilter } from "@/components/dashboard/SessionsTimeRangeFilter";
import { SessionsViewModeToggle } from "@/components/dashboard/SessionsViewModeToggle";
import { sessionPassesTimeRange } from "@/lib/utils/sessionTimeRange";
import type { SessionsTimeRange } from "@/lib/utils/sessionTimeRange";
import { useSessionsSearch } from "@/components/dashboard/context/SessionsSearchContext";
import EmptySessionsCard from "@/components/dashboard/EmptySessionsCard";
import { ToastProvider } from "@/components/dashboard/context/ToastContext";
import { DeleteSessionModal } from "@/components/dashboard/DeleteSessionModal";
import DashboardCaptureHost from "./components/DashboardCaptureHost";
import type { Session } from "@/lib/domain/session";
import { useSessionEntryCta } from "@/components/dashboard/hooks/useSessionEntryCta";

function filterAndSortSessions(sessions: SessionWithCounts[], search: string): SessionWithCounts[] {
  const q = search.trim().toLowerCase();
  const list = q
    ? sessions.filter(({ session }) =>
        session.title.toLowerCase().includes(q)
      )
    : [...sessions];

  return [...list].sort((a, b) => {
    const ta = a.session.updatedAt as { seconds?: number } | null | undefined;
    const tb = b.session.updatedAt as { seconds?: number } | null | undefined;
    const sa = ta?.seconds ?? 0;
    const sb = tb?.seconds ?? 0;
    return sb - sa;
  });
}

function DashboardContent() {
  const router = useRouter();
  const {
    sessions,
    loading: sessionsLoading,
    updateSession,
    setSessionArchived,
    deleteSession,
  } = useWorkspaceOverview("all");
  const { search } = useSessionsSearch();
  const skeletonCount =
    sessions?.length > 0
      ? sessions.length
      : 3;
  const [captureOpen, setCaptureOpen] = useState(false);
  const { startingRecorder, triggerCta } = useSessionEntryCta();
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const [listArchiveTab, setListArchiveTab] = useState<SessionsListArchiveTab>("sessions");
  const [sessionViewMode, setSessionViewMode] = useState<"list" | "grid">("list");
  const [sessionsTimeRange, setSessionsTimeRange] = useState<SessionsTimeRange>("all");

  const filteredSessions = useMemo(
    () => filterAndSortSessions(sessions, search),
    [sessions, search]
  );

  const tabFilteredSessions = useMemo(() => {
    const byArchive =
      listArchiveTab === "sessions"
        ? filteredSessions.filter(({ session }) => (session.isArchived ?? session.archived) !== true)
        : filteredSessions.filter(({ session }) => (session.isArchived ?? session.archived) === true);
    return byArchive.filter(({ session }) =>
      sessionPassesTimeRange(session, sessionsTimeRange)
    );
  }, [filteredSessions, listArchiveTab, sessionsTimeRange]);

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
    router.push(`/dashboard/${sessionId}`);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-10 pt-3">
        <SessionsHeader />

        <main className="flex-1">
          <div className="pt-3">
            {sessionsLoading ? (
              <div className="transition-opacity duration-150">
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
                        disabled={startingRecorder}
                        aria-busy={startingRecorder}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
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
                  isLoading
                  loadingRowCount={skeletonCount}
                />
              </div>
            ) : (
              <div className="transition-opacity duration-150">
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
                        disabled={startingRecorder}
                        aria-busy={startingRecorder}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
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

                {tabFilteredSessions.length > 0 ? (
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
                ) : (
                  <div className="mt-16">
                    <EmptySessionsCard />
                  </div>
                )}
              </div>
            )}
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
