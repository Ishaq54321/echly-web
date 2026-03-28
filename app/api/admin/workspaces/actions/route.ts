import { NextResponse } from "next/server";
import { withAuthorization } from "@/lib/server/auth/withAuthorization";

/**
 * POST /api/admin/workspaces/actions
 * Obsolete endpoint: disabled for safety during userId migration.
 */
export const POST = withAuthorization(
  "update_session",
  async (req: Request) => {
  try {
    await req.json().catch(() => null);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  return NextResponse.json(
    { error: "Admin workspace actions are disabled" },
    { status: 410 }
  );
  },
  {
    isAdmin: true,
    resolveWorkspace: async (_req, _user, _ctx, viewerWorkspaceId) => viewerWorkspaceId,
  }
);
