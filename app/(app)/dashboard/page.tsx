"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateDoc, deleteDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import type { DashboardFolder } from "./hooks/useWorkspaceOverview";
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
import { Loader2 } from "lucide-react";
import { useSessionsSearch } from "@/components/dashboard/context/SessionsSearchContext";
import { FolderCard } from "@/components/dashboard/FolderCard";
import EmptySessionsCard from "@/components/dashboard/EmptySessionsCard";
import FoldersSkeleton from "@/components/skeleton/FoldersSkeleton";
import { MoveSessionsModal } from "@/components/dashboard/MoveSessionsModal";
import { DragSessionProvider, useDragSession } from "@/components/dashboard/context/DragSessionContext";
import { ToastProvider, useToast } from "@/components/dashboard/context/ToastContext";
import { DragGhostChip } from "@/components/dashboard/DragGhostChip";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { DeleteSessionModal } from "@/components/dashboard/DeleteSessionModal";
import DashboardCaptureHost from "./components/DashboardCaptureHost";
import type { Session } from "@/lib/domain/session";

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
  const { showToast } = useToast();
  const { draggedSessionId, setDraggedSessionId } = useDragSession();
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const {
    user,
    sessions,
    folders,
    loading: sessionsLoading,
    foldersLoading,
    expectedSessionCount,
    expectedFolderCount,
    refreshFolders,
    handleCreateSession,
    updateSession,
    removeSession,
    deleteSession,
  } = useWorkspaceOverview("all");
  const { search } = useSessionsSearch();
  const hasFolders = folders.length > 0;
  const skeletonCount =
    sessions?.length > 0
      ? sessions.length
      : 3;
  const [moveModalFolder, setMoveModalFolder] = useState<DashboardFolder | null>(null);
  const [moveToFolderSessionId, setMoveToFolderSessionId] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePayload, setUpgradePayload] = useState<{ message: string; upgradePlan: string | null } | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [listArchiveTab, setListArchiveTab] = useState<SessionsListArchiveTab>("sessions");
  const [sessionViewMode, setSessionViewMode] = useState<"list" | "grid">("list");
  const [sessionsTimeRange, setSessionsTimeRange] = useState<SessionsTimeRange>("all");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateFolder = async (id: string, updates: Partial<Pick<DashboardFolder, "name" | "sessions">>) => {
    const ref = doc(db, "folders", id);
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.sessions !== undefined) payload.sessionIds = updates.sessions;
    if (Object.keys(payload).length > 0) await updateDoc(ref, payload);
    await refreshFolders();
  };

  const removeFolder = async (id: string) => {
    await deleteDoc(doc(db, "folders", id));
    await refreshFolders();
  };

  const sessionIdsInFolders = useMemo(
    () => new Set(folders.flatMap((f) => f.sessions ?? [])),
    [folders]
  );

  const rootSessions = useMemo(
    () => sessions.filter(({ session }) => !sessionIdsInFolders.has(session.id)),
    [sessions, sessionIdsInFolders]
  );

  const filteredRootSessions = useMemo(
    () => filterAndSortSessions(rootSessions, search),
    [rootSessions, search]
  );

  const tabFilteredRootSessions = useMemo(() => {
    const byArchive =
      listArchiveTab === "sessions"
        ? filteredRootSessions.filter(({ session }) => !session.archived)
        : filteredRootSessions.filter(({ session }) => Boolean(session.archived));
    return byArchive.filter(({ session }) =>
      sessionPassesTimeRange(session, sessionsTimeRange)
    );
  }, [filteredRootSessions, listArchiveTab, sessionsTimeRange]);

  const workspaceSections = useMemo(
    () => [
      {
        title: listArchiveTab === "sessions" ? "" : "Archived",
        markerClassName: listArchiveTab === "sessions" ? "bg-blue-500" : "bg-neutral-400",
        items: tabFilteredRootSessions,
      },
    ],
    [listArchiveTab, tabFilteredRootSessions]
  );

  const handleMoveSessions = async (sessionIds: string[], folderId: string) => {
    await updateDoc(doc(db, "folders", folderId), {
      sessionIds: arrayUnion(...sessionIds),
    });
    if (user?.uid) await refreshFolders();
    const folder = folders.find((f) => f.id === folderId);
    if (folder) showToast(`Session${sessionIds.length > 1 ? "s" : ""} moved to ${folder.name}`);
  };

  const moveSessionToFolder = async (folderId: string) => {
    if (!draggedSessionId) return;
    await updateDoc(doc(db, "folders", folderId), {
      sessionIds: arrayUnion(draggedSessionId),
    });
    if (user?.uid) await refreshFolders();
    setDraggedSessionId(null);
    setHoveredFolder(null);
    const folder = folders.find((f) => f.id === folderId);
    if (folder) showToast(`Session moved to ${folder.name}`);
  };

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`);
  };

  const startRecording = () => {
    setCreatingSession(true);
    handleCreateSession((payload) => {
      setUpgradePayload(payload);
      setUpgradeModalOpen(true);
    }).finally(() => {
      setCreatingSession(false);
    });
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-10 pt-3">
        <SessionsHeader />

        <main className="flex-1">
          <div className="pt-3">
            {hasFolders && (
              <div className="mb-4">
                <h3 className="mb-3 text-[16px] font-semibold text-neutral-900">Folders</h3>
                {foldersLoading ? (
                  <FoldersSkeleton count={expectedFolderCount || 2} />
                ) : (
                  <div className="flex gap-4 flex-wrap">
                    {folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onRename={(name) => updateFolder(folder.id, { name })}
                        onDelete={() => removeFolder(folder.id)}
                        onMoveSessionsClick={() => setMoveModalFolder(folder)}
                        onDropSession={() => moveSessionToFolder(folder.id)}
                        onDragEnter={() => setHoveredFolder(folder.id)}
                        onDragLeave={() => setHoveredFolder(null)}
                        hoveredFolderId={hoveredFolder}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {isMounted && sessionsLoading ? (
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

                <SessionsWorkspace
                  sections={workspaceSections}
                  onView={handleView}
                  onRenameSuccess={(session) =>
                    updateSession(session.id, { title: session.title })
                  }
                  onArchiveSuccess={removeSession}
                  onRequestDelete={(session) => setDeleteTarget(session)}
                  onOpenMoveToFolder={setMoveToFolderSessionId}
                  viewMode={sessionViewMode}
                  onViewModeChange={setSessionViewMode}
                  isLoading
                  loadingRowCount={skeletonCount}
                />
              </div>
            ) : !isMounted ? null : sessions.length === 0 ? (
              <EmptySessionsCard />
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

                {tabFilteredRootSessions.length > 0 ? (
                  <SessionsWorkspace
                    sections={workspaceSections}
                    onView={handleView}
                    onRenameSuccess={(session) =>
                      updateSession(session.id, { title: session.title })
                    }
                    onArchiveSuccess={removeSession}
                    onRequestDelete={(session) => setDeleteTarget(session)}
                    onOpenMoveToFolder={setMoveToFolderSessionId}
                    viewMode={sessionViewMode}
                    onViewModeChange={setSessionViewMode}
                  />
                ) : null}

                {filteredRootSessions.length === 0 && (
                  <p className="py-8 text-[13px] text-neutral-500">
                    {search.trim()
                      ? "No sessions match your search."
                      : "No sessions at the workspace root yet. Create one or move sessions out of folders."}
                  </p>
                )}

                {filteredRootSessions.length > 0 && tabFilteredRootSessions.length === 0 && (
                  <p className="py-8 text-[13px] text-neutral-500">
                    {listArchiveTab === "sessions"
                      ? "No active sessions at the workspace root."
                      : "No archived sessions at the workspace root."}
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MoveSessionsModal
        open={!!moveModalFolder || !!moveToFolderSessionId}
        onClose={() => {
          setMoveModalFolder(null);
          setMoveToFolderSessionId(null);
        }}
        folder={moveModalFolder ?? { id: "", name: "" }}
        sessions={moveModalFolder ? rootSessions : []}
        sessionIdToMove={moveToFolderSessionId}
        folders={
          moveToFolderSessionId
            ? folders.map((f) => ({ id: f.id, name: f.name }))
            : []
        }
        onMove={async (ids, folderId) => {
          await handleMoveSessions(ids, folderId);
          setMoveModalFolder(null);
          setMoveToFolderSessionId(null);
        }}
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setUpgradePayload(null);
        }}
        message={upgradePayload?.message}
        upgradePlan={upgradePayload?.upgradePlan ?? null}
      />

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

      <DragGhostChip
        visible={!!draggedSessionId}
        sessionTitle={sessions.find((s) => s.session.id === draggedSessionId)?.session.title}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DragSessionProvider>
        <DashboardContent />
      </DragSessionProvider>
    </ToastProvider>
  );
}
