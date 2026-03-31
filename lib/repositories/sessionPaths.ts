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
