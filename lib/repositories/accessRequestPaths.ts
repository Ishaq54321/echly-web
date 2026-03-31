export function accessRequestsPath(sessionId: string) {
  return `sessions/${sessionId}/accessRequests`;
}

export function accessRequestDocPath(sessionId: string, requestId: string) {
  return `sessions/${sessionId}/accessRequests/${requestId}`;
}
