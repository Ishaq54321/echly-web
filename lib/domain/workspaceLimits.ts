export const MAX_WORKSPACES_PER_USER = 5;

export class WorkspaceLimitError extends Error {
  code = "WORKSPACE_LIMIT_REACHED";
  status = 403;
  constructor(public currentCount: number) {
    super(`User is already in ${currentCount} workspaces (max ${MAX_WORKSPACES_PER_USER}).`);
  }
}

export function assertCanJoinAnotherWorkspace(
  currentMemberships: string[],
  joiningWorkspaceId: string,
): void {
  if (currentMemberships.includes(joiningWorkspaceId)) return;
  if (currentMemberships.length >= MAX_WORKSPACES_PER_USER) {
    throw new WorkspaceLimitError(currentMemberships.length);
  }
}
