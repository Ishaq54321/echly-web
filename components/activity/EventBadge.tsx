import React from "react";

interface BadgeProps {
  size?: number;
  className?: string;
}

// ═══════════════════════════════════════════════════════
// BADGE 1: Created (feedback.created)
// Color: brand purple #5A49BF
// Glyph: bold plus sign
// ═══════════════════════════════════════════════════════
export function CreatedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#5A49BF" opacity="0.12" />
      <circle cx="16" cy="16" r="11" fill="#5A49BF" />
      <path
        d="M16 11 V21 M11 16 H21"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 2: Resolved (feedback.resolved)
// Color: success green #1D9E75
// Glyph: checkmark
// ═══════════════════════════════════════════════════════
export function ResolvedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#1D9E75" opacity="0.12" />
      <circle cx="16" cy="16" r="11" fill="#1D9E75" />
      <path
        d="M11.5 16.2 L14.5 19 L20.5 13"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 3: Reopened (feedback.reopened)
// Color: warning amber #BA7517
// Glyph: counterclockwise rotate with arrowhead
// ═══════════════════════════════════════════════════════
export function ReopenedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#BA7517" opacity="0.12" />
      <circle cx="16" cy="16" r="11" fill="#BA7517" />
      <path
        d="M19.5 12 A5 5 0 1 0 21 16.5 M19.5 12 V14.5 H17"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 4: Deleted (feedback.deleted / session.deleted)
// Color: danger red #A32D2D
// Glyph: bespoke trash can with lid + handle
// ═══════════════════════════════════════════════════════
export function DeletedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#A32D2D" opacity="0.12" />
      <circle cx="16" cy="16" r="11" fill="#A32D2D" />
      <path
        d="M12 13 H20 M13 13 V20 A1 1 0 0 0 14 21 H18 A1 1 0 0 0 19 20 V13 M14 13 V11.5 A0.5 0.5 0 0 1 14.5 11 H17.5 A0.5 0.5 0 0 1 18 11.5 V13"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 5: Commented (comment.added, non-mention)
// Color: info blue #378ADD
// Glyph: solid speech bubble pointing bottom-left
// ═══════════════════════════════════════════════════════
export function CommentedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#378ADD" opacity="0.12" />
      <circle cx="16" cy="16" r="11" fill="#378ADD" />
      <path
        d="M11 14.5 C11 12.7 12.3 11.5 14 11.5 H18 C19.7 11.5 21 12.7 21 14.5 V17 C21 18.7 19.7 20 18 20 H14.5 L12 21.5 V20 C11.4 19.6 11 18.8 11 17.8 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 6: Mentioned you (comment.added with @user)
// Color: pink #D4537E (special: signals personal relevance)
// Glyph: custom @ symbol
// ═══════════════════════════════════════════════════════
export function MentionBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#D4537E" opacity="0.14" />
      <circle cx="16" cy="16" r="11" fill="#D4537E" />
      <circle cx="16" cy="16" r="2.7" fill="none" stroke="#FFFFFF" strokeWidth="1.7" />
      <path
        d="M19 17.5 V14.5 A4 4 0 1 0 17 19.5 M19 17.5 A1.5 1.5 0 0 0 21 16 V15 A6 6 0 1 0 18 20.5"
        stroke="#FFFFFF"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 7: Session created (session.created)
// Color: coral #D85A30
// Glyph: desktop window with traffic-light dots
// ═══════════════════════════════════════════════════════
export function SessionCreatedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#D85A30" opacity="0.13" />
      <circle cx="16" cy="16" r="11" fill="#D85A30" />
      <rect x="11" y="12" width="10" height="8" rx="1.5" fill="#FFFFFF" />
      <rect x="11" y="12" width="10" height="2.5" rx="1.5" fill="#FFFFFF" opacity="0.4" />
      <circle cx="13.5" cy="13.2" r="0.6" fill="#D85A30" />
      <circle cx="15.5" cy="13.2" r="0.6" fill="#D85A30" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 8: Archived (session.archived)
