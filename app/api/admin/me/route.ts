import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";

/**
 * GET /api/admin/me
 * Returns { isAdmin: boolean }. Used by admin layout to gate access.
 * Uses same admin auth as other admin APIs; returns 200 { isAdmin: false } when not admin.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    return NextResponse.json({ isAdmin: true });
  } catch (e) {
    const res = e as Response;
    if (res?.status === 403) return NextResponse.json({ isAdmin: false });
    return res;
  }
}
