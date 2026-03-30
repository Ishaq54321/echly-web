import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { apiSuccess } from "@/lib/server/apiResponse";

/**
 * GET /api/admin/me
 * Returns { isAdmin: boolean }. Used by admin layout to gate access.
 * Uses same admin auth as other admin APIs; returns 200 { isAdmin: false } when not admin.
 */
export const GET = withAuthorization(
  "read_feedback",
  async (_req, _ctx, { isAdmin }) => apiSuccess({ isAdmin }),
  {
    isAdmin: true,
    allowNonAdmin: true,
    resolveWorkspace: async (_req, _user, _ctx, viewerWorkspaceId) => viewerWorkspaceId,
  }
);
