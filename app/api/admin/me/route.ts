import { NextResponse } from "next/server";
import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

/**
 * GET /api/admin/me
 * Returns { isAdmin: boolean }. Used by admin layout to gate access.
 * Uses same admin auth as other admin APIs; returns 200 { isAdmin: false } when not admin.
 */
export const GET = withAuthorization(
  "read_feedback",
  async (_req, _ctx, { isAdmin }) => NextResponse.json({ isAdmin }),
  {
    isAdmin: true,
    allowNonAdmin: true,
    resolveWorkspace: async (_req, user) => getUserWorkspaceIdRepo(user.uid),
  }
);
