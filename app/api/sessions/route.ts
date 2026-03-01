import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { requireAuth } from "@/lib/server/auth";
import { getUserSessionsRepo } from "@/lib/repositories/sessionsRepository";

/** GET /api/sessions — list sessions for the authenticated user. */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const sessions = await getUserSessionsRepo(user.uid, 100);
    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => serializeSession(s)),
    });
  } catch (err) {
    console.error("GET /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

function serializeSession(session: Session): Record<string, unknown> {
  const out = { ...session } as Record<string, unknown>;
  const createdAt = session.createdAt as { toDate?: () => Date } | null | undefined;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  const updatedAt = session.updatedAt as { toDate?: () => Date } | null | undefined;
  if (updatedAt != null && typeof updatedAt.toDate === "function") {
    out.updatedAt = updatedAt.toDate().toISOString();
  }
  return out;
}
