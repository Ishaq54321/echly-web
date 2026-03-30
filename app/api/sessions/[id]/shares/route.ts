import { NextResponse } from "next/server";
import { listSessionSharesRepo } from "@/lib/repositories/sessionSharesRepository";
import { getAccessContext } from "@/lib/access/getAccessContext";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { resolveOptionalSessionViewer } from "@/lib/server/requestContext";

/** GET /api/sessions/:id/shares — optional auth; read gated by `capabilities.canView` only. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  if (!sessionId?.trim()) {
    return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
  }

  const id = sessionId.trim();
  const { viewerUser, tokenString } = await resolveOptionalSessionViewer(req);
  const loaded = await getSessionByIdRepo(id);
  const { session, access } = await getAccessContext({
    sessionId: id,
    user: viewerUser,
    session: loaded,
    tokenString,
  });

  if (!access?.capabilities.canView) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  try {
    const rows = await listSessionSharesRepo(id);
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
