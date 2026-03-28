"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, MessageCircle, FileText, Loader2 } from "lucide-react";
import type { SessionWithCounts } from "@/app/(app)/dashboard/hooks/useWorkspaceOverview";
import type { Session } from "@/lib/domain/session";
import type { Timestamp } from "firebase/firestore";
import { formatDistanceToNowStrict } from "date-fns/formatDistanceToNowStrict";
import { toDate } from "@/lib/utils/date";
import { SessionActionsDropdown } from "@/components/dashboard/SessionActionsDropdown";

const TOOLTIP_HOVER_DELAY_MS = 300;
const COPIED_TOOLTIP_MS = 2000;

function sessionUpdatedToDate(updatedAt: Session["updatedAt"]): Date | null {
  if (updatedAt == null) return null;
  if (typeof updatedAt === "string") {
    const d = new Date(updatedAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return toDate(updatedAt as Date | Timestamp | null | undefined);
}

export interface WorkspaceCardProps {
  item: SessionWithCounts;
  onView: (sessionId: string) => void;
  index: number;
  onRenameSuccess?: (session: { id: string; title: string; updatedAt?: unknown }) => void;
  onSetArchived?: (sessionId: string, archived: boolean) => Promise<void> | void;
  onRequestDelete?: (session: Session) => void;
}

export function WorkspaceCard({
  item,
  onView,
  index,
  onRenameSuccess,
  onSetArchived,
  onRequestDelete,
}: WorkspaceCardProps) {
  const { session, counts } = item;
  const isOptimistic = Boolean(session.isOptimistic);
  const updatedAtDate = sessionUpdatedToDate(session.updatedAt);
  const updatedAtLabel =
    updatedAtDate && !Number.isNaN(updatedAtDate.getTime())
      ? formatDistanceToNowStrict(updatedAtDate, { addSuffix: true })
      : "";
  const countsPending = false;
  const viewCount = session.viewCount ?? 0;
  const commentCount = session.commentCount ?? 0;

  const [copyTooltip, setCopyTooltip] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOptimistic) setIsOpening(false);
  }, [isOptimistic]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-card-actions]")) return;
    if (isOpening) return;
    if (isOptimistic) {
      setIsOpening(true);
      return;
    }
    setIsOpening(true);
    onView(session.id);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isOpening) return;
      if (isOptimistic) {
        setIsOpening(true);
        return;
      }
      setIsOpening(true);
      onView(session.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
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
      {(isOptimistic || isOpening) && (
        <div
          className="absolute inset-0 rounded-xl ring-2 ring-[#155DFC]/35 pointer-events-none"
          aria-hidden
        />
      )}
      <div className="absolute top-4 right-4">
        <div data-card-actions className="relative z-10 shrink-0 opacity-100">
          <div
            className="relative h-10 w-10"
            onMouseEnter={() => {
              if (actionsMenuOpen) return;
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
            <SessionActionsDropdown
              session={session}
              onRenameSuccess={onRenameSuccess}
              onSetArchived={onSetArchived}
              onRequestDelete={onRequestDelete}
              variant="card"
              flipPlacement
              disabled={isOpening}
              onOpenChange={(open) => {
                setActionsMenuOpen(open);
                if (open) setShowTooltip(false);
              }}
              onCopyLinkSuccess={() => {
                setCopyTooltip(true);
                setTimeout(() => setCopyTooltip(false), COPIED_TOOLTIP_MS);
              }}
              triggerClassName="flex items-center justify-center h-10 w-10 rounded-xl text-[hsl(var(--text-tertiary))] transition-colors duration-[var(--motion-duration)] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] cursor-pointer"
              triggerIconClassName="h-[16px] w-[16px] relative top-[1px] pointer-events-none"
            />
            {showTooltip && !actionsMenuOpen && (
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

      <div className="flex h-full flex-col justify-between">
        <div>
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
              <FileText size={20} aria-hidden />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              {session.title?.trim() ? (
                <h3 className="font-medium text-neutral-900 text-[15px] leading-tight line-clamp-2 overflow-hidden text-ellipsis min-w-0">
                  {session.title}
                </h3>
              ) : null}
              <div className="text-xs text-meta font-medium mt-1 flex items-center gap-2 min-w-0 min-h-[14px]">
                {isOptimistic || isOpening ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : updatedAtLabel ? (
                  <>Updated: {updatedAtLabel}</>
                ) : (
                  <div
                    className="h-3.5 w-28 max-w-[70%] rounded bg-neutral-200/90 animate-pulse"
                    aria-hidden
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex min-h-[28px] flex-wrap items-center gap-2 mb-4">
            {countsPending ? (
              <>
                <div className="h-6 w-16 rounded-full bg-neutral-200 animate-pulse" aria-hidden />
                <div className="h-6 w-8 rounded-full bg-neutral-200 animate-pulse" aria-hidden />
                <div className="h-6 w-10 rounded-full bg-neutral-200 animate-pulse" aria-hidden />
              </>
            ) : (
              <>
                {counts != null && counts.total > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700 tabular-nums">
                    {counts.total} feedback
                  </span>
                ) : null}
                {counts != null && counts.open > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-600 tabular-nums">
                    {counts.open} open
                  </span>
                ) : null}
                {counts != null && counts.resolved > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs bg-green-50 text-green-700 tabular-nums">
                    {counts.resolved} resolved
                  </span>
                ) : null}
              </>
            )}
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
  );
}
