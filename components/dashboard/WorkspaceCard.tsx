"use client";

import { authFetch } from "@/lib/authFetch";
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Link2, UserPlus, MoreHorizontal, Pencil, Archive, Trash2, Eye, MessageCircle, FileText, FolderPlus, ArrowLeft } from "lucide-react";
import { useDragSession } from "./context/DragSessionContext";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatRelativeTime } from "@/lib/utils/time";
import { ShareSessionModal } from "./ShareSessionModal";
import { RenameSessionModal } from "./RenameSessionModal";
import { DeleteSessionModal } from "./DeleteSessionModal";

const DROPDOWN_Z_INDEX = 1000;
const TOOLTIP_HOVER_DELAY_MS = 300;
const DROPDOWN_ANIMATION_MS = 150;

export interface WorkspaceCardProps {
  item: SessionWithCounts;
  onView: (sessionId: string) => void;
  index: number;
  onRenameSuccess?: (session: { id: string; title: string; updatedAt?: unknown }) => void;
  onArchiveSuccess?: (sessionId: string) => void;
  onDeleteSuccess?: (sessionId: string) => void;
  /** If true, this session is in a folder (root sessions only can be dragged) */
  isRootSession?: boolean;
  /** Open move-to-folder modal for this session (dashboard only) */
  onOpenMoveToFolder?: (sessionId: string) => void;
  /** When set, show "Remove from folder" and call onRemoveFromFolder (folder page only) */
  folderId?: string;
  onRemoveFromFolder?: (sessionId: string) => void;
}

const COPIED_TOOLTIP_MS = 2000;

