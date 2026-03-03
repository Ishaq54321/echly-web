"use client";

import { authFetch } from "@/lib/authFetch";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link2, UserPlus, MoreHorizontal, Pencil, Archive, Trash2, Eye, MessageCircle, Folder, Hash } from "lucide-react";
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
    "w-full px-3 py-2 text-left text-[14px] font-medium rounded-lg text-[hsl(var(--text-primary-strong))] hover:bg-white/70 transition-colors duration-[120ms] cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)]";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className="
          group
          relative
          w-full
          rounded-2xl
          border border-[var(--layer-2-border)]
          bg-[var(--layer-2-bg)]
          p-5
          cursor-pointer
          outline-none
          shadow-[var(--layer-2-shadow)]
          focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)]
          transition-[background-color,box-shadow,filter,transform] duration-[120ms] ease-out
          hover:bg-[var(--layer-2-hover-bg)]
          hover:shadow-[var(--layer-2-shadow-hover)]
          hover:brightness-[1.01]
          hover:-translate-y-0.5
        "
        style={{ animationDelay: `${index * 40}ms` } as React.CSSProperties}
        data-session-id={session.id}
      >
        {/* 3-DOTS — ABSOLUTELY POSITIONED, visible on hover */}
        <div className="absolute top-4 right-4">
          <div data-card-actions className="relative z-20 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
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
                className="flex items-center justify-center h-10 w-10 rounded-xl text-[hsl(var(--text-tertiary))] transition-colors duration-[120ms] hover:bg-white/60 hover:text-[hsl(var(--text-secondary-soft))] focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)] cursor-pointer"
              >
                <MoreHorizontal className="h-[16px] w-[16px] relative top-[1px] pointer-events-none" strokeWidth={1.5} aria-hidden />
              </button>
              {showTooltip && (
                <span
                  className="
                    tooltip-enter
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
                  className="dropdown-enter absolute right-0 top-full mt-1 py-1 min-w-[160px] rounded-xl border border-[var(--glass-1-border)] bg-[var(--glass-1-bg)] backdrop-blur-[10px] shadow-[var(--layer-2-shadow-hover)] z-10"
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
                    onClick={() => {
                      const id = session.id ? `FB-${session.id.slice(-6).toUpperCase()}` : session.id;
                      if (id && navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(id);
                      }
                      setMoreOpen(false);
                    }}
                    className={menuItemClass}
                    role="menuitem"
                  >
                    <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Copy session ID
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
                  <div className="my-1 border-t border-[var(--glass-1-border)]" role="separator" aria-hidden />
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="w-full px-3 py-2 text-left text-[14px] font-medium rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary-soft))] hover:bg-semantic-danger/10 transition-colors duration-[120ms] cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-[var(--ai-accent)]"
                    role="menuitem"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Delete permanently
                  </button>
                </div>
              )}
            </div>
            {copyTooltip && (
              <span
                className="tooltip-enter absolute right-12 top-0 mt-2 px-3 py-1.5 text-xs rounded-md bg-black text-white shadow-lg whitespace-nowrap z-20 pointer-events-none"
                role="status"
                aria-live="polite"
              >
                Link copied
              </span>
            )}
          </div>
        </div>

        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0 flex-1 pr-8">
                <Folder
                  className="h-[16px] w-[16px] relative top-[1px] shrink-0 text-neutral-400 transition-colors duration-150 group-hover:text-neutral-600"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="text-[16px] leading-[1.35] tracking-[-0.01em] text-[hsl(var(--text-primary-strong))] line-clamp-2 overflow-hidden text-ellipsis min-w-0 flex-1">
                  {session.title}
                </h3>
                <span
                  className={`ml-2 mt-2 h-2 w-2 shrink-0 rounded-full opacity-90 ${
                    feedbackCount === 0
                      ? "bg-neutral-300"
                      : openCount > 0
                        ? "bg-[var(--ai-accent)]"
                        : allCompleted
                          ? "bg-semantic-success"
                          : "bg-neutral-300"
                  }`}
                  aria-hidden
                />
              </div>
            </div>

            {/* Metrics row — disciplined alignment, low emphasis */}
            <div className="mt-4 flex items-center gap-3">
              <div className="inline-flex items-center rounded-xl bg-white/70 border border-[var(--layer-2-border)] px-2.5 py-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                <span className="text-[13px] text-[hsl(var(--text-secondary-soft))] tabular-nums">
                  {feedbackCount}
                </span>
                <span className="ml-1.5 text-[12px] text-[hsl(var(--text-tertiary))]">
                  feedback
                </span>
              </div>
              <div className="inline-flex items-center rounded-xl bg-white/70 border border-[var(--layer-2-border)] px-2.5 py-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                <span className="text-[13px] text-[hsl(var(--text-secondary-soft))] tabular-nums">
                  {openCount}
                </span>
                <span className="ml-1.5 text-[12px] text-[hsl(var(--text-tertiary))]">
                  open
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col">
            {/* Activity row (views + comments) — tertiary */}
            <div className="flex items-center gap-4 text-[13px] text-[hsl(var(--text-tertiary))]">
              <div className="flex items-center gap-1.5">
                <Eye className="h-[14px] w-[14px] shrink-0 text-neutral-400" strokeWidth={1.5} aria-hidden />
                <span>{viewCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-[14px] w-[14px] shrink-0 text-neutral-400" strokeWidth={1.5} aria-hidden />
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
