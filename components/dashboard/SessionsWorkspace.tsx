"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  Calendar,
  CircleDashed,
  Link,
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
  /** When the session list is empty (e.g. snapshot pending), render this many inert list rows with field-level skeletons. */
  listPlaceholderCount?: number;
  /** Controls whether bulk bar shows Archive vs Unarchive. */
  activeTab?: "sessions" | "archived";
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
  item?: SessionWithCounts | undefined;
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

  if (!item) {
    return (
      <div
        className="group flex w-full items-center justify-between rounded-lg px-4 py-4"
        aria-busy="true"
        aria-label="Loading session row"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="relative flex h-8 w-8 shrink-0 items-center justify-center"
            aria-hidden
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200/90 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div
              className="h-4 max-w-[55%] rounded-md bg-neutral-200/85 animate-pulse sm:w-48"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex min-h-[36px] shrink-0 items-center gap-3.5">
          <div
            className="flex h-7 min-w-[4.5rem] items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5"
            aria-hidden
          >
            <div className="h-4 w-8 rounded bg-neutral-200/90 animate-pulse" />
          </div>
          <div
            className="flex h-7 min-w-[5.5rem] items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5"
            aria-hidden
          >
            <div className="h-4 w-8 rounded bg-neutral-200/90 animate-pulse" />
          </div>
          <div
            className="inline-flex min-h-[36px] min-w-[5.5rem] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm"
            aria-hidden
          >
            <div className="h-4 w-4 shrink-0 rounded bg-neutral-200/90 animate-pulse" />
            <div className="h-4 w-16 rounded bg-neutral-200/90 animate-pulse" />
          </div>
          <div className="flex items-center gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-7 w-7 shrink-0 rounded-full border-2 border-white bg-neutral-200/90 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { session, counts } = item;
  const sessionId = session.id;
  const isOptimistic = Boolean(session.isOptimistic);
  const countsUnknown = false;

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
          "group flex w-full items-center justify-between rounded-lg px-4 py-4 transition-all duration-150 hover:bg-gray-50",
          isSelectionMode ? "hover:bg-gray-100 cursor-pointer" : "",
          isSelected ? "bg-blue-50 hover:bg-blue-50" : "",
          openingId === session.id ? "bg-gray-50" : "",
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
                  "w-[22px] h-[22px] rounded-[6px] border flex items-center justify-center transition-all duration-150",
                  "cursor-pointer",
                  "hover:scale-[1.06] active:scale-[0.97]",
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-400 hover:border-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                <Check
                  className={[
                    "w-4 h-4",
                    isSelected
                      ? "text-white opacity-100"
                      : "text-gray-500 opacity-60",
                  ].join(" ")}
                  strokeWidth={3}
                  aria-hidden
                />
              </div>
            ) : countsUnknown ? (
              <div
                className="h-8 w-8 shrink-0 rounded-full bg-neutral-200/90 animate-pulse"
                aria-hidden
              />
            ) : (
              <ProgressPie value={progress} size={32} />
            )}
          </button>

          <div className="min-w-0">
            {session.title?.trim() ? (
              <span className="truncate block text-[15px] font-medium text-gray-900">
                {session.title}
              </span>
            ) : null}
            {(isOptimistic || openingId === session.id) && (
              <div
                className="mt-1.5 h-3.5 w-28 max-w-[55%] rounded-md bg-neutral-200/85 animate-pulse"
                aria-hidden
              />
            )}
          </div>
        </div>

        <div className="flex min-h-[36px] items-center shrink-0 gap-3.5">
          {countsUnknown ? (
            <>
              <div
                className="h-7 min-w-[4.5rem] rounded-full border border-gray-200 bg-white px-3 py-1.5 flex items-center justify-center"
                aria-hidden
              >
                <div className="h-4 w-8 rounded bg-neutral-200/90 animate-pulse" />
              </div>
              <div
                className="h-7 min-w-[5.5rem] rounded-full border border-gray-200 bg-white px-3 py-1.5 flex items-center justify-center"
                aria-hidden
              >
                <div className="h-4 w-8 rounded bg-neutral-200/90 animate-pulse" />
              </div>
            </>
          ) : (
            <>
              {open != null && open > 0 && (
                <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 inline-flex items-center justify-center gap-1.5">
                  <CircleDashed className="h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                  <span className="whitespace-nowrap font-medium tracking-tight">{open} open</span>
                </div>
              )}
              {resolved != null && resolved > 0 && (
                <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 inline-flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4 shrink-0 text-green-500" strokeWidth={2.5} aria-hidden />
                  <span className="whitespace-nowrap font-medium tracking-tight">{resolved} resolved</span>
                </div>
              )}
            </>
          )}
          {updatedShort ? (
            <div className="inline-flex min-h-[36px] min-w-[5.5rem] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-orange-500" strokeWidth={2.5} aria-hidden />
              <span className="whitespace-nowrap font-medium tracking-tight text-gray-700">
                {updatedShort}
              </span>
            </div>
          ) : !isOptimistic ? (
            <div
              className="inline-flex min-h-[36px] min-w-[5.5rem] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm"
              aria-hidden
            >
              <div className="h-4 w-4 shrink-0 rounded bg-neutral-200/90 animate-pulse" />
              <div className="h-4 w-16 rounded bg-neutral-200/90 animate-pulse" />
            </div>
          ) : null}

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
                disabled={isOptimistic || copyLinkBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOptimistic || copyLinkBusy) return;
                  assertIdentityResolved(isIdentityResolved);
                  void copySessionLink(session.id, authUid, {
                    onBusy: setCopyLinkBusy,
                  }).then((ok) => {
                    if (ok) setCopied(true);
                  });
                }}
                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30 disabled:opacity-50 disabled:pointer-events-none"
                aria-label={
                  copyLinkBusy ? "Generating link…" : copied ? "Copied" : "Copy link"
                }
                title={copyLinkBusy ? "Generating link…" : copied ? "Copied" : "Copy link"}
              >
                {copyLinkBusy ? (
                  <span
                    className="inline-flex h-5 w-5 rounded-full bg-neutral-300/90 animate-pulse"
                    aria-hidden
                  />
                ) : copied ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Link className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                )}
              </button>
              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <SessionActionsDropdown
                  session={session}
                  onRenameSuccess={onRenameSuccess}
                  onSetArchived={onSetArchived}
                  onRequestDelete={onRequestDelete}
                  variant="list"
                  flipPlacement
                  disabled={isOptimistic}
                  triggerClassName="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]/30"
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
  listPlaceholderCount: listPlaceholderCountProp,
  activeTab = "sessions",
  onView,
  onRenameSuccess,
  onSetArchived,
  onRequestDelete,
  onDeleteSession,
  viewMode: viewModeProp,
  onViewModeChange,
}: SessionsWorkspaceProps) {
  const listPlaceholderCount = listPlaceholderCountProp ?? 0;
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

  const sessionById = useCallback(() => {
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
    const byId = sessionById();
    const sessionsToDelete: Session[] = ids.map((id) => byId.get(id)).filter(Boolean) as Session[];
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
  const listShellActive =
    listPlaceholderCount > 0 && flatItemCount === 0 && viewMode === "list";
  const showGridShell =
    listPlaceholderCount > 0 && flatItemCount === 0 && viewMode === "grid";
  const hasRenderableSessions = sectionsInput.some((s) => s.items.length > 0);

  if (!listShellActive && !showGridShell && !hasRenderableSessions) return null;

  const sectionsForRender =
    listShellActive && sectionsInput.length === 0
      ? [
          {
            title: "",
            markerClassName: "bg-blue-500",
            items: [] as SessionWithCounts[],
          },
        ]
      : sectionsInput;

  const byId = sessionById();
  const selectedSessionObjects = selectedSessions
    .map((id) => byId.get(id))
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

      {showGridShell ? (
        <section className="w-full" aria-busy="true">
          <div className="mt-2 w-full">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
              {Array.from({ length: listPlaceholderCount }, (_, i) => (
                <div
                  key={`grid-slot-${i}`}
                  className="h-[min(200px,40vw)] min-h-[160px] w-full rounded-xl border border-gray-200 bg-neutral-50/80 px-4 py-4"
                  aria-hidden
                >
                  <div className="mb-4 h-5 w-3/4 max-w-[12rem] rounded-md bg-neutral-200/90 animate-pulse" />
                  <div className="mb-3 h-3 w-full max-w-[8rem] rounded bg-neutral-200/80 animate-pulse" />
                  <div className="mt-6 flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-neutral-200/85 animate-pulse" />
                    <div className="h-6 w-16 rounded-full bg-neutral-200/85 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        sectionsForRender.map((section, sectionIndex) => {
          const isPrimaryListShell =
            listShellActive &&
            sectionIndex === 0 &&
            section.items.length === 0;
          const skipEmptySection =
            section.items.length === 0 && !isPrimaryListShell;
          if (skipEmptySection) return null;

          const rowCount = isPrimaryListShell
            ? listPlaceholderCount
            : section.items.length;

          const showSectionHead = section.title.trim().length > 0;
          const headingSlug =
            section.title.trim().replace(/\s+/g, "-") || "section";
          const headingId = `workspace-section-${sectionIndex}-${headingSlug}`;
          const listWrap = "w-full";
          const sectionHead = showSectionHead ? (
            <div className="mb-2 flex items-center justify-between px-0">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${section.markerClassName ?? "bg-blue-500"}`}
                  aria-hidden
                />
                <span
                  id={headingId}
                  className="text-[16px] font-semibold text-neutral-900"
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
              aria-busy={isPrimaryListShell ? true : undefined}
            >
              <div className={viewMode === "list" ? listWrap : "w-full"}>
                {sectionHead}
              </div>

              {viewMode === "list" ? (
                <div className={`${listWrap} mt-0 space-y-3`}>
                  {Array.from({ length: rowCount }, (_, rowIndex) => {
                    const rowItem = section.items[rowIndex];
                    const rowKey = `slot-${sectionIndex}-${rowIndex}`;
                    return (
                      <SessionWorkspaceRow
                        key={rowKey}
                        item={rowItem}
                        rowIndex={rowIndex}
                        onView={onView}
                        onRenameSuccess={onRenameSuccess}
                        onSetArchived={onSetArchived}
                        onRequestDelete={onRequestDelete}
                        isSelectionMode={isSelectionMode}
                        isSelected={
                          rowItem
                            ? selectedSessions.includes(rowItem.session.id)
                            : false
                        }
                        onToggleSelected={toggleSelected}
                      />
                    );
                  })}
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
            <h2 id="bulk-delete-title" className="text-[18px] font-semibold text-gray-900">
              Delete sessions?
            </h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-gray-600">
              This will permanently delete {selectedSessions.length} session(s). This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={bulkDeleting}
                className="px-4 py-2.5 text-[14px] font-medium rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmBulkDelete()}
                disabled={bulkDeleting || selectedSessions.length === 0 || !onDeleteSession}
                className="px-4 py-2.5 text-[14px] font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
