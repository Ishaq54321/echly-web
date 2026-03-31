/**
 * Firestore document shape (`sessions/{sessionId}/accessRequests/{userId}`):
 * ```json
 * {
 *   "requesterUserId": "string",
 *   "requesterEmail": "string",
 *   "requestedAccess": "resolve",
 *   "status": "pending | approved | rejected",
 *   "createdAt": "timestamp",
 *   "updatedAt": "timestamp"
 * }
 * ```
 */
export type AccessRequestStatus = "pending" | "approved" | "rejected";

export type AccessRequest = {
  id: string;
  sessionId: string;

  requesterUserId: string;
  requesterEmail: string;

  requestedAccess: "resolve";

  status: AccessRequestStatus;

  createdAt: number;
  updatedAt: number;
};
