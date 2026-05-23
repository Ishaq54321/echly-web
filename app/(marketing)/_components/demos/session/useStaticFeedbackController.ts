/**
 * useStaticFeedbackController — static stand-in for
 * useFeedbackDetailController (SESSION_PAGE_DESIGN_SPEC §10, the heaviest hook).
 *
 * The production controller owns comment CRUD + a Firestore subscription and
 * feeds FeedbackContent via props. This shim returns the same *shape* of data
 * FeedbackContent needs, derived from MockTicket data — no subscription, no
 * refs, no network.
 *
 * INTERACTIVITY PASS (MARKETING_SESSION_INTERACTIVITY): the controller now also
 * owns three pieces of demo-local, per-ticket mutable state so the marketing
 * session view *feels* like the real product:
 *   - assignment (assignee) per ticket — DemoAssignDropdown writes via `assignTo`
 *   - priority per ticket — DemoPriorityDropdown writes via `setPriority`
 *   - comments per ticket — the composer appends via `sendComment`, always
 *     attributed to Alex Nguyen (the demo "viewer"), never to whatever a stubbed
 *     useWorkspace might return.
 * Nothing persists: state lives in useState, seeded once from MOCK_TICKETS, and
 * resets on refresh. Switching tickets shows that ticket's own state (comments
 * the viewer added to t1 stay in t1 for the session). All mutations are
 * synchronous local-state setters — no optimistic/rollback machinery.
 *
 * `minutesAgo` on each mock comment is resolved to a human label here via the
 * same rules as lib/utils/formatCommentDate (Just now / Nm ago / Nh ago /
 * Yesterday / Nd ago) so timestamps read naturally without a live clock.
 */
import { useCallback, useMemo, useState } from "react";
import { MOCK_TICKETS, type MockTicket, type MockComment } from "./sessionMockData";
import type { DemoComment } from "./CommentItem";
import type { DemoThread } from "./CommentsSection";
import type { DemoPriority } from "./DemoPriorityDropdown";

function labelFromMinutes(mins: number): string {
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

/* Maps each commenter (by userId) to a real-photo avatar so the session
   demo doesn't render initials placeholders. Photos match each persona's
   gender; falls back to color+initials if a userId isn't listed here. */
const COMMENTER_AVATARS: Record<string, string> = {
  "u-maya": "/marketing/people/maya-anand.jpg",
  "u-daniel": "/marketing/people/daniel-torres.jpg",
  "u-sarah": "/marketing/people/sarah-kim.jpg",
  "u-alex": "/marketing/people/alex-nguyen.jpg",
};

function toDemoComment(c: MockComment): DemoComment {
  return {
    id: c.id,
    userName: c.authorName,
    userId: c.userId,
    avatarColor: c.avatarColor,
    avatarUrl: c.avatarUrl ?? COMMENTER_AVATARS[c.userId],
    message: c.body,
    timestampLabel: labelFromMinutes(c.minutesAgo),
    reactions: c.reactions,
  };
}

export interface DemoAssignee {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface DemoAssignment {
  assignee: DemoAssignee | null;
  priority: DemoPriority | null;
}

/** Most tickets start unassigned / no priority. The active ticket (t1) starts
 *  pre-populated — Daniel Torres (who's already commenting on it) assigned and
 *  High priority — so the demo opens on the populated state. */
function initializeAssignments(): Record<string, DemoAssignment> {
  const out: Record<string, DemoAssignment> = {};
  for (const ticket of MOCK_TICKETS) {
    out[ticket.id] =
      ticket.id === "t1"
        ? {
            assignee: {
              id: "u-daniel",
              name: "Daniel Torres",
              avatarUrl: "/marketing/people/daniel-torres.jpg",
            },
            priority: "high",
          }
        : { assignee: null, priority: null };
  }
  return out;
}

/** Seed per-ticket comment lists once from the mock data. Subsequent appends
 *  (via sendComment) mutate the copy in state, not the source literals. */
function initializeComments(): Record<string, MockComment[]> {
  const out: Record<string, MockComment[]> = {};
  for (const ticket of MOCK_TICKETS) {
    out[ticket.id] = [...ticket.comments];
  }
  return out;
}

function buildThreads(comments: MockComment[]): DemoThread[] {
  const roots = comments.filter((c) => !c.threadId);
  const repliesByThread = new Map<string, MockComment[]>();
  for (const c of comments) {
    if (!c.threadId) continue;
    const list = repliesByThread.get(c.threadId) ?? [];
    list.push(c);
    repliesByThread.set(c.threadId, list);
  }
  return roots.map((root) => ({
    root: toDemoComment(root),
    replies: (repliesByThread.get(root.id) ?? []).map(toDemoComment),
  }));
}

export interface StaticFeedbackController {
  description: string;
  tags: string[];
  threads: DemoThread[];
  participants: string[];
  /** Demo-local assignment/priority for the currently selected ticket. */
  assignment: DemoAssignment;
  assignTo: (assignee: DemoAssignee | null) => void;
  setPriority: (priority: DemoPriority | null) => void;
  /** Prepend a comment to the current ticket, attributed to Alex Nguyen
   *  (newest-first: it appears at the top of the thread). */
  sendComment: (body: string) => void;
}

export function useStaticFeedbackController(ticket: MockTicket): StaticFeedbackController {
  const [assignments, setAssignments] = useState<Record<string, DemoAssignment>>(initializeAssignments);
  const [commentsByTicket, setCommentsByTicket] = useState<Record<string, MockComment[]>>(initializeComments);

  const ticketId = ticket.id;

  const assignTo = useCallback(
    (assignee: DemoAssignee | null) => {
      setAssignments((prev) => ({
        ...prev,
        [ticketId]: { ...prev[ticketId], assignee },
      }));
    },
    [ticketId]
  );

  const setPriority = useCallback(
    (priority: DemoPriority | null) => {
      setAssignments((prev) => ({
        ...prev,
        [ticketId]: { ...prev[ticketId], priority },
      }));
    },
    [ticketId]
  );

  const sendComment = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      // Hardcoded author block — never sourced from a stubbed useWorkspace.
      const newComment: MockComment = {
        id: `demo-${Date.now()}`,
        authorName: "Alex Nguyen",
        authorInitials: "AN",
        userId: "u-alex",
        avatarColor: "#F59E0B",
        body: trimmed,
        minutesAgo: 0,
        reactions: [],
      };
      // Prepend so the viewer's new comment appears at the TOP of the thread.
      setCommentsByTicket((prev) => ({
        ...prev,
        [ticketId]: [newComment, ...(prev[ticketId] ?? [])],
      }));
    },
    [ticketId]
  );

  const comments = commentsByTicket[ticketId] ?? ticket.comments;
  const threads = useMemo(() => buildThreads(comments), [comments]);
  const assignment = assignments[ticketId] ?? { assignee: null, priority: null };

  return {
    description: ticket.description,
    tags: ticket.tags,
    threads,
    participants: ticket.participants,
    assignment,
    assignTo,
    setPriority,
    sendComment,
  };
}
