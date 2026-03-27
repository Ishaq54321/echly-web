import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/workspace/status
 * Legacy compatibility route. Workspace suspension is deprecated in user-owned mode
 * and returns suspended: false when auth succeeds.
 */
export async function GET(_req: Request) {
  try {
    await requireAuth(_req);
    return NextResponse.json({ suspended: false });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("GET /api/workspace/status:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
