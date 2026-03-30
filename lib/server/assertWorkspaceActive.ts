type WorkspaceLike = { billing?: { suspended?: boolean } } | null | undefined;

/**
 * Throws if the workspace is suspended. Use after loading a workspace in API routes
 * so suspended workspaces cannot use any product functionality.
 */
export function assertWorkspaceActive(workspace: WorkspaceLike): void {
  if (workspace?.billing?.suspended === true) {
    const err = new Error("WORKSPACE_SUSPENDED");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}

/** Message matched by clients for workspace billing suspension (see apiError FORBIDDEN). */
export const WORKSPACE_SUSPENDED_MESSAGE = "Workspace suspended";
