export function sessionMembersPath(sessionId: string) {
  return `sessions/${sessionId}/members`;
}

export function sessionMemberDocPath(sessionId: string, userId: string) {
  return `sessions/${sessionId}/members/${userId}`;
}

export function sessionInvitesPath(sessionId: string) {
  return `sessions/${sessionId}/invites`;
}

export function sessionInviteDocPath(sessionId: string, inviteId: string) {
  return `sessions/${sessionId}/invites/${inviteId}`;
}

/**
 * Composite key for the sessionAccess collection.
 * Format: `${userId}_${sessionId}`.
 *
 * Invariant: both userId (Firebase Auth UID) and sessionId (Firestore auto-ID)
 * are alphanumeric only — no underscores. The single underscore separator is
 * unambiguous. If either ID format ever changes to allow underscores, this
 * helper must change too.
 */
export function sessionAccessDocPath(userId: string, sessionId: string): string {
  return `sessionAccess/${userId}_${sessionId}`;
}
