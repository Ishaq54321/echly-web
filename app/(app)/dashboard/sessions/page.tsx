"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Folder } from "lucide-react";
import { db } from "@/lib/firebase";
import { useWorkspaceOverview } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { SessionsWorkspace } from "@/components/dashboard/SessionsWorkspace";
import {
  SessionsListArchiveTabs,
  type SessionsListArchiveTab,
} from "@/components/dashboard/SessionsListArchiveTabs";
import { SessionsTimeRangeFilter } from "@/components/dashboard/SessionsTimeRangeFilter";
import { SessionsViewModeToggle } from "@/components/dashboard/SessionsViewModeToggle";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { useSessionsSearch } from "@/components/dashboard/context/SessionsSearchContext";
import { sessionPassesTimeRange } from "@/lib/utils/sessionTimeRange";
import type { SessionsTimeRange } from "@/lib/utils/sessionTimeRange";
import { Loader2 } from "lucide-react";

const SESSION_LIMIT = 50;

interface FolderData {
  id: string;
  name: string;
  sessionIds: string[];
}

const FOLDERS_CACHE_KEY = "echly_folders";

function FolderItem({
  folder,
}: {
  folder: FolderData;
}) {
  const router = useRouter();
  const count = folder.sessionIds.length;

  return (
    <button
      type="button"
      onClick={() => router.push(`/folders/${folder.id}`)}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-5 text-left transition-all duration-150 hover:border-[#155DFC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
      style={{ borderWidth: "1px" }}
    >
      <Folder className="h-5 w-5 shrink-0 text-[#155DFC] stroke-[2]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold text-neutral-900">
          {folder.name}
        </p>
        <p className="text-[13px] text-neutral-500">
          {count} {count === 1 ? "session" : "sessions"}
        </p>
      </div>
    </button>
  );
}

export default function SessionsPage() {
  const router = useRouter();
  const {
    user,
    sessions: sessionsWithCounts,
    loading: sessionsLoading,
    handleCreateSession,
  } = useWorkspaceOverview("all");
  const sessions = sessionsWithCounts;
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const { search } = useSessionsSearch();
  const [listArchiveTab, setListArchiveTab] = useState<SessionsListArchiveTab>("sessions");
  const [sessionViewMode, setSessionViewMode] = useState<"list" | "grid">("list");
  const [sessionsTimeRange, setSessionsTimeRange] = useState<SessionsTimeRange>("all");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePayload, setUpgradePayload] = useState<{
    message: string;
    upgradePlan: string | null;
  } | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);

  const tableSessions = useMemo(() => {
    const sorted = [...sessionsWithCounts].sort((a, b) => {
      const ta = a.session.updatedAt as { seconds?: number } | null | undefined;
      const tb = b.session.updatedAt as { seconds?: number } | null | undefined;
      return (tb?.seconds ?? 0) - (ta?.seconds ?? 0);
    });
    return sorted.slice(0, SESSION_LIMIT);
  }, [sessionsWithCounts]);

  const loadFolders = useCallback(async (uid: string) => {
    setFoldersLoading(true);
    try {
      const cached = sessionStorage.getItem(FOLDERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setFolders(parsed as FolderData[]);
      }
    } catch {
      // Ignore cache read/parse errors.
    }
    try {
      const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
      const q = query(
        collection(db, "folders"),
        where("workspaceId", "==", workspaceId)
      );
      const snapshot = await getDocs(q);
      const list: FolderData[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: (data.name as string) ?? "Untitled Folder",
          sessionIds: (data.sessionIds as string[]) ?? [],
        };
      });
      setFolders(list);
      try {
        sessionStorage.setItem(FOLDERS_CACHE_KEY, JSON.stringify(list));
      } catch {
        // Ignore cache write errors.
      }
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    void loadFolders(user.uid);
  }, [user?.uid, loadFolders]);

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
        ? filteredSessions.filter(({ session }) => !session.archived)
        : filteredSessions.filter(({ session }) => Boolean(session.archived));
    return byArchive.filter(({ session }) =>
      sessionPassesTimeRange(session, sessionsTimeRange)
    );
  }, [filteredSessions, listArchiveTab, sessionsTimeRange]);

  const skeletonCount =
    sessions?.length > 0
      ? sessions.length
      : 3;

  const startRecording = () => {
    setCreatingSession(true);
    handleCreateSession((payload) => {
      setUpgradePayload(payload);
      setUpgradeModalOpen(true);
    }).finally(() => {
      setCreatingSession(false);
    });
  };

  const workspaceSections = useMemo(
    () => [
      {
        title: listArchiveTab === "sessions" ? "" : "Archived",
        markerClassName: listArchiveTab === "sessions" ? "bg-blue-500" : "bg-neutral-400",
        items: tabFilteredSessions,
      },
    ],
    [listArchiveTab, tabFilteredSessions]
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-10 pt-3">
        <div className="mb-8">
          <div className="text-[15px] font-semibold text-black">Library</div>
          <h1 className="text-[28px] font-semibold text-black">Sessions</h1>
        </div>

        {foldersLoading ? (
          <div className="mb-8">
            <h2 className="mb-3 text-[16px] font-semibold text-neutral-900">Folders</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
          </div>
        ) : folders.length > 0 ? (
          <div className="mb-4">
            <h2 className="mb-3 text-[16px] font-semibold text-neutral-900">Folders</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {folders.map((folder) => (
                <FolderItem key={folder.id} folder={folder} />
              ))}
            </div>
          </div>
        ) : null}

        {filteredSessions.length > 0 || sessionsLoading ? (
          <>
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
                    onClick={startRecording}
                    disabled={creatingSession}
                    aria-busy={creatingSession}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {creatingSession ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </span>
                    ) : (
                      "New Session"
                    )}
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
                onView={(sessionId) => router.push(`/dashboard/${sessionId}`)}
                viewMode={sessionViewMode}
                onViewModeChange={setSessionViewMode}
                isLoading={sessionsLoading}
                loadingRowCount={skeletonCount}
              />
            ) : sessionsLoading ? (
              <SessionsWorkspace
                sections={workspaceSections}
                onView={(sessionId) => router.push(`/dashboard/${sessionId}`)}
                viewMode={sessionViewMode}
                onViewModeChange={setSessionViewMode}
                isLoading
                loadingRowCount={skeletonCount}
              />
            ) : (
              <p className="py-8 text-[13px] text-neutral-500">
                {listArchiveTab === "sessions"
                  ? "No active sessions."
                  : "No archived sessions."}
              </p>
            )}
          </>
        ) : null}

        {!sessionsLoading && filteredSessions.length === 0 && (
          <p className="py-8 text-[13px] text-neutral-500">
            {search.trim()
              ? "No sessions match your search."
              : "No sessions yet. Use New Session to get started."}
          </p>
        )}
      </div>

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setUpgradePayload(null);
        }}
        message={upgradePayload?.message}
        upgradePlan={upgradePayload?.upgradePlan ?? null}
      />
    </div>
  );
}
