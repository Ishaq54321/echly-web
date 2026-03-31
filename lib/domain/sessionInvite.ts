/**
 * Firestore document shape (`sessions/{sessionId}/invites/{inviteId}`):
 * ```json
 * {
 *   "email": "string",
 *   "access": "view | resolve",
 *   "status": "pending | active",
 *   "invitedBy": "string",
 *   "createdAt": "timestamp"
 * }
 * ```
 */
export type SessionInviteStatus = "pending" | "active";

export type SessionInvite = {
  email: string;
  access: "view" | "resolve";
  status: SessionInviteStatus;
  invitedBy: string;
  createdAt: Date;
};
