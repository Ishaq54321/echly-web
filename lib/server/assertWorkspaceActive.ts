type WorkspaceLike = {
  billing?: { suspended?: boolean };
  deletedAt?: { toMillis?: () => number } | null;
} | null | undefined;

/**
 * Throws if the workspace is soft-deleted or suspended. Use after loading a workspace
 * in API routes so deleted/suspended workspaces cannot use any product functionality.
 *
 * `opts.allowSuspended` lets recovery routes (portal, checkout, workspace-DELETE)
 * through for suspended workspaces — the DELETED check always fires regardless.
 */
export function assertWorkspaceActive(
  workspace: WorkspaceLike,
  opts?: { allowSuspended?: boolean }
): void {
  // DELETED check ALWAYS fires — cannot be bypassed.
  if (workspace?.deletedAt != null) {
    const err = new Error("WORKSPACE_DELETED");
    (err as Error & { status?: number }).status = 410;
    throw err;
  }
  // SUSPENDED check fires unless explicitly allowed.
  if (!opts?.allowSuspended && workspace?.billing?.suspended === true) {
    const err = new Error("WORKSPACE_SUSPENDED");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}

/** Message matched by clients for workspace billing suspension (see apiError FORBIDDEN). */
export const WORKSPACE_SUSPENDED_MESSAGE = "Workspace suspended";
