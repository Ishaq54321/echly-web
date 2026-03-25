"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  ArrowLeft,
  Calendar,
  CircleDashed,
  FolderPlus,
  Link,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  CheckCircle,
  Check,
  XCircle,
} from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import type { Session, SessionCreatedBy } from "@/lib/domain/session";
import { getInitials } from "@/lib/utils/getInitials";
import { UserAvatar } from "@/components/ui/UserAvatar";
import ProgressPie from "@/components/ui/ProgressPie";
import { ShareSessionModal } from "@/components/dashboard/ShareSessionModal";
import { RenameSessionModal } from "@/components/dashboard/RenameSessionModal";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { SessionsViewModeToggle } from "@/components/dashboard/SessionsViewModeToggle";

const DROPDOWN_Z_INDEX = 1000;

export interface SessionWorkspaceSection {
  title: string;
  /** Dot color for section marker (Tailwind classes for bg-*). */
  markerClassName?: string;
  items: SessionWithCounts[];
}

export interface SessionsWorkspaceProps {
  sections?: SessionWorkspaceSection[];
  onView: (sessionId: string) => void;
  onRenameSuccess?: (session: { id: string; title: string; updatedAt?: unknown }) => void;
  onArchiveSuccess?: (sessionId: string) => void;
  onRequestDelete?: (session: Session) => void;
  onOpenMoveToFolder?: (sessionId: string) => void;
  folderId?: string;
  onRemoveFromFolder?: (sessionId: string) => void;
  /** When set with onViewModeChange, view toggle is controlled by the parent (e.g. dashboard header). */
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  /** Inline-loading mode: render placeholder rows using the same row component. */
  isLoading?: boolean;
  /** Number of inline-loading rows when `isLoading` is true (default: 3). */
  loadingRowCount?: number;
}

function displayName(u: SessionCreatedBy): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || "User";
}

function getAssignees(session: Session): SessionCreatedBy[] {
  const withUsers = session as Session & { users?: SessionCreatedBy[] };
  if (withUsers.users?.length) {
    return withUsers.users.slice(0, 4);
  }
  if (session.createdBy) {
    return [session.createdBy];
  }
  return [];
}

function formatSessionUpdatedShort(session: Session): string {
  const u = session.updatedAt;
  if (u == null) return "—";
  let ms: number | null = null;
  if (
    typeof u === "object" &&
    u !== null &&
    "toDate" in u &&
    typeof (u as { toDate: () => Date }).toDate === "function"
  ) {
    ms = (u as { toDate: () => Date }).toDate().getTime();
  } else if (
    typeof u === "object" &&
    u !== null &&
    "seconds" in u &&
    typeof (u as { seconds: number }).seconds === "number"
  ) {
    ms = (u as { seconds: number }).seconds * 1000;
  } else if (u instanceof Date) {
    ms = u.getTime();
  } else if (typeof u === "string") {
    ms = new Date(u).getTime();
  }
  if (ms == null || Number.isNaN(ms)) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(ms);
}

