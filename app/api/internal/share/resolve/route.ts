import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { resolveShareToken } from "@/lib/server/shareTokenResolver";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY: GET /api/internal/share/resolve?token=...
 * Authenticated-only debug endpoint to test share token resolution.
 */
export async function GET(req: Request) {
  try {
    await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ success: false, error: "Missing token query parameter" }, { status: 400 });
  }

  try {
    const result = await resolveShareToken(token);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("GET /api/internal/share/resolve:", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
