"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link2, UserPlus, MoreHorizontal, Pencil, Archive, Trash2, Eye, MessageCircle, Folder } from "lucide-react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { ShareSessionModal } from "./ShareSessionModal";
import { RenameSessionModal } from "./RenameSessionModal";
import { DeleteSessionModal } from "./DeleteSessionModal";

export interface WorkspaceCardProps {
  item: SessionWithCounts;
  onView: (sessionId: string) => void;
  index: number;
  onRenameSuccess?: (session: { id: string; title: string; updatedAt?: unknown }) => void;
  onArchiveSuccess?: (sessionId: string) => void;
  onDeleteSuccess?: (sessionId: string) => void;
}

const COPIED_TOOLTIP_MS = 2000;

export function WorkspaceCard({
  item,
  onView,
  index,
  onRenameSuccess,
  onArchiveSuccess,
  onDeleteSuccess,
}: WorkspaceCardProps) {
  const { session, counts } = item;
  const feedbackCount = counts.open + counts.in_progress + counts.resolved;
  const openFeedbackCount = counts.open;
  const viewCount = session.viewCount ?? 0;
  const commentCount = session.commentCount ?? 0;

  const [copyTooltip, setCopyTooltip] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const closeMenu = useCallback(() => setMoreOpen(false), []);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        closeMenu();
      }
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
      const res = await fetch(`/api/sessions/${session.id}`, {
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
    const res = await fetch(`/api/sessions/${session.id}`, {
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
    const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    onDeleteSuccess?.(session.id);
  };

  const menuItemClass =
    "focus-ring-brand w-full px-3 py-2 text-left text-sm rounded-md text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-2))] transition-colors duration-150 flex items-center gap-2";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className="
          focus-ring-brand
          group
          relative
          w-full
          rounded-2xl
          border border-[hsl(var(--border))]
          bg-white
          px-6 py-6
          cursor-pointer
          outline-none
          transition-[box-shadow,border-color] duration-200 ease-out
          hover:ring-1
          hover:ring-[hsl(var(--brand-red))]
          hover:ring-offset-0
          hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]
        "
        style={
          {
            "--tw-ring-color": "hsl(var(--brand-red))",
            animationDelay: `${index * 40}ms`,
          } as React.CSSProperties
        }
        data-session-id={session.id}
      >
        {/* 3-DOTS — ABSOLUTELY POSITIONED */}
        <div
          className="
            absolute
            top-4
            right-4
          "
        >
          <div data-card-actions className="relative z-20 shrink-0">
            <div
              className="relative h-10 w-10"
              ref={moreRef}
              onMouseEnter={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setShowTooltip(true);
                }, 300);
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMoreOpen((prev) => !prev);
                }}
                aria-label="More actions"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className="
                  flex items-center justify-center
                  h-10 w-10
                  rounded-lg
                  text-[hsl(var(--text-secondary))]
                  transition-colors duration-150
                  hover:bg-[hsl(var(--surface-2))]
                  hover:text-[hsl(var(--text-primary))]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[hsl(var(--brand))]
                  cursor-pointer
                "
              >
                <MoreHorizontal className="w-4 h-4 pointer-events-none" aria-hidden />
              </button>
              {showTooltip && (
                <span
                  className="
                    absolute
                    top-full
                    right-0
                    mt-2
                    px-3 py-1.5
                    text-xs
                    rounded-md
                    bg-black
                    text-white
                    shadow-lg
                    pointer-events-none
                    transition-opacity duration-150
                    whitespace-nowrap
                  "
                >
                  More actions…
                </span>
              )}
              {moreOpen && (
                <div
                  ref={menuRef}
                  data-card-actions
                  className="absolute right-0 top-full mt-1 py-1 min-w-[160px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shadow-lg z-10"
                  role="menu"
                  aria-label="Workspace actions"
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
                  <div className="my-1 border-t border-[hsl(var(--border))]" role="separator" aria-hidden />
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="focus-ring-brand w-full px-3 py-2 text-left text-sm rounded-md text-red-500 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
                    role="menuitem"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Delete
                  </button>
                </div>
              )}
            </div>
            {copyTooltip && (
              <span
                className="absolute right-12 top-0 mt-2 px-3 py-1.5 text-xs rounded-md bg-black text-white shadow-lg whitespace-nowrap z-20 pointer-events-none transition-opacity duration-150"
                role="status"
                aria-live="polite"
              >
                Link copied
              </span>
            )}
          </div>
        </div>

        {/* ROW 1 — HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1 pr-10">
            <Folder
              className="
                w-4 h-4
                shrink-0
                text-[hsl(var(--text-secondary))]
                transition-colors duration-200
                group-hover:text-[hsl(var(--brand-red))]
              "
              strokeWidth={1.75}
              aria-hidden
            />
            <h3 className="
              text-[17px]
              font-semibold
              tracking-[-0.015em]
              text-[hsl(var(--text-primary))]
              leading-snug
              line-clamp-2
              overflow-hidden
              text-ellipsis
              min-w-0
              flex-1
            ">
              {session.title}
            </h3>
            {openFeedbackCount > 0 && (
              <span
                className="ml-2 mt-[6px] h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--brand-red))]"
                aria-hidden
              />
            )}
          </div>
        </div>

        {/* ROW 2 — FEEDBACK SUMMARY */}
        <div className="mt-2 text-sm text-[hsl(var(--text-secondary))] font-medium">
          <span className="text-[hsl(var(--text-primary))]">
            {feedbackCount}
          </span>
          {" "}Feedback ·{" "}
          <span className="text-[hsl(var(--text-primary))]">
            {openFeedbackCount}
          </span>
          {" "}Open
        </div>

        {/* ROW 3 — META (VIEWS + COMMENTS) */}
        <div className="mt-3 flex items-center gap-6 text-sm text-[hsl(var(--text-secondary))]">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 shrink-0 opacity-70" aria-hidden />
            <span className="font-medium text-[hsl(var(--text-primary))]">
              {viewCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 shrink-0 opacity-70" aria-hidden />
            <span className="font-medium text-[hsl(var(--text-primary))]">
              {commentCount}
            </span>
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
