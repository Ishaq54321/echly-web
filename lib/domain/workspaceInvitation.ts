import type { Timestamp } from "firebase-admin/firestore";
import type { WorkspaceMemberRole } from "./workspaceMember";

export type WorkspaceInvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
  status: WorkspaceInvitationStatus;
  invitedBy: string;
  invitedByName: string;
  workspaceName: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  acceptedAt: Timestamp | null;
  acceptedBy: string | null;
  reminderSentAt: Timestamp | null;
}
