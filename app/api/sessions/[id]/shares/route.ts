import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { listSessionSharesRepo } from "@/lib/repositories/sessionSharesRepository";

/** GET /api/sessions/:id/shares — list email shares for a session (owner only). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  const { id: sessionId } = await params;
  if (!sessionId?.trim()) {
    return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (session.userId !== user.uid) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const workspaceId =
    session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await resolveWorkspaceById(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json({ success: false, ...WORKSPACE_SUSPENDED_RESPONSE }, { status: 403 });
    }
    throw err;
  }

  try {
    const rows = await listSessionSharesRepo(sessionId);
    const shares = rows.map((r) => ({
      email: r.email,
      permission: r.permission,
    }));
    return NextResponse.json({ success: true, shares });
  } catch (e) {
    console.error("GET /api/sessions/[id]/shares:", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