// Color: gray #888780
// Glyph: archive box with label slot
// ═══════════════════════════════════════════════════════
export function ArchivedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#888780" opacity="0.16" />
      <circle cx="16" cy="16" r="11" fill="#888780" />
      <rect x="11" y="13" width="10" height="2.5" rx="0.6" fill="#FFFFFF" />
      <rect x="11.5" y="15.8" width="9" height="5" rx="0.8" fill="#FFFFFF" />
      <rect x="14" y="17.5" width="4" height="1" rx="0.3" fill="#888780" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 9: Member added (invite.accepted, session.member.added,
//                       access_request.approved)
// Color: teal/success #1D9E75
// Glyph: person silhouette with + badge bottom-right
// ═══════════════════════════════════════════════════════
export function MemberAddedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#1D9E75" opacity="0.12" />
      <circle cx="16" cy="16" r="11" fill="#1D9E75" />
      <circle cx="14" cy="14.5" r="2" fill="#FFFFFF" />
      <path
        d="M10.5 20.5 C10.5 18.5 12 17 14 17 C15.5 17 16.6 17.8 17.2 19"
        stroke="#FFFFFF"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="19.5" cy="18.5" r="2.5" fill="#FFFFFF" />
      <path
        d="M19.5 17.3 V19.7 M18.3 18.5 H20.7"
        stroke="#1D9E75"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 10: Member removed (session.member.removed,
//                          access_request.rejected)
// Color: gray #888780
// Glyph: person silhouette with - line on right
// ═══════════════════════════════════════════════════════
export function MemberRemovedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#888780" opacity="0.16" />
      <circle cx="16" cy="16" r="11" fill="#888780" />
      <circle cx="14" cy="14.5" r="2" fill="#FFFFFF" />
      <path
        d="M10.5 20.5 C10.5 18.5 12 17 14 17 C15.5 17 16.6 17.8 17.2 19"
        stroke="#FFFFFF"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 18.5 H21"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 11: Invite sent (invite.sent)
// Color: gray #888780
// Glyph: envelope with diagonal opening
// ═══════════════════════════════════════════════════════
export function InviteSentBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#888780" opacity="0.16" />
      <circle cx="16" cy="16" r="11" fill="#888780" />
      <rect x="10.8" y="12.3" width="10.4" height="7.4" rx="1.2" fill="#FFFFFF" />
      <path
        d="M11 13 L16 16.5 L21 13"
        stroke="#888780"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// BADGE 12: Role changed (session.member.role_changed,
//                        session.settings_changed)
// Color: gray #888780
// Glyph: shield with checkmark inside
// ═══════════════════════════════════════════════════════
export function RoleChangedBadge({ size = 32, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="#888780" opacity="0.16" />
      <circle cx="16" cy="16" r="11" fill="#888780" />
      <path
        d="M16 10.5 L20.5 12.5 V16 C20.5 18.8 18.5 20.8 16 21.5 C13.5 20.8 11.5 18.8 11.5 16 V12.5 Z"
        fill="#FFFFFF"
      />
      <path
        d="M13.8 16 L15.4 17.5 L18.2 14.5"
        stroke="#888780"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// EVENT COLOR — single source of truth shared by the badge
// dispatcher AND the color-coordinated pills (Phase 28.5).
// Any new event type only needs to be added here.
// ═══════════════════════════════════════════════════════

export const EVENT_COLORS = {
  brand: "#5A49BF", // feedback.created
  success: "#1D9E75", // feedback.resolved, member added, access approved
  warning: "#BA7517", // feedback.reopened
  danger: "#A32D2D", // feedback.deleted, session.deleted, access rejected
  info: "#378ADD", // comment.added (non-mention)
  pink: "#D4537E", // mention
  coral: "#D85A30", // session.created
  gray: "#888780", // archived / system events
} as const;

export function getEventColor(
  eventType: string,
  isPersonalMention: boolean = false
): string {
  if (eventType === "comment.added" && isPersonalMention) {
    return EVENT_COLORS.pink;
  }

  switch (eventType) {
    case "feedback.created":
      return EVENT_COLORS.brand;
    case "feedback.resolved":
      return EVENT_COLORS.success;
    case "feedback.reopened":
      return EVENT_COLORS.warning;
    case "feedback.deleted":
    case "session.deleted":
      return EVENT_COLORS.danger;
    case "comment.added":
      return EVENT_COLORS.info;
    case "session.created":
      return EVENT_COLORS.coral;
    case "invite.accepted":
    case "session.member.added":
    case "access_request.approved":
      return EVENT_COLORS.success;
    case "access_request.rejected":
      return EVENT_COLORS.danger;
    case "session.member.removed":
    case "session.member.role_changed":
    case "session.settings_changed":
    case "session.archived":
    case "invite.sent":
    default:
      return EVENT_COLORS.gray;
  }
}

// ═══════════════════════════════════════════════════════
// DISPATCHER — maps event type + mention state to the right badge
// ═══════════════════════════════════════════════════════

interface EventBadgeProps {
  eventType: string;
  isPersonalMention?: boolean;
  size?: number;
  className?: string;
}

export function EventBadge({
  eventType,
  isPersonalMention = false,
  size = 32,
  className,
}: EventBadgeProps) {
  const props = { size, className };

  // Special: comment.added with current user mentioned → pink mention badge
  if (eventType === "comment.added" && isPersonalMention) {
    return <MentionBadge {...props} />;
  }

  switch (eventType) {
    case "feedback.created":
      return <CreatedBadge {...props} />;

    case "feedback.resolved":
      return <ResolvedBadge {...props} />;

    case "feedback.reopened":
      return <ReopenedBadge {...props} />;

    case "feedback.deleted":
    case "session.deleted":
      return <DeletedBadge {...props} />;

    case "comment.added":
      return <CommentedBadge {...props} />;

    case "session.created":
      return <SessionCreatedBadge {...props} />;

    case "session.archived":
      return <ArchivedBadge {...props} />;

    case "invite.accepted":
    case "session.member.added":
    case "access_request.approved":
      return <MemberAddedBadge {...props} />;

    case "session.member.removed":
    case "access_request.rejected":
      return <MemberRemovedBadge {...props} />;

    case "invite.sent":
      return <InviteSentBadge {...props} />;

    case "session.member.role_changed":
    case "session.settings_changed":
      return <RoleChangedBadge {...props} />;

    default:
      // Unknown event type → fallback to generic created badge
      // Pre-launch: log a warning so we catch missing mappings
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        console.warn(`[EventBadge] No badge mapped for eventType: ${eventType}`);
      }
      return <CreatedBadge {...props} />;
  }
}
