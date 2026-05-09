"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getAvatarColor } from "@/lib/utils/getAvatarColor";
import {
  Archive,
  Building2,
  Calendar,
  CircleDashed,
  Link,
  Loader2,
  LogOut,
  RotateCcw,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import type { Session } from "@/lib/domain/session";
import ProgressPie from "@/components/ui/ProgressPie";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { SessionsViewModeToggle } from "@/components/dashboard/SessionsViewModeToggle";
import { SessionActionsDropdown } from "@/components/dashboard/SessionActionsDropdown";
import { triggerAddMoreTickets } from "@/components/dashboard/hooks/triggerAddMoreTickets";
import { Modal } from "@/components/ui/Modal";
import { copySessionLink } from "@/utils/copySessionLink";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  useShareController,
  type ShareGeneralAccess,
} from "@/components/share/useShareController";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoResultsIllu } from "@/components/empty/canvasIllustrations";
import { useSessionsSearch } from "@/components/dashboard/context/SessionsSearchContext";

const ShareModal = dynamic(
  () => import("@/components/share/ShareModal").then((m) => m.ShareModal),
  { ssr: false }
);

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
  onSetArchived?: (sessionId: string, archived: boolean) => Promise<void> | void;
  onRequestDelete?: (session: Session) => void;
  /** Direct delete API (used for bulk delete). */
  onDeleteSession?: (session: Session) => Promise<void>;
  /** When set with onViewModeChange, view toggle is controlled by the parent (e.g. dashboard header). */
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
}

function formatSessionDateShort(session: Session): string {
  const u = session.createdAt;
  if (u == null) return "";
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
  if (ms == null || Number.isNaN(ms)) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(ms);
}

