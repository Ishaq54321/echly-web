/**
 * Firestore document shape (`sessions/{sessionId}/members/{userId}`):
 * ```json
 * {
 *   "userId": "string",
 *   "email": "string",
 *   "access": "view | resolve",
 *   "addedBy": "string",
 *   "createdAt": "timestamp"
 * }
 * ```
 */
export type SessionMemberAccess = "view" | "resolve";

export type SessionMember = {
  userId: string;
  email: string;
  access: SessionMemberAccess;
  addedBy: string;
  createdAt: Date;
};
