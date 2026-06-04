"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import {
  AtSign,
  Bell,
  Check,
  Loader2,
  Lock,
  MessageSquare,
  PenLine,
  RotateCcw,
  Share2,
  UserPlus,
} from "lucide-react";
import {
  fetchNotifications,
  markAllRead,
  markRead,
  updateNotificationActionStatus,
  useNotificationStore,
} from "@/lib/store/notificationStore";
import type { NotificationRow, NotificationType } from "@/lib/domain/notification";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useWorkspaceStore } from "@/lib/client/workspaceStore";
import { useUserAvatars } from "@/lib/hooks/useUserAvatars";

function getBadgeClass(type: NotificationType | string): string {
  switch (type) {
    case "comment.added":
      return "badge-comment";
    case "comment.mention":
    case "description.mention":
      return "badge-mention";
    case "feedback.created":
      return "badge-feedback";
    case "feedback.resolved":
      return "badge-resolved";
    case "feedback.reopened":
      return "badge-feedback";
    case "ticket.assigned":
      return "badge-feedback";
    case "invite.accepted":
    case "invite.sent":
      return "badge-invite";
    case "session.shared":
    case "session.opened":
      return "badge-invite";
    case "access_request.approved":
      return "badge-access";
    case "access_request.rejected":
      return "badge-access";
    case "access_request.pending":
      return "badge-access";
    default:
      return "badge-comment";
  }
}