export const SessionWorkspaceRow = memo(function SessionWorkspaceRow({
  item,
  onView,
  onRenameSuccess,
  onSetArchived,
  onRequestDelete,
  onRequestShare,
  isSelectionMode,
  isSelected,
  onToggleSelected,
  sharedByName,
  workspaceLabel,
  isSharedSession,
  onLeaveSession,
}: {
  item: SessionWithCounts;
  onView?: (sessionId: string) => void;
  onRenameSuccess?: SessionsWorkspaceProps["onRenameSuccess"];
  onSetArchived?: SessionsWorkspaceProps["onSetArchived"];
  onRequestDelete?: SessionsWorkspaceProps["onRequestDelete"];
  onRequestShare?: (session: Session) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelected?: (sessionId: string) => void;
  sharedByName?: string;
  workspaceLabel?: string;
  isSharedSession?: boolean;
  onLeaveSession?: (sessionId: string) => void;
}) {
  const { authUid, isIdentityResolved } = useWorkspace();
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyLinkBusy, setCopyLinkBusy] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 900);
    return () => window.clearTimeout(t);
  }, [copied]);

  const { session, counts } = item;
  const sessionId = session.id;
  const isOptimistic = Boolean(session.isOptimistic);

  const handleRowActivate = () => {
    if (isSelectionMode) {
      onToggleSelected?.(sessionId);
      return;
    }
    if (isOptimistic) {
      setOpeningId(sessionId);
      return;
    }
    setOpeningId(sessionId);
    onView?.(sessionId);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent) => {
    if (isSelectionMode && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onToggleSelected?.(sessionId);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowActivate();
    }
  };

  const handleActionsContainerClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
    },
    []
  );

  const handleActionsContainerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
    },
    []
  );

  const handleCopyLinkClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (isOptimistic || copyLinkBusy) return;
      assertIdentityResolved(isIdentityResolved);
      void copySessionLink(session.id, authUid, {
        onBusy: setCopyLinkBusy,
      }).then((ok) => {
        if (ok) setCopied(true);
      });
    },
    [authUid, copyLinkBusy, isIdentityResolved, isOptimistic, session.id]
  );

  const open = counts.open;
  const resolved = counts.resolved;
  const total = (counts.open ?? 0) + (counts.resolved ?? 0);
  const updatedShort = formatSessionDateShort(session);
  const resolvedForPie = resolved ?? 0;
  let progress =
    total == null || total === 0 ? 0 : (resolvedForPie / total) * 100;
  if (progress >= 100) progress = 99.999;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowActivate}
        onKeyDown={handleRowKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          "group relative flex w-full items-center justify-between rounded-lg px-4 py-4 transition-all duration-150 hover:bg-[var(--surface-hover)]",
          isSelectionMode ? "hover:bg-[var(--surface-hover)] cursor-pointer" : "",
          isSelected ? "bg-[var(--brand-subtle)] hover:bg-[var(--brand-subtle)]" : "",
          openingId === session.id ? "bg-[var(--surface-subtle)]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-session-id={session.id}
      >
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            aria-label={isSelected ? "Deselect session" : "Select session"}
            className={[
              "relative flex h-[38px] w-[38px] items-center justify-center",
              (!isSharedSession && (hovered || isSelectionMode)) ? "cursor-pointer" : "cursor-default",
              (!isSharedSession && (hovered || isSelectionMode)) ? "transition-all duration-150" : "",
            ].join(" ")}
            onClick={(e) => {
              if (isSharedSession) return;
              if (!(hovered || isSelectionMode)) return;
              e.preventDefault();
              e.stopPropagation();
              onToggleSelected?.(sessionId);
            }}
            onMouseDown={(e) => {
              if (isSharedSession) return;
              if (!(hovered || isSelectionMode)) return;
              e.stopPropagation();
            }}
          >
            {(!isSharedSession && (hovered || isSelectionMode)) ? (
              <div
                className={[
                  "w-[22px] h-[22px] rounded-[var(--radius-xs)] border flex items-center justify-center transition-all duration-150",
                  "cursor-pointer",
                  "hover:scale-[1.06] active:scale-[0.97]",
                  isSelected
                    ? "bg-[var(--brand)] border-[var(--brand)]"
                    : "bg-white border-[var(--border-strong)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]",
                ].join(" ")}
              >
                <Check
                  className={[
                    "w-4 h-4",
                    isSelected
                      ? "text-white opacity-100"
                      : "text-[var(--text-secondary)] opacity-60",
                  ].join(" ")}
                  strokeWidth={3}
                  aria-hidden
                />
              </div>
            ) : (
              <ProgressPie value={progress} size={32} />
            )}
          </button>

          <div className="min-w-0">
            {session.title?.trim() ? (
              <span className="truncate block text-[15px] font-medium text-[var(--text-heading)]">
                {session.title}
              </span>
            ) : null}
            {(() => {
              const creatorName = session.creatorName;
              const commentCount = session.commentCount ?? 0;
              const showSharedBy = Boolean(sharedByName);
              const showWorkspace = Boolean(workspaceLabel);
              if (!showSharedBy && !creatorName && commentCount === 0 && !showWorkspace) return null;
              return (
                <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mt-0.5">
                  {showSharedBy ? (
                    <span>Shared by {sharedByName}</span>
                  ) : creatorName ? (
                    <span>Created by {creatorName}</span>
                  ) : null}
                  {showWorkspace && (
                    <>
                      {(showSharedBy || creatorName) && (
                        <span className="text-[var(--text-tertiary)]">·</span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] px-2 py-0.5 text-[12px] font-medium text-[var(--text-body)]">
                        <Building2 className="h-3.5 w-3.5" aria-hidden />
                        {workspaceLabel}
                      </span>
                    </>
                  )}
                  {!isSharedSession && creatorName && commentCount > 0 && (
                    <span className="text-[var(--text-tertiary)]">·</span>
                  )}
                  {!isSharedSession && commentCount > 0 && (
                    <span>
                      {commentCount} {commentCount === 1 ? "comment" : "comments"}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex min-h-[36px] items-center shrink-0 gap-10 transition-[margin] duration-150 group-hover:mr-[86px]">
          {(() => {
            const viewers = session.recentViewers ?? [];
            const viewCount = session.viewCount ?? 0;
            const maxVisible = 4;
            const visibleViewers = viewers.slice(0, maxVisible);
            const remaining = viewCount - visibleViewers.length;

            if (viewCount === 0 || viewers.length === 0) return null;

            return (
              <div
                className="flex items-center -space-x-1.5 group-hover:opacity-0"
                aria-label="Recent viewers"
              >
                {visibleViewers.map((viewer, i) => (
                  <div
                    key={viewer.id}
                    className="rounded-full ring-2 ring-white overflow-hidden"
                    style={{
                      zIndex: maxVisible - i + 1,
                      width: 28,
                      height: 28,
                      backgroundColor: viewer.isAnonymous
                        ? undefined
                        : getAvatarColor(viewer.id),
                    }}
                  >
                    <UserAvatar
                      avatarUrl={viewer.avatarUrl}
                      name={viewer.displayName}
                      size={28}
                      isAnonymous={viewer.isAnonymous}
                      initialsClassName="bg-transparent text-white font-semibold"
                    />
                  </div>
                ))}
                {remaining > 0 && (
                  <div
                    className="rounded-full ring-2 ring-white flex items-center justify-center bg-[var(--surface-hover)] text-[var(--text-secondary)] font-semibold"
                    style={{ width: 28, height: 28, minWidth: 28, fontSize: 11, zIndex: 0 }}
                    aria-label={`${remaining} more viewers`}
                  >
                    +{remaining}
                  </div>
                )}
              </div>
            );
          })()}
          <>
            {open != null && open > 0 && (
              <div className="text-sm text-[var(--text-body)] inline-flex items-center gap-1.5">
                <CircleDashed className="h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden />
                <span className="whitespace-nowrap font-medium tracking-tight">{open} open</span>
              </div>
            )}
            {resolved != null && resolved > 0 && (
              <div className="text-sm text-[var(--text-body)] inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 shrink-0 text-[var(--color-success)]" strokeWidth={2.5} aria-hidden />
                <span className="whitespace-nowrap font-medium tracking-tight">{resolved} resolved</span>
              </div>
            )}
          </>
          {updatedShort ? (
            <div className="inline-flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-[var(--color-warning)]" strokeWidth={2.5} aria-hidden />
              <span className="whitespace-nowrap font-medium tracking-tight text-[var(--text-body)]">
                {updatedShort}
              </span>
            </div>
          ) : null}
        </div>

        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          onClick={handleActionsContainerClick}
          onKeyDown={handleActionsContainerKeyDown}
        >
          <Tooltip content={copyLinkBusy ? "Generating link…" : copied ? "Copied" : "Copy link"}>
            <button
              type="button"
              disabled={isOptimistic || copyLinkBusy}
              onClick={handleCopyLinkClick}
              className="w-[38px] h-[38px] rounded-[var(--radius-btn)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF]/30 disabled:opacity-50 disabled:pointer-events-none"
              aria-label={
                copyLinkBusy ? "Generating link…" : copied ? "Copied" : "Copy link"
              }
            >
              {copyLinkBusy ? (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-secondary)]" aria-hidden />
              ) : copied ? (
                <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              ) : (
                <Link className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              )}
            </button>
          </Tooltip>
          <div
            className="relative"
            onClick={handleActionsContainerClick}
            onKeyDown={handleActionsContainerKeyDown}
          >
            {isSharedSession ? (
              <Tooltip content="Leave session">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLeaveSession?.(session.id);
                  }}
                  className="w-[38px] h-[38px] rounded-[var(--radius-btn)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF]/30"
                  aria-label="Leave session"
                >
                  <LogOut className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                </button>
              </Tooltip>
            ) : (
              <SessionActionsDropdown
                session={session}
                onRenameSuccess={onRenameSuccess}
                onSetArchived={onSetArchived}
                onRequestDelete={onRequestDelete}
                onShareClick={() => onRequestShare?.(session)}
                onAddMoreTickets={() => triggerAddMoreTickets(session.id)}
                variant="list"
                flipPlacement
                disabled={isOptimistic}
                triggerClassName="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A49BF]/30"
                triggerIconClassName="h-5 w-5"
                triggerAriaLabel="Session actions"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
});

interface ShareModalForSessionProps {
  session: Session;
  onClose: () => void;
  authUid: string | null;
}

function ShareModalForSession({ session, onClose, authUid }: ShareModalForSessionProps) {
  const share = useShareController(session.id, {
    initialGeneralAccess: session.generalAccess as ShareGeneralAccess | undefined,
  });
  const { setOpen, load } = share;

  useEffect(() => {
    setOpen(true);
  }, [setOpen]);

  useEffect(() => {
    if (!share.open) return;
    void load().catch(() => {});
  }, [share.open, load]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose();
  }, [setOpen, onClose]);

  if (!share.open) return null;

  return (
    <ShareModal
      open
      onClose={handleClose}
      canManageShare
      canManageAccess
      isWorkspaceMember
      sessionId={session.id}
      sessionName={session.title ?? null}
      inviteEmail={share.inviteEmail}
      setInviteEmail={share.setInviteEmail}
      inviteAccess={share.inviteAccess}
      setInviteAccess={share.setInviteAccess}
      generalAccess={share.generalAccess}
      updatingGeneralAccess={share.updatingGeneralAccess}
      items={share.items}
      initialLoading={share.initialLoading}
      inviting={share.inviting}
      updatingId={share.updatingId}
      removingId={share.removingId}
      inviteError={share.inviteError}
      listError={share.listError}
      onInvite={() => {
        void share.invite().catch(() => {});
      }}
      onUpdateGeneralAccess={(value) => {
        void share.updateGeneralAccess(value).catch(() => {});
      }}
      onUpdateRole={(item, access) => {
        void share.updateRole(item, access).catch(() => {});
      }}
      onRemove={(item) => {
        void share.removeAccess(item).catch(() => {});
      }}
      accessRequests={share.accessRequests}
      patchingAccessRequestId={share.patchingAccessRequestId}
      onApproveAccessRequest={(id, access) => {
        void share.patchAccessRequest(id, "approve", access).catch(() => {});
      }}
      onRejectAccessRequest={(id) => {
        void share.patchAccessRequest(id, "reject").catch(() => {});
      }}
      canResolve
      linkCopied={share.linkCopied}
      onCopyShareLink={() => void share.copyShareLink().catch(() => {})}
      refetchingAfterApproval={share.refetchingAfterApproval}
      workspaceMembers={share.workspaceMembers}
      loadingWorkspaceMembers={share.loadingWorkspaceMembers}
      currentUserUid={authUid ?? undefined}
    />
  );
}

export function SessionsWorkspace({
  sections,
  onView,
  onRenameSuccess,
  onSetArchived,
  onRequestDelete,
  onDeleteSession,
  viewMode: viewModeProp,
  onViewModeChange,
}: SessionsWorkspaceProps) {
  const { authUid, isIdentityResolved } = useWorkspace();
  const { setSearch } = useSessionsSearch();
  const [internalViewMode, setInternalViewMode] = useState<"list" | "grid">("list");
  const [shareSession, setShareSession] = useState<Session | null>(null);

  const handleRequestShare = useCallback((session: Session) => {
    setShareSession(session);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShareSession(null);
  }, []);

  const isControlled = viewModeProp !== undefined && typeof onViewModeChange === "function";
  const viewMode = isControlled ? viewModeProp! : internalViewMode;
  const setViewMode = isControlled ? onViewModeChange! : setInternalViewMode;

  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const isSelectionMode = selectedSessions.length > 0;
  const [bulkArchiving, setBulkArchiving] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const bulkBusy = bulkArchiving || bulkDeleting;

  const toggleSelected = useCallback((id: string) => {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const sessionById = useMemo(() => {
    const map = new Map<string, Session>();
    for (const section of sections ?? []) {
      for (const item of section.items) {
        map.set(item.session.id, item.session);
      }
    }
    return map;
  }, [sections]);

  const archiveSelected = useCallback(async () => {
    if (!onSetArchived) return;
    if (bulkBusy) return;
    assertIdentityResolved(isIdentityResolved);
    const ids = selectedSessions.slice();
    if (ids.length === 0) return;
    setBulkArchiving(true);
    try {
      await Promise.all(ids.map((id) => onSetArchived(id, true)));
      setSelectedSessions([]);
    } finally {
      setBulkArchiving(false);
    }
  }, [onSetArchived, selectedSessions, bulkBusy, isIdentityResolved]);

  const unarchiveSelected = useCallback(async () => {
    if (!onSetArchived) return;
    if (bulkBusy) return;
    assertIdentityResolved(isIdentityResolved);
    const ids = selectedSessions.slice();
    if (ids.length === 0) return;
    setBulkArchiving(true);
    try {
      await Promise.all(ids.map((id) => onSetArchived(id, false)));
      setSelectedSessions([]);
    } finally {
      setBulkArchiving(false);
    }
  }, [onSetArchived, selectedSessions, bulkBusy, isIdentityResolved]);

  const deleteSelected = useCallback(async () => {
    if (!onDeleteSession) return;
    if (bulkBusy) return;
    assertIdentityResolved(isIdentityResolved);
    const ids = selectedSessions.slice();
    if (ids.length === 0) return;
    const sessionsToDelete: Session[] = ids.map((id) => sessionById.get(id)).filter(Boolean) as Session[];
    if (sessionsToDelete.length === 0) return;
    setBulkDeleting(true);
    try {
      await Promise.all(sessionsToDelete.map((s) => onDeleteSession(s)));
      setSelectedSessions([]);
    } finally {
      setBulkDeleting(false);
    }
  }, [onDeleteSession, selectedSessions, bulkBusy, sessionById, isIdentityResolved]);

  const handleBulkDelete = useCallback(() => {
    if (bulkBusy) return;
    if (selectedSessions.length === 0) return;
    setDeleteModalOpen(true);
  }, [bulkBusy, selectedSessions.length]);

  const confirmBulkDelete = useCallback(async () => {
    if (selectedSessions.length === 0) return;
    await deleteSelected();
    setSelectedSessions([]);
    setDeleteModalOpen(false);
  }, [deleteSelected, selectedSessions.length]);

  const sectionsInput = sections ?? [];
  const flatItemCount = sectionsInput.reduce((n, s) => n + s.items.length, 0);

  const selectedSessionObjects = selectedSessions
    .map((id) => sessionById.get(id))
    .filter(Boolean) as Session[];
  const allArchived =
    selectedSessionObjects.length > 0 &&
    selectedSessionObjects.every((s) => (s.isArchived ?? (s as Session & { archived?: boolean }).archived) === true);

  return (
    <div className={`flex w-full flex-col gap-4 ${isControlled ? "mt-0" : "mt-4"}`}>
      {!isControlled ? (
        <div className="flex w-full justify-end">
          <SessionsViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      ) : null}

      {flatItemCount === 0 ? (
        <section className="w-full pt-12 pb-10" aria-live="polite">
          <CanvasEmptyState
            illustration={<NoResultsIllu />}
            title="No sessions match your filters"
            description="Try adjusting your search or clearing filters."
            cta={
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex h-[34px] items-center gap-1.5 px-3.5 rounded-[8px] border border-[var(--border)] bg-white text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
              >
                Clear filters
              </button>
            }
          />
        </section>
      ) : (
        sectionsInput.map((section, sectionIndex) => {
          if (section.items.length === 0) return null;

          const showSectionHead = section.title.trim().length > 0;
          const headingSlug =
            section.title.trim().replace(/\s+/g, "-") || "section";
          const headingId = `workspace-section-${sectionIndex}-${headingSlug}`;
          const listWrap = "w-full";
          const sectionHead = showSectionHead ? (
            <div className="mb-2 flex items-center justify-between px-0">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${section.markerClassName ?? "bg-[var(--brand)]"}`}
                  aria-hidden
                />
                <span
                  id={headingId}
                  className="text-[16px] font-semibold text-[var(--text-heading)]"
                >
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
              <div className={viewMode === "list" ? listWrap : "w-full"}>
                {sectionHead}
              </div>

              {viewMode === "list" ? (
                <div className={`${listWrap} mt-0 space-y-3`}>
                  {section.items.map((rowItem) => (
                    <SessionWorkspaceRow
                      key={rowItem.session.id}
                      item={rowItem}
                      onView={onView}
                      onRenameSuccess={onRenameSuccess}
                      onSetArchived={onSetArchived}
                      onRequestDelete={onRequestDelete}
                      onRequestShare={handleRequestShare}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedSessions.includes(rowItem.session.id)}
                      onToggleSelected={toggleSelected}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-2 w-full">
                  <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {section.items.map((item, index) => (
                      <WorkspaceCard
                        key={`${sectionIndex}-${item.session.id}-${index}`}
                        item={item}
                        onView={onView}
                        index={index}
                        onRenameSuccess={onRenameSuccess}
                        onSetArchived={onSetArchived}
                        onRequestDelete={onRequestDelete}
                        onRequestShare={handleRequestShare}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })
      )}

      {selectedSessions.length > 0 ? (
        <div
          className={[
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]",
            "transition-all duration-200 ease-out",
            "opacity-100 translate-y-0",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center justify-between bg-[#15101F] text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm min-w-[420px] max-w-[600px]",
              "select-none",
            ].join(" ")}
          >
            <span className="text-sm font-medium">{selectedSessions.length} selected</span>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => void (allArchived ? unarchiveSelected() : archiveSelected())}
                disabled={bulkBusy || !onSetArchived}
                aria-disabled={bulkBusy || !onSetArchived}
                className="flex items-center gap-2 hover:opacity-80 disabled:opacity-50"
              >
                {allArchived ? (
                  <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <Archive className="w-4 h-4" strokeWidth={2.5} />
                )}
                <span className="text-sm">
                  {bulkArchiving
                    ? allArchived
                      ? "Unarchiving…"
                      : "Archiving…"
                    : allArchived
                      ? "Unarchive"
                      : "Archive"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedSessions.length === 0 || bulkBusy || !onDeleteSession}
                aria-disabled={selectedSessions.length === 0 || bulkBusy || !onDeleteSession}
                className={[
                  "flex items-center gap-2 transition-opacity",
                  selectedSessions.length === 0 || bulkBusy || !onDeleteSession
                    ? "opacity-40 pointer-events-none"
                    : "hover:opacity-80",
                ].join(" ")}
              >
                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-sm">{bulkDeleting ? "Deleting…" : "Delete"}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSessions([])}
                disabled={bulkBusy}
                className="text-sm text-[var(--text-placeholder)] hover:text-white disabled:opacity-50 inline-flex items-center gap-2"
              >
                <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModalOpen ? (
        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          ariaLabelledBy="bulk-delete-title"
          role="alertdialog"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 cursor-default">
            <h2 id="bulk-delete-title" className="text-[18px] font-semibold text-[var(--text-heading)]">
              Delete sessions?
            </h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-[var(--text-secondary)]">
              This will permanently delete {selectedSessions.length} session(s). This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={bulkDeleting}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmBulkDelete()}
                disabled={bulkDeleting || selectedSessions.length === 0 || !onDeleteSession}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--color-danger)] text-white text-[14px] font-medium hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {bulkDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {shareSession ? (
        <ShareModalForSession
          session={shareSession}
          onClose={handleCloseShare}
          authUid={authUid ?? null}
        />
      ) : null}
    </div>
  );
}
