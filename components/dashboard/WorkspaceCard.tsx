"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, UserPlus, MoreHorizontal, Pencil, Archive, Trash2 } from "lucide-react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import { formatFullDateTime } from "@/lib/utils/date";
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
  const openIssues = counts.open;
  const isActive = openIssues > 0;

  const [copyTooltip, setCopyTooltip] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    setMoreOpen(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareOpen(true);
    setMoreOpen(false);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameOpen(true);
    setMoreOpen(false);
  };

  const handleArchiveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMoreOpen(false);
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
    setMoreOpen(false);
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

  const iconButtonClass =
    "focus-ring-brand flex items-center justify-center h-8 w-8 rounded-md text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] hover:scale-[1.02] transition-[opacity,background-color,transform] duration-150";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className={`focus-ring-brand group relative flex flex-col min-h-[132px] w-full bg-white rounded-[16px] px-5 py-5 border cursor-pointer outline-none transition-[border-color,box-shadow] duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isActive
            ? "border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.05)] hover:border-neutral-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]"
            : "border-neutral-200/70 shadow-[0_4px_12px_rgba(0,0,0,0.025)] hover:border-neutral-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]"
        }`}
        style={{ animationDelay: `${index * 40}ms` }}
        data-session-id={session.id}
      >
        {/* Action bar: visible on hover, absolute so no layout shift */}
        <div
          data-card-actions
          className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          <div className="relative">
            <button
              type="button"
              onClick={handleCopyLink}
              className={iconButtonClass}
              aria-label={copyTooltip ? "Copied" : "Copy link"}
              title={copyTooltip ? "Copied" : "Copy link"}
            >
              <Link2 className="h-4 w-4" aria-hidden />
            </button>
            {copyTooltip && (
              <span
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 text-xs font-medium rounded bg-neutral-800 text-white whitespace-nowrap"
                role="status"
              >
                Copied
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleShare}
            className={iconButtonClass}
            aria-label="Share session"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
          </button>
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMoreOpen((prev) => !prev);
              }}
              className={iconButtonClass}
              aria-label="More options"
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
            {moreOpen && (
              <div
                data-card-actions
                className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shadow-lg z-10"
                role="menu"
              >
                <button
                  type="button"
                  onClick={handleRenameClick}
                  className="focus-ring-brand w-full px-3 py-2 text-left text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-2))] flex items-center gap-2"
                  role="menuitem"
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={handleArchiveClick}
                  disabled={archiving}
                  className="focus-ring-brand w-full px-3 py-2 text-left text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-2))] flex items-center gap-2 disabled:opacity-60"
                  role="menuitem"
                >
                  <Archive className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {archiving ? "Archiving…" : "Archive"}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="focus-ring-brand w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  role="menuitem"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-2 min-w-0 ${!isActive ? "opacity-90" : ""}`}>
          <svg
            className="shrink-0 w-[14px] h-[14px] text-[hsl(var(--text-secondary))] transition-colors duration-150 group-hover:text-[hsl(var(--brand))]"
            fill="none"
            strokeWidth={1.4}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44l-2.122-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6z" />
          </svg>
          <h2 className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 truncate min-w-0">
            {session.title}
          </h2>
          <span
            className={`shrink-0 w-[6px] h-[6px] rounded-full ${isActive ? "bg-[var(--color-brand-primary)]" : "bg-neutral-300"}`}
            aria-hidden
          />
        </div>

        <div className={`mt-1.5 text-[14px] text-neutral-600 ${!isActive ? "opacity-[0.85]" : ""}`}>
          {feedbackCount} Feedback ·{" "}
          <span className={openIssues > 0 ? "text-[var(--color-brand-primary)]" : ""}>{openIssues}</span> Open
        </div>

        <div className="mt-1.5 flex justify-between items-center">
          <span className="text-xs text-[hsl(var(--text-secondary))] tracking-tight">
            Last activity · {formatFullDateTime(session.updatedAt ?? session.createdAt)}
          </span>
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] inline-flex text-neutral-400"
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
