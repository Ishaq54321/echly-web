import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { sendPasswordResetEmail } from "@/lib/email/workspaceEmails";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  const userRecord = await getAuth().getUser(user.uid);
  const primaryProvider = userRecord.providerData[0]?.providerId;

  if (primaryProvider !== "password") {
    return apiError({
      code: "GOOGLE_AUTH_NO_PASSWORD",
      message:
        "Cannot send password reset for accounts that don't use email/password sign-in.",
      status: 400,
    });
  }

  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return apiError({ code: "INVALID_INPUT", message: "Email is required", status: 400 });
  }

  try {
    const resetLink = await getAuth().generatePasswordResetLink(email);

    const userSnap = await adminDb.doc(`users/${user.uid}`).get();
    const userName = (userSnap.data()?.displayName as string | undefined) ?? email;

    await sendPasswordResetEmail({
      to: email,
      resetUrl: resetLink,
      userName,
    });

    return apiSuccess({ sent: true });
  } catch (err) {
    console.error("send-password-reset error:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to send reset email", status: 500 });
  }
}
