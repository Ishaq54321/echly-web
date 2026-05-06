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

function getBadgeClass(type: NotificationType | string): string {
  switch (type) {
    case "comment.added":
      return "badge-comment";
    case "comment.mention":
      return "badge-mention";
    case "feedback.created":
      return "badge-feedback";
    case "feedback.resolved":
      return "badge-resolved";
    case "feedback.reopened":
      return "badge-feedback";
    case "invite.accepted":
    case "invite.sent":
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
      return <AtSign {...props} />;
    case "feedback.created":
      return <PenLine {...props} />;
    case "feedback.resolved":
      return <Check {...props} />;
    case "feedback.reopened":
      return <RotateCcw {...props} />;
    case "invite.accepted":
    case "invite.sent":
      return <UserPlus {...props} />;
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
    case "feedback.created":
      return (
        <>
          <strong>{actorName}</strong> reported{entityPart}
          {inSession}
        </>
      );
    case "feedback.resolved":
      return (
        <>
          <strong>{actorName}</strong> resolved{entityPart}
          {inSession}
        </>
      );
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

type NotificationGroup = {
  label: string;
  items: NotificationRow[];
};

function groupByDay(items: NotificationRow[]): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  let current: NotificationGroup | null = null;
  for (const n of items) {
    const label = dayLabel(n.createdAt);
    if (!current || current.label !== label) {
      current = { label, items: [n] };
      groups.push(current);
    } else {
      current.items.push(n);
    }
  }
  return groups;
}

export interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoaded,
    isLoading,
    hasMore,
    nextCursor,
  } = useNotificationStore();

  useEffect(() => {
    if (!open) return;
    if (!isLoaded) {
      void fetchNotifications();
    }
  }, [open, isLoaded]);

  const groups = useMemo(() => groupByDay(notifications), [notifications]);

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

  const showEmpty = isLoaded && notifications.length === 0 && !isLoading;
  const showInitialLoading = !isLoaded && isLoading && notifications.length === 0;

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
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
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
              {group.items.map((n) => {
                const badgeClass = getBadgeClass(n.type);
                const isPendingAccessRequest =
                  n.type === "access_request.pending";
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
                        photoURL={n.actor?.photoURL || null}
                        name={n.actor?.name}
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
                      <div className="notif-text">
                        {renderNotificationText(n)}
                      </div>
                      {n.body && <div className="notif-preview">{n.body}</div>}
                      <div className="notif-time">
                        {relativeTime(n.createdAt)}
                      </div>
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
              })}
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
