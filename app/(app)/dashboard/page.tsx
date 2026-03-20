"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { setDoc, updateDoc, deleteDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import type { DashboardFolder } from "./hooks/useWorkspaceOverview";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { SessionsHeader } from "@/components/dashboard/SessionsHeader";
import { FolderCard } from "@/components/dashboard/FolderCard";
import EmptySessionsCard from "@/components/dashboard/EmptySessionsCard";
import FoldersSkeleton from "@/components/skeleton/FoldersSkeleton";
import SessionSkeletonList from "@/components/skeleton/SessionSkeletonList";
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
  const [viewMode, setViewMode] = useState<"all" | "archived">("all");
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
  } = useWorkspaceOverview(viewMode);
  const [search, setSearch] = useState("");
  const hasFolders = folders.length > 0;
  const sessionSkeletonCount = expectedSessionCount ?? 0;
  const [moveModalFolder, setMoveModalFolder] = useState<DashboardFolder | null>(null);
  const [moveToFolderSessionId, setMoveToFolderSessionId] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePayload, setUpgradePayload] = useState<{ message: string; upgradePlan: string | null } | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createFolder = async () => {
    if (!user?.uid) return;
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const folderId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await setDoc(doc(db, "folders", folderId), {
      name: "Untitled Folder",
      sessionIds: [],
      workspaceId,
      createdAt: serverTimestamp(),
    });
    await refreshFolders();
  };

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

  const filteredSessions = useMemo(
    () => filterAndSortSessions(rootSessions, search),
    [rootSessions, search]
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
    <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20 relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[560px]">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-meta pointer-events-none" />
          <input
            type="search"
            placeholder="Search sessions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-full border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
            aria-label="Search sessions"
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1800px] px-10 pt-10 pb-8">
        <SessionsHeader
          activeTab={viewMode}
          onTabChange={setViewMode}
          sessionCount={sessions.length}
          onNewFolder={createFolder}
          isCreating={creatingSession}
          onNewSession={startRecording}
        />

        <main className="flex-1">
          <div className="pt-8">
            {hasFolders && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Folders</h3>
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

            {hasFolders && (
              <h2 className="text-sm font-semibold text-neutral-700 mb-3">
                Sessions
              </h2>
            )}

            {isMounted && sessionsLoading && sessionSkeletonCount > 0 ? (
              <SessionSkeletonList count={sessionSkeletonCount} />
            ) : !isMounted ? null : sessions.length === 0 ? (
              <EmptySessionsCard />
            ) : (
              <div className="transition-opacity duration-150">
                <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
                  {filteredSessions.map((item, index) => (
                    <WorkspaceCard
                      key={item.session.id}
                      item={item}
                      onView={handleView}
                      index={index}
                      onRenameSuccess={(session) =>
                        updateSession(session.id, { title: session.title })
                      }
                      onArchiveSuccess={removeSession}
                      onRequestDelete={(session) => setDeleteTarget(session)}
                      onOpenMoveToFolder={setMoveToFolderSessionId}
                    />
                  ))}
                </div>

                {filteredSessions.length === 0 && (
                  <p className="text-[14px] text-[hsl(var(--text-tertiary))] py-8">
                    {search.trim()
                      ? "No sessions match your search."
                      : viewMode === "archived"
                        ? "No archived sessions."
                        : "No sessions yet. Create one to get started."}
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
