"use client";

import type { ReactNode } from "react";
import { PanelRight, Sparkles, Check } from "lucide-react";
import { useTicketActivity } from "@/lib/hooks/useTicketActivity";
import { useUserAvatar } from "@/lib/hooks/useUserAvatars";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActivityIllu } from "@/components/empty/canvasIllustrations";
import BrandLoader from "@/components/ui/BrandLoader";
import type { ActivityEvent } from "@/lib/activity/groupEvents";

/**
 * Per-ticket activity timeline (Phase 26.1).
 *
 * Reads workspaces/{wid}/activityEvents directly via useTicketActivity's
 * onSnapshot listener — independent of the /api/activity-feed route, so
 * the Phase 26.7 workspace-feed exclusion of priority/assignment events
 * does not apply here (those still show in this per-ticket panel).
 */
interface TicketActivityPanelProps {
  workspaceId: string;
  feedbackId: string;
  sessionId: string;
  onClose: () => void;
}

const KNOWN_EVENTS = new Set([
  "feedback.created",
  "feedback.resolved",
  "feedback.reopened",
  "ticket.priority.changed",
  "ticket.assignment.changed",
]);

export function TicketActivityPanel({
  workspaceId,
  feedbackId,
  sessionId,
  onClose,
}: TicketActivityPanelProps) {
  const { events, loading } = useTicketActivity(
    workspaceId,
    feedbackId,
    sessionId
  );
  const visible = events.filter((e) => KNOWN_EVENTS.has(e.eventType));

  return (
    <div className="ticket-activity-panel">
      <div className="ticket-activity-header">
        <h3 className="ticket-activity-title">Activity</h3>
        <button
          type="button"
          className="ticket-activity-close"
          onClick={onClose}
          aria-label="Close activity panel"
        >
          <PanelRight size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div className="ticket-activity-timeline">
        {loading && (
          <div className="ticket-activity-centered">
            <span className="ticket-activity-spinner" role="status" aria-label="Loading activity">
              <BrandLoader />
            </span>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="ticket-activity-centered">
            <CanvasEmptyState
              illustration={<NoActivityIllu />}
              title="No activity yet"
              description="Changes to this ticket — status, priority, and assignment — will show up here as they happen."
            />
          </div>
        )}

        {!loading && visible.length > 0 && <ActivityList events={visible} />}
      </div>
    </div>
  );
}

function ActivityList({ events }: { events: ActivityEvent[] }) {
  const buckets = bucketByDay(events);
  return (
    <>
      {buckets.map((bucket) => (
        <div key={bucket.label}>
          <p className="ticket-activity-day-header">{bucket.label}</p>
          {bucket.events.map((event) => (
            <ActivityRow key={event.id} event={event} />
          ))}
        </div>
      ))}
    </>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  return (
    <div className="ticket-activity-row">
      {event.eventType === "feedback.created" ? (
        <div className="ticket-activity-icon-wrap ticket-activity-icon-wrap--created">
          <Sparkles size={15} strokeWidth={1.75} />
        </div>
      ) : (
        <UserAvatar
          avatarUrl={event.actor?.photoURL ?? null}
          name={event.actor?.name ?? null}
          size={28}
          colorSeed={event.actor?.id ?? null}
        />
      )}

      <div className="ticket-activity-content">
        <p className="ticket-activity-text">{renderEventText(event)}</p>
        <p className="ticket-activity-time">{formatTime(event.createdAt)}</p>
      </div>
    </div>
  );
}

function renderEventText(event: ActivityEvent): ReactNode {
  const actor = (
    <span className="ticket-activity-actor">
      {event.actor?.name ?? "Unknown user"}
    </span>
  );

  switch (event.eventType) {
    case "feedback.created":
      return <>{actor} created this ticket</>;

    case "feedback.resolved":
      return (
        <>
          {actor} marked as{" "}
          <span className="ticket-activity-value-pill ticket-activity-value--resolved">
            <Check size={12} strokeWidth={2.5} />
            Resolved
          </span>
        </>
      );

    case "feedback.reopened":
      return <>{actor} reopened this ticket</>;

    case "ticket.priority.changed": {
      const md = (event.metadata ?? {}) as {
        from?: string | null;
        to?: string | null;
      };
      const from = md.from ?? null;
      const to = md.to ?? null;
      if (!from && to) {
        return (
          <>
            {actor} set priority to <PriorityPill value={to} />
          </>
        );
      }
      if (from && !to) {
        return <>{actor} cleared priority</>;
      }
      return (
        <>
          {actor} changed priority from <PriorityPill value={from} /> to{" "}
          <PriorityPill value={to} />
        </>
      );
    }

    case "ticket.assignment.changed": {
      const md = (event.metadata ?? {}) as {
        from?: { uid: string; name: string } | null;
        to?: { uid: string; name: string } | null;
      };
      if (!md.from && md.to) {
        return (
          <>
            {actor} assigned this to <MentionPill user={md.to} />
          </>
        );
      }
      if (md.from && !md.to) {
        return (
          <>
            {actor} unassigned this from <MentionPill user={md.from} />
          </>
        );
      }
      if (md.from && md.to) {
        return (
          <>
            {actor} changed assignee from <MentionPill user={md.from} /> to{" "}
            <MentionPill user={md.to} />
          </>
        );
      }
      return <>{actor} changed assignment</>;
    }

    default:
      return <>{actor} performed an action</>;
  }
}

function PriorityPill({ value }: { value: string | null }) {
  if (!value) return null;
  const lower = value.toLowerCase();
  return (
    <span
      className={`ticket-activity-value-pill ticket-activity-value--priority-${lower}`}
    >
      {capitalize(value)}
    </span>
  );
}

/** Resolves the mention user's avatar live so it stays fresh on photo change. */
function MentionPill({ user }: { user: { uid: string; name: string } }) {
  const liveAvatar = useUserAvatar(user.uid);
  return (
    <span className="ticket-activity-mention">
      <UserAvatar
        avatarUrl={liveAvatar}
        size={16}
        colorSeed={user.uid}
        name={user.name}
      />
      <span>{user.name}</span>
    </span>
  );
}

function bucketByDay(
  events: ActivityEvent[]
): Array<{ label: string; events: ActivityEvent[] }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const map = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    if (event.createdAt == null) continue;
    const eventDate = new Date(event.createdAt);
    eventDate.setHours(0, 0, 0, 0);

    let label: string;
    if (eventDate.getTime() === today.getTime()) label = "Today";
    else if (eventDate.getTime() === yesterday.getTime())
      label = "Yesterday";
    else
      label = eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

    const list = map.get(label);
    if (list) list.push(event);
    else map.set(label, [event]);
  }

  // Insertion order follows the events array (desc by createdAt).
  return Array.from(map.entries()).map(([label, evs]) => ({
    label,
    events: evs,
  }));
}

function formatTime(createdAt: number | null): string {
  if (createdAt == null) return "";
  const diffMs = Date.now() - createdAt;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffDay === 0)
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay === 1) {
    return `Yesterday, ${new Date(createdAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }
  return new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
