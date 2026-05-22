/**
 * useStaticFeedbackController — static stand-in for
 * useFeedbackDetailController (SESSION_PAGE_DESIGN_SPEC §10, the heaviest hook).
 *
 * The production controller owns comment CRUD + a Firestore subscription and
 * feeds FeedbackContent via props. This shim returns the same *shape* of data
 * FeedbackContent needs, derived purely from a MockTicket — no subscription,
 * no refs, no callbacks. All mutations would be no-ops (the demo never wires
 * them), so they're simply omitted; FeedbackContent's static fork reads only
 * the data fields below.
 *
 * `minutesAgo` on each mock comment is resolved to a human label here via the
 * same rules as lib/utils/formatCommentDate (Just now / Nm ago / Nh ago /
 * Yesterday / MMM d) so the timestamps read naturally without a live clock.
 */
import { useMemo } from "react";
import type { MockTicket, MockComment } from "./sessionMockData";
import type { DemoComment } from "./CommentItem";
import type { DemoThread } from "./CommentsSection";

function labelFromMinutes(mins: number): string {
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function toDemoComment(c: MockComment): DemoComment {
  return {
    id: c.id,
    userName: c.authorName,
    userId: c.userId,
    avatarColor: c.avatarColor,
    message: c.body,
    timestampLabel: labelFromMinutes(c.minutesAgo),
    reactions: c.reactions,
  };
}

export interface StaticFeedbackController {
  description: string;
  tags: string[];
  threads: DemoThread[];
  participants: string[];
}

export function useStaticFeedbackController(ticket: MockTicket): StaticFeedbackController {
  return useMemo(() => {
    const roots = ticket.comments.filter((c) => !c.threadId);
    const repliesByThread = new Map<string, MockComment[]>();
    for (const c of ticket.comments) {
      if (!c.threadId) continue;
      const list = repliesByThread.get(c.threadId) ?? [];
      list.push(c);
      repliesByThread.set(c.threadId, list);
    }
    const threads: DemoThread[] = roots.map((root) => ({
      root: toDemoComment(root),
      replies: (repliesByThread.get(root.id) ?? []).map(toDemoComment),
    }));
    return {
      description: ticket.description,
      tags: ticket.tags,
      threads,
      participants: ticket.participants,
    };
  }, [ticket]);
}
