# Dashboard Implementation — Extraction for Restore

This document captures the **exact** Dashboard implementation so it can be safely restored after a repository reset. **No code was modified**; this is documentation only.

---

## DASHBOARD IMPLEMENTATION FILES

### Entry & data

| File | Purpose |
|------|--------|
| `app/(app)/dashboard/page.tsx` | Main dashboard page (entry). Renders search, folders, sessions table, move modal, drag ghost. |
| `app/(app)/dashboard/hooks/useWorkspaceOverview.ts` | Loads user sessions + feedback counts; create session, update/remove session. |

### Dashboard UI components (used by page)

| File | Purpose |
|------|--------|
| `components/dashboard/SessionsHeader.tsx` | Title "Sessions", tabs (Sessions / Archived), New Folder / New Session buttons. |
| `components/dashboard/FolderCard.tsx` | Folder row: name, session count, menu (Rename, Move sessions, Share, Delete), drag-and-drop. |
| `components/dashboard/SessionsTableView.tsx` | Table: Session Name, Status, Feedback, Open, Replies, Activity bar, Updated. |
| `components/dashboard/MoveSessionsModal.tsx` | Modal to move one or many sessions into a folder (or pick folder for one session). |
| `components/dashboard/context/DragSessionContext.tsx` | Context for dragged session ID (drag-and-drop state). |
| `components/dashboard/context/ToastContext.tsx` | Context for showing toasts (e.g. "Session moved to …"). |
| `components/dashboard/DragGhostChip.tsx` | Floating chip shown while dragging a session. |
| `components/dashboard/RenameFolderModal.tsx` | Modal to rename a folder (used by FolderCard). |
| `components/ui/Toast.tsx` | Toast UI used by ToastContext. |

### Skeletons (loading states)

| File | Purpose |
|------|--------|
| `components/skeleton/SessionsTableSkeleton.tsx` | Table skeleton while sessions load. |
| `components/skeleton/FolderSkeleton.tsx` | Folder card skeleton while folders load. |

### Layout that wraps dashboard

| File | Purpose |
|------|--------|
| `app/(app)/layout.tsx` | App shell: GlobalRail, FloatingUtilityActions, ErrorBoundary. Wraps all (app) routes including dashboard. |

### Data layer (used by dashboard)

| File | Purpose |
|------|--------|
| `lib/sessions.ts` | `createSession`, `getUserSessions` (used by useWorkspaceOverview). |
| `lib/feedback.ts` | `getSessionFeedbackCounts` (used by useWorkspaceOverview). |
| `lib/firebase.ts` | `db` for Firestore (folders collection on dashboard page). |
| `lib/domain/session.ts` | `Session` type. |
| `lib/repositories/feedbackRepository.ts` | `SessionFeedbackCounts` type and repo. |
| `lib/utils/time.ts` | `formatRelativeTime` (used by SessionsTableView, MoveSessionsModal). |

### Dashboard-related styles

| Location | Purpose |
|----------|--------|
| `app/globals.css` (lines 288–298) | `.dashboard-workspace-section` and `@keyframes dashboard-section-in` (section fade). |

---

## Dashboard component structure (brief)

- **Entry:** `DashboardPage` (default export) wraps content in `ToastProvider` and `DragSessionProvider`, then renders `DashboardContent`.
- **DashboardContent:**  
  - Centered search input.  
  - `SessionsHeader`: Library / Sessions title, Sessions vs Archived tabs, New Folder, New Session.  
  - **Folders:** If folders load, a "Folders" section with `FolderCard` per folder (rename, delete, move sessions, drop session). Each `FolderCard` uses `RenameFolderModal`.  
  - **Sessions:** "Sessions" heading; then either `SessionsTableSkeleton` (loading), empty message, or `SessionsTableView` with filtered root sessions.  
  - `MoveSessionsModal` for moving sessions into a folder (or picking a folder for one session).  
  - `DragGhostChip` when a session is being dragged.
