import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
import { sendEmailChangeConfirmation } from "@/lib/email/workspaceEmails";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: { newEmail?: string; password?: string };
  try {
    body = (await req.json()) as { newEmail?: string; password?: string };
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const newEmail = typeof body.newEmail === "string" ? body.newEmail.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return apiError({ code: "INVALID_INPUT", message: "Invalid email address", status: 400 });
  }

  if (!password) {
    return apiError({ code: "INVALID_INPUT", message: "Password is required", status: 400 });
  }

  const currentEmail = user.email;
  if (!currentEmail) {
    return apiError({ code: "INVALID_INPUT", message: "No email on current account", status: 400 });
  }

  if (newEmail === currentEmail.toLowerCase()) {
    return apiError({ code: "INVALID_INPUT", message: "New email must be different from current", status: 400 });
  }

  // Verify password via Firebase REST API
  const signInRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, password, returnSecureToken: false }),
    }
  );
  if (!signInRes.ok) {
    return apiError({ code: "FORBIDDEN", message: "Incorrect password", status: 403 });
  }

  // Check if new email already taken
  try {
    await getAuth().getUserByEmail(newEmail);
    return apiError({ code: "INVALID_INPUT", message: "Email already in use", status: 409 });
  } catch {
    // Not found — good
  }

  const token = randomBytes(32).toString("hex");

  await adminDb.doc(`users/${user.uid}/pendingEmailChange/${token}`).set({
    newEmail,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
  });

  const confirmUrl = `${APP_URL}/api/users/confirm-email-change?token=${token}&uid=${user.uid}`;

  // Get user display name for the email
  const userSnap = await adminDb.doc(`users/${user.uid}`).get();
  const userName = (userSnap.data()?.displayName as string | undefined) ?? currentEmail;

  await sendEmailChangeConfirmation({
    to: newEmail,
    newEmail,
    confirmUrl,
    userName,
  });

  return apiSuccess({ message: `Confirmation email sent to ${newEmail}` });
}
