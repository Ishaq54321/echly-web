import type { NextRequest } from "next/server";
import { apiError } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  if (!token || !uid) {
    return NextResponse.redirect(`${APP_URL}/settings?error=invalid_token`);
  }

  let pendingDoc;
  try {
    pendingDoc = await adminDb.doc(`users/${uid}/pendingEmailChange/${token}`).get();
  } catch {
    return NextResponse.redirect(`${APP_URL}/settings?error=invalid_token`);
  }

  if (!pendingDoc.exists) {
    return NextResponse.redirect(`${APP_URL}/settings?error=invalid_token`);
  }

  const data = pendingDoc.data() as {
    newEmail: string;
    expiresAt: Timestamp;
  };

  if (data.expiresAt.toMillis() < Date.now()) {
    return NextResponse.redirect(`${APP_URL}/settings?error=expired_token`);
  }

  try {
    await getAuth().updateUser(uid, { email: data.newEmail });
    await adminDb.doc(`users/${uid}`).set(
      { email: data.newEmail, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    await pendingDoc.ref.delete();
  } catch (err) {
    console.error("confirm-email-change error:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to update email", status: 500 });
  }

  return NextResponse.redirect(`${APP_URL}/settings?success=email_changed`);
}