- **Data:** `useWorkspaceOverview(viewMode)` provides sessions (with counts), loading, create/update/remove. Folders are loaded from Firestore `folders` in the page (getDocs, addDoc, updateDoc, deleteDoc). Root sessions = sessions not in any folder; they are filtered by search and rendered in the table.

---

## Full file contents (for restore)

Below is the full source of every file that directly implements the Dashboard UI (entry, hooks, components, skeletons, layout). Data-layer files (`lib/sessions`, `lib/feedback`, etc.) are not pasted here; paths are listed above so you can restore from repo or backup.

---

### File: app/(app)/dashboard/page.tsx

```tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import { SessionsHeader } from "@/components/dashboard/SessionsHeader";
import { FolderCard } from "@/components/dashboard/FolderCard";
import { SessionsTableView } from "@/components/dashboard/SessionsTableView";
import SessionsTableSkeleton from "@/components/skeleton/SessionsTableSkeleton";
import FolderSkeleton from "@/components/skeleton/FolderSkeleton";
import { MoveSessionsModal } from "@/components/dashboard/MoveSessionsModal";
import { DragSessionProvider, useDragSession } from "@/components/dashboard/context/DragSessionContext";
import { ToastProvider, useToast } from "@/components/dashboard/context/ToastContext";
import { DragGhostChip } from "@/components/dashboard/DragGhostChip";

export interface DashboardFolder {
  id: string;
  name: string;
  sessions: string[];
}

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
    sessions,
    loading,
    handleCreateSession,
    updateSession,
    removeSession,
  } = useWorkspaceOverview(viewMode);
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState<DashboardFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [moveModalFolder, setMoveModalFolder] = useState<DashboardFolder | null>(null);
  const [moveToFolderSessionId, setMoveToFolderSessionId] = useState<string | null>(null);

  const loadFolders = async () => {
    setFoldersLoading(true);
    const snapshot = await getDocs(collection(db, "folders"));
    const folderData: DashboardFolder[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? "Untitled Folder",
        sessions: data.sessionIds ?? [],
      };
    });
    setFolders(folderData);
    setFoldersLoading(false);
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const createFolder = async () => {
    await addDoc(collection(db, "folders"), {
      name: "Untitled Folder",
      sessionIds: [],
      createdAt: serverTimestamp(),
    });
    await loadFolders();
  };

  const updateFolder = async (id: string, updates: Partial<Pick<DashboardFolder, "name" | "sessions">>) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    const ref = doc(db, "folders", id);
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.sessions !== undefined) payload.sessionIds = updates.sessions;
    if (Object.keys(payload).length > 0) await updateDoc(ref, payload);
  };

  const removeFolder = async (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    await deleteDoc(doc(db, "folders", id));
  };

  const sessionIdsInFolders = useMemo(
    () => new Set(folders.flatMap((f) => f.sessions)),
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
    await loadFolders();
    const folder = folders.find((f) => f.id === folderId);
    if (folder) showToast(`Session${sessionIds.length > 1 ? "s" : ""} moved to ${folder.name}`);
  };

  const moveSessionToFolder = async (folderId: string) => {
    if (!draggedSessionId) return;
    await updateDoc(doc(db, "folders", folderId), {
      sessionIds: arrayUnion(draggedSessionId),
    });
    await loadFolders();
    setDraggedSessionId(null);
    setHoveredFolder(null);
    const folder = folders.find((f) => f.id === folderId);
    if (folder) showToast(`Session moved to ${folder.name}`);
  };

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`);
  };

  return (
    <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20 relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[560px]">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search sessions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-full border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
          onNewSession={handleCreateSession}
        />

        <main className="flex-1">
          <div className="pt-8">
            {foldersLoading ? (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-neutral-700 mb-3">
                  Folders
                </h2>
                <div className="flex gap-4 flex-wrap">
                  <FolderSkeleton />
                  <FolderSkeleton />
                </div>
              </div>
            ) : folders.length > 0 ? (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-neutral-700 mb-3">
                  Folders
                </h2>
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
              </div>
            ) : null}

            {(foldersLoading || folders.length > 0) && (
              <h2 className="text-sm font-semibold text-neutral-700 mb-3">
                Sessions
              </h2>
            )}
            <div className="transition-opacity duration-200">
              {loading ? (
                <SessionsTableSkeleton />
              ) : filteredSessions.length === 0 ? (
                <p className="text-[14px] text-[hsl(var(--text-tertiary))] py-8">
                  {search.trim()
                    ? "No sessions match your search."
                    : viewMode === "archived"
                      ? "No archived sessions."
                      : "No sessions yet. Create one to get started."}
                </p>
              ) : (
                <SessionsTableView
                  items={filteredSessions}
                  onView={handleView}
                />
              )}
            </div>
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
```

---

### File: app/(app)/dashboard/hooks/useWorkspaceOverview.ts

```ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache } from "@/lib/authFetch";
import { onAuthStateChanged } from "firebase/auth";
import { createSession, getUserSessions } from "@/lib/sessions";
import { getSessionFeedbackCounts } from "@/lib/feedback";
import type { Session } from "@/lib/domain/session";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";

