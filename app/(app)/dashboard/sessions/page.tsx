"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { SessionsWorkspace } from "@/components/dashboard/SessionsWorkspace";
import {
  SessionsListArchiveTabs,
  type SessionsListArchiveTab,
} from "@/components/dashboard/SessionsListArchiveTabs";
import { SessionsTimeRangeFilter } from "@/components/dashboard/SessionsTimeRangeFilter";
import { SessionsViewModeToggle } from "@/components/dashboard/SessionsViewModeToggle";
import EmptySessionsCard from "@/components/dashboard/EmptySessionsCard";
import { useSessionsSearch } from "@/components/dashboard/context/SessionsSearchContext";
import { sessionPassesTimeRange } from "@/lib/utils/sessionTimeRange";
import type { SessionsTimeRange } from "@/lib/utils/sessionTimeRange";
import { useSessionEntryCta } from "@/components/dashboard/hooks/useSessionEntryCta";

const SESSION_LIMIT = 50;

export default function SessionsPage() {
  const router = useRouter();
  const {
    sessions: sessionsWithCounts,
    loading: sessionsLoading,
    setSessionArchived,
    updateSession,
    deleteSession,
  } = useWorkspaceOverview("all");
  const sessions = sessionsWithCounts;
  const { search } = useSessionsSearch();
  const [listArchiveTab, setListArchiveTab] = useState<SessionsListArchiveTab>("sessions");
  const [sessionViewMode, setSessionViewMode] = useState<"list" | "grid">("list");
  const [sessionsTimeRange, setSessionsTimeRange] = useState<SessionsTimeRange>("all");
  const { startingRecorder, triggerCta } = useSessionEntryCta();

  const tableSessions = useMemo(() => {
    const sorted = [...sessionsWithCounts].sort((a, b) => {
      const ta = a.session.updatedAt as { seconds?: number } | null | undefined;
      const tb = b.session.updatedAt as { seconds?: number } | null | undefined;
      return (tb?.seconds ?? 0) - (ta?.seconds ?? 0);
    });
    return sorted.slice(0, SESSION_LIMIT);
  }, [sessionsWithCounts]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tableSessions;
    return tableSessions.filter(({ session }) =>
      session.title.toLowerCase().includes(q)
    );
  }, [tableSessions, search]);

  const tabFilteredSessions = useMemo(() => {
    const byArchive =
      listArchiveTab === "sessions"
        ? filteredSessions.filter(({ session }) => (session.isArchived ?? session.archived) !== true)
        : filteredSessions.filter(({ session }) => (session.isArchived ?? session.archived) === true);
    return byArchive.filter(({ session }) =>
      sessionPassesTimeRange(session, sessionsTimeRange)
    );
  }, [filteredSessions, listArchiveTab, sessionsTimeRange]);

  const skeletonCount =
    sessions?.length > 0
      ? sessions.length
      : 3;

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

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-3">
        <div className="mb-8">
          <div className="text-[15px] font-semibold text-black">Library</div>
          <h1 className="text-[28px] font-semibold text-black">Sessions</h1>
        </div>

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
            activeTab={listArchiveTab}
            onView={(sessionId) => router.push(`/dashboard/${sessionId}`)}
            onRenameSuccess={(session) =>
              updateSession(session.id, { title: session.title })
            }
            onSetArchived={setSessionArchived}
            onDeleteSession={deleteSession}
            viewMode={sessionViewMode}
            onViewModeChange={setSessionViewMode}
            isLoading={sessionsLoading}
            loadingRowCount={skeletonCount}
          />
        ) : sessionsLoading ? (
          <SessionsWorkspace
            sections={workspaceSections}
            activeTab={listArchiveTab}
            onView={(sessionId) => router.push(`/dashboard/${sessionId}`)}
            onRenameSuccess={(session) =>
              updateSession(session.id, { title: session.title })
            }
            onSetArchived={setSessionArchived}
            onDeleteSession={deleteSession}
            viewMode={sessionViewMode}
            onViewModeChange={setSessionViewMode}
            isLoading
            loadingRowCount={skeletonCount}
          />
        ) : (
          <div className="mt-16">
            <EmptySessionsCard />
          </div>
        )}
      </div>

    </div>
  );
}
