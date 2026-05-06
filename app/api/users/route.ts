import type { NextRequest } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import {
  ensureUserRepo,
  updateUserFieldsRepo,
} from "@/lib/repositories/usersRepository.server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { corsHeaders } from "@/lib/server/cors";
import { setWorkspaceClaim } from "@/lib/server/setWorkspaceClaim";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";
import { composeFullName } from "@/lib/utils/nameSplit";
import {
  signOnboardedToken,
  buildOnboardedCookieString,
} from "@/lib/server/onboardingCookie";
import {
  signEmailVerifiedToken,
  buildEmailVerifiedCookieString,
} from "@/lib/server/emailVerifiedCookie";

async function buildHeadersWithOnboardedCookie(
  req: NextRequest,
  uid: string,
  onboardingCompleted: unknown,
  hasWorkspace: boolean
): Promise<Headers> {
  const headers = new Headers(corsHeaders(req));
  // Set onboarded cookie only when onboardingCompleted !== false (true OR
  // absent legacy) AND the user has a workspace. New signups with
  // workspaceId: null must NOT receive the cookie — they need to complete
  // onboarding (step 5 creates the workspace and issues the cookie).
  if (onboardingCompleted !== false && hasWorkspace) {
    const token = await signOnboardedToken(uid);
    headers.append("Set-Cookie", buildOnboardedCookieString(token));
  }
  // Google sign-ups (and any provider with a verified email) bypass the
  // verification gate — issue the cookie at ensure-user time so middleware
  // doesn't bounce them to /check-email.
  try {
    const userRecord = await getAuth().getUser(uid);
    if (userRecord.emailVerified) {
      const token = await signEmailVerifiedToken(uid);
      headers.append("Set-Cookie", buildEmailVerifiedCookieString(token));
    }
  } catch (err) {
    console.warn("ensureUser: emailVerified cookie skipped", err);
  }
  return headers;
}

export const dynamic = "force-dynamic";

const MAX_NAME_LEN = 50;

/** GET /api/users — return current user data including authProvider. */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  try {
    const userRecord = await getAuth().getUser(user.uid);
    const providerId = userRecord.providerData[0]?.providerId ?? "unknown";
    const authProvider =
      providerId === "google.com"
        ? "google"
        : providerId === "password"
        ? "password"
        : "unknown";

    const snap = await adminDb.doc(`users/${user.uid}`).get();
    const data = snap.data() ?? {};
    const firstName = typeof data.firstName === "string" ? data.firstName : "";
    const lastName = typeof data.lastName === "string" ? data.lastName : "";
    const composed =
      composeFullName(firstName, lastName) || userRecord.displayName || null;
    const onboardingStep =
      typeof data.onboardingStep === "number" ? data.onboardingStep : null;
    const onboardingCompleted =
      typeof data.onboardingCompleted === "boolean"
        ? data.onboardingCompleted
        : null;

    return apiSuccess(
      {
        uid: user.uid,
        email: user.email ?? null,
        firstName,
        lastName,
        displayName: composed,
        avatarUrl: (data.avatarUrl as string | undefined) ?? null,
        authProvider,
        onboardingStep,
        onboardingCompleted,
      },
      null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/users:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch user",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

type UserPatchBody = {
  role?: string;
  companySize?: string;
  firstName?: string;
  lastName?: string;
  onboardingStep?: number;
};

const MAX_ONBOARDING_STEP = 5;

function unauthorizedResponse(req: NextRequest, errRes: Response): NextResponse {
  return new NextResponse(errRes.body, {
    status: errRes.status,
    statusText: errRes.statusText,
    headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
  });
}

// Per-uid in-memory mutex. Concurrent same-uid POST /api/users requests on the
// same warm Vercel instance share one Promise so the ensure-user logic only
// executes once. NOT a cross-instance lock — Firestore deterministic path
// workspaces/{uid} + transaction guards in ensureUserRepo are the actual
// safety net. This is a hot-path optimization for double-click and two-tab
// signups within the same browser/instance.
const inFlightEnsureUser = new Map<string, Promise<NextResponse>>();

async function ensureUserAndRespond(
  req: NextRequest,
  user: { uid: string; email?: string | null; displayName?: string | null }
): Promise<NextResponse> {
  try {
    const existingSnap = await adminDb.doc(`users/${user.uid}`).get();
    if (existingSnap.exists) {
      const data = existingSnap.data() as Record<string, unknown>;
      const storedWorkspaceId =
        typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
      const firstName = typeof data.firstName === "string" ? data.firstName : "";
      const lastName = typeof data.lastName === "string" ? data.lastName : "";
      if (storedWorkspaceId) {
        await setWorkspaceClaim(user.uid, storedWorkspaceId);
        const headers = await buildHeadersWithOnboardedCookie(
          req,
          user.uid,
          data.onboardingCompleted,
          true
        );
        return apiSuccess(
          {
            workspaceId: storedWorkspaceId,
            avatarUrl: (data.avatarUrl as string | undefined) ?? null,
            firstName,
            lastName,
            displayName: composeFullName(firstName, lastName),
          },
          null,
          { headers }
        ) as NextResponse;
      }
      // Existing user with no workspaceId — mid-onboarding. Skip claim
      // setting and onboarded cookie; client treats null as needsOnboarding.
      const headers = await buildHeadersWithOnboardedCookie(
        req,
        user.uid,
        data.onboardingCompleted,
        false
      );
      return apiSuccess(
        {
          workspaceId: null,
          avatarUrl: (data.avatarUrl as string | undefined) ?? null,
          firstName,
          lastName,
          displayName: composeFullName(firstName, lastName),
        },
        null,
        { headers }
      ) as NextResponse;
    }

    const { workspaceId, avatarUrl } = await ensureUserRepo({
      uid: user.uid,
      email: user.email ?? null,
      authDisplayName: user.displayName ?? null,
    });
    if (workspaceId) {
      await setWorkspaceClaim(user.uid, workspaceId);
    }
    // Re-read so the freshly-seeded firstName/lastName are returned to the client.
    const freshSnap = await adminDb.doc(`users/${user.uid}`).get();
    const fresh = (freshSnap.data() ?? {}) as Record<string, unknown>;
    const firstName = typeof fresh.firstName === "string" ? fresh.firstName : "";
    const lastName = typeof fresh.lastName === "string" ? fresh.lastName : "";
    const headers = await buildHeadersWithOnboardedCookie(
      req,
      user.uid,
      fresh.onboardingCompleted,
      Boolean(workspaceId)
    );
    return apiSuccess(
      {
        workspaceId: workspaceId ?? null,
        avatarUrl,
        firstName,
        lastName,
        displayName: composeFullName(firstName, lastName),
      },
      null,
      { headers }
    ) as NextResponse;
  } catch (err) {
    console.error("POST /api/users:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to ensure user",
      status: 500,
      init: { headers: corsHeaders(req) },
    }) as NextResponse;
  }
}

/** POST /api/users — ensure user exists. */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  const existing = inFlightEnsureUser.get(user.uid);
  if (existing) {
    // Concurrent caller — re-serialize JSON body so each awaiter gets a fresh
    // stream. The original response's body can only be consumed once; cloning
    // the JSON value and re-emitting via NextResponse.json gives each caller
    // their own readable body.
    const shared = await existing;
    const body = await shared.clone().json();
    return NextResponse.json(body, {
      status: shared.status,
      headers: shared.headers,
    });
  }

  // Single-caller path: return the inner NextResponse directly. No re-wrap —
  // preserves Content-Type and avoids stream-handling fragility.
  const promise = ensureUserAndRespond(req, user).finally(() => {
    inFlightEnsureUser.delete(user.uid);
  });
  inFlightEnsureUser.set(user.uid, promise);
  return promise;
}

