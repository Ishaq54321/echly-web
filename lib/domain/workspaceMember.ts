import type { Timestamp } from "firebase-admin/firestore";

export type WorkspaceMemberRole = "OWNER" | "MEMBER";

export interface WorkspaceMember {
  uid: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: WorkspaceMemberRole;
  joinedAt: Timestamp;
  invitedBy: string | null;
}
