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

/** Standard 403 body for suspended workspace. Use when catch(assertWorkspaceActive). */
export const WORKSPACE_SUSPENDED_RESPONSE = {
  error: "WORKSPACE_SUSPENDED" as const,
  message: "Workspace suspended",
};
