import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";

export const dynamic = "force-dynamic";

/**
 * GET /api/workspace/status
 * Returns current user's workspace suspended status for UI (e.g. full-page suspended message).
 * Returns 200 with { suspended: boolean }. If not authenticated or no workspace, returns { suspended: false }.
 */
export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const workspace = await getWorkspace(workspaceId);
    const suspended =
      !!workspace?.billing && (workspace.billing as { suspended?: boolean }).suspended === true;
    return NextResponse.json({ suspended });
  } catch {
    return NextResponse.json({ suspended: false });
  }
}
