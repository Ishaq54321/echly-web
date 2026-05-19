import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { sendPasswordResetEmail } from "@/lib/email/workspaceEmails";

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ok() {
  return NextResponse.json({ success: true, data: { sent: true } });
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_INPUT", message: "Valid email is required" } },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  if (!hit(ipBuckets, ip, MAX_PER_IP) || !hit(emailBuckets, email, MAX_PER_EMAIL)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many reset requests. Please try again later.",
        },
      },
      { status: 429 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

  try {
    const firebaseLink = await getAuth().generatePasswordResetLink(email);

    const oobCode = new URL(firebaseLink).searchParams.get("oobCode");
    if (!oobCode) throw new Error("Missing oobCode in generated reset link");

    const resetUrl = `${baseUrl}/reset-password?oobCode=${encodeURIComponent(
      oobCode
    )}&mode=resetPassword`;

    let userName = email.split("@")[0] ?? email;
    try {
      const snap = await adminDb
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (!snap.empty) {
        const data = snap.docs[0]!.data();
        const display =
          (typeof data.displayName === "string" && data.displayName.trim()) ||
          (typeof data.name === "string" && data.name.trim());
        if (display) userName = display;
      }
    } catch (err) {
      console.error("forgot-password: user lookup failed", err);
    }

    await sendPasswordResetEmail({ to: email, resetUrl, userName });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/user-not-found" || code === "auth/email-not-found") {
      return ok();
    }
    console.error("forgot-password: send failed", err);
    return ok();
  }

  return ok();
}
