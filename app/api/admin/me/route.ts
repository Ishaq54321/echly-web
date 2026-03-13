import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { requireAdmin } from "@/lib/server/requireAdmin";

/**
 * GET /api/admin/me
 * Returns { isAdmin: boolean }. Used by admin layout to gate access.
 */
export async function GET(req: Request) {
  let uid: string;
  try {
    const decoded = await requireAuth(req);
    uid = decoded.uid;
  } catch (res) {
    return res as Response;
  }

  try {
    await requireAdmin(uid);
    return NextResponse.json({ isAdmin: true });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
