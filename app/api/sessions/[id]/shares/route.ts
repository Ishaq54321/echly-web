import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { listSessionSharesRepo } from "@/lib/repositories/sessionSharesRepository";
import { sessionWorkspaceId } from "@/lib/server/sessionWorkspaceScope";
import { buildRequestContext } from "@/lib/server/requestContext";

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

  const context = await buildRequestContext({
    userId: user.uid,
    sessionId: sessionId.trim(),
  });
  if (!context.session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (!context.canAccess) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const session = context.session;

  try {
    const workspaceId = sessionWorkspaceId(session) ?? "";
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const rows = await listSessionSharesRepo(sessionId, workspaceId);
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
