"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import {
  Archive,
  Calendar,
  CircleDashed,
  Link,
  Loader2,
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
import { Modal } from "@/components/ui/Modal";
import { copySessionLink } from "@/utils/copySessionLink";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";

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

function formatSessionUpdatedShort(session: Session): string {
  const u = session.updatedAt;
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

function SessionWorkspaceRow({
  item,
  rowIndex,
  onView,
  onRenameSuccess,
  onSetArchived,
  onRequestDelete,
  isSelectionMode,
  isSelected,
  onToggleSelected,
}: {
  item: SessionWithCounts;
  rowIndex: number;
  onView?: (sessionId: string) => void;
  onRenameSuccess?: SessionsWorkspaceProps["onRenameSuccess"];
  onSetArchived?: SessionsWorkspaceProps["onSetArchived"];
  onRequestDelete?: SessionsWorkspaceProps["onRequestDelete"];
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelected?: (sessionId: string) => void;
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
  const updatedShort = formatSessionUpdatedShort(session);
  const resolvedForPie = resolved ?? 0;
  let progress =
    total == null || total === 0 ? 0 : (resolvedForPie / total) * 100;
  if (progress >= 100) progress = 99.999;

  const mockAssigneeInitials = (() => {
    // Temp mock per spec (static for now).
    const rows: string[][] = [
      ["A", "J", "K"],
      ["M", "R"],
      ["S", "T", "D"],
    ];
    return rows[rowIndex % rows.length] ?? ["?"];
  })();
  const assigneeLabels = useMemo(() => {
    const baseLabels = mockAssigneeInitials.length > 0 ? mockAssigneeInitials : ["?"];
    return [...baseLabels, "?", "?", "?"].slice(0, 3);
  }, [mockAssigneeInitials]);

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
          "group flex w-full items-center justify-between rounded-lg px-4 py-4 transition-all duration-150 hover:bg-[var(--surface-hover)]",
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
              "relative flex h-8 w-8 items-center justify-center",
              (hovered || isSelectionMode) ? "cursor-pointer" : "cursor-default",
              (hovered || isSelectionMode) ? "transition-all duration-150" : "",
            ].join(" ")}
            onClick={(e) => {
              if (!(hovered || isSelectionMode)) return;
              e.preventDefault();
              e.stopPropagation();
              onToggleSelected?.(sessionId);
            }}
            onMouseDown={(e) => {
              if (!(hovered || isSelectionMode)) return;
              e.stopPropagation();
            }}
          >
            {(hovered || isSelectionMode) ? (
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
          </div>
        </div>

        <div className="flex min-h-[36px] items-center shrink-0 gap-3.5">
          <>
            {open != null && open > 0 && (
              <div className="rounded-[var(--radius-sm)] bg-white px-3 py-1.5 text-sm text-[var(--text-body)] inline-flex items-center justify-center gap-1.5">
                <CircleDashed className="h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden />
                <span className="whitespace-nowrap font-medium tracking-tight">{open} open</span>
              </div>
            )}
            {resolved != null && resolved > 0 && (
              <div className="rounded-[var(--radius-sm)] bg-white px-3 py-1.5 text-sm text-[var(--text-body)] inline-flex items-center justify-center gap-1.5">
                <Check className="h-4 w-4 shrink-0 text-[var(--color-success)]" strokeWidth={2.5} aria-hidden />
                <span className="whitespace-nowrap font-medium tracking-tight">{resolved} resolved</span>
              </div>
            )}
          </>
          {updatedShort ? (
            <div className="inline-flex min-h-[36px] min-w-[5.5rem] items-center gap-1.5 rounded-[var(--radius-sm)] bg-white px-3 py-1.5 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-[var(--color-warning)]" strokeWidth={2.5} aria-hidden />
              <span className="whitespace-nowrap font-medium tracking-tight text-[var(--text-body)]">
                {updatedShort}
              </span>
            </div>
          ) : null}

          <div className="flex items-center relative">
            <div
              className="flex -space-x-2 transition-opacity duration-150 group-hover:opacity-0"
              aria-label="Assignees"
            >
              {assigneeLabels.map((label, i) => (
                <div
                  key={`${session.id}-assignee-${i}-${label}`}
                  style={{ border: "2px solid white", borderRadius: "50%", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
                  aria-label={label === "?" ? "Unassigned" : `Assignee ${label}`}
                >
                  <Avatar
                    src={null}
                    name={label === "?" ? null : label}
                    size={28}
                  />
                </div>
              ))}
            </div>

            <div
              className="absolute right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              onClick={handleActionsContainerClick}
              onKeyDown={handleActionsContainerKeyDown}
            >
              <button
                type="button"
                disabled={isOptimistic || copyLinkBusy}
                onClick={handleCopyLinkClick}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]/30 disabled:opacity-50 disabled:pointer-events-none"
                aria-label={
                  copyLinkBusy ? "Generating link…" : copied ? "Copied" : "Copy link"
                }
                title={copyLinkBusy ? "Generating link…" : copied ? "Copied" : "Copy link"}
              >
                {copyLinkBusy ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--text-secondary)]" aria-hidden />
                ) : copied ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Link className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                )}
              </button>
              <div
                className="relative"
                onClick={handleActionsContainerClick}
                onKeyDown={handleActionsContainerKeyDown}
              >
                <SessionActionsDropdown
                  session={session}
                  onRenameSuccess={onRenameSuccess}
                  onSetArchived={onSetArchived}
                  onRequestDelete={onRequestDelete}
                  variant="list"
                  flipPlacement
                  disabled={isOptimistic}
                  triggerClassName="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1775E0]/30"
                  triggerIconClassName="h-5 w-5"
                  triggerAriaLabel="Session actions"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
  const { isIdentityResolved } = useWorkspace();
  const [internalViewMode, setInternalViewMode] = useState<"list" | "grid">("list");
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
        <section
          className="w-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-subtle)]/60 px-6 py-14 text-center"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-[var(--text-heading)]">No sessions match the current filters</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Try another time range or clear your search.
          </p>
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
                  {section.items.map((rowItem, rowIndex) => (
                    <SessionWorkspaceRow
                      key={rowItem.session.id}
                      item={rowItem}
                      rowIndex={rowIndex}
                      onView={onView}
                      onRenameSuccess={onRenameSuccess}
                      onSetArchived={onSetArchived}
                      onRequestDelete={onRequestDelete}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedSessions.includes(rowItem.session.id)}
                      onToggleSelected={toggleSelected}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-2 w-full">
                  <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
                    {section.items.map((item, index) => (
                      <WorkspaceCard
                        key={`${sectionIndex}-${item.session.id}-${index}`}
                        item={item}
                        onView={onView}
                        index={index}
                        onRenameSuccess={onRenameSuccess}
                        onSetArchived={onSetArchived}
                        onRequestDelete={onRequestDelete}
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
              "flex items-center justify-between bg-[#1C1C1E] text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm min-w-[420px] max-w-[600px]",
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
                className="text-sm text-gray-300 hover:text-white disabled:opacity-50 inline-flex items-center gap-2"
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
                className="px-4 py-2.5 text-[14px] font-medium rounded-xl bg-[var(--surface-hover)] text-[var(--text-heading)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmBulkDelete()}
                disabled={bulkDeleting || selectedSessions.length === 0 || !onDeleteSession}
                className="px-4 py-2.5 text-[14px] font-semibold rounded-xl bg-[var(--color-danger)] text-white hover:opacity-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
