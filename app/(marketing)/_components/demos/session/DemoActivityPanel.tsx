/**
 * DemoActivityPanel — static marketing stand-in for
 * components/session/feedbackDetail/TicketActivityPanel.tsx
 *
 * WHY A REIMPLEMENTATION (not a direct import): the real TicketActivityPanel is
 * NOT props-driven. It pulls in useTicketActivity (a Firestore onSnapshot
 * listener), useUserAvatar/useUserAvatars (Firebase-backed avatar hooks), and
 * BrandLoader — all of which violate the marketing chrome contract (no
 * Firebase/auth/repos in marketing components). Unlike DevToolsPanel (which IS
 * fully props-driven and is imported directly), this panel must be forklifted.
 *
 * This component reproduces the real panel's markup and chrome VERBATIM — same
 * `.ticket-activity-*` classes (defined globally in app/globals.css, available on
 * the marketing page) and the same per-event copy/pills — but renders a static
 * list of DemoActivityEvent literals instead of a live snapshot. UserAvatar is
 * imported directly (it's clean: React + getInitials/getAvatarColor utils, no
 * Firebase). Day bucketing + relative-time formatting mirror the source.
 */
"use client";

import type { ReactNode } from "react";
import { PanelRight, Sparkles, Check } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActivityIllu } from "@/components/empty/canvasIllustrations";

export type DemoActivityEventType =
  | "feedback.created"
  | "feedback.resolved"
  | "feedback.reopened"
  | "ticket.priority.changed"
  | "ticket.assignment.changed";

export interface DemoActivityActor {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface DemoActivityEvent {
  id: string;
  eventType: DemoActivityEventType;
  actor: DemoActivityActor;
  /** Epoch ms. Used for day bucketing + relative time, exactly like the source. */
  createdAt: number;
  metadata?: {
    from?: string | { uid: string; name: string } | null;
    to?: string | { uid: string; name: string } | null;
  };
}

export function DemoActivityPanel({
  events,
  onClose,
}: {
  events: DemoActivityEvent[];
  onClose: () => void;
}) {
  return (
    <div className="ticket-activity-panel" style={{ width: "100%" }}>
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
        {events.length === 0 ? (
          <div className="ticket-activity-centered">
            <CanvasEmptyState
              illustration={<NoActivityIllu />}
              title="No activity yet"
              description="Changes to this ticket — status, priority, and assignment — will show up here as they happen."
            />
          </div>
        ) : (
          <ActivityList events={events} />
        )}
      </div>
    </div>
  );
}

function ActivityList({ events }: { events: DemoActivityEvent[] }) {
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

function ActivityRow({ event }: { event: DemoActivityEvent }) {
  return (
    <div className="ticket-activity-row">
      {event.eventType === "feedback.created" ? (
        <div className="ticket-activity-icon-wrap ticket-activity-icon-wrap--created">
          <Sparkles size={15} strokeWidth={1.75} />
        </div>
      ) : (
        <UserAvatar
          avatarUrl={event.actor.avatarUrl ?? null}
          name={event.actor.name}
          size={28}
          colorSeed={event.actor.id}
        />
      )}

      <div className="ticket-activity-content">
        <p className="ticket-activity-text">{renderEventText(event)}</p>
        <p className="ticket-activity-time">{formatTime(event.createdAt)}</p>
      </div>
    </div>
  );
}

function renderEventText(event: DemoActivityEvent): ReactNode {
  const actor = (
    <span className="ticket-activity-actor">{event.actor.name}</span>
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
      const from = typeof event.metadata?.from === "string" ? event.metadata.from : null;
      const to = typeof event.metadata?.to === "string" ? event.metadata.to : null;
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
      const from =
        event.metadata?.from && typeof event.metadata.from === "object"
          ? event.metadata.from
          : null;
      const to =
        event.metadata?.to && typeof event.metadata.to === "object"
          ? event.metadata.to
          : null;
      if (!from && to) {
        return (
          <>
            {actor} assigned this to <MentionPill user={to} />
          </>
        );
      }
      if (from && !to) {
        return (
          <>
            {actor} unassigned this from <MentionPill user={from} />
          </>
        );
      }
      if (from && to) {
        return (
          <>
            {actor} changed assignee from <MentionPill user={from} /> to{" "}
            <MentionPill user={to} />
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

function MentionPill({ user }: { user: { uid: string; name: string } }) {
  return (
    <span className="ticket-activity-mention">
      <UserAvatar avatarUrl={null} size={16} colorSeed={user.uid} name={user.name} />
      <span>{user.name}</span>
    </span>
  );
}

function bucketByDay(
  events: DemoActivityEvent[]
): Array<{ label: string; events: DemoActivityEvent[] }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const map = new Map<string, DemoActivityEvent[]>();
  for (const event of events) {
    const eventDate = new Date(event.createdAt);
    eventDate.setHours(0, 0, 0, 0);

    let label: string;
    if (eventDate.getTime() === today.getTime()) label = "Today";
    else if (eventDate.getTime() === yesterday.getTime()) label = "Yesterday";
    else
      label = eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

    const list = map.get(label);
    if (list) list.push(event);
    else map.set(label, [event]);
  }

  return Array.from(map.entries()).map(([label, evs]) => ({
    label,
    events: evs,
  }));
}

function formatTime(createdAt: number): string {
  const diffMs = Date.now() - createdAt;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffDay === 0) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
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