const SESSION_LIMIT = 50;

async function loadSessionsAndCounts(
  uid: string,
  archivedOnly?: boolean
): Promise<{
  sessions: Session[];
  counts: Record<string, SessionFeedbackCounts>;
}> {
  const userSessions = await getUserSessions(uid, SESSION_LIMIT, {
    archivedOnly,
  });
  const counts = await Promise.all(
    userSessions.map((s) =>
      getSessionFeedbackCounts(s.id).then((c) => [s.id, c] as const)
    )
  );
  return { sessions: userSessions, counts: Object.fromEntries(counts) };
}

export interface SessionWithCounts {
  session: Session;
  counts: SessionFeedbackCounts;
}

export type ViewMode = "all" | "archived";

export function useWorkspaceOverview(viewMode: ViewMode = "all") {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, SessionFeedbackCounts>>({});
  const [loading, setLoading] = useState(true);

  const archivedOnly = viewMode === "archived";

  const refreshSessions = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setLoading(true);
    try {
      const { sessions: userSessions, counts: newCounts } = await loadSessionsAndCounts(
        currentUser.uid,
        archivedOnly
      );
      setSessions(userSessions);
      setSessionCounts(newCounts);
    } finally {
      setLoading(false);
    }
  }, [archivedOnly]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        clearAuthTokenCache();
        router.push("/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadSessionsAndCounts(user.uid, archivedOnly)
      .then(({ sessions: userSessions, counts: newCounts }) => {
        setSessions(userSessions);
        setSessionCounts(newCounts);
      })
      .finally(() => setLoading(false));
  }, [user?.uid, archivedOnly]);

  const sessionsWithCounts: SessionWithCounts[] = sessions.map((session) => ({
    session,
    counts: sessionCounts[session.id] ?? { open: 0, resolved: 0 },
  }));

  const handleCreateSession = useCallback(async () => {
    if (!user) return;
    const parts = (auth.currentUser?.displayName || "User").trim().split(/\s+/);
    const firstName = parts[0] || "User";
    const lastName = parts.slice(1).join(" ") || "";
    const createdBy = {
      id: user.uid,
      firstName,
      lastName,
      avatarUrl: auth.currentUser?.photoURL ?? undefined,
    };
    const sessionId = await createSession(user.uid, createdBy);
    router.push(`/dashboard/${sessionId}`);
  }, [user, router]);

  const updateSession = useCallback((sessionId: string, patch: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s))
    );
  }, []);

  const removeSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSessionCounts((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
  }, []);

  return {
    user,
    sessions: sessionsWithCounts,
    loading,
    handleCreateSession,
    refreshSessions,
    updateSession,
    removeSession,
  };
}
```

---

### File: components/dashboard/SessionsHeader.tsx

```tsx
"use client";

