import "server-only";

import { apiError } from "@/lib/server/apiResponse";
import { WORKSPACE_SUSPENDED_MESSAGE } from "@/lib/server/assertWorkspaceActive";

/**
 * Centralized mapper for errors thrown by assertWorkspaceActive().
 * Returns a properly-shaped Response if the error is a known workspace-guard error,
 * or null if it's something else (let the caller's normal error handling proceed).
 *
 * Usage in route catch blocks:
 *   } catch (err) {
 *     const guardResponse = workspaceGuardErrorResponse(err);
 *     if (guardResponse) return guardResponse;
 *     // existing 500 handling
 *   }
 */
export function workspaceGuardErrorResponse(err: unknown): Response | null {
  if (!(err instanceof Error)) return null;

  if (err.message === "WORKSPACE_SUSPENDED") {
    return apiError({
      code: "FORBIDDEN",
      message: WORKSPACE_SUSPENDED_MESSAGE,
      status: 403,
    });
  }

  if (err.message === "WORKSPACE_DELETED") {
    return apiError({
      code: "GONE",
      message: "Workspace deleted",
      status: 410,
    });
  }

  return null;
}
