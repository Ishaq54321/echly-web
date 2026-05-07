import { verifyIdToken } from "@/lib/server/auth";
import {
  signSessionPayload,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/session";
import {
  signEmailVerifiedToken,
  buildEmailVerifiedCookieString,
} from "@/lib/server/emailVerifiedCookie";
import {
  signOnboardedToken,
  buildOnboardedCookieString,
} from "@/lib/server/onboardingCookie";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/session
 * Exchange a Firebase ID token for a server session cookie.
 * Body: { idToken: string }
 */
export async function POST(req: Request) {
  let body: { idToken?: string };
  try {
    body = await req.json();
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== "string") {
    return apiError({ code: "INVALID_INPUT", message: "Missing idToken", status: 400 });
  }

  try {
    const decoded = await verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = (decoded.email as string) ?? null;
    const name = (decoded.name as string) ?? null;
    const emailVerified = decoded.email_verified === true;

    const sessionPayload = { uid, email, name };
    const token = await signSessionPayload(sessionPayload);

    const isProduction = process.env.NODE_ENV === "production";
    const response = apiSuccess({ user: { uid, email } });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    if (emailVerified) {
      const verifiedToken = await signEmailVerifiedToken(uid);
      response.headers.append(
        "Set-Cookie",
        buildEmailVerifiedCookieString(verifiedToken)
      );
    }

    // Re-issue onboarded cookie for returning users who already completed onboarding.
    // Without this, logout clears the cookie and middleware bounces to /onboarding
    // before WorkspaceProvider can re-issue it via POST /api/users.
    const userSnap = await adminDb.doc(`users/${uid}`).get();
    const userData = userSnap.data() ?? {};
    const onboardingCompleted = userData.onboardingCompleted;
    const hasWorkspace =
      typeof userData.workspaceId === "string" &&
      userData.workspaceId.trim().length > 0;
    if (onboardingCompleted !== false && hasWorkspace) {
      const onboardedToken = await signOnboardedToken(uid);
      response.headers.append(
        "Set-Cookie",
        buildOnboardedCookieString(onboardedToken)
      );
    }

    console.log("Session cookie created for user:", uid);
    return response;
  } catch (err) {
    console.error("Session login failed:", err);
    return apiError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
      status: 401,
    });
  }
}
