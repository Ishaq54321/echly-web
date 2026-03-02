import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { requireAuth } from "@/lib/server/auth";
import {
  getUserSessionsRepo,
  createSessionRepo,
} from "@/lib/repositories/sessionsRepository";
import { log } from "@/lib/utils/logger";

/** GET /api/sessions — list sessions for the authenticated user. */
export async function GET(req: Request) {
  const start = Date.now();
  log("[API] GET /api/sessions start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const sessions = await getUserSessionsRepo(user.uid, 100);
    log("[API] GET /api/sessions duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => serializeSession(s)),
    });
  } catch (err) {
    console.error("GET /api/sessions:", err);
    log("[API] GET /api/sessions duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

/** POST /api/sessions — create a new session. Returns { success: true, session: { id } }. */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  try {
    const id = await createSessionRepo(user.uid, null);
    return NextResponse.json({ success: true, session: { id } });
  } catch (err) {
    console.error("POST /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
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
