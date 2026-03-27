import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import type { SessionSharePermission } from "@/lib/repositories/sessionSharesRepository";
import { upsertSessionShareRepo } from "@/lib/repositories/sessionSharesRepository";
import { userWorkspaceMatchesSession } from "@/lib/server/sessionWorkspaceScope";

type ShareBody = {
  sessionId?: string;
  email?: string;
  permission?: string;
};

const PERMISSIONS: SessionSharePermission[] = ["view", "comment", "resolve"];

function isValidEmail(email: string): boolean {
  const t = email.trim();
  if (!t || !t.includes("@")) return false;
  const at = t.indexOf("@");
  return at > 0 && at < t.length - 1;
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: ShareBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  const email = typeof body.email === "string" ? body.email : "";
  const permission = body.permission as SessionSharePermission;

  if (!sessionId) {
    return NextResponse.json({ success: false, error: "Missing sessionId" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
  }
  if (!PERMISSIONS.includes(permission)) {
    return NextResponse.json({ success: false, error: "Invalid permission" }, { status: 400 });
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (!(await userWorkspaceMatchesSession(user.uid, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    await upsertSessionShareRepo(user.uid, sessionId, email, permission);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/sessions/share:", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
