"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ExternalLink, RotateCcw } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { ActivityEvent, GroupedActivity } from "@/lib/activity/groupEvents";
import { getTier, eventIconMap } from "@/components/activity/eventIcons";

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
        actionPhrase: "created a session",
        entityLabel: st,
        entityFallback: "a new session",
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
    case "session.member.added":
      return {
        actionPhrase: "added a member",
        entityLabel: null,
        entityFallback: "",
        sessionContext: st ?? null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "session.member.removed":
      return {
        actionPhrase: "removed a member",
        entityLabel: null,
        entityFallback: "",
        sessionContext: st ?? null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "session.member.role_changed":
      return {
        actionPhrase: "changed a member's role",
        entityLabel: null,
        entityFallback: "",
        sessionContext: st ?? null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "access_request.approved":
      return {
        actionPhrase: "approved an access request",
        entityLabel: null,
        entityFallback: "",
        sessionContext: st ?? null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
    case "access_request.rejected":
      return {
        actionPhrase: "rejected an access request",
        entityLabel: null,
        entityFallback: "",
        sessionContext: st ?? null,
        feedbackId: null,
        sessionId: sid || null,
        previewText: null,
        showPreview: false,
      };
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
  const first = g.events[0]!;
  const firstWithFeedback = g.events.find((e) => e.feedbackId?.trim());
  const sid = (first?.sessionId ?? g.sessionId)?.trim() ?? "";
  const fid = firstWithFeedback?.feedbackId?.trim() ?? "";
  const meta = firstWithFeedback?.metadata ?? first?.metadata;
  const ft = feedbackTitleFromMeta(meta);
  const st = sessionTitleFromMeta(meta);

  let previewText: string | null = null;
  if (g.eventType === "comment.added") {
    for (const e of g.events) {
      const p = commentPreviewFromMetadata(e.metadata);
      if (p) {
        previewText = p;
        break;
      }
    }
  } else if (g.eventType === "feedback.created") {
    for (const e of g.events) {
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
    className: "bg-[#EAF3DE] text-[#3B6D11] border-[#C0DD97]",
    icon: "check",
  },
  "feedback.reopened": {
    label: "Reopened",
    className: "bg-[#FAEEDA] text-[#854F0B] border-[#FAC775]",
    icon: "reopen",
  },
  "feedback.created": {
    label: "New",
    className: "bg-[#EEEDFE] text-[#534AB7] border-[#CECBF6]",
  },
  "session.created": {
    label: "Session",
    className: "bg-[#E6F1FB] text-[#185FA5] border-[#B5D4F4]",
  },
  "session.archived": {
    label: "Archived",
    className: "bg-neutral-100 text-neutral-500 border-neutral-200",
  },
  "access_request.approved": {
    label: "Approved",
    className: "bg-[#EAF3DE] text-[#3B6D11] border-[#C0DD97]",
    icon: "check",
  },
  "access_request.rejected": {
    label: "Rejected",
    className: "bg-[#FCEBEB] text-[#A32D2D] border-[#F7C1C1]",
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
      <span
        key={i}
        className="bg-blue-50 text-blue-700 rounded px-0.5 font-medium text-[12px] dark:bg-blue-950 dark:text-blue-300"
      >
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
      onToggleExpand: () => void;
    };

// ─── Component ───────────────────────────────────────────────────────────────

export function ActivityItem(props: ActivityItemProps) {
  const router = useRouter();

  const eventType = props.kind === "single" ? props.event.eventType : props.group.eventType;
  const tier = getTier(eventType);

  const actor =
    props.kind === "single"
      ? props.event.actor
      : { id: props.group.actorId, name: props.group.actorName, photoURL: undefined as string | undefined };

  const actorName = actor.name?.trim() || "A teammate";
  const photoURL = props.kind === "single" ? (props.event.actor.photoURL ?? undefined) : undefined;

  const row =
    props.kind === "single" ? deriveRowModel(props.event) : deriveGroupRowModel(props.group);

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
  const hasEntityChip = tier !== 3 && Boolean(entityLabel);
  const hasStatePill = tier !== 3 && eventType in PILL_STYLES;

  const badgeEntry = eventIconMap[eventType];
  const BadgeIcon = badgeEntry?.icon;
  const badgeColorClass = badgeEntry?.badgeClass ?? "bg-neutral-300";

  return (
    <div className={`flex items-start ${tier === 3 ? "py-1" : "py-2.5"}`}>
      {/* Fixed-width avatar column — w-[52px] keeps the timeline spine centred */}
      <div className="relative z-10 w-[52px] shrink-0 flex justify-center pt-0.5">
        {tier === 3 ? (
          /* Compact icon node for system events */
          <div className="h-[22px] w-[22px] rounded-full bg-neutral-100 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 flex items-center justify-center">
            {BadgeIcon && <BadgeIcon className="h-3 w-3 text-neutral-400 dark:text-neutral-500" aria-hidden />}
          </div>
        ) : (
          /* Actor avatar with event-type badge overlay */
          <div className="relative">
            <UserAvatar
              photoURL={photoURL}
              name={actorName}
              className="h-9 w-9"
            />
            {BadgeIcon && (
              <div
                className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background flex items-center justify-center w-[15px] h-[15px] ${badgeColorClass}`}
                aria-hidden
              >
                <BadgeIcon className="h-[7px] w-[7px] text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pl-[14px]">
        {/* Action line */}
        <div
          className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 leading-snug ${
            tier === 3 ? "text-[13px]" : "text-[15px]"
          }`}
        >
          {tier === 3 ? (
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground/70">{actorName}</span>
              {" "}
              {row.actionPhrase}
            </span>
          ) : (
            <>
              <span className="font-medium text-foreground">{actorName}</span>
              <span className="text-muted-foreground">{row.actionPhrase}</span>
            </>
          )}

          {hasEntityChip && entityLabel ? (
            handleEntityClick ? (
              <button
                type="button"
                onClick={handleEntityClick}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground bg-muted border border-border rounded-md px-2 py-0.5 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-blue-500 font-semibold text-[11px]">#</span>
                {entityLabel}
                <ExternalLink className="h-2.5 w-2.5 opacity-40 shrink-0" aria-hidden />
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground bg-muted border border-border rounded-md px-2 py-0.5">
                <span className="text-blue-500 font-semibold text-[11px]">#</span>
                {entityLabel}
              </span>
            )
          ) : null}

          {hasStatePill && <StatePill eventType={eventType} />}

          {row.sessionContext ? (
            <span className="text-[12px] text-muted-foreground">in {row.sessionContext}</span>
          ) : null}

          <span className="text-muted-foreground/40 text-[12px]" aria-hidden>
            ·
          </span>

          {props.relativeTime ? (
            <time
              dateTime={props.isoTime}
              className="text-[12px] text-muted-foreground whitespace-nowrap"
            >
              {props.relativeTime}
            </time>
          ) : null}
        </div>

        {/* Preview card — Tier 1 only */}
        {row.showPreview && row.previewText ? (
          <div className="mt-2 flex max-w-[600px] overflow-hidden rounded-lg border border-border">
            <div className="w-[3px] shrink-0 bg-blue-400 rounded-l-lg" aria-hidden />
            <div className="bg-muted/50 px-3 py-2 text-[14px] text-muted-foreground line-clamp-2 flex-1 min-w-0 leading-[1.55]">
              {renderMentions(row.previewText)}
            </div>
          </div>
        ) : null}

        {/* Group expand toggle */}
        {props.kind === "group" && (
          <button
            type="button"
            aria-expanded={props.isExpanded}
            onClick={(e) => {
              e.stopPropagation();
              props.onToggleExpand();
            }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-1.5 w-fit cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-150 ${props.isExpanded ? "rotate-180" : ""}`}
              aria-hidden
            />
            {props.isExpanded
              ? "Hide"
              : `${props.group.count - 1} more ${props.group.count === 2 ? "item" : "items"}`}
          </button>
        )}

        {/* Expanded group sub-items */}
        {props.kind === "group" && props.isExpanded ? (
          <div className="mt-2 border-l-2 border-border pl-3 space-y-1.5">
            {props.group.events.map((ev) => {
              const evRow = deriveRowModel(ev);
              return (
                <div key={ev.id} className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground/80">
                    {ev.actor?.name?.trim() || "A teammate"}
                  </span>
                  {" "}
                  {evRow.actionPhrase}
                  {evRow.entityLabel && (
                    <span className="text-foreground/70"> {evRow.entityLabel}</span>
                  )}
                  {ev.createdAt != null ? (
                    <span className="text-muted-foreground/60"> · {fmtTime(ev.createdAt)}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
