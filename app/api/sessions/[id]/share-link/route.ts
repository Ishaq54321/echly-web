import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { createShareLink } from "@/lib/repositories/shareLinksRepository";
import { getActiveShareLinkForSession } from "@/lib/repositories/shareLinkActiveBySession";

export const dynamic = "force-dynamic";

/** POST /api/sessions/:id/share-link — return existing active token or create one (comment access). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: { userId?: unknown } = {};
  try {
    body = (await req.json()) as { userId?: unknown };
  } catch {
    body = {};
  }
  const clientUid = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!clientUid || clientUid !== user.uid) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const sessionId = typeof id === "string" ? id.trim() : "";
  if (!sessionId) {
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
    const existing = await getActiveShareLinkForSession(sessionId);
    if (existing) {
      return NextResponse.json({ success: true, token: existing.token });
    }
    const { token } = await createShareLink(sessionId, "comment", user.uid);
    return NextResponse.json({ success: true, token });
  } catch (e) {
    console.error("POST /api/sessions/[id]/share-link:", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
