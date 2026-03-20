"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { clearAuthTokenCache, authFetch } from "@/lib/authFetch";
import type { Session } from "@/lib/domain/session";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { useWorkspaceOverview } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { Folder, Loader2 } from "lucide-react";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { MoveSessionsModal } from "@/components/dashboard/MoveSessionsModal";
import SessionsGridSkeleton from "@/components/skeleton/SessionsGridSkeleton";
import { DragSessionProvider } from "@/components/dashboard/context/DragSessionContext";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { Button } from "@/components/ui/Button";
import { DeleteSessionModal } from "@/components/dashboard/DeleteSessionModal";

interface FolderData {
  id: string;
  name: string;
  sessionIds: string[];
}

function FolderPageContent() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;

  const [folder, setFolder] = useState<FolderData | null>(null);
  const [sessions, setSessions] = useState<SessionWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const initialSnapshotHandledRef = useRef(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePayload, setUpgradePayload] = useState<{
    message: string;
    upgradePlan: string | null;
  } | null>(null);
  const { sessions: allSessions, loading: allSessionsLoading } = useWorkspaceOverview("all");
  const sessionsNotInFolder = useMemo(
    () =>
      folder
        ? allSessions.filter(({ session }) => !folder.sessionIds.includes(session.id))
        : [],
    [folder, allSessions]
  );

  const loadFolder = useCallback(async () => {
    if (!folderId) return;

    const folderRef = doc(db, "folders", folderId);
    const folderSnap = await getDoc(folderRef);

    if (!folderSnap.exists()) {
      setFolder(null);
      setSessions([]);
      setLoading(false);
      return;
    }

    const data = folderSnap.data();
    const folderData: FolderData = {
      id: folderSnap.id,
      name: data.name ?? "Untitled Folder",
      sessionIds: data.sessionIds ?? [],
    };
    setFolder(folderData);
    setLoading(false);
  }, [folderId]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        clearAuthTokenCache();
        router.push("/login");
        return;
      }
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (!folderId) return;
    initialSnapshotHandledRef.current = false;
    const unsub = onSnapshot(doc(db, "folders", folderId), (snap) => {
      if (!initialSnapshotHandledRef.current) {
        initialSnapshotHandledRef.current = true;
      }
      if (!snap.exists()) {
        setFolder(null);
        setSessions([]);
        setLoading(false);
        return;
      }
      const data = snap.data();
      const folderData: FolderData = {
        id: snap.id,
        name: data.name ?? "Untitled Folder",
        sessionIds: data.sessionIds ?? [],
      };
      setFolder(folderData);
      setLoading(false);
    });
    return () => unsub();
  }, [folderId]);

  useEffect(() => {
    if (!folder) {
      setSessions([]);
      return;
    }
    const orderMap = new Map(folder.sessionIds.map((id, i) => [id, i]));
    const mapped = allSessions
      .filter(({ session }) => folder.sessionIds.includes(session.id) && !session.archived)
      .sort(
        (a, b) =>
          (orderMap.get(a.session.id) ?? Number.MAX_SAFE_INTEGER) -
          (orderMap.get(b.session.id) ?? Number.MAX_SAFE_INTEGER)
      );
    setSessions(mapped);
  }, [folder, allSessions]);

  useEffect(() => {
    if (!folder) return;
    setLoading(allSessionsLoading);
  }, [folder, allSessionsLoading]);

  const handleCreateSession = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Optimistic insert: show a temp session card instantly.
    const tempSessionId = `temp-${Date.now()}`;
    const tempItem: SessionWithCounts = {
      session: {
        id: tempSessionId,
        title: "Untitled Session",
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
      },
      counts: { total: 0, open: 0, resolved: 0, skipped: 0 },
    };
    setSessions((prev) => [tempItem, ...prev]);

    try {
      const res = await authFetch("/api/sessions", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 403) {
        setSessions((prev) => prev.filter((x) => x.session.id !== tempSessionId));
        if (data.error === "PLAN_LIMIT_REACHED") {
          setUpgradePayload({
            message: data.message ?? "You've reached your plan limit.",
            upgradePlan: data.upgradePlan ?? "starter",
          });
          setUpgradeModalOpen(true);
          return;
        }
        if (data.error === "WORKSPACE_SUSPENDED") {
          setUpgradePayload({
            message: data.message ?? "Workspace suspended. Contact support.",
            upgradePlan: null,
          });
          setUpgradeModalOpen(true);
          return;
        }
        setUpgradePayload({
          message:
            (data && typeof data.message === "string" && data.message) ||
            "You don't have permission to create a session.",
          upgradePlan: data?.upgradePlan ?? null,
        });
        setUpgradeModalOpen(true);
        return;
      }

      if (!res.ok) {
        setSessions((prev) => prev.filter((x) => x.session.id !== tempSessionId));
        console.error("Create session failed:", res.status, data);
        return;
      }

      const sessionId = data.session?.id;
      if (!sessionId) {
        setSessions((prev) => prev.filter((x) => x.session.id !== tempSessionId));
        return;
      }

      // Replace temp session with the real one (match by temp id).
      setSessions((prev) =>
        prev.map((x) =>
          x.session.id === tempSessionId
            ? {
                ...x,
                session: { ...x.session, id: sessionId, isOptimistic: false, updatedAt: new Date() },
              }
            : x
        )
      );

      // Sync folder membership in the background.
      if (folderId) {
        void updateDoc(doc(db, "folders", folderId), {
          sessionIds: arrayUnion(sessionId),
        }).catch((err) => console.error("Failed to add session to folder:", err));
      }

      router.push(`/dashboard/${sessionId}`);
    } catch (err) {
      setSessions((prev) => prev.filter((x) => x.session.id !== tempSessionId));
      console.error("Create session failed:", err);
    }
  }, [folderId, router]);

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`);
  };

  const handleRenameSuccess = (session: { id: string; title: string }) => {
    setSessions((prev) =>
      prev.map((item) =>
        item.session.id === session.id
          ? { ...item, session: { ...item.session, title: session.title } }
          : item
      )
    );
  };

  const handleArchiveOrDelete = (sessionId: string) => {
    setSessions((prev) => prev.filter((item) => item.session.id !== sessionId));
  };

  const handleDeleteSessionOptimistic = useCallback(
    async (session: Session) => {
      const sessionId = session.id;
      const snapshot = sessions.find((x) => x.session.id === sessionId);

      // Optimistic remove.
      setSessions((prev) => prev.filter((item) => item.session.id !== sessionId));

      try {
        const res = await authFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data && data.error) || "Failed to delete session");
        }
      } catch (err) {
        // Error recovery: reinsert session when delete fails.
        if (snapshot) setSessions((prev) => [snapshot, ...prev]);
        throw err;
      }
    },
    [sessions]
  );

  const removeSessionFromFolder = async (sessionId: string) => {
    await updateDoc(doc(db, "folders", folderId), {
      sessionIds: arrayRemove(sessionId),
    });
    await loadFolder();
  };

  if (!folder && !loading) {
    return (
      <div className="bg-white flex flex-col w-full min-h-[40vh]">
        <div className="mx-auto w-full max-w-[1800px] px-10 py-8 flex items-center justify-center">
          <p className="text-[14px] text-[hsl(var(--text-tertiary))]">
            Folder not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20 relative">
      <div className="mx-auto w-full max-w-[1800px] px-10 pt-10 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-secondary font-medium">
              Folder
            </div>
            {loading ? (
              <div className="h-10 w-48 bg-neutral-200 rounded animate-pulse mt-1" />
            ) : folder ? (
              <h1 className="text-4xl font-semibold">
                {folder.name}
              </h1>
            ) : null}
          </div>

          <div className="flex gap-3">
            {!loading && (
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  setCreatingSession(true);
                  void handleCreateSession().finally(() => setCreatingSession(false));
                }}
                disabled={creatingSession}
                aria-busy={creatingSession}
                className="rounded-full px-5 py-2 text-sm font-semibold"
              >
                {creatingSession ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Creating…
                  </span>
                ) : (
                  "New Session"
                )}
              </Button>
            )}
          </div>
        </div>

        <main className="flex-1">
          <div className="pt-8">
            <div className="transition-opacity duration-200">
              {loading ? (
                <SessionsGridSkeleton />
              ) : folder && folder.sessionIds.length > 0 ? (
                <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
                  {sessions.map((item, index) => (
                    <WorkspaceCard
                      key={item.session.id}
                      item={item}
                      onView={handleView}
                      index={index}
                      onRenameSuccess={handleRenameSuccess}
                      onArchiveSuccess={handleArchiveOrDelete}
                      onRequestDelete={(session) => setDeleteTarget(session)}
                      isRootSession={false}
                      folderId={folderId}
                      onRemoveFromFolder={removeSessionFromFolder}
                    />
                  ))}
                </div>
              ) : folder ? (
                <div className="flex flex-col items-center justify-center mt-24 text-center">
                  <Folder className="w-12 h-12 text-[#155DFC] mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    This folder is empty
                  </h3>
                  <p className="text-sm text-secondary mb-6 max-w-sm">
                    Move sessions into this folder to organize your feedback and recordings.
                  </p>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => setMoveModalOpen(true)}
                    className="rounded-full px-5 py-2 text-sm font-semibold"
                  >
                    Add Sessions
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <MoveSessionsModal
        open={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        folder={folder ? { id: folder.id, name: folder.name } : { id: "", name: "" }}
        sessions={sessionsNotInFolder}
        onMove={async (sessionIds, targetFolderId) => {
          await updateDoc(doc(db, "folders", targetFolderId), {
            sessionIds: arrayUnion(...sessionIds),
          });
          await loadFolder();
          setMoveModalOpen(false);
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
          await handleDeleteSessionOptimistic(deleteTarget);
        }}
      />
    </div>
  );
}

export default function FolderPage() {
  return (
    <DragSessionProvider>
      <FolderPageContent />
    </DragSessionProvider>
  );
}
