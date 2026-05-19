import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { sendEmailVerification } from "@/lib/email/workspaceEmails";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server/session";

export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 3;
const MAX_PER_IP = 10;

type Bucket = { count: number; resetAt: number };
const emailBuckets = new Map<string, Bucket>();
const ipBuckets = new Map<string, Bucket>();

function hit(map: Map<string, Bucket>, key: string, max: number): boolean {
  const now = Date.now();
  const bucket = map.get(key);
  if (!bucket || bucket.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

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

  const email = userRecord.email;
  if (!email) {
    return NextResponse.json(
      { success: false, error: { code: "NO_EMAIL", message: "Account has no email" } },
      { status: 400 }
    );
  }

  if (userRecord.emailVerified) {
    return NextResponse.json({ success: true, data: { alreadyVerified: true } });
  }

  const ip = getClientIp(req);
  if (!hit(ipBuckets, ip, MAX_PER_IP) || !hit(emailBuckets, email, MAX_PER_EMAIL)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many verification requests. Please try again later.",
        },
      },
      { status: 429 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

  try {
    const firebaseLink = await adminAuth.generateEmailVerificationLink(email);
    const oobCode = new URL(firebaseLink).searchParams.get("oobCode");
    if (!oobCode) throw new Error("Missing oobCode in generated verification link");

    const verifyUrl = `${baseUrl}/auth/action?mode=verifyEmail&oobCode=${encodeURIComponent(
      oobCode
    )}`;

    let userName = email.split("@")[0] ?? email;
    try {
      const snap = await adminDb.doc(`users/${session.uid}`).get();
      const data = snap.data();
      if (data) {
        const display =
          (typeof data.displayName === "string" && data.displayName.trim()) ||
          (typeof data.firstName === "string" && data.firstName.trim()) ||
          (typeof data.name === "string" && data.name.trim());
        if (display) userName = display;
      }
    } catch (err) {
      console.error("send-verification: user lookup failed", err);
    }

    await sendEmailVerification({ to: email, verifyUrl, userName });
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };

    if (firebaseError?.message?.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many attempts. Please wait a few minutes and try again.",
          },
        },
        { status: 429 }
      );
    }

    console.error("send-verification: send failed", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VERIFICATION_FAILED",
          message: "Unable to send verification email. Please try again shortly.",
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { sent: true } });
}
