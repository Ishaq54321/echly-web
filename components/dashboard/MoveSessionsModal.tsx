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
        className="w-[460px] p-6 bg-[#FFFFFF] border border-[#E3E6E5] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="move-sessions-title"
          className="text-h3 font-semibold mb-1 text-[#111111]"
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
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-left transition border ${
                  selectedFolderId === f.id
                    ? "border-[#E5E7EB] bg-[#E9ECEB]"
                    : "border-transparent hover:bg-[#E9ECEB]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFolderId === f.id}
                  onChange={() => {}}
                  className="mt-1 rounded border-[#E3E6E5] text-[#111111] focus:ring-gray-300"
                />
                <span className="text-meta font-medium text-[#111111]">
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
              className="w-full border border-[#E3E6E5] rounded-full px-4 py-2 text-meta mt-4 text-[#111111] placeholder:text-[#111111] focus:outline-none focus:border-[#D1D5DB] focus:shadow-[0_0_0_3px_rgba(209,213,219,0.4)]"
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
                    className="rounded border-[#E3E6E5] text-[#111111] focus:ring-gray-300"
                  />
                  <span className="text-meta text-[#5F6368]">Select all</span>
                </label>
              )}
              {filteredSessions.map(({ session }) => (
                <label
                  key={session.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#E9ECEB] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(session.id)}
                    onChange={() => toggleSession(session.id)}
                    className="mt-1 rounded border-[#E3E6E5] text-[#111111] focus:ring-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#111111] shrink-0" />
                      <span className="text-meta font-medium text-[#111111] truncate">
                        {session.title}
                      </span>
                    </div>
                    <p className="text-xs text-[#111111] mt-0.5">
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
              <p className="text-sm text-[#111111] py-4">
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
            className="text-[#111111] text-meta px-4 py-2 hover:bg-[#E9ECEB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={moveDisabled}
            className="primary-cta px-5 py-2 rounded-full text-meta disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
          >
            Move{moveCount > 0 ? ` (${moveCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