export interface SessionsHeaderProps {
  activeTab: "all" | "archived";
  onTabChange: (tab: "all" | "archived") => void;
  sessionCount: number;
  onNewFolder: () => void;
  onNewSession: () => void;
}

export function SessionsHeader({
  activeTab,
  onTabChange,
  sessionCount,
  onNewFolder,
  onNewSession,
}: SessionsHeaderProps) {
  return (
    <div>
      {/* Title + Actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-neutral-500 font-medium">Library</div>
          <h1 className="text-4xl font-semibold">Sessions</h1>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNewFolder}
            className="border border-neutral-300 rounded-full px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition"
          >
            New Folder
          </button>

          <button
            type="button"
            onClick={onNewSession}
            className="bg-[#155DFC] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#0F4ED1] transition"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex items-end justify-between">
          <div className="flex gap-6">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              onClick={() => onTabChange("all")}
              className={`relative pb-3 text-sm font-semibold ${
                activeTab === "all" ? "text-neutral-900" : "text-neutral-500"
              }`}
            >
              Sessions
              {activeTab === "all" && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[#155DFC] rounded-full" />
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "archived"}
              onClick={() => onTabChange("archived")}
              className={`relative pb-3 text-sm font-semibold ${
                activeTab === "archived"
                  ? "text-neutral-900"
                  : "text-neutral-500"
              }`}
            >
              Archived
              {activeTab === "archived" && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[#155DFC] rounded-full" />
              )}
            </button>
          </div>

          {/* Session Count — aligned with tabs */}
          <div className="text-sm text-neutral-400">
            {sessionCount} sessions
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-neutral-200"></div>
      </div>
    </div>
  );
}
```

---

### File: components/dashboard/FolderCard.tsx

```tsx
"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Folder, MoreHorizontal, Pencil, Trash2, FolderInput, UserPlus } from "lucide-react";
import { RenameFolderModal } from "./RenameFolderModal";
import { useDragSession } from "./context/DragSessionContext";

const DROPDOWN_Z_INDEX = 1000;

export interface FolderCardFolder {
  id: string;
  name: string;
  sessions: string[];
}

export interface FolderCardProps {
  folder: FolderCardFolder;
  onRename: (name: string) => void;
  onDelete: () => void;
  onMoveSessionsClick?: () => void;
  onDropSession?: (sessionId?: string) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  hoveredFolderId?: string | null;
}

const menuItemClass =
  "w-full px-3 py-2.5 text-left text-[14px] font-medium rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20";

