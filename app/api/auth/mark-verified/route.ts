import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server/session";
import {
  signEmailVerifiedToken,
  buildEmailVerifiedCookieString,
} from "@/lib/server/emailVerifiedCookie";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not signed in" } },
      { status: 401 }
    );
  }

  let userRecord;
  try {
    userRecord = await adminAuth.getUser(session.uid);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  if (!userRecord.emailVerified) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_VERIFIED", message: "Email is not verified yet" } },
      { status: 400 }
    );
  }

  const token = await signEmailVerifiedToken(session.uid);
  const headers = new Headers();
  headers.append("Set-Cookie", buildEmailVerifiedCookieString(token));
  return NextResponse.json({ success: true, data: { verified: true } }, { headers });
}
