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
          <div className="text-xs text-secondary">
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
            className="flex items-center justify-center h-8 w-8 rounded-lg text-meta hover:bg-neutral-200 hover:text-secondary transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
              className="w-full px-3 py-2.5 text-left text-[14px] font-medium rounded-xl text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
