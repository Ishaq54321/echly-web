"use client";

import { memo, useCallback } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Layers,
  MessageCircle,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  groupPreviewEvents,
  type ActivityEvent,
  type GroupedActivity,
} from "@/lib/activity/groupEvents";
import { isPersonalMention } from "@/components/activity/eventIcons";
import { EventBadge, getEventColor } from "./EventBadge";

// ─── Metadata helpers ────────────────────────────────────────────────────────

function metaStr(meta: Record<string, unknown> | undefined, keys: string[]): string | null {
  if (!meta) return null;
  for (const k of keys) {
    const v = meta[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function feedbackTitleFromMeta(meta?: Record<string, unknown>): string | null {
  const v = metaStr(meta, ["feedbackTitle", "title"]);
  return v ? v.replace(/^#\s*/, "") : null;
}

function sessionTitleFromMeta(meta?: Record<string, unknown>): string | null {
  return metaStr(meta, ["sessionTitle", "sessionName"]);
}

function commentPreviewFromMeta(meta?: Record<string, unknown>): string | null {
  return metaStr(meta, [
    "commentText",
    "commentBody",
    "commentPreview",
    "body",
    "message",
    "text",
    "preview",
    "snippet",
  ]);
}

function targetUserName(meta?: Record<string, unknown>): string | null {
  return metaStr(meta, ["targetName", "targetUserName", "targetEmail", "requesterName", "requesterEmail"]);
}

function targetUserId(meta?: Record<string, unknown>): string | null {
  return metaStr(meta, ["targetUserId", "targetUid", "requesterUid", "requesterId"]);
}

// ─── Navigation hrefs (codebase convention: /session/{sid}?ticket={fid}) ──────

function feedbackHref(sessionId: string | null, feedbackId: string | null): string | null {
  const sid = sessionId?.trim();
  if (!sid) return null;
  const fid = feedbackId?.trim();
  return fid
    ? `/session/${encodeURIComponent(sid)}?ticket=${encodeURIComponent(fid)}`
    : `/session/${encodeURIComponent(sid)}`;
}

function replyHref(ev: ActivityEvent): string | null {
  const sid = ev.sessionId?.trim();
  const fid = ev.feedbackId?.trim();
  const cid = ev.commentId?.trim();
  if (!sid || !fid || !cid) return feedbackHref(ev.sessionId, ev.feedbackId ?? null);
  return (
    `/session/${encodeURIComponent(sid)}` +
    `?ticket=${encodeURIComponent(fid)}` +
    `&comment=${encodeURIComponent(cid)}` +
    `&action=reply`
  );
}

// ─── Pills ───────────────────────────────────────────────────────────────────

/** Tiny "this is a ticket" glyph for the mini-square inside TicketPill.
 *  The square's COLOR carries the event meaning; this glyph just signals
 *  "a ticket" — one consistent symbol keeps the row calm. */
function TicketIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      {/* Filled dot in the event colour with a white hole — reads as "a thing" */}
      <circle cx="6" cy="6" r="4.5" fill="currentColor" />
      <circle cx="6" cy="6" r="1.6" fill="#FFFFFF" />
    </svg>
  );
}

function TicketPill({
  event,
  eventColor,
  fallbackText,
}: {
  event: ActivityEvent;
  eventColor: string;
  fallbackText?: string | null;
}) {
  const title =
    feedbackTitleFromMeta(event.metadata) ||
    fallbackText?.trim() ||
    "untitled ticket";
  const href = feedbackHref(event.sessionId, event.feedbackId ?? null);
  // Soft halo for the mini-icon, derived from the event colour (echoes
  // the big badge's 12–14% halo at small scale).
  const iconBg = `color-mix(in srgb, ${eventColor} 14%, transparent)`;
  const inner = (
    <>
      {/* Mini event-colour square — echoes the big badge anatomy */}
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          background: iconBg,
          color: eventColor,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <TicketIcon size={11} />
      </span>
      <span className="activity-pill-label">{title}</span>
    </>
  );
  if (!href) {
    return (
      <span className="activity-pill activity-pill-ticket" title={title}>
        {inner}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="activity-pill activity-pill-ticket"
      title={title}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
}

function SessionPill({
  event,
  eventColor,
}: {
  event: ActivityEvent;
  eventColor: string;
}) {
  const name = sessionTitleFromMeta(event.metadata) || "a session";
  const sid = event.sessionId?.trim();
  // Whole pill inherits the event colour: soft tinted fill + matching text.
  // Hover is driven in JS because the resting background is an inline style
  // (dynamic colour) and an inline style can't be overridden by a CSS :hover.
  const bg = `color-mix(in srgb, ${eventColor} 8%, transparent)`;
  const bgHover = `color-mix(in srgb, ${eventColor} 14%, transparent)`;
  const style = { background: bg, color: eventColor } as CSSProperties;
  const onEnter = (e: ReactMouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = bgHover;
  };
  const onLeave = (e: ReactMouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = bg;
  };
  const inner = <span className="activity-pill-label">{name}</span>;
  if (!sid) {
    return (
      <span
        className="activity-pill activity-pill-session"
        title={name}
        style={style}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {inner}
      </span>
    );
  }
  return (
    <Link
      href={`/session/${encodeURIComponent(sid)}`}
      className="activity-pill activity-pill-session"
      title={name}
      style={style}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
}

function MentionPill({ uid, name }: { uid?: string | null; name?: string | null }) {
  if (!uid && !name) return <span className="ev-plain">someone</span>;
  return (
    <span className="activity-pill-mention">
      <UserAvatar size={17} colorSeed={uid || name || ""} name={name ?? null} />
      <span>{name ?? "someone"}</span>
    </span>
  );
}

function SessionSep() {
  return <span className="ev-sep ev-sep-in">in</span>;
}

// ─── Event copy (one line) ───────────────────────────────────────────────────

function renderActionAndTargets(
  event: ActivityEvent,
  isGroup: boolean,
  groupCount: number,
  eventColor: string
): ReactNode {
  const meta = event.metadata;
  const hasSession = Boolean(event.sessionId?.trim());
  const sessionPart = hasSession ? (
    <>
      <SessionSep />
      <SessionPill event={event} eventColor={eventColor} />
    </>
  ) : null;

  switch (event.eventType) {
    case "feedback.created":
      if (isGroup && groupCount > 1) {
        return (
          <>
            <span className="ev-verb">created</span>
            <span className="activity-pill" title={`${groupCount} feedback items`}>
              <Layers size={14} strokeWidth={1.75} className="activity-pill-lead" aria-hidden />
              <span className="activity-pill-label">{groupCount} feedback items</span>
            </span>
            {sessionPart}
          </>
        );
      }
      return (
        <>
          <span className="ev-verb">created</span>
          <TicketPill event={event} eventColor={eventColor} />
          {sessionPart}
        </>
      );

    case "feedback.resolved":
      return (
        <>
          <span className="ev-verb">resolved</span>
          <TicketPill event={event} eventColor={eventColor} />
          {sessionPart}
        </>
      );

    case "feedback.reopened":
      return (
        <>
          <span className="ev-verb">reopened</span>
          <TicketPill event={event} eventColor={eventColor} />
          {sessionPart}
        </>
      );

    case "feedback.deleted":
      return (
        <>
          <span className="ev-verb">deleted</span>
          <TicketPill
            event={event}
            eventColor={eventColor}
            fallbackText={metaStr(meta, ["feedbackTitle", "title"]) ?? "a feedback item"}
          />
          {sessionPart}
        </>
      );

    case "comment.added":
      if (isGroup && groupCount > 1) {
        return (
          <>
            <span className="ev-verb">added {groupCount} comments on</span>
            <TicketPill event={event} eventColor={eventColor} />
            {sessionPart}
          </>
        );
      }
      return (
        <>
          <span className="ev-verb">commented on</span>
          <TicketPill event={event} eventColor={eventColor} />
          {sessionPart}
        </>
      );

    case "session.created":
      return (
        <>
          <span className="ev-verb">created session</span>
          <SessionPill event={event} eventColor={eventColor} />
        </>
      );

    case "session.archived":
      return (
        <>
          <span className="ev-verb">archived</span>
          <SessionPill event={event} eventColor={eventColor} />
        </>
      );

    case "session.deleted":
      return (
        <>
          <span className="ev-verb">deleted session</span>
          <span className="ev-plain">{sessionTitleFromMeta(meta) ?? "a session"}</span>
        </>
      );

    case "session.settings_changed":
      return (
        <>
          <span className="ev-verb">updated settings for</span>
          <SessionPill event={event} eventColor={eventColor} />
        </>
      );

    case "session.member.added":
    case "invite.accepted": {
      const source = metaStr(meta, ["source"]);
      if (source === "invite_redemption" || event.eventType === "invite.accepted") {
        return (
          <>
            <span className="ev-verb">joined</span>
            {hasSession ? <SessionPill event={event} eventColor={eventColor} /> : <span className="ev-plain">the workspace</span>}
          </>
        );
      }
      return (
        <>
          <span className="ev-verb">added</span>
          <MentionPill uid={targetUserId(meta)} name={targetUserName(meta)} />
          {hasSession ? (
            <>
              <span className="ev-plain">to</span>
              <SessionPill event={event} eventColor={eventColor} />
            </>
          ) : null}
        </>
      );
    }

    case "session.member.removed":
      return (
        <>
          <span className="ev-verb">removed</span>
          <MentionPill uid={targetUserId(meta)} name={targetUserName(meta)} />
          {hasSession ? (
            <>
              <span className="ev-plain">from</span>
              <SessionPill event={event} eventColor={eventColor} />
            </>
          ) : null}
        </>
      );

    case "session.member.role_changed":
      return (
        <>
          <span className="ev-verb">changed access for</span>
          <MentionPill uid={targetUserId(meta)} name={targetUserName(meta)} />
          {sessionPart}
        </>
      );

    case "invite.sent":
      return (
        <>
          <span className="ev-verb">invited</span>
          <span className="ev-plain" style={{ fontWeight: 500, color: "var(--text-heading)" }}>
            {metaStr(meta, ["email", "targetEmail"]) ?? "someone"}
          </span>
          {hasSession ? (
            <>
              <span className="ev-plain">to</span>
              <SessionPill event={event} eventColor={eventColor} />
            </>
          ) : null}
        </>
      );

    case "access_request.approved":
      return (
        <>
          <span className="ev-verb">approved access for</span>
          <MentionPill uid={targetUserId(meta)} name={targetUserName(meta)} />
          {sessionPart}
        </>
      );

    case "access_request.rejected":
      return (
        <>
          <span className="ev-verb">denied access for</span>
          <MentionPill uid={targetUserId(meta)} name={targetUserName(meta)} />
          {sessionPart}
        </>
      );

    default:
      return <span className="ev-verb">updated this workspace</span>;
  }
}

function EventCopy({
  actorName,
  event,
  isGroup,
  groupCount,
  isMention,
}: {
  actorName: string;
  event: ActivityEvent;
  isGroup: boolean;
  groupCount: number;
  isMention: boolean;
}) {
  // Single source of truth (EventBadge.tsx) — same colour the big badge uses.
  const eventColor = getEventColor(event.eventType, isMention);
  return (
    <p className="activity-copy">
      <span className="activity-actor">{actorName}</span>
      {renderActionAndTargets(event, isGroup, groupCount, eventColor)}
    </p>
  );
}

// ─── @mention highlight in preview bubble ────────────────────────────────────

function renderPreviewWithMentions(text: string): ReactNode {
  const parts = text.split(/(@[\w.-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="activity-mention-tag">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── Event badge ─────────────────────────────────────────────────────────────

/** Bespoke 32px SVG badge (halo + circle + solid glyph). The SVG's own
 *  outer halo masks the connector line, so no CSS white-ring is needed. */
function EventBadgeIcon({
  eventType,
  isMention,
}: {
  eventType: string;
  isMention: boolean;
}) {
  return (
    <span className="badge-wrap" aria-hidden>
      <EventBadge eventType={eventType} isPersonalMention={isMention} size={32} />
    </span>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

export type ActivityItemProps = (
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
    }
) & {
  /** Extra classes merged onto the row root (e.g. enter-animation). */
  className?: string;
  /** Current viewer uid — drives the personal-mention treatment. */
  currentUserId?: string | null;
};

// ─── Component ───────────────────────────────────────────────────────────────

function representativeEvent(props: ActivityItemProps): ActivityEvent {
  if (props.kind === "single") return props.event;
  const preview = groupPreviewEvents(props.group);
  const withFeedback = preview.find((e) => e.feedbackId?.trim());
  return withFeedback ?? preview[0]!;
}

function ActivityItemBase(props: ActivityItemProps) {
  const router = useRouter();

  const eventType =
    props.kind === "single" ? props.event.eventType : props.group.eventType;

  const event = representativeEvent(props);

  const actor =
    props.kind === "single"
      ? props.event.actor
      : {
          id: props.group.actorId,
          name: props.group.actorName,
          photoURL: props.group.previewEvents?.[0]?.actor?.photoURL,
        };
  const actorName = actor.name?.trim() || "A teammate";

  const groupCount = props.kind === "group" ? props.group.count : 1;
  const isGroup = props.kind === "group";

  const isMention = isPersonalMention(
    eventType,
    event.metadata,
    props.currentUserId ?? null
  );

  const isComment = eventType === "comment.added";
  const previewText = isMention ? commentPreviewFromMeta(event.metadata) : null;
  const showDetail = isMention && Boolean(previewText);

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
      const href = feedbackHref(sessionId, feedbackId);
      if (href) router.push(href);
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

  const openHref = feedbackHref(event.sessionId, event.feedbackId ?? null);
  const rootClass = ["activity-row", "group", props.className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} data-event-id={event.id}>
      {/* Col 1 — bespoke event badge */}
      <EventBadgeIcon eventType={eventType} isMention={isMention} />

      {/* Col 2 — actor avatar circle */}
      <UserAvatar
        avatarUrl={actor.photoURL ?? null}
        name={actorName}
        colorSeed={actor.id || actorName}
        size={32}
        className="activity-row-avatar"
      />

      {/* Col 3 — one-line copy */}
      <div className="activity-row-body">
        <EventCopy
          actorName={actorName}
          event={event}
          isGroup={isGroup}
          groupCount={groupCount}
          isMention={isMention}
        />
      </div>

      {/* Col 4 — time + hover actions */}
      {props.relativeTime ? (
        <time
          className="activity-row-time"
          dateTime={props.isoTime}
        >
          {props.relativeTime}
        </time>
      ) : (
        <span className="activity-row-time" aria-hidden />
      )}

      <div className="activity-row-actions">
        {isComment ? (
          <Link
            href={replyHref(event) ?? "#"}
            onClick={(e) => e.stopPropagation()}
            aria-label="Reply"
          >
            <button type="button">
              <MessageCircle size={13} strokeWidth={1.75} aria-hidden />
              Reply
            </button>
          </Link>
        ) : null}
        {openHref ? (
          <Link
            href={openHref}
            onClick={(e) => e.stopPropagation()}
            aria-label="Open"
          >
            <button type="button">
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden />
              Open
            </button>
          </Link>
        ) : null}
      </div>

      {/* Detail row — personal mention preview + group expand */}
      {(showDetail || showGroupExpandToggle || (props.kind === "group" && props.isExpanded)) ? (
        <div className="activity-row-detail">
          {showDetail && previewText ? (
            <div className="activity-mention-preview">
              {renderPreviewWithMentions(previewText)}
            </div>
          ) : null}

          {showGroupExpandToggle && props.kind === "group" ? (
            <button
              type="button"
              aria-expanded={props.isExpanded}
              onClick={(e) => {
                e.stopPropagation();
                props.onToggleExpand(props.group);
              }}
              className="activity-grouped-toggle"
            >
              <ChevronDown
                size={13}
                strokeWidth={1.75}
                style={{
                  transform: props.isExpanded ? "rotate(180deg)" : "none",
                  transition: "transform 120ms",
                }}
                aria-hidden
              />
              {props.isExpanded ? "Show less" : `Show all ${props.group.count}`}
            </button>
          ) : null}

          {/* Expanded group sub-items */}
          {props.kind === "group" && props.isExpanded ? (
            <div className="mt-2 w-full min-w-0" role="list">
              {(() => {
                const g = props.group;
                const needsRemoteMembers = g.count > g.previewEvents.length;
                const membersReady =
                  !needsRemoteMembers || props.expandListEvents !== undefined;
                const showMembersLoading =
                  Boolean(g.groupId) && needsRemoteMembers && !membersReady;
                const list = showMembersLoading
                  ? []
                  : (props.expandListEvents ?? g.previewEvents);
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
                      const subIsMention = isPersonalMention(
                        ev.eventType,
                        ev.metadata,
                        props.currentUserId ?? null
                      );
                      const subActorName = ev.actor?.name?.trim() || "A teammate";
                      const subEntityClick =
                        ev.feedbackId && ev.sessionId
                          ? () => goToFeedback(ev.sessionId, ev.feedbackId!)
                          : ev.sessionId
                            ? () => goToSession(ev.sessionId)
                            : undefined;
                      return (
                        <div
                          key={ev.id}
                          role="listitem"
                          className="grid w-full min-w-0 items-center gap-3 py-2.5"
                          style={{ gridTemplateColumns: "22px 1fr" }}
                        >
                          <span
                            className="flex h-[22px] w-[22px] items-center justify-center"
                            aria-hidden
                          >
                            <EventBadge
                              eventType={ev.eventType}
                              isPersonalMention={subIsMention}
                              size={22}
                            />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              subEntityClick?.();
                            }}
                            disabled={!subEntityClick}
                            className="min-w-0 text-left disabled:cursor-default"
                          >
                            <EventCopy
                              actorName={subActorName}
                              event={ev}
                              isGroup={false}
                              groupCount={1}
                              isMention={subIsMention}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const ActivityItem = memo(ActivityItemBase);