function SessionWorkspaceRow({
  item,
  rowIndex,
  onView,
  onRenameSuccess,
  onArchiveSuccess,
  onRequestDelete,
  onOpenMoveToFolder,
  folderId,
  onRemoveFromFolder,
  isLoading,
}: {
  item?: SessionWithCounts;
  rowIndex: number;
  onView?: (sessionId: string) => void;
  onRenameSuccess?: SessionsWorkspaceProps["onRenameSuccess"];
  onArchiveSuccess?: SessionsWorkspaceProps["onArchiveSuccess"];
  onRequestDelete?: SessionsWorkspaceProps["onRequestDelete"];
  onOpenMoveToFolder?: SessionsWorkspaceProps["onOpenMoveToFolder"];
  folderId?: string;
  onRemoveFromFolder?: SessionsWorkspaceProps["onRemoveFromFolder"];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between px-8 py-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-36 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-[90px] rounded-full bg-gray-200 animate-pulse" />
          <div className="h-8 w-[110px] rounded-full bg-gray-200 animate-pulse" />
          <div className="h-8 w-[95px] rounded-full bg-gray-200 animate-pulse" />
          <div className="h-8 w-[85px] rounded-full bg-gray-200 animate-pulse" />
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gray-300 animate-pulse" />
            <div className="w-7 h-7 rounded-full bg-gray-300 animate-pulse" />
            <div className="w-7 h-7 rounded-full bg-gray-300 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const { session, counts } = item;
  const isOptimistic = Boolean(session.isOptimistic);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [copied, setCopied] = useState(false);
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
    const dropdownMinWidth = 160;
    const padding = 8;
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
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 900);
    return () => window.clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (moreOpen) firstMenuItemRef.current?.focus();
  }, [moreOpen]);

  const handleRowActivate = () => {
    if (isOptimistic) {
      setOpeningId(session.id);
      return;
    }
    setOpeningId(session.id);
    onView?.(session.id);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowActivate();
    }
  };

  const assignees = getAssignees(session);
  const open = counts.open ?? 0;
  const resolved = counts.resolved ?? 0;
  const skipped = counts.skipped ?? 0;
  const total = open + resolved + skipped;
  const hasAnyPills = open > 0 || resolved > 0 || skipped > 0;
  let progress = total === 0 ? 0 : (resolved / total) * 100;
  if (progress >= 100) progress = 99.999;

  const menuItemClass =
    "w-full px-3 py-2.5 text-left text-[14px] font-medium rounded-xl text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/30";

  const mockAssigneeInitials = (() => {
    // Temp mock per spec (static for now).
    const rows: string[][] = [
      ["A", "J", "K"],
      ["M", "R"],
      ["S", "T", "D"],
    ];
    return rows[rowIndex % rows.length] ?? ["?"];
  })();

  const handleRenameSave = async (title: string) => {
    const res = await authFetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to rename");
    const data = (await res.json()) as {
      success?: boolean;
      session?: { id: string; title: string; updatedAt?: unknown };
    };
    if (data.success && data.session && onRenameSuccess) {
      onRenameSuccess(data.session);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowActivate}
        onKeyDown={handleRowKeyDown}
        className={[
          "group flex w-full items-center justify-between rounded-lg px-8 py-4 transition-all duration-150 hover:bg-gray-50",
          openingId === session.id ? "bg-gray-50" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-session-id={session.id}
      >
        <div className="flex items-center gap-4 min-w-0">
          <ProgressPie value={progress} size={32} />

          <div className="min-w-0">
            <span className="truncate block text-[15px] font-medium text-gray-900">
              {session.title || "Untitled Session"}
            </span>
            {(isOptimistic || openingId === session.id) && (
              <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-600" aria-hidden />
                {isOptimistic ? "Creating…" : "Opening…"}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasAnyPills && (
            <div className="flex items-center gap-3 min-w-[260px] justify-end">
              {open > 0 && (
                <div className="h-8 w-[90px] rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 inline-flex items-center justify-center gap-1.5">
                  <CircleDashed className="h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                  <span className="whitespace-nowrap font-medium tracking-tight">{open} open</span>
                </div>
              )}
              {resolved > 0 && (
                <div className="h-8 w-[110px] rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 inline-flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
                  <span className="whitespace-nowrap font-medium tracking-tight">{resolved} resolved</span>
                </div>
              )}
              {skipped > 0 && (
                <div className="h-8 w-[95px] rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 inline-flex items-center justify-center gap-1.5">
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
                  <span className="whitespace-nowrap font-medium tracking-tight">{skipped} skipped</span>
                </div>
              )}
            </div>
          )}
          <div className="h-8 w-[85px] rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 inline-flex items-center justify-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
            <span className="whitespace-nowrap font-medium tracking-tight">
              {formatSessionUpdatedShort(session)}
            </span>
          </div>

          <div className="flex items-center relative">
            <div
              className="flex -space-x-2 transition-opacity duration-150 group-hover:opacity-0"
              aria-label="Assignees"
            >
              {(mockAssigneeInitials.length > 0 ? mockAssigneeInitials : ["?"])
                .concat(["?", "?", "?"])
                .slice(0, 3)
                .map((label, i) => (
                <div
                  key={`${session.id}-assignee-${i}-${label}`}
                  className={[
                    "w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-xs font-medium flex items-center justify-center border-2 border-white shadow-sm",
                    label === "?" ? "bg-gray-100 text-gray-400" : "",
                  ].join(" ")}
                  aria-label={label === "?" ? "Unassigned" : `Assignee ${label}`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div
              className="absolute right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOptimistic) return;
                  if (navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(session.id);
                    setCopied(true);
                  }
                }}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30"
                aria-label={copied ? "Copied" : "Copy link"}
                title={copied ? "Copied" : "Copy link"}
              >
                {copied ? (
                  <Check className="h-5 w-5 stroke-[2] text-green-600" aria-hidden />
                ) : (
                  <Link className="h-5 w-5 stroke-[2] text-gray-500" aria-hidden />
                )}
              </button>
              <button
                ref={triggerRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOptimistic) return;
                  setMoreOpen((o) => !o);
                }}
                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30"
                aria-label="Session actions"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                <MoreHorizontal className="h-5 w-5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {moreOpen &&
        dropdownPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Session actions"
            className="min-w-[160px] rounded-xl border border-neutral-200 bg-white py-1 shadow-sm"
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
              role="menuitem"
              className={menuItemClass}
              onClick={(e) => {
                e.stopPropagation();
                const url =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/dashboard/${session.id}`
                    : "";
                if (url && navigator.clipboard?.writeText) {
                  void navigator.clipboard.writeText(url);
                }
                closeMenu();
              }}
            >
              <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Copy link
            </button>
            {onOpenMoveToFolder && (
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMoveToFolder(session.id);
                  closeMenu();
                }}
              >
                <FolderPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Move to folder
              </button>
            )}
            {folderId && onRemoveFromFolder && (
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromFolder(session.id);
                  closeMenu();
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Remove from folder
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={(e) => {
                e.stopPropagation();
                setShareOpen(true);
                closeMenu();
              }}
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Share
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOptimistic) setRenameOpen(true);
                closeMenu();
              }}
            >
              <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Rename
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              disabled={archiving || !onArchiveSuccess}
              onClick={async (e) => {
                e.stopPropagation();
                if (isOptimistic || !onArchiveSuccess) return;
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
                closeMenu();
              }}
            >
              <Archive className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {archiving ? "Archiving…" : "Archive"}
            </button>
            <div className="my-1 border-t border-neutral-200" role="separator" aria-hidden />
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left text-[14px] font-medium rounded-xl text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 flex cursor-pointer items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/30"
              onClick={(e) => {
                e.stopPropagation();
                if (!isOptimistic) onRequestDelete?.(session);
                closeMenu();
              }}
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Delete permanently
            </button>
          </div>,
          document.body
        )}

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
    </>
  );
}

export function SessionsWorkspace({
  sections,
  onView,
  onRenameSuccess,
  onArchiveSuccess,
  onRequestDelete,
  onOpenMoveToFolder,
  folderId,
  onRemoveFromFolder,
  viewMode: viewModeProp,
  onViewModeChange,
  isLoading,
  loadingRowCount = 3,
}: SessionsWorkspaceProps) {
  const [internalViewMode, setInternalViewMode] = useState<"list" | "grid">("list");
  const isControlled = viewModeProp !== undefined && typeof onViewModeChange === "function";
  const viewMode = isControlled ? viewModeProp! : internalViewMode;
  const setViewMode = isControlled ? onViewModeChange! : setInternalViewMode;

  if (isLoading) {
    return (
      <div className={`flex w-full flex-col gap-4 ${isControlled ? "mt-0" : "mt-4"}`}>
        {!isControlled ? (
          <div className="flex w-full justify-end">
            <SessionsViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        ) : null}

        {viewMode === "list" ? (
          <div className="w-full mt-0 space-y-3">
            {Array.from({ length: loadingRowCount }).map((_, i) => (
              <SessionWorkspaceRow key={`session-loading-${i}`} rowIndex={i} isLoading />
            ))}
          </div>
        ) : (
          <div className="mt-2 w-full">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
              {Array.from({ length: Math.min(loadingRowCount, 10) }).map((_, i) => (
                <div key={`session-loading-card-${i}`} className="h-[140px] rounded-xl bg-neutral-100 animate-pulse" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const visibleSections = (sections ?? []).filter((s) => s.items.length > 0);
  if (visibleSections.length === 0) return null;

  return (
    <div className={`flex w-full flex-col gap-4 ${isControlled ? "mt-0" : "mt-4"}`}>
      {!isControlled ? (
        <div className="flex w-full justify-end">
          <SessionsViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      ) : null}

      {visibleSections.map((section, sectionIndex) => {
        const showSectionHead = section.title.trim().length > 0;
        const headingSlug = section.title.trim().replace(/\s+/g, "-") || "section";
        const headingId = `workspace-section-${sectionIndex}-${headingSlug}`;
        const listWrap = "w-full";
        const sectionHead = showSectionHead ? (
          <div className="mb-2 flex items-center justify-between px-0">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${section.markerClassName ?? "bg-blue-500"}`}
                aria-hidden
              />
              <span id={headingId} className="text-[16px] font-semibold text-neutral-900">
                {section.title}
              </span>
            </div>
          </div>
        ) : null;

        return (
          <section
            key={`${section.title}-${sectionIndex}`}
            aria-labelledby={showSectionHead ? headingId : undefined}
            className="w-full"
          >
            <div className={viewMode === "list" ? listWrap : "w-full"}>{sectionHead}</div>

            {viewMode === "list" ? (
              <div className={`${listWrap} mt-0 space-y-3`}>
                {section.items.map((item, rowIndex) => (
                  <SessionWorkspaceRow
                    key={item.session.id}
                    item={item}
                    rowIndex={rowIndex}
                    onView={onView}
                    onRenameSuccess={onRenameSuccess}
                    onArchiveSuccess={onArchiveSuccess}
                    onRequestDelete={onRequestDelete}
                    onOpenMoveToFolder={onOpenMoveToFolder}
                    folderId={folderId}
                    onRemoveFromFolder={onRemoveFromFolder}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-2 w-full">
                <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
                  {section.items.map((item, index) => (
                    <WorkspaceCard
                      key={item.session.id}
                      item={item}
                      onView={onView}
                      index={index}
                      onRenameSuccess={onRenameSuccess}
                      onArchiveSuccess={onArchiveSuccess}
                      onRequestDelete={onRequestDelete}
                      isRootSession={!folderId}
                      onOpenMoveToFolder={onOpenMoveToFolder}
                      folderId={folderId}
                      onRemoveFromFolder={onRemoveFromFolder}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