export function WorkspaceCard({
  item,
  onView,
  index,
  onRenameSuccess,
  onArchiveSuccess,
  onDeleteSuccess,
  isRootSession = true,
  onOpenMoveToFolder,
  folderId,
  onRemoveFromFolder,
}: WorkspaceCardProps) {
  const { setDraggedSessionId } = useDragSession();
  const { session, counts } = item;
  const feedbackCount = counts.open + counts.resolved;
  const openFeedbackCount = counts.open;
  const openCount = openFeedbackCount;
  const allCompleted = feedbackCount > 0 && counts.resolved === feedbackCount;
  const viewCount = session.viewCount ?? 0;
  const commentCount = session.commentCount ?? 0;

  const [copyTooltip, setCopyTooltip] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const closeMenu = useCallback(() => {
    setMoreOpen(false);
    setDropdownPosition(null);
  }, []);

  // Position dropdown when open (for portal)
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

  // Click outside: both trigger (in card) and portaled menu
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
        return;
      }
      const menu = menuRef.current;
      if (!menu) return;
      const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === "ArrowDown" && currentIndex < items.length - 1) {
        e.preventDefault();
        items[currentIndex + 1]?.focus();
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        e.preventDefault();
        items[currentIndex - 1]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
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

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-card-actions]")) return;
    onView(session.id);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onView(session.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", session.id);
    setDraggedSessionId(session.id);
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGOODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedSessionId(null);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/dashboard/${session.id}` : "";
    if (url && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopyTooltip(true);
          setTimeout(() => setCopyTooltip(false), COPIED_TOOLTIP_MS);
        },
        () => {}
      );
    }
    closeMenu();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareOpen(true);
    closeMenu();
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameOpen(true);
    closeMenu();
  };

  const handleArchiveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    if (archiving || !onArchiveSuccess) return;
    setArchiving(true);
    try {
      const res = await authFetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (res.ok) onArchiveSuccess(session.id);
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
    closeMenu();
  };

  const handleRenameSave = async (title: string) => {
    const res = await authFetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to rename");
    const data = (await res.json()) as { success?: boolean; session?: { id: string; title: string; updatedAt?: unknown } };
    if (data.success && data.session && onRenameSuccess) {
      onRenameSuccess(data.session);
    }
  };

  const handleDeleteConfirm = async () => {
    const res = await authFetch(`/api/sessions/${session.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    onDeleteSuccess?.(session.id);
  };

  const menuItemClass =
    "w-full px-3 py-2.5 text-left text-[14px] font-medium rounded-xl text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] transition-colors duration-[var(--motion-duration)] cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        draggable={isRootSession}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className="
          group
          relative
          w-full
          rounded-xl
          border border-neutral-200
          bg-white
          p-5
          overflow-hidden
          shadow-sm
          hover:bg-neutral-50
          hover:!border-[#155DFC80]
          hover:ring-1
          hover:ring-[#155DFC40]
          hover:shadow-md
          hover:-translate-y-[1px]
          transition-all
          duration-200
          ease-out
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] focus:ring-offset-2
        "
        style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
        data-session-id={session.id}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500/70 rounded-t-xl" aria-hidden />
        {/* 3-DOTS — visible on hover; tooltip only when hover and dropdown closed */}
        <div className="absolute top-4 right-4">
          <div data-card-actions className="relative z-10 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
            <div
              className="relative h-10 w-10"
              onMouseEnter={() => {
                if (moreOpen) return;
                hoverTimeoutRef.current = setTimeout(() => {
                  setShowTooltip(true);
                }, TOOLTIP_HOVER_DELAY_MS);
              }}
              onMouseLeave={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setShowTooltip(false);
              }}
            >
              <button
                ref={triggerRef}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTooltip(false);
                  setMoreOpen((prev) => !prev);
                }}
                aria-label="More actions"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className="flex items-center justify-center h-10 w-10 rounded-xl text-[hsl(var(--text-tertiary))] transition-colors duration-[var(--motion-duration)] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] cursor-pointer"
              >
                <MoreHorizontal className="h-[16px] w-[16px] relative top-[1px] pointer-events-none" strokeWidth={1.5} aria-hidden />
              </button>
              {/* Tooltip: only when hover and dropdown is closed */}
              {showTooltip && !moreOpen && (
                <span
                  className="workspace-card-tooltip absolute top-full right-0 mt-2 px-3 py-1.5 text-xs rounded-xl bg-[hsl(var(--text-primary-strong))] text-white shadow-[var(--shadow-level-4)] pointer-events-none whitespace-nowrap z-[100]"
                  role="tooltip"
                >
                  More actions…
                </span>
              )}
            </div>
            {copyTooltip && (
              <span
                className="workspace-card-tooltip absolute right-12 top-0 mt-2 px-3 py-1.5 text-xs rounded-xl bg-[hsl(var(--text-primary-strong))] text-white shadow-[var(--shadow-level-4)] whitespace-nowrap z-[100] pointer-events-none"
                role="status"
                aria-live="polite"
              >
                Link copied
              </span>
            )}
          </div>
        </div>

        {/* Dropdown: portaled to body, fixed position, no clipping */}
        {moreOpen &&
          dropdownPosition &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={menuRef}
              data-card-actions
              role="menu"
              aria-label="Workspace actions"
              className="workspace-card-dropdown min-w-[160px] rounded-xl border border-[var(--layer-1-border)] bg-[var(--layer-1-bg)] shadow-[var(--shadow-level-5)] py-1"
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
                onClick={handleCopyLink}
                className={menuItemClass}
                role="menuitem"
              >
                <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Copy link
              </button>
              {onOpenMoveToFolder && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenMoveToFolder(session.id);
                    closeMenu();
                  }}
                  className={menuItemClass}
                  role="menuitem"
                >
                  <FolderPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Move to folder
                </button>
              )}
              {folderId && onRemoveFromFolder && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveFromFolder(session.id);
                    closeMenu();
                  }}
                  className={menuItemClass}
                  role="menuitem"
                >
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Remove from folder
                </button>
              )}
              <button
                type="button"
                onClick={handleShare}
                className={menuItemClass}
                role="menuitem"
              >
                <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Share
              </button>
              <button
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
                onClick={handleArchiveClick}
                disabled={archiving}
                className={`${menuItemClass} disabled:opacity-60`}
                role="menuitem"
              >
                <Archive className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {archiving ? "Archiving…" : "Archive"}
              </button>
              <div className="my-1 border-t border-[var(--glass-1-border)]" role="separator" aria-hidden />
              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full px-3 py-2 text-left text-[14px] font-medium rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors duration-[var(--motion-duration)] cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                role="menuitem"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Delete permanently
              </button>
            </div>,
            document.body
          )}

        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Header: icon + title */}
            <div className="flex items-center gap-3 mb-5 pr-10 min-w-0">
              <div
                className="
                  flex items-center justify-center
                  w-10 h-10
                  rounded-xl
                  bg-gradient-to-br from-blue-100 to-blue-50
                  text-blue-600
                  ring-1 ring-blue-200
                  shadow-inner
                  shrink-0
                "
              >
                <FileText size={18} aria-hidden />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="font-medium text-neutral-900 text-[15px] leading-tight line-clamp-2 overflow-hidden text-ellipsis min-w-0">
                  {session.title}
                </h3>
                <div className="text-xs text-meta font-medium mt-1">
                  Updated {session.updatedAt ? formatRelativeTime(session.updatedAt) : "recently"}
                </div>
              </div>
            </div>

            {/* Signal pills */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700 tabular-nums">
                {feedbackCount} feedback
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-600 tabular-nums">
                {openCount} open
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent mb-3" />
            <div className="flex items-center gap-4 text-secondary text-sm">
              <div className="flex items-center gap-1">
                <Eye size={14} aria-hidden />
                <span>{viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={14} aria-hidden />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareSessionModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        sessionId={session.id}
        sessionTitle={session.title}
      />
      <RenameSessionModal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        sessionId={session.id}
        currentTitle={session.title}
        onSave={handleRenameSave}
      />
      <DeleteSessionModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        sessionTitle={session.title}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