export function FolderCard({
  folder,
  onRename,
  onDelete,
  onMoveSessionsClick,
  onDropSession,
  onDragEnter,
  onDragLeave,
  hoveredFolderId,
}: FolderCardProps) {
  const router = useRouter();
  const { draggedSessionId } = useDragSession();
  const [isDragOver, setIsDragOver] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setMoreOpen(false);
    setDropdownPosition(null);
  }, []);

  useLayoutEffect(() => {
    if (!moreOpen || typeof document === "undefined") return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const padding = 8;
    const dropdownMinWidth = 160;
    setDropdownPosition({
      top: rect.bottom + padding,
      left: Math.max(8, rect.right - dropdownMinWidth),
    });
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inTrigger && !inMenu) closeMenu();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen, closeMenu]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moreOpen, closeMenu]);

  useEffect(() => {
    if (moreOpen) {
      firstMenuItemRef.current?.focus();
    }
  }, [moreOpen]);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameOpen(true);
    closeMenu();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
    closeMenu();
  };

  const handleRenameSave = (name: string) => {
    onRename(name);
  };

  const handleMoveSessions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMoveSessionsClick?.();
    closeMenu();
  };

  const isHovered = hoveredFolderId != null ? hoveredFolderId === folder.id : isDragOver;

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (draggedSessionId) setIsDragOver(true);
    },
    [draggedSessionId]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (draggedSessionId) onDragEnter?.();
    },
    [draggedSessionId, onDragEnter]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
        onDragLeave?.();
      }
    },
    [onDragLeave]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (draggedSessionId && onDropSession) {
        onDropSession();
      }
    },
    [draggedSessionId, onDropSession]
  );

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Placeholder: share folder not implemented
    closeMenu();
  };

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl cursor-pointer transition-all duration-200 ease-out hover:bg-neutral-50 hover:!border-[#155DFC80] hover:ring-1 hover:ring-[#155DFC40] hover:shadow-md hover:-translate-y-[1px] group min-w-[200px] relative shadow-sm ${
          isHovered ? "!border-[#155DFC80] !ring-1 !ring-[#155DFC40]" : ""
        }`}
        data-folder-id={folder.id}
        onClick={() => router.push(`/folders/${folder.id}`)}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {draggedSessionId && isHovered && (
          <span
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-neutral-900 text-white px-2 py-1 rounded-md shadow pointer-events-none z-10"
            role="tooltip"
          >
            Drop to move session
          </span>
        )}
        <Folder className="w-5 h-5 text-[#155DFC] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-neutral-900 truncate">
            {folder.name}
          </div>
          <div className="text-xs text-neutral-500">
            {folder.sessions.length} sessions
          </div>
        </div>
        <div className="relative shrink-0" data-card-actions>
          <button
            ref={triggerRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMoreOpen((prev) => !prev);
            }}
            aria-label="Folder actions"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className="flex items-center justify-center h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {moreOpen &&
        dropdownPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            data-card-actions
            role="menu"
            aria-label="Folder actions"
            className="min-w-[160px] rounded-xl border border-neutral-200 bg-white shadow-lg py-1"
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: DROPDOWN_Z_INDEX,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              ref={firstMenuItemRef}
              type="button"
              onClick={handleRenameClick}
              className={menuItemClass}
              role="menuitem"
            >
              <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Rename
            </button>
            <button
              type="button"
              onClick={handleMoveSessions}
              className={menuItemClass}
              role="menuitem"
            >
              <FolderInput className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Move sessions
            </button>
            <button
              type="button"
              onClick={handleShare}
              className={menuItemClass}
              role="menuitem"
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Share
            </button>
            <div className="my-1 border-t border-neutral-200" role="separator" aria-hidden />
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full px-3 py-2.5 text-left text-[14px] font-medium rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
              role="menuitem"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Delete
            </button>
          </div>,
          document.body
        )}

      <RenameFolderModal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        currentName={folder.name}
        onSave={handleRenameSave}
      />
    </>
  );
}
```

---

### File: components/dashboard/SessionsTableView.tsx

