import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Check,
  Layers,
  MessageCircle,
  Plus,
  RotateCcw,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";

export type EventIconEntry = {
  icon: LucideIcon;
  badgeClass: string;
};

export const eventIconMap: Record<string, EventIconEntry> = {
  "comment.added":            { icon: MessageCircle, badgeClass: "bg-[var(--brand)]" },
  "feedback.created":         { icon: Plus,          badgeClass: "bg-[var(--color-insight)]" },
  "feedback.resolved":        { icon: Check,         badgeClass: "bg-[var(--color-success)]" },
  "feedback.reopened":        { icon: RotateCcw,     badgeClass: "bg-[var(--color-warning-dot)]" },
  "session.created":          { icon: Layers,        badgeClass: "bg-[var(--color-insight)]" },
  "session.archived":         { icon: Archive,       badgeClass: "bg-[var(--text-body)]" },
  "session.member.added":     { icon: UserPlus,      badgeClass: "bg-[var(--text-body)]" },
  "session.member.removed":   { icon: UserMinus,     badgeClass: "bg-[var(--text-body)]" },
  "session.member.role_changed": { icon: UserPlus,   badgeClass: "bg-[var(--text-body)]" },
  "session.settings_changed": { icon: Settings,      badgeClass: "bg-[var(--text-body)]" },
  "access_request.approved":  { icon: Shield,        badgeClass: "bg-[var(--color-success-dot)]" },
  "access_request.rejected":  { icon: Shield,        badgeClass: "bg-[var(--color-danger)]" },
  "invite.sent":              { icon: UserPlus,      badgeClass: "bg-blue-400" },
  "invite.accepted":          { icon: UserCheck,     badgeClass: "bg-[var(--color-success-dot)]" },
  "session.deleted":          { icon: Trash2,        badgeClass: "bg-[var(--color-danger)]" },
  "feedback.deleted":         { icon: Trash2,        badgeClass: "bg-[var(--color-danger)]" },
};

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
