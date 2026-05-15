// ─── Event classification + mention detection ────────────────────────────────
//
// The visual badges themselves now live in ./EventBadge.tsx (bespoke SVG
// components, Phase 28.4). Per-event pill colour now also comes from there
// (getEventColor, Phase 28.5) — the old hash-based getSessionColor helper
// was removed since pills inherit the event colour, not a session-stable one.
// This module keeps only the non-visual helpers that survived:
//   - getTier / TIER_MAP    → activity feed density classification
//   - isPersonalMention     → @-mention detection for the pink badge variant

export const TIER_MAP: Record<string, 1 | 2 | 3> = {
  "comment.added": 1,
  "feedback.created": 1,
  "feedback.resolved": 2,
  "feedback.reopened": 2,
  "session.created": 2,
  "session.archived": 2,
  "session.member.added": 3,
  "session.member.removed": 3,
  "session.member.role_changed": 3,
  "session.settings_changed": 3,
  "access_request.approved": 3,
  "access_request.rejected": 3,
  "invite.sent": 2,
  "invite.accepted": 2,
  "session.deleted": 2,
  "feedback.deleted": 2,
};

export function getTier(eventType: string): 1 | 2 | 3 {
  return TIER_MAP[eventType] ?? 2;
}

// ─── Personal-mention detection ──────────────────────────────────────────────

/** True when a comment.added event lists `currentUserId` in metadata.mentionedUserIds. */
export function isPersonalMention(
  eventType: string,
  metadata: Record<string, unknown> | undefined,
  currentUserId: string | null | undefined
): boolean {
  if (eventType !== "comment.added") return false;
  if (!currentUserId) return false;
  const m = metadata?.mentionedUserIds;
  return Array.isArray(m) && m.includes(currentUserId);
}
