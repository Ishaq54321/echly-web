"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link2, UserPlus, MoreHorizontal, Pencil, Archive, Trash2, Eye, MessageCircle } from "lucide-react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatRelativeTime } from "@/lib/utils/time";
import { Avatar } from "@/components/ui/Avatar";
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
  const openIssues = counts.open;
  const isActive = openIssues > 0;
  const createdBy = session.createdBy;
  const creatorName = createdBy
    ? [createdBy.firstName, createdBy.lastName].filter(Boolean).join(" ") || "Unknown"
    : "Unknown";
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
        className={`focus-ring-brand relative flex flex-col min-h-[132px] w-full bg-white rounded-[16px] px-5 py-5 border cursor-pointer outline-none transition-[border-color,box-shadow] duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isActive
            ? "border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.05)] hover:border-neutral-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]"
            : "border-neutral-200/70 shadow-[0_4px_12px_rgba(0,0,0,0.025)] hover:border-neutral-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]"
        }`}
        style={{ animationDelay: `${index * 40}ms` }}
        data-session-id={session.id}
      >
        {/* Action bar: 3-dot menu only */}
        <div
          data-card-actions
          className="absolute top-3 right-3 z-20"
        >
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
                  absolute right-0 top-full mt-1
                  whitespace-nowrap
                  px-2 py-1
                  text-xs
                  rounded-md
                  bg-[hsl(var(--surface-3))]
                  border border-[hsl(var(--border))]
                  shadow-md
                  text-[hsl(var(--text-primary))]
                  pointer-events-none
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
              className="absolute right-12 top-0 px-2 py-1 text-xs font-medium rounded-md bg-neutral-800 text-white whitespace-nowrap z-20 pointer-events-none"
              role="status"
              aria-live="polite"
            >
              Link copied
            </span>
          )}
        </div>

        {/* Creator line: [Avatar] Name · relative time */}
        <div className={`flex items-center gap-2 min-w-0 text-xs text-[hsl(var(--text-secondary))] ${!isActive ? "opacity-90" : ""}`}>
          <Avatar
            id={createdBy?.id ?? session.userId}
            firstName={createdBy?.firstName ?? ""}
            lastName={createdBy?.lastName ?? ""}
            avatarUrl={createdBy?.avatarUrl}
            size="sm"
            className="shrink-0"
          />
          <span className="truncate min-w-0">
            {creatorName}
            <span aria-hidden className="mx-1">·</span>
            {formatRelativeTime(session.updatedAt ?? session.createdAt)}
          </span>
        </div>

        {/* Session title */}
        <h2 className="mt-1.5 text-base font-medium tracking-[-0.01em] text-neutral-900 truncate min-w-0">
          {session.title}
        </h2>

        {/* Counts row: views, comments */}
        <div className="mt-1.5 flex items-center gap-4 text-sm text-[hsl(var(--text-secondary))]">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />
            {viewCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />
            {commentCount}
          </span>
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] inline-flex text-neutral-400 ml-auto"
            aria-hidden
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={1.5}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
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