```tsx
"use client";

import React from "react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatRelativeTime } from "@/lib/utils/time";

export interface SessionsTableViewProps {
  items: SessionWithCounts[];
  onView: (sessionId: string) => void;
}

function getSessionStatus(
  open: number,
  total: number
): "Active" | "Resolved" | "Inactive" {
  if (total === 0) return "Inactive";
  if (open > 0) return "Active";
  return "Resolved";
}

/** Activity score for bar width: feedback count + reply count (visual only). */
function getActivityScore(item: SessionWithCounts): number {
  const feedback = item.counts.open + item.counts.resolved;
  const replies = item.session.commentCount ?? 0;
  return feedback + replies;
}

const ACTIVITY_BAR_MAX = 80; // max width %

export function SessionsTableView({ items, onView }: SessionsTableViewProps) {
  const maxActivity = React.useMemo(() => {
    if (items.length === 0) return 1;
    const max = Math.max(...items.map(getActivityScore), 1);
    return max;
  }, [items]);

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">
              Session Name
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-24">
              Status
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-20 text-right tabular-nums">
              Feedback
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-16 text-right tabular-nums">
              Open
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-16 text-right tabular-nums">
              Replies
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-28">
              Activity
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-24 text-right">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const open = item.session.openCount ?? item.counts.open;
            const total = item.counts.open + item.counts.resolved;
            const status = getSessionStatus(open, total);
            const feedbackCount = total;
            const replyCount = item.session.commentCount ?? 0;
            const activityScore = getActivityScore(item);
            const activityPct = Math.min(
              (activityScore / maxActivity) * ACTIVITY_BAR_MAX,
              100
            );

            const statusStyles =
              status === "Active"
                ? "bg-[rgba(16,185,129,0.08)] text-[#059669]"
                : status === "Resolved"
                  ? "bg-[rgba(107,114,128,0.08)] text-[#4b5563]"
                  : "bg-[rgba(0,0,0,0.04)] text-[#9ca3af]";

            return (
              <tr
                key={item.session.id}
                onClick={() => onView(item.session.id)}
                className="border-b border-[rgba(0,0,0,0.06)] last:border-b-0 transition-colors duration-120 cursor-pointer hover:bg-[rgba(0,0,0,0.025)]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView(item.session.id);
                  }
                }}
              >
                <td className="px-4 pt-[14px] pb-[14px]">
                  <span className="text-[14.5px] font-medium text-neutral-900">
                    {item.session.title || "Untitled Session"}
                  </span>
                </td>
                <td className="px-4 pt-[14px] pb-[14px]">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium ${statusStyles}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-4 pt-[14px] pb-[14px] text-right text-[13px] tabular-nums text-neutral-600">
                  {feedbackCount}
                </td>
                <td className="px-4 pt-[14px] pb-[14px] text-right text-[13px] tabular-nums text-neutral-600">
                  {open}
                </td>
                <td className="px-4 pt-[14px] pb-[14px] text-right text-[13px] tabular-nums text-neutral-600">
                  {replyCount}
                </td>
                <td className="px-4 pt-[14px] pb-[14px]">
                  <div
                    className="h-1.5 rounded-full bg-neutral-200 max-w-[64px] overflow-hidden"
                    role="presentation"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-neutral-400 min-w-[2px]"
                      style={{ width: `${Math.max(activityPct, 2)}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 pt-[14px] pb-[14px] text-right text-[13px] text-neutral-500">
                  {item.session.updatedAt
                    ? formatRelativeTime(item.session.updatedAt)
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

---

### File: components/skeleton/SessionsTableSkeleton.tsx

```tsx
export default function SessionsTableSkeleton() {
  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3">
              Session Name
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-24">
              Status
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-20 text-right">
              Feedback
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-16 text-right">
              Open
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-16 text-right">
              Replies
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-28">
              Activity
            </th>
            <th className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6b7280] px-4 py-3 w-24 text-right">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr
              key={i}
              className="border-b border-[rgba(0,0,0,0.06)] last:border-b-0"
            >
              <td className="px-4 pt-[14px] pb-[14px]">
                <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
              </td>
              <td className="px-4 pt-[14px] pb-[14px]">
                <div className="h-4 w-12 rounded bg-neutral-100 animate-pulse" />
              </td>
              <td className="px-4 pt-[14px] pb-[14px] text-right">
                <div className="h-4 w-6 rounded bg-neutral-100 animate-pulse inline-block" />
              </td>
              <td className="px-4 pt-[14px] pb-[14px] text-right">
                <div className="h-4 w-6 rounded bg-neutral-100 animate-pulse inline-block" />
              </td>
              <td className="px-4 pt-[14px] pb-[14px] text-right">
                <div className="h-4 w-6 rounded bg-neutral-100 animate-pulse inline-block" />
              </td>
              <td className="px-4 pt-[14px] pb-[14px]">
                <div className="h-1.5 w-14 rounded-full bg-neutral-200 animate-pulse" />
              </td>
              <td className="px-4 pt-[14px] pb-[14px] text-right">
                <div className="h-4 w-16 rounded bg-neutral-100 animate-pulse inline-block ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### File: components/skeleton/FolderSkeleton.tsx

```tsx
export default function FolderSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 border border-neutral-200 rounded-xl p-4 bg-white min-w-[200px]">
      <div className="h-5 w-5 bg-neutral-200 rounded shrink-0" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-3 w-16 bg-neutral-100 rounded" />
      </div>
    </div>
  );
}
```

---

### File: components/dashboard/MoveSessionsModal.tsx

```tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FileText } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/time";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";

