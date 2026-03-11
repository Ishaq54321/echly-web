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
              className="w-full border border-neutral-200 rounded-full px-4 py-2 text-sm mt-4 text-neutral-900 placeholder:text-meta focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-transparent"
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
                    <p className="text-xs text-secondary mt-0.5">
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
              <p className="text-sm text-secondary py-4">
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
            className="text-secondary text-sm px-4 py-2 hover:text-neutral-900 transition"
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