/** PATCH /api/users — update user profile fields. */
export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  let body: UserPatchBody;
  try {
    body = (await req.json()) as UserPatchBody;
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const role = typeof body.role === "string" ? body.role.trim() : "";
  const companySize = typeof body.companySize === "string" ? body.companySize.trim() : "";
  const namesProvided =
    body.firstName !== undefined || body.lastName !== undefined;
  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName =
    typeof body.lastName === "string" ? body.lastName.trim() : "";
  const onboardingStepProvided = typeof body.onboardingStep === "number";
  const onboardingStep = onboardingStepProvided
    ? Math.floor(body.onboardingStep as number)
    : null;

  if (
    onboardingStepProvided &&
    (onboardingStep! < 1 || onboardingStep! > MAX_ONBOARDING_STEP)
  ) {
    return apiError({
      code: "INVALID_INPUT",
      message: `onboardingStep must be 1..${MAX_ONBOARDING_STEP}`,
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  if (!role && !companySize && !namesProvided && !onboardingStepProvided) {
    return apiError({
      code: "INVALID_INPUT",
      message: "No updates provided",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  if (namesProvided) {
    if (!firstName) {
      return apiError({
        code: "INVALID_INPUT",
        message: "First name is required",
        status: 400,
        init: { headers: corsHeaders(req) },
      });
    }
    if (firstName.length > MAX_NAME_LEN) {
      return apiError({
        code: "INVALID_INPUT",
        message: `First name must be ${MAX_NAME_LEN} characters or fewer`,
        status: 400,
        init: { headers: corsHeaders(req) },
      });
    }
    if (lastName.length > MAX_NAME_LEN) {
      return apiError({
        code: "INVALID_INPUT",
        message: `Last name must be ${MAX_NAME_LEN} characters or fewer`,
        status: 400,
        init: { headers: corsHeaders(req) },
      });
    }
  }

  try {
    let composed = "";
    if (namesProvided) {
      composed = composeFullName(firstName, lastName);
      await adminDb.doc(`users/${user.uid}`).set(
        {
          firstName,
          lastName,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      if (composed) {
        try {
          await getAuth().updateUser(user.uid, { displayName: composed });
        } catch (e) {
          console.warn("PATCH /api/users: Auth.updateUser displayName failed:", e);
        }
      }
    }
    if (role || companySize) {
      await updateUserFieldsRepo(user.uid, {
        role: role || undefined,
        companySize: companySize || undefined,
      });
    }
    if (onboardingStepProvided && onboardingStep != null) {
      // Only persist when this strictly advances the user past their saved step.
      // Going back (or re-saving the same step) is a no-op so we never regress
      // a user who reopens an earlier screen mid-onboarding.
      const userRef = adminDb.doc(`users/${user.uid}`);
      const userSnap = await userRef.get();
      const stored =
        typeof userSnap.data()?.onboardingStep === "number"
          ? (userSnap.data()!.onboardingStep as number)
          : 0;
      if (onboardingStep > stored) {
        await userRef.set(
          {
            onboardingStep,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    }
    return apiSuccess(
      namesProvided ? { firstName, lastName, displayName: composed } : {},
      null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("PATCH /api/users:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to update user",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
