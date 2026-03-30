import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { apiError } from "@/lib/server/apiResponse";

/**
 * POST /api/admin/workspaces/actions
 * Obsolete endpoint: disabled.
 */
export const POST = withAuthorization(
  "update_session",
  async (req: Request) => {
    try {
      await req.json().catch(() => null);
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid JSON", status: 400 });
    }
    return apiError({
      code: "FORBIDDEN",
      message: "Admin workspace actions are disabled",
      status: 410,
    });
  },
  {
    isAdmin: true,
    resolveWorkspace: async (_req, _user, _ctx, viewerWorkspaceId) => viewerWorkspaceId,
  }
);