function getTypeIcon(type: NotificationType | string) {
  const props = { size: 11, strokeWidth: 2.5 };
  switch (type) {
    case "comment.added":
      return <MessageSquare {...props} />;
    case "comment.mention":
    case "description.mention":
      return <AtSign {...props} />;
    case "feedback.created":
      return <PenLine {...props} />;
    case "feedback.resolved":
      return <Check {...props} />;
    case "feedback.reopened":
      return <RotateCcw {...props} />;
    case "ticket.assigned":
      return <UserPlus {...props} />;
    case "invite.accepted":
    case "invite.sent":
      return <UserPlus {...props} />;
    case "session.shared":
    case "session.opened":
      return <Share2 {...props} />;
    case "access_request.approved":
    case "access_request.rejected":
    case "access_request.pending":
      return <Lock {...props} />;
    default:
      return <MessageSquare {...props} />;
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatTimeOfDay(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
}

function dayLabel(createdAt: number | null): string {
  if (createdAt == null) return "Earlier";
  const now = new Date();
  const d = new Date(createdAt);
  if (isSameDay(now, d)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(yesterday, d)) return "Yesterday";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function relativeTime(createdAt: number | null): string {
  if (createdAt == null) return "";
  const now = Date.now();
  const diff = now - createdAt;
  if (diff < 60_000) return "Just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  const today = new Date();
  const d = new Date(createdAt);
  if (hours < 24 && isSameDay(today, d)) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(yesterday, d)) {
    return `Yesterday at ${formatTimeOfDay(d)}`;
  }
  return `${MONTHS[d.getMonth()]} ${d.getDate()} at ${formatTimeOfDay(d)}`;
}

function renderNotificationText(n: NotificationRow): React.ReactNode {
  const actorName = n.actor?.name || "Someone";
  const sessionTitle = n.sessionTitle || "a session";
  const ticketTitle = n.entityTitle || "";
  const inSession = (
    <>
      {" in "}
      <span className="notif-session-name">{sessionTitle}</span>
    </>
  );
  const quoted = (label: string) => (
    <>
      {" "}
      <span className="notif-entity">{label}</span>
    </>
  );
  const entityPart = ticketTitle ? quoted(ticketTitle) : " a ticket";

  switch (n.type) {
    case "comment.added":
      return (
        <>
          <strong>{actorName}</strong> commented on{entityPart}
          {inSession}
        </>
      );
    case "comment.mention":
      return (
        <>
          <strong>{actorName}</strong> mentioned you on{entityPart}
          {inSession}
        </>
      );
    case "description.mention":
      return (
        <>
          <strong>{actorName}</strong> mentioned you in the description of
          {entityPart}
          {inSession}
        </>
      );
    case "feedback.created":
      return (
        <>
          <strong>{actorName}</strong> reported{entityPart}
          {inSession}
        </>
      );
    case "feedback.resolved": {
      const count =
        typeof n.collapseCount === "number" && n.collapseCount > 1
          ? n.collapseCount
          : null;
      if (count) {
        return (
          <>
            <strong>{actorName}</strong> resolved {count} tickets{inSession}
          </>
        );
      }
      return (
        <>
          <strong>{actorName}</strong> resolved{entityPart}
          {inSession}
        </>
      );
    }
    case "feedback.reopened":
      return (
        <>
          <strong>{actorName}</strong> reopened{entityPart}
          {inSession}
        </>
      );
    case "invite.accepted":
      return (
        <>
          <strong>{actorName}</strong> joined{" "}
          <span className="notif-session-name">{sessionTitle}</span>
        </>
      );
    case "invite.sent":
      return (
        <>
          <strong>{actorName}</strong> invited you to{" "}
          <span className="notif-session-name">{n.entityTitle || "a workspace"}</span>
        </>
      );
    case "session.shared":
      return (
        <>
          <strong>{actorName}</strong> shared{" "}
          <span className="notif-session-name">{sessionTitle}</span> with you
        </>
      );
    case "session.opened":
      return (
        <>
          <strong>{actorName}</strong> opened{" "}
          <span className="notif-session-name">{sessionTitle}</span>
        </>
      );
    case "ticket.assigned":
      return (
        <>
          <strong>{actorName}</strong> assigned{" "}
          <span className="notif-session-name">{n.entityTitle || "a ticket"}</span> to you
        </>
      );
    case "access_request.pending":
      return (
        <>
          <strong>{actorName}</strong> requested {n.requestedAccess || "view"} access to{" "}
          <span className="notif-session-name">{sessionTitle}</span>
        </>
      );
    case "access_request.approved":
      return (
        <>
          Your access to{" "}
          <span className="notif-session-name">{sessionTitle}</span> was approved
        </>
      );
    case "access_request.rejected":
      return (
        <>
          Your access request for{" "}
          <span className="notif-session-name">{sessionTitle}</span> was declined
        </>
      );
    default:
      return n.title;
  }
}

type TicketSubGroup =
  | { kind: "single"; item: NotificationRow }
  | {
      kind: "ticket-group";
      ticketKey: string;
      items: NotificationRow[];
      latest: NotificationRow;
    };

type NotificationDayGroup = {
  label: string;
  subgroups: TicketSubGroup[];
};

function ticketGroupKey(n: NotificationRow): string | null {
  if (!n.feedbackId) return null;
  if (
    n.type !== "comment.added" &&
    n.type !== "comment.mention" &&
    n.type !== "description.mention" &&
    n.type !== "feedback.created" &&
    n.type !== "feedback.resolved" &&
    n.type !== "feedback.reopened"
  ) {
    return null;
  }
  return `${n.sessionId}::${n.feedbackId}`;
}

function groupByDayThenTicket(items: NotificationRow[]): NotificationDayGroup[] {
  type DayState = {
    label: string;
    buckets: Map<string, NotificationRow[]>;
    order: string[];
  };
  const days: NotificationDayGroup[] = [];
  const states: DayState[] = [];
  let current: DayState | null = null;

  for (const n of items) {
    const lbl = dayLabel(n.createdAt);
    if (!current || current.label !== lbl) {
      current = { label: lbl, buckets: new Map(), order: [] };
      states.push(current);
      days.push({ label: lbl, subgroups: [] });
    }
    const tk = ticketGroupKey(n);
    const bucketKey = tk ?? `__single::${n.id}`;
    if (!current.buckets.has(bucketKey)) {
      current.buckets.set(bucketKey, []);
      current.order.push(bucketKey);
    }
    current.buckets.get(bucketKey)!.push(n);
  }

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const state = states[i];
    for (const key of state.order) {
      const arr = state.buckets.get(key)!;
      if (key.startsWith("__single::") || arr.length === 1) {
        for (const item of arr) day.subgroups.push({ kind: "single", item });
      } else {
        day.subgroups.push({
          kind: "ticket-group",
          ticketKey: key,
          items: arr,
          latest: arr[0],
        });
      }
    }
  }

  return days;
}

function summarizeTicketGroup(items: NotificationRow[]): string {
  const commentCount = items.filter(
    (n) => n.type === "comment.added" || n.type === "comment.mention"
  ).length;
  const wasResolved = items.some((n) => n.type === "feedback.resolved");
  const wasReopened = items.some((n) => n.type === "feedback.reopened");
  const wasCreated = items.some((n) => n.type === "feedback.created");

  const actors = new Set<string>();
  for (const n of items) {
    if (n.actor?.name) actors.add(n.actor.name);
  }
  const actorNames = Array.from(actors);
  const actorPhrase =
    actorNames.length === 0
      ? "Someone"
      : actorNames.length === 1
        ? actorNames[0]
        : actorNames.length === 2
          ? `${actorNames[0]} and ${actorNames[1]}`
          : `${actorNames[0]} and ${actorNames.length - 1} others`;

  const parts: string[] = [];
  if (commentCount > 0) {
    parts.push(
      `${actorPhrase} commented${commentCount > 1 ? ` (${commentCount})` : ""}`
    );
  }
  if (wasResolved) parts.push("resolved");
  if (wasReopened) parts.push("reopened");
  if (wasCreated) parts.push("created");

  return parts.join(" · ") || "Updated";
}

export interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const {
    notifications,
    isLoaded,
    isLoading,
    hasMore,
    nextCursor,
  } = useNotificationStore();

  const { sessions: workspaceSessions } = useWorkspaceStore();
  const [sharedSessionIds, setSharedSessionIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!open) return;
    if (!isLoaded) {
      void fetchNotifications();
    }
  }, [open, isLoaded]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/sessions/shared", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: { sessions?: Array<{ sessionId?: string }> };
        };
        const ids = new Set<string>(
          (json.data?.sessions ?? [])
            .map((s) => (typeof s?.sessionId === "string" ? s.sessionId : ""))
            .filter((s) => s.length > 0)
        );
        if (!cancelled) setSharedSessionIds(ids);
      } catch {
        // ignore — fall back to workspace sessions only
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const accessibleSessionIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of workspaceSessions) {
      const id = s.session?.id;
      if (id) set.add(id);
    }
    for (const id of sharedSessionIds) set.add(id);
    return set;
  }, [workspaceSessions, sharedSessionIds]);

  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (n) => !n.sessionId || accessibleSessionIds.has(n.sessionId)
      ),
    [notifications, accessibleSessionIds]
  );

  const visibleUnreadCount = useMemo(
    () => visibleNotifications.filter((n) => !n.read).length,
    [visibleNotifications]
  );

  const groups = useMemo(
    () => groupByDayThenTicket(visibleNotifications),
    [visibleNotifications]
  );

  // Tier 2: notification actor photos are denormalized at notification-creation
  // time and /api/notifications does NOT re-resolve them (unlike
  // /api/activity-feed), so they go stale when an actor changes their photo.
  // Resolve each actor's avatar LIVE by uid through the userProfiles mirror and
  // use (live ?? snapshot) precedence at render. Read-only — no change to the
  // notification data model, write path, or the unread-count onSnapshot.
  const actorAvatars = useUserAvatars(
    useMemo(
      () => visibleNotifications.map((n) => n.actor?.id),
      [visibleNotifications]
    )
  );
  const liveActorPhoto = useCallback(
    (actor: { id?: string | null; photoURL?: string | null } | null | undefined) => {
      const uid = actor?.id ?? null;
      const live = uid ? actorAvatars.get(uid) ?? null : null;
      return live ?? actor?.photoURL ?? null;
    },
    [actorAvatars]
  );

  const handleItemClick = useCallback(
    (n: NotificationRow) => {
      if (!n.read) {
        void markRead(n.id);
      }
      const sid = (n.sessionId || "").trim();
      if (!sid) {
        onClose();
        return;
      }
      const url = new URL(`/dashboard/${sid}`, window.location.origin);
      if (n.feedbackId) {
        url.searchParams.set("ticket", n.feedbackId);
      }
      if (n.commentId) {
        url.searchParams.set("comment", n.commentId);
      }
      router.push(url.pathname + url.search);
      onClose();
    },
    [onClose, router]
  );

  const handleTicketGroupClick = useCallback(
    (items: NotificationRow[], latest: NotificationRow) => {
      for (const n of items) {
        if (!n.read) void markRead(n.id);
      }
      const sid = (latest.sessionId || "").trim();
      if (!sid) {
        onClose();
        return;
      }
      const url = new URL(`/dashboard/${sid}`, window.location.origin);
      if (latest.feedbackId) {
        url.searchParams.set("ticket", latest.feedbackId);
      }
      router.push(url.pathname + url.search);
      onClose();
    },
    [onClose, router]
  );

  const handleMarkAll = useCallback(() => {
    void markAllRead();
  }, []);

  const [actingId, setActingId] = useState<{ id: string; action: "approved" | "rejected" } | null>(null);

  const handleAccessRequestAction = useCallback(
    async (n: NotificationRow, decision: "approved" | "rejected") => {
      if (!n.accessRequestId || !n.sessionId) return;
      if (actingId) return;
      setActingId({ id: n.id, action: decision });

      updateNotificationActionStatus(n.id, decision);

      try {
        const [reqRes, ackRes] = await Promise.all([
          authFetch(
            `/api/sessions/${encodeURIComponent(n.sessionId)}/access-requests`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                requestId: n.accessRequestId,
                action: decision === "approved" ? "approve" : "reject",
                ...(decision === "approved"
                  ? { access: n.requestedAccess || "view" }
                  : {}),
              }),
            }
          ),
          authFetch("/api/notifications/action", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              notificationId: n.id,
              actionStatus: decision,
            }),
          }),
        ]);

        if (!reqRes || !reqRes.ok || !ackRes || !ackRes.ok) {
          console.error(
            "Access request action failed:",
            reqRes?.status,
            ackRes?.status
          );
          updateNotificationActionStatus(n.id, "pending");
        }
      } catch (err) {
        console.error("Access request action error:", err);
        updateNotificationActionStatus(n.id, "pending");
      } finally {
        setActingId(null);
      }
    },
    [actingId]
  );

  const handleLoadMore = useCallback(() => {
    if (!nextCursor) return;
    void fetchNotifications({ cursor: nextCursor, append: true });
  }, [nextCursor]);

  if (!open) return null;

  const showEmpty = isLoaded && visibleNotifications.length === 0 && !isLoading;
  const showInitialLoading =
    !isLoaded && isLoading && visibleNotifications.length === 0;

  function renderSingle(n: NotificationRow) {
    const badgeClass = getBadgeClass(n.type);
    const isPendingAccessRequest = n.type === "access_request.pending";
    const showActionButtons =
      isPendingAccessRequest &&
      (n.actionStatus === "pending" || !n.actionStatus);
    return (
      <div
        key={n.id}
        className={`notif-item${n.read ? "" : " notif-item--unread"}`}
        onClick={() => handleItemClick(n)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleItemClick(n);
          }
        }}
      >
        <div className="notif-avatar">
          <UserAvatar
            photoURL={liveActorPhoto(n.actor)}
            name={n.actor?.name}
            colorSeed={n.actor?.id}
            alt={n.actor?.name || "Notification"}
            className="h-full w-full"
          />
          <span
            className={`notif-type-badge ${badgeClass}`}
            aria-hidden
          >
            {getTypeIcon(n.type)}
          </span>
        </div>
        <div className="notif-content">
          <div className="notif-text">{renderNotificationText(n)}</div>
          {n.body && <div className="notif-preview">{n.body}</div>}
          <div className="notif-time">{relativeTime(n.createdAt)}</div>
          {isPendingAccessRequest && (
            <div className="notif-actions">
              {showActionButtons ? (
                <>
                  <button
                    type="button"
                    className="notif-action-approve"
                    disabled={!!actingId}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleAccessRequestAction(n, "approved");
                    }}
                  >
                    {actingId?.id === n.id && actingId?.action === "approved" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Approve
                      </>
                    ) : (
                      "Approve"
                    )}
                  </button>
                  <button
                    type="button"
                    className="notif-action-deny"
                    disabled={!!actingId}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleAccessRequestAction(n, "rejected");
                    }}
                  >
                    {actingId?.id === n.id && actingId?.action === "rejected" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Deny
                      </>
                    ) : (
                      "Deny"
                    )}
                  </button>
                </>
              ) : n.actionStatus === "approved" ? (
                <span className="notif-action-done notif-action-done--approved">
                  Approved
                </span>
              ) : n.actionStatus === "rejected" ? (
                <span className="notif-action-done notif-action-done--denied">
                  Denied
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderTicketGroup(
    ticketKey: string,
    items: NotificationRow[],
    latest: NotificationRow
  ) {
    const anyUnread = items.some((n) => !n.read);
    const summary = summarizeTicketGroup(items);
    const ticketTitle = latest.entityTitle || "a ticket";
    const badgeClass = getBadgeClass(latest.type);
    return (
      <div
        key={ticketKey}
        className={`notif-item${anyUnread ? " notif-item--unread" : ""}`}
        onClick={() => handleTicketGroupClick(items, latest)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTicketGroupClick(items, latest);
          }
        }}
      >
        <div className="notif-avatar">
          <UserAvatar
            photoURL={liveActorPhoto(latest.actor)}
            name={latest.actor?.name}
            colorSeed={latest.actor?.id}
            alt={latest.actor?.name || "Notification"}
            className="h-full w-full"
          />
          <span className={`notif-type-badge ${badgeClass}`} aria-hidden>
            {getTypeIcon(latest.type)}
          </span>
        </div>
        <div className="notif-content">
          <div className="notif-text">
            <strong>{ticketTitle}</strong>
          </div>
          <div className="notif-preview">{summary}</div>
          <div className="notif-time">{relativeTime(latest.createdAt)}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="notif-dropdown"
      role="dialog"
      aria-modal="false"
      aria-label="Notifications"
    >
      <div className="notif-header">
        <div className="notif-header-left">
          <span className="notif-title">Notifications</span>
          {visibleUnreadCount > 0 && (
            <span className="notif-badge">
              {visibleUnreadCount > 99 ? "99+" : visibleUnreadCount}
            </span>
          )}
        </div>
        {visibleUnreadCount > 0 && (
          <button
            type="button"
            className="notif-mark-all"
            onClick={handleMarkAll}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="notif-list">
        {showInitialLoading && (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="notif-skeleton">
                <div className="skel skel-circle" />
                <div className="skel-lines">
                  <div className="skel skel-line-1" />
                  <div className="skel skel-line-2" />
                  <div className="skel skel-line-3" />
                </div>
              </div>
            ))}
          </>
        )}

        {showEmpty && (
          <div className="notif-empty">
            <div className="notif-empty-icon-wrap">
              <Bell size={24} strokeWidth={1.5} />
              <span className="notif-empty-check">
                <Check size={11} strokeWidth={3} />
              </span>
            </div>
            <div className="notif-empty-title">You&apos;re all caught up</div>
            <div className="notif-empty-desc">
              Notifications about comments, mentions, and feedback updates will
              appear here.
            </div>
          </div>
        )}

        {!showInitialLoading &&
          groups.map((group) => (
            <div key={group.label}>
              <div className="notif-day">{group.label}</div>
              {group.subgroups.map((sg) =>
                sg.kind === "single"
                  ? renderSingle(sg.item)
                  : renderTicketGroup(sg.ticketKey, sg.items, sg.latest)
              )}
            </div>
          ))}
      </div>

      {hasMore && !showEmpty && (
        <div className="notif-load-more">
          <button
            type="button"
            className="notif-load-more-btn"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading…" : "Load older notifications"}
          </button>
        </div>
      )}
    </div>
  );
}
