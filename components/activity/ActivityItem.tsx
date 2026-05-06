"use client";

import { memo, useCallback } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ExternalLink, RotateCcw } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getInitials } from "@/lib/utils/getInitials";
import {
  groupPreviewEvents,
  type ActivityEvent,
  type GroupedActivity,
} from "@/lib/activity/groupEvents";
import { getTier, eventIconMap } from "@/components/activity/eventIcons";

// ─── Activity-page-only fallback avatar palette ──────────────────────────────

const ACTIVITY_AVATAR_COLORS = [
  "var(--avatar-warm-orange)",
  "var(--avatar-blue)",
  "var(--avatar-purple)",
  "var(--avatar-green)",
  "var(--avatar-pink)",
  "var(--avatar-gold)",
  "var(--avatar-teal)",
];

function getActivityAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return ACTIVITY_AVATAR_COLORS[Math.abs(hash) % ACTIVITY_AVATAR_COLORS.length]!;
}

// ─── Metadata helpers ────────────────────────────────────────────────────────

function feedbackTitleFromMeta(meta?: Record<string, unknown>): string | null {
  if (!meta) return null;
  for (const k of ["feedbackTitle", "title"] as const) {
    const v = meta[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function sessionTitleFromMeta(meta?: Record<string, unknown>): string | null {
  if (!meta) return null;
  for (const k of ["sessionTitle", "sessionName"] as const) {
    const v = meta[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function commentPreviewFromMetadata(meta?: Record<string, unknown>): string | null {
  if (!meta) return null;
  for (const k of [
    "commentText",
    "commentBody",
    "commentPreview",
    "body",
    "message",
    "text",
    "preview",
    "snippet",
  ] as const) {
    const v = meta[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Compact time formatter for expanded sub-items inside a group. */
function fmtTime(ms: number | null): string {
  if (ms == null || !Number.isFinite(ms)) return "";
  const diff = Math.max(0, (Date.now() - ms) / 1000);
  if (diff < 45) return "Just now";
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
  if (diff < 86400) return `${Math.max(1, Math.floor(diff / 3600))}h ago`;
  const d = new Date(ms);
  const n = new Date();
  const dd = Math.round(
    (new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000
  );
  if (dd === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== n.getFullYear() ? "numeric" : undefined,
  });
}

/** Subtle left accent for comment preview only (not titles). */
function ActivityContextBlock({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-2 pl-4">
      <div
        className="absolute bottom-0 left-0 top-0 w-[2px] rounded-full bg-[var(--brand)]/60"
        aria-hidden
      />
      <div className="py-1">{children}</div>
    </div>
  );
}

/** Same semantic color as the row body; weight carries hierarchy. */
const FEEDBACK_TITLE_EMPHASIS = "font-medium text-[var(--text-heading)]";

/** Display string for inline feedback title; primary titles include a # prefix when missing. */
function feedbackTitleDisplay(primaryFromMeta: string | null, fallback: string): string {
  const p = primaryFromMeta?.trim();
  if (p) return p.startsWith("#") ? p : `# ${p}`;
  return fallback.trim();
}

// ─── Row model ───────────────────────────────────────────────────────────────

type RowModel = {
  actionPhrase: string;
  entityLabel: string | null;
  entityFallback: string;
  sessionContext: string | null;
  feedbackId: string | null;
  sessionId: string | null;
  previewText: string | null;
  showPreview: boolean;
};

function deriveRowModel(ev: ActivityEvent): RowModel {
  const sid = ev.sessionId?.trim() ?? "";
  const fid = ev.feedbackId?.trim() ?? "";
  const meta = ev.metadata;
  const ft = feedbackTitleFromMeta(meta);
  const st = sessionTitleFromMeta(meta);
  const preview =
    ev.eventType === "comment.added" || ev.eventType === "feedback.created"
      ? commentPreviewFromMetadata(meta)
      : null;
  const showPreview =
    (ev.eventType === "comment.added" || ev.eventType === "feedback.created") &&
    Boolean(preview?.trim());

  switch (ev.eventType) {
    case "comment.added":
      return {
        actionPhrase: "commented on",
        entityLabel: ft,
        entityFallback: "a feedback",
        sessionContext: st && st !== ft ? st : null,
        feedbackId: fid || null,
        sessionId: sid || null,
        previewText: preview,
        showPreview,
      };
    case "feedback.created":
      return {
        actionPhrase: "created feedback",
        entityLabel: ft,
        entityFallback: "a new thread",
        sessionContext: st && st !== ft ? st : null,
        feedbackId: fid || null,
        sessionId: sid || null,
        previewText: preview,
        showPreview,
      };
    case "feedback.resolved":
      return {
        actionPhrase: "resolved",
        entityLabel: ft,
        entityFallback: "an issue",
        sessionContext: st ?? null,
        feedbackId: fid || null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "feedback.reopened":
      return {
        actionPhrase: "reopened",
        entityLabel: ft,
        entityFallback: "an issue",
        sessionContext: st ?? null,
        feedbackId: fid || null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "session.created":
      return {
        actionPhrase: "created a new session",
        entityLabel: null,
        entityFallback: "",
        sessionContext: null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "session.archived":
      return {
        actionPhrase: "archived",
        entityLabel: st,
        entityFallback: "a session",
        sessionContext: null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "invite.sent": {
      const email = (ev.metadata?.email as string | undefined) ?? "";
      const sessionTitle = (ev.metadata?.sessionTitle as string | undefined) ?? "";
      return {
        actionPhrase: `invited ${email} to`,
        entityLabel: null,
        entityFallback: "",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "invite.accepted": {
      const sessionTitle = (ev.metadata?.sessionTitle as string | undefined) ?? "";
      return {
        actionPhrase: "joined",
        entityLabel: null,
        entityFallback: "",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "session.member.added": {
      const source = (ev.metadata?.source as string | undefined) ?? "";
      const targetName =
        (ev.metadata?.targetName as string | undefined) ||
        (ev.metadata?.targetEmail as string | undefined) ||
        "a user";
      const accessLevel = (ev.metadata?.accessLevel as string | undefined) ?? "";
      const sessionTitle = (ev.metadata?.sessionTitle as string | undefined) ?? "";
      const accessLabel = accessLevel === "resolve" ? "resolve" : "view";

      if (source === "invite_redemption") {
        return {
          actionPhrase: "joined",
          entityLabel: null,
          entityFallback: "",
          sessionContext: sessionTitle || null,
          feedbackId: null,
          sessionId: sid || null,
          previewText: null,
          showPreview: false,
        };
      }

      return {
        actionPhrase: `granted ${targetName} ${accessLabel} access to`,
        entityLabel: null,
        entityFallback: "",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "session.member.removed": {
      const targetName =
        (ev.metadata?.targetName as string | undefined) ||
        (ev.metadata?.targetEmail as string | undefined) ||
        "a user";
      const sessionTitle = (ev.metadata?.sessionTitle as string | undefined) ?? "";
      return {
        actionPhrase: `removed ${targetName} from`,
        entityLabel: null,
        entityFallback: "",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "session.member.role_changed": {
      const targetName =
        (ev.metadata?.targetName as string | undefined) ||
        (ev.metadata?.targetEmail as string | undefined) ||
        "a user";
      const prev = (ev.metadata?.previousAccess as string | undefined) ?? "";
      const next = (ev.metadata?.newAccess as string | undefined) ?? "";
      const sessionTitle = (ev.metadata?.sessionTitle as string | undefined) ?? "";
      const prevLabel = prev === "resolve" ? "resolve" : "view";
      const nextLabel = next === "resolve" ? "resolve" : "view";
      return {
        actionPhrase: `changed ${targetName}'s access from ${prevLabel} to ${nextLabel} in`,
        entityLabel: null,
        entityFallback: "",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "access_request.approved": {
      const requesterName =
        (ev.metadata?.requesterName as string | undefined) ||
        (ev.metadata?.requesterEmail as string | undefined) ||
        "someone";
      const sessionTitle = (ev.metadata?.sessionTitle as string | undefined) ?? "";
      return {
        actionPhrase: `approved ${requesterName}'s access request for`,
        entityLabel: null,
        entityFallback: "",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "access_request.rejected": {
      const requesterName =
        (ev.metadata?.requesterName as string | undefined) ||
        (ev.metadata?.requesterEmail as string | undefined) ||
        "someone";
      const sessionTitle = (ev.metadata?.sessionTitle as string | undefined) ?? "";
      return {
        actionPhrase: `rejected ${requesterName}'s access request for`,
        entityLabel: null,
        entityFallback: "",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "session.settings_changed":
      return {
        actionPhrase: "updated session settings",
        entityLabel: null,
        entityFallback: "",
        sessionContext: st ?? null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "session.deleted": {
      const sessionTitle = ev.metadata?.sessionTitle as string ?? "a session";
      return {
        actionPhrase: "deleted a session",
        entityLabel: sessionTitle,
        entityFallback: "a session",
        sessionContext: null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    case "feedback.deleted": {
      const feedbackTitle = ev.metadata?.feedbackTitle as string ?? "a feedback item";
      const sessionTitle = ev.metadata?.sessionTitle as string ?? "";
      return {
        actionPhrase: "deleted feedback",
        entityLabel: feedbackTitle,
        entityFallback: "a feedback item",
        sessionContext: sessionTitle || null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    }
    default:
      return {
        actionPhrase: "recorded activity",
        entityLabel: null,
        entityFallback: "",
        sessionContext: st ?? null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
  }
}

function deriveGroupRowModel(g: Extract<GroupedActivity, { type: "group" }>): RowModel {
  const preview = groupPreviewEvents(g);
  const first = preview[0]!;
  const firstWithFeedback = preview.find((e) => e.feedbackId?.trim());
  const sid = (first?.sessionId ?? g.sessionId)?.trim() ?? "";
  const fid = firstWithFeedback?.feedbackId?.trim() ?? "";
  const meta = firstWithFeedback?.metadata ?? first?.metadata;
  const ft = feedbackTitleFromMeta(meta);
  const st = sessionTitleFromMeta(meta);

  let previewText: string | null = null;
  if (g.eventType === "comment.added") {
    for (const e of preview) {
      const p = commentPreviewFromMetadata(e.metadata);
      if (p) {
        previewText = p;
        break;
      }
    }
  } else if (g.eventType === "feedback.created") {
    for (const e of preview) {
      const p = feedbackTitleFromMeta(e.metadata);
      if (p) {
        previewText = p;
        break;
      }
    }
  }

  if (g.eventType === "comment.added") {
    return {
      actionPhrase: `added ${g.count} comments on`,
      entityLabel: ft,
      entityFallback: "a feedback",
      sessionContext: st && st !== ft ? st : null,
      feedbackId: fid || null,
      sessionId: sid || null,
      previewText,
      showPreview: Boolean(previewText?.trim()),
    };
  }
  if (g.eventType === "feedback.created") {
    return {
      actionPhrase: `created ${g.count} feedback items in`,
      entityLabel: st,
      entityFallback: "a session",
      sessionContext: null,
      feedbackId: null,
      sessionId: sid || null,
      previewText,
      showPreview: Boolean(previewText?.trim()),
    };
  }
  return {
    actionPhrase: `recorded ${g.count} events`,
    entityLabel: null,
    entityFallback: "",
    sessionContext: st ?? null,
    feedbackId: null,
    sessionId: sid || null,
    previewText: null,
    showPreview: false,
  };
}

// ─── State pills ─────────────────────────────────────────────────────────────

const PILL_STYLES: Record<string, { label: string; className: string; icon?: "check" | "reopen" }> = {
  "feedback.resolved": {
    label: "Resolved",
    className: "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
    icon: "check",
  },
  "feedback.reopened": {
    label: "Reopened",
    className: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]",
    icon: "reopen",
  },
  "feedback.created": {
    label: "New",
    className: "bg-[var(--color-insight-bg)] text-[var(--color-insight)] border-[var(--color-insight-border)]",
  },
  "session.created": {
    label: "Session",
    className: "bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]",
  },
  "session.archived": {
    label: "Archived",
    className: "bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border)]",
  },
  "access_request.approved": {
    label: "Approved",
    className: "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
    icon: "check",
  },
  "access_request.rejected": {
    label: "Rejected",
    className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-border)]",
  },
};

function StatePill({ eventType }: { eventType: string }) {
  const pill = PILL_STYLES[eventType];
  if (!pill) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[12px] font-medium rounded-full px-2.5 py-0.5 border ${pill.className}`}
    >
      {pill.icon === "check" && <Check className="h-3 w-3" aria-hidden />}
      {pill.icon === "reopen" && <RotateCcw className="h-3 w-3" aria-hidden />}
      {pill.label}
    </span>
  );
}

// ─── @mention highlight ──────────────────────────────────────────────────────

function renderMentions(text: string): ReactNode {
  const parts = text.split(/(@[\w.-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-medium text-[12px] text-[var(--text-heading)]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

export type ActivityItemProps =
  | {
      kind: "single";
      event: ActivityEvent;
      relativeTime: string | null;
      isoTime?: string;
    }
  | {
      kind: "group";
      group: Extract<GroupedActivity, { type: "group" }>;
      relativeTime: string | null;
      isoTime?: string;
      isExpanded: boolean;
      onToggleExpand: (g: Extract<GroupedActivity, { type: "group" }>) => void;
      /** Full member list when expanded (preview-only rows use `previewEvents` until lazy load completes). */
      expandListEvents?: ActivityEvent[];
    };

// ─── Component ───────────────────────────────────────────────────────────────

function ActivityItemBase(props: ActivityItemProps) {
  const router = useRouter();

  const eventType = props.kind === "single" ? props.event.eventType : props.group.eventType;
  const tier = getTier(eventType);

  const actor =
    props.kind === "single"
      ? props.event.actor
      : { id: props.group.actorId, name: props.group.actorName, photoURL: undefined as string | undefined };

  const actorName =
    actor.name?.trim() ||
    actor.id?.split("@")[0]?.trim() ||
    "A teammate";
  const photoURL =
    props.kind === "single"
      ? (props.event.actor.photoURL ?? undefined)
      : (props.group.previewEvents?.[0]?.actor?.photoURL ?? undefined);

  const row =
    props.kind === "single" ? deriveRowModel(props.event) : deriveGroupRowModel(props.group);

  const previewForGroup =
    props.kind === "group" ? groupPreviewEvents(props.group) : null;
  const collapsedMoreBeyondPreview =
    props.kind === "group" && previewForGroup
      ? Math.max(0, props.group.count - previewForGroup.length)
      : 0;
  const showGroupExpandToggle =
    props.kind === "group" && collapsedMoreBeyondPreview > 0;

  const goToFeedback = useCallback(
    (sessionId: string, feedbackId: string) => {
      const sid = sessionId.trim();
      const fid = feedbackId.trim();
      if (sid && fid)
        router.push(
          `/session/${encodeURIComponent(sid)}?ticket=${encodeURIComponent(fid)}`
        );
    },
    [router]
  );

  const goToSession = useCallback(
    (sessionId: string) => {
      const sid = sessionId.trim();
      if (sid) router.push(`/session/${encodeURIComponent(sid)}`);
    },
    [router]
  );

  const handleEntityClick =
    row.feedbackId && row.sessionId
      ? () => goToFeedback(row.sessionId!, row.feedbackId!)
      : row.sessionId
        ? () => goToSession(row.sessionId!)
        : undefined;

  const entityLabel = (row.entityLabel?.trim() || row.entityFallback).trim();
  const hasPrimaryEntityTitle = Boolean(row.entityLabel?.trim());
  const hasEntityChip = tier !== 3 && Boolean(entityLabel);
  const hasCommentPreview = Boolean(row.showPreview && row.previewText);
  const inlineTitleText = hasPrimaryEntityTitle
    ? feedbackTitleDisplay(row.entityLabel, "")
    : entityLabel;
  const hasStatePill = tier !== 3 && eventType in PILL_STYLES;

  /** Rows with preview or group chrome stack below the headline; keep cross-axis alignment sensible. */
  const isTallRow = hasCommentPreview || props.kind === "group";

  return (
    <div
      className={`flex w-full gap-3 py-4 ${isTallRow ? "items-start" : "items-center"}`}
    >
      {/* Fixed-width avatar column — w-[52px] keeps the timeline spine centred */}
      <div className="relative z-10 flex w-[52px] shrink-0 justify-center">
        <div className="relative">
          {photoURL ? (
            <UserAvatar
              photoURL={photoURL}
              name={actorName}
              className="h-9 w-9"
            />
          ) : (
            <span
              className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-white font-semibold text-[14px]"
              style={{ backgroundColor: getActivityAvatarColor(actor.id || actorName) }}
              aria-hidden
            >
              {getInitials(actorName)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Action line — timestamp column fixed right */}
        <div className="flex w-full min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 leading-snug text-[15px]">
            <span className="text-[var(--text-heading)]">{actorName}</span>
            <span className="text-[var(--text-heading)]">{row.actionPhrase}</span>

            {hasEntityChip && entityLabel ? (
              handleEntityClick ? (
                <button
                  type="button"
                  onClick={handleEntityClick}
                  className={`inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 text-left underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    hasPrimaryEntityTitle
                      ? FEEDBACK_TITLE_EMPHASIS
                      : "font-medium text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="min-w-0 break-words">{inlineTitleText}</span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]"
                    aria-hidden
                  />
                </button>
              ) : (
                <span
                  className={
                    hasPrimaryEntityTitle
                      ? FEEDBACK_TITLE_EMPHASIS
                      : "font-medium text-[var(--text-secondary)]"
                  }
                >
                  {inlineTitleText}
                </span>
              )
            ) : null}

            {hasStatePill && <StatePill eventType={eventType} />}

            {row.sessionContext ? (
              <span className="text-[15px] text-[var(--text-secondary)]">
                in {row.sessionContext}
              </span>
            ) : null}
          </div>

          {props.relativeTime ? (
            <time
              dateTime={props.isoTime}
              className="shrink-0 text-right text-sm tabular-nums text-[var(--text-secondary)] whitespace-nowrap"
            >
              {props.relativeTime}
            </time>
          ) : null}
        </div>

        {/* Comment preview — blue accent only */}
        {hasCommentPreview && row.previewText ? (
          <ActivityContextBlock>
            <div className="text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">
              {renderMentions(row.previewText)}
            </div>
          </ActivityContextBlock>
        ) : null}

        {/* Group expand toggle — only when more members exist than the preview slice */}
        {showGroupExpandToggle ? (
          <button
            type="button"
            aria-expanded={props.isExpanded}
            onClick={(e) => {
              e.stopPropagation();
              props.onToggleExpand(props.group);
            }}
            className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-xs text-[var(--text-body)] transition-colors hover:text-[var(--text-heading)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[var(--text-heading)] transition-transform duration-150 ${props.isExpanded ? "rotate-180" : ""}`}
              aria-hidden
            />
            {props.isExpanded ? "Show less" : "Show all"}
          </button>
        ) : null}

        {/* Expanded group sub-items */}
        {props.kind === "group" && props.isExpanded ? (
          <div className="mt-3 w-full min-w-0" role="list">
            {(() => {
              const g = props.group;
              const needsRemoteMembers = g.count > g.previewEvents.length;
              const membersReady =
                !needsRemoteMembers || props.expandListEvents !== undefined;
              const showMembersLoading =
                Boolean(g.groupId) && needsRemoteMembers && !membersReady;
              const list = showMembersLoading ? [] : (props.expandListEvents ?? []);
              return (
                <>
                  {showMembersLoading ? (
                    <div
                      className="flex items-center gap-1.5 py-2 text-[var(--text-secondary)]"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <span className="sr-only">Loading group activity</span>
                      <span className="inline-flex items-center gap-1 px-0.5" aria-hidden>
                        <span className="activity-expand-dot" style={{ animationDelay: "0ms" }} />
                        <span className="activity-expand-dot" style={{ animationDelay: "140ms" }} />
                        <span className="activity-expand-dot" style={{ animationDelay: "280ms" }} />
                      </span>
                    </div>
                  ) : null}
                  {list.map((ev) => {
              const evRow = deriveRowModel(ev);
              const evTier = getTier(ev.eventType);
              const timeLabel =
                ev.createdAt != null ? fmtTime(ev.createdAt) : null;
              const SubIcon = eventIconMap[ev.eventType]?.icon;
              const subEntityLabel = (
                evRow.entityLabel?.trim() || evRow.entityFallback
              ).trim();
              const subHasPrimaryTitle = Boolean(evRow.entityLabel?.trim());
              const subHasEntityChip = evTier !== 3 && Boolean(subEntityLabel);
              const subHasPreview = Boolean(
                evRow.showPreview && evRow.previewText
              );
              const subInlineTitleText = subHasPrimaryTitle
                ? feedbackTitleDisplay(evRow.entityLabel, "")
                : subEntityLabel;
              const subEntityClick =
                evRow.feedbackId && evRow.sessionId
                  ? () => goToFeedback(evRow.sessionId!, evRow.feedbackId!)
                  : evRow.sessionId
                    ? () => goToSession(evRow.sessionId!)
                    : undefined;
              const subTallRow = subHasPreview;
              return (
                <div
                  key={ev.id}
                  role="listitem"
                  className={`flex w-full min-w-0 justify-between gap-3 py-4 ${subTallRow ? "items-start" : "items-center"}`}
                >
                  <div
                    className={`flex min-w-0 flex-1 gap-3 ${subTallRow ? "items-start" : "items-center"}`}
                  >
                    {SubIcon ? (
                      <SubIcon
                        className="h-4 w-4 shrink-0 text-[var(--text-secondary)]"
                        aria-hidden
                      />
                    ) : (
                      <span className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="flex min-w-0 flex-wrap items-center gap-2 text-[15px] leading-relaxed">
                        <span className="text-[var(--text-heading)]">
                          {ev.actor?.name?.trim() || "A teammate"}
                        </span>
                        <span className="text-[var(--text-heading)]">
                          {evRow.actionPhrase}
                        </span>
                        {subHasEntityChip && subEntityLabel ? (
                          subEntityClick ? (
                            <button
                              type="button"
                              onClick={subEntityClick}
                              className={`inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 text-left underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                subHasPrimaryTitle
                                  ? FEEDBACK_TITLE_EMPHASIS
                                  : "font-medium text-[var(--text-secondary)]"
                              }`}
                            >
                              <span className="min-w-0 break-words">
                                {subInlineTitleText}
                              </span>
                              <ExternalLink
                                className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]"
                                aria-hidden
                              />
                            </button>
                          ) : (
                            <span
                              className={
                                subHasPrimaryTitle
                                  ? FEEDBACK_TITLE_EMPHASIS
                                  : "font-medium text-[var(--text-secondary)]"
                              }
                            >
                              {subInlineTitleText}
                            </span>
                          )
                        ) : null}
                      </p>
                      {subHasPreview && evRow.previewText ? (
                        <ActivityContextBlock>
                          <div className="text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                            {renderMentions(evRow.previewText)}
                          </div>
                        </ActivityContextBlock>
                      ) : null}
                    </div>
                  </div>
                  {timeLabel ? (
                    <time
                      dateTime={
                        ev.createdAt != null
                          ? new Date(ev.createdAt).toISOString()
                          : undefined
                      }
                      className={`shrink-0 text-right text-sm tabular-nums text-[var(--text-secondary)] whitespace-nowrap ${subTallRow ? "self-start" : ""}`}
                    >
                      {timeLabel}
                    </time>
                  ) : null}
                </div>
              );
                  })}
                </>
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const ActivityItem = memo(ActivityItemBase);
