"use client";

import { useState, useCallback, useEffect } from "react";
import { Folder } from "lucide-react";

export interface MoveToFolderFolder {
  id: string;
  name: string;
  sessionIds: string[];
}

export interface MoveToFolderModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  folders: MoveToFolderFolder[];
  onMove: (sessionId: string, folderId: string) => void | Promise<void>;
  onCreateFolder: () => void | Promise<void>;
}

export function MoveToFolderModal({
  open,
  onClose,
  sessionId,
  folders,
  onMove,
  onCreateFolder,
}: MoveToFolderModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const handleMove = useCallback(async () => {
    if (!selected) return;
    setMoving(true);
    try {
      await onMove(sessionId, selected);
      onClose();
    } finally {
      setMoving(false);
    }
  }, [sessionId, selected, onMove, onClose]);

  const handleClose = useCallback(() => {
    setSelected(null);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="move-to-folder-title"
    >
      <div
        className="w-[420px] p-6 bg-white rounded-2xl shadow-xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="move-to-folder-title"
          className="text-lg font-semibold mb-1 text-neutral-900"
        >
          Move session
        </h2>
        <p className="text-sm text-secondary mb-4">
          Select a folder to move this session into.
        </p>

        {folders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-secondary mb-4">
              No folders created yet
            </p>
            <button
              type="button"
              onClick={() => onCreateFolder()}
              className="primary-cta px-5 py-2 rounded-lg text-sm transition"
            >
              Create folder
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelected(folder.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg border transition ${
                    selected === folder.id
                      ? "border-[#E5E7EB] bg-[#E9ECEB]"
                      : "border-neutral-200 hover:border-[#E5E7EB] hover:bg-[#E9ECEB]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#111111]" />
                    <span className="text-sm font-medium text-neutral-900">
                      {folder.name}
                    </span>
                  </div>
                  <span className="text-xs text-secondary">
                    {folder.sessionIds.length}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="text-secondary hover:text-neutral-900 px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#E9ECEB] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMove}
                disabled={!selected || moving}
                className="primary-cta px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {moving ? "Moving…" : "Move"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
