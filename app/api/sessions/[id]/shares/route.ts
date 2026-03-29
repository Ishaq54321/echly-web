import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { listSessionSharesRepo } from "@/lib/repositories/sessionSharesRepository";
import { buildRequestContext } from "@/lib/server/requestContext";

/** GET /api/sessions/:id/shares — list email shares (requires resolve capability). */
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
    userEmail: user.email,
    sessionId: sessionId.trim(),
  });
  if (!context.access?.canResolve) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!context.session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  try {
    const rows = await listSessionSharesRepo(sessionId.trim());
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
