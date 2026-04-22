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
  "comment.added":            { icon: MessageCircle, badgeClass: "bg-[#1775E0]" },
  "feedback.created":         { icon: Plus,          badgeClass: "bg-purple-500" },
  "feedback.resolved":        { icon: Check,         badgeClass: "bg-green-500" },
  "feedback.reopened":        { icon: RotateCcw,     badgeClass: "bg-amber-500" },
  "session.created":          { icon: Layers,        badgeClass: "bg-purple-400" },
  "session.archived":         { icon: Archive,       badgeClass: "bg-neutral-400" },
  "session.member.added":     { icon: UserPlus,      badgeClass: "bg-neutral-300" },
  "session.member.removed":   { icon: UserMinus,     badgeClass: "bg-neutral-300" },
  "session.member.role_changed": { icon: UserPlus,   badgeClass: "bg-neutral-300" },
  "session.settings_changed": { icon: Settings,      badgeClass: "bg-neutral-300" },
  "access_request.approved":  { icon: Shield,        badgeClass: "bg-green-400" },
  "access_request.rejected":  { icon: Shield,        badgeClass: "bg-red-400" },
  "invite.sent":              { icon: UserPlus,      badgeClass: "bg-blue-400" },
  "invite.accepted":          { icon: UserCheck,     badgeClass: "bg-green-400" },
  "session.deleted":          { icon: Trash2,        badgeClass: "bg-red-400" },
  "feedback.deleted":         { icon: Trash2,        badgeClass: "bg-red-400" },
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