export interface MoveSessionsModalProps {
  open: boolean;
  onClose: () => void;
  folder: { id: string; name: string };
  sessions: SessionWithCounts[];
  onMove: (sessionIds: string[], folderId: string) => void;
  /** When set with folders, show "Move session to folder" and list folders instead of sessions. */
  sessionIdToMove?: string | null;
  /** Folders for "pick folder" mode (used with sessionIdToMove). */
  folders?: { id: string; name: string }[];
}

export function MoveSessionsModal({
  open,
  onClose,
  folder,
  sessions,
  onMove,
  sessionIdToMove = null,
  folders = [],
}: MoveSessionsModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const isPickFolderMode =
    !!sessionIdToMove && folders.length > 0 && !folder.id;

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(({ session }) =>
      session.title.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const toggleSession = (sessionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSessions.map(({ session }) => session.id)));
    }
  };

  const handleMove = () => {
    if (isPickFolderMode) {
      if (!selectedFolderId || !sessionIdToMove) return;
      onMove([sessionIdToMove], selectedFolderId);
      setSelectedFolderId(null);
    } else {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      onMove(ids, folder.id);
      setSelectedIds(new Set());
    }
    setSearch("");
    onClose();
  };

  const handleClose = useCallback(() => {
    setSelectedIds(new Set());
    setSearch("");
    setSelectedFolderId(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  if (!open) return null;

  const moveDisabled = isPickFolderMode
    ? !selectedFolderId
    : selectedIds.size === 0;
  const moveCount = isPickFolderMode ? 1 : selectedIds.size;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-sessions-title"
    >
      <div
        className="w-[460px] p-6 bg-white rounded-2xl shadow-xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="move-sessions-title"
          className="text-lg font-semibold mb-1 text-neutral-900"
        >
          {isPickFolderMode
            ? "Move session to folder"
            : `Move sessions to "${folder.name}"`}
        </h2>

        {isPickFolderMode ? (
          <div className="space-y-2 max-h-[320px] overflow-y-auto mt-4">
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setSelectedFolderId((prev) => (prev === f.id ? null : f.id))
                }
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left transition border ${
                  selectedFolderId === f.id
                    ? "border-[#155DFC] bg-[#155DFC]/5"
                    : "border-transparent hover:bg-neutral-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFolderId === f.id}
                  onChange={() => {}}
                  className="mt-1 rounded border-neutral-300 text-[#155DFC] focus:ring-[#155DFC]/20"
                />
                <span className="text-sm font-medium text-neutral-900">
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-neutral-200 rounded-full px-4 py-2 text-sm mt-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-transparent"
              aria-label="Search sessions"
            />

            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-0">
              {filteredSessions.length > 0 && (
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      filteredSessions.length > 0 &&
                      filteredSessions.every(({ session }) =>
                        selectedIds.has(session.id)
                      )
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 text-[#155DFC] focus:ring-[#155DFC]/20"
                  />
                  <span className="text-sm text-neutral-700">Select all</span>
                </label>
              )}
              {filteredSessions.map(({ session }) => (
                <label
                  key={session.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(session.id)}
                    onChange={() => toggleSession(session.id)}
                    className="mt-1 rounded border-neutral-300 text-[#155DFC] focus:ring-[#155DFC]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#155DFC] shrink-0" />
                      <span className="text-sm font-medium text-neutral-900 truncate">
                        {session.title}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Updated{" "}
                      {session.updatedAt
                        ? formatRelativeTime(session.updatedAt)
                        : "recently"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {filteredSessions.length === 0 && (
              <p className="text-sm text-neutral-500 py-4">
                {search.trim()
                  ? "No sessions match your search."
                  : "No sessions available to move."}
              </p>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="text-neutral-600 text-sm px-4 py-2 hover:text-neutral-900 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={moveDisabled}
            className="bg-[#155DFC] text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-[#0F4ED1] transition disabled:cursor-not-allowed"
          >
            Move{moveCount > 0 ? ` (${moveCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### File: components/dashboard/context/DragSessionContext.tsx

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface DragSessionContextValue {
  draggedSessionId: string | null;
  setDraggedSessionId: (id: string | null) => void;
}

const DragSessionContext = createContext<DragSessionContextValue | null>(null);

export function DragSessionProvider({ children }: { children: ReactNode }) {
  const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);
  return (
    <DragSessionContext.Provider
      value={{ draggedSessionId, setDraggedSessionId }}
    >
      {children}
    </DragSessionContext.Provider>
  );
}

export function useDragSession() {
  const ctx = useContext(DragSessionContext);
  if (!ctx) {
    return {
      draggedSessionId: null,
      setDraggedSessionId: () => {},
    };
  }
  return ctx;
}
```

---

### File: components/dashboard/context/ToastContext.tsx

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Toast } from "@/components/ui/Toast";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={dismissToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}
```

---

### File: components/dashboard/DragGhostChip.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface DragGhostChipProps {
  visible: boolean;
  sessionTitle?: string;
}

export function DragGhostChip({ visible, sessionTitle }: DragGhostChipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const updatePosition = (e: { clientX: number; clientY: number }) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMove = (e: MouseEvent) => updatePosition(e);
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      updatePosition(e);
    };
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("dragover", handleDragOver);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("dragover", handleDragOver);
    };
  }, [visible]);

  if (!visible || typeof document === "undefined" || !mounted) return null;

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9998] bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-sm text-sm text-neutral-700 whitespace-nowrap max-w-[200px] truncate"
      style={{
        left: position.x + 12,
        top: position.y + 12,
      }}
    >
      📄 Moving session{sessionTitle ? `: ${sessionTitle.length > 20 ? sessionTitle.slice(0, 20) + "…" : sessionTitle}` : ""}
    </div>,
    document.body
  );
}
```

---

### File: components/dashboard/RenameFolderModal.tsx

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export interface RenameFolderModalProps {
  open: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

export function RenameFolderModal({
  open,
  onClose,
  currentName,
  onSave,
}: RenameFolderModalProps) {
  const [value, setValue] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(currentName);
    setError(null);
  }, [currentName, open]);

  useEffect(() => {
    if (open) {
      setValue(currentName);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open, currentName]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-folder-title"
    >
      <div
        className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rename-folder-title"
          className="text-xl font-semibold text-neutral-900 mb-4"
        >
          Rename folder
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-transparent"
          aria-label="Folder name"
          aria-invalid={!!error}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={value.trim() === ""}
            className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[#155DFC] text-white hover:bg-[#0F4ED1] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### File: components/ui/Toast.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible || !message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [visible, message, duration, onDismiss]);

  if (!visible || !message || typeof document === "undefined" || !mounted)
    return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium shadow-lg transition-opacity duration-200"
    >
      {message}
    </div>,
    document.body
  );
}
```

---

### File: app/(app)/layout.tsx

```tsx
import GlobalRail from "@/components/layout/GlobalRail";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <GlobalRail />
      <main className="relative flex flex-1 min-h-0 overflow-auto">
        <FloatingUtilityActions />
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <div className="fixed bottom-4 right-6 text-[11px] text-neutral-400 pointer-events-none">
        All changes saved • Secure session
      </div>
    </div>
  );
}
```

---

### Dashboard-related CSS (app/globals.css, lines 288–298)

```css
/* ======================================
   WORKSPACE DASHBOARD — SECTION FADE
====================================== */

.dashboard-workspace-section {
  opacity: 0;
  animation: dashboard-section-in 160ms ease-out forwards;
}
@keyframes dashboard-section-in {
  to { opacity: 1; }
}
```

---

**End of extraction.** Use this document to restore the Dashboard implementation after a repository reset. No code was modified during this extraction.
