"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { clearAuthTokenCache } from "@/lib/authFetch";
import { createSession } from "@/lib/sessions";
import { getSessionFeedbackCounts } from "@/lib/feedback";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import type { Session } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { useWorkspaceOverview } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { Folder } from "lucide-react";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { MoveSessionsModal } from "@/components/dashboard/MoveSessionsModal";
import SessionsGridSkeleton from "@/components/skeleton/SessionsGridSkeleton";
import { DragSessionProvider } from "@/components/dashboard/context/DragSessionContext";

interface FolderData {
  id: string;
  name: string;
  sessionIds: string[];
}

async function loadFolderSessions(
  sessionIds: string[]
): Promise<SessionWithCounts[]> {
  if (sessionIds.length === 0) return [];

  const sessionsAndCounts = await Promise.all(
    sessionIds.map(async (id) => {
      const session = await getSessionByIdRepo(id);
      const counts: SessionFeedbackCounts = session
        ? await getSessionFeedbackCounts(id)
        : { open: 0, resolved: 0, skipped: 0 };
      return { id, session, counts };
    })
  );

  const valid = sessionsAndCounts.filter(
    (x): x is { id: string; session: Session; counts: SessionFeedbackCounts } =>
      x.session != null && !(x.session as Session & { archived?: boolean }).archived
  );

  const orderMap = new Map(sessionIds.map((id, i) => [id, i]));
  return valid
    .map(({ session, counts }) => ({ session, counts }))
    .sort(
      (a, b) =>
        (orderMap.get(a.session.id) ?? 999) - (orderMap.get(b.session.id) ?? 999)
    );
}

function FolderPageContent() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;

  const [folder, setFolder] = useState<FolderData | null>(null);
  const [sessions, setSessions] = useState<SessionWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const { sessions: allSessions } = useWorkspaceOverview("all");
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

    const sessionsWithCounts = await loadFolderSessions(folderData.sessionIds);
    setSessions(sessionsWithCounts);
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
    setLoading(true);
    const unsub = onSnapshot(doc(db, "folders", folderId), async (snap) => {
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
      const sessionsWithCounts = await loadFolderSessions(folderData.sessionIds);
      setSessions(sessionsWithCounts);
      setLoading(false);
    });
    return () => unsub();
  }, [folderId]);

  const handleCreateSession = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const parts = (currentUser.displayName || "User").trim().split(/\s+/);
    const firstName = parts[0] || "User";
    const lastName = parts.slice(1).join(" ") || "";
    const createdBy = {
      id: currentUser.uid,
      firstName,
      lastName,
      avatarUrl: currentUser.photoURL ?? undefined,
    };

    const sessionId = await createSession(currentUser.uid, createdBy);

    if (folderId) {
      const { updateDoc, arrayUnion } = await import("firebase/firestore");
      await updateDoc(doc(db, "folders", folderId), {
        sessionIds: arrayUnion(sessionId),
      });
      await loadFolder();
    }

    router.push(`/dashboard/${sessionId}`);
  }, [folderId, router, loadFolder]);

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
              <button
                type="button"
                onClick={handleCreateSession}
                className="bg-[#155DFC] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#0F4ED1] transition"
              >
                New Session
              </button>
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
                      onDeleteSuccess={handleArchiveOrDelete}
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
                  <button
                    type="button"
                    onClick={() => setMoveModalOpen(true)}
                    className="bg-[#155DFC] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#0F4ED1]"
                  >
                    Add Sessions
                  </button>
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
