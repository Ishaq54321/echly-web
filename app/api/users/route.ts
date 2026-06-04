import type { NextRequest } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import {
  ensureUserRepo,
  updateUserFieldsRepo,
} from "@/lib/repositories/usersRepository.server";
import { mirrorUserProfileFromUserDoc } from "@/lib/repositories/userProfilesRepository.server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { corsHeaders } from "@/lib/server/cors";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";
import { composeFullName, resolveUserName } from "@/lib/utils/nameSplit";
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

/** Trim a value to a non-empty string, else null. */
function trimToNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Fix 1c — resolve the SIGNED-IN user's own avatar with the canonical priority:
 *   custom uploaded avatar (firebasestorage) > live Auth photoURL > stored snapshot.
 *
 * `liveAuthPhotoURL` is userRecord.photoURL from getAuth().getUser() — the live
 * Firebase Auth photo. The hasCustomAvatar guard (firebasestorage signal,
 * matching usersRepository.server.ts) ensures a Google photo never out-ranks an
 * upload.
 */
function resolveSelfAvatarUrl(
  data: Record<string, unknown>,
  liveAuthPhotoURL: string | null | undefined
): string | null {
  const storedAvatarUrl = trimToNull(data.avatarUrl);
  const storedPhotoURL = trimToNull(data.photoURL);
  const live = trimToNull(liveAuthPhotoURL);

  const hasCustomAvatar = Boolean(
    storedAvatarUrl && storedAvatarUrl.includes("firebasestorage")
  );
  if (hasCustomAvatar) return storedAvatarUrl;

  // No custom upload: live Auth photo wins over the stale snapshot.
  return live ?? storedAvatarUrl ?? storedPhotoURL;
}

/**
 * Fix 1b — refresh-on-login for the EXISTING-user path.
 *
 * ensureUserRepo's shouldRefreshGooglePhoto only runs for fresh signups / the
 * edge-case recovery path; returning users with a workspace short-circuit in
 * ensureUserAndRespond before ensureUserRepo is ever called. So the live Google
 * photo never reached them — the reported stale-avatar bug. This mirrors the
 * exact guard semantics from usersRepository.server.ts (hasCustomAvatar via the
 * `firebasestorage` signal) so a custom uploaded avatar is NEVER overwritten by
 * the Google photo. We hotlink Google's CDN URL — no re-hosting to Storage.
 *
 * Returns the avatar URL to report to the client (refreshed when applicable,
 * else the stored snapshot). Best-effort: a write failure never blocks the
 * ensure-user response.
 */
async function refreshGooglePhotoForExistingUser(
  uid: string,
  data: Record<string, unknown>,
  livePhotoURL: string | null | undefined
): Promise<string | null> {
  const storedAvatarUrl =
    typeof data.avatarUrl === "string" && data.avatarUrl.trim()
      ? data.avatarUrl.trim()
      : null;
  const storedPhotoURL =
    typeof data.photoURL === "string" && data.photoURL.trim()
      ? data.photoURL.trim()
      : null;

  // Same signal as ensureUserRepo: a custom upload lives in Firebase Storage.
  const hasCustomAvatar = Boolean(
    storedAvatarUrl && storedAvatarUrl.includes("firebasestorage")
  );

  const live = typeof livePhotoURL === "string" ? livePhotoURL.trim() : "";
  const shouldRefresh =
    !hasCustomAvatar && live !== "" && live !== storedPhotoURL;

  if (!shouldRefresh) {
    // No change (or a protected custom upload): report the stored value,
    // collapsing avatarUrl → photoURL to match resolveUserAvatar's ladder.
    return storedAvatarUrl ?? storedPhotoURL;
  }

  try {
    await adminDb.doc(`users/${uid}`).set(
      { photoURL: live, avatarUrl: live, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    // Keep the public mirror (userProfiles/{uid}) in step so other users'
    // realtime listeners see the refreshed photo too.
    await mirrorUserProfileFromUserDoc(uid);
  } catch (e) {
    console.warn("POST /api/users: Google photo refresh failed (non-fatal)", e);
    return storedAvatarUrl ?? storedPhotoURL;
  }
  return live;
}

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
        // Fix 1c: prefer the user's own avatar by priority
        //   custom uploaded avatar (firebasestorage) > live Auth photoURL > stored snapshot
        // userRecord.photoURL is the LIVE Firebase Auth photo (current Google
        // CDN URL for Google users). When the user has NO custom upload we
        // surface that live value over the possibly-stale Firestore snapshot;
        // when they DO have a custom upload the firebasestorage avatarUrl wins,
        // so a Google photo can never clobber an upload. Collapses avatarUrl →
        // photoURL to match resolveUserAvatar's ladder for the no-photo case.
        avatarUrl: resolveSelfAvatarUrl(data, userRecord.photoURL),
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
  user: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    /** Live Google photo from the ID token's `picture` claim (Fix 1b). */
    photoURL?: string | null;
  }
): Promise<NextResponse> {
  try {
    const existingSnap = await adminDb.doc(`users/${user.uid}`).get();
    if (existingSnap.exists) {
      const data = existingSnap.data() as Record<string, unknown>;
      const storedWorkspaceId =
        typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
      const firstName = typeof data.firstName === "string" ? data.firstName : "";
      const lastName = typeof data.lastName === "string" ? data.lastName : "";
      // Fix 1b: refresh-on-login. Returning users never reached ensureUserRepo's
      // refresh logic, so their Google photo went stale. hasCustomAvatar guard
      // preserved (see helper) — uploads are never clobbered.
      const resolvedAvatarUrl = await refreshGooglePhotoForExistingUser(
        user.uid,
        data,
        user.photoURL
      );
      if (storedWorkspaceId) {
        const memberships: string[] = Array.isArray(data.workspaceMemberships)
          ? (data.workspaceMemberships as unknown[]).filter(
              (v): v is string => typeof v === "string" && v.trim() !== ""
            )
          : [];
        // Defense-in-depth: only push storedWorkspaceId into the claims array
        // if a member doc actually backs it. Without this, a stale
        // users/{uid}.workspaceId (e.g. from some future bug that doesn't
        // clear it on removal) would re-grant workspace access on every page
        // load. If the pointer is stale, clear it instead of trusting it.
        let activeWorkspaceId: string | null = storedWorkspaceId;
        if (!memberships.includes(storedWorkspaceId)) {
          const memberSnap = await adminDb
            .doc(`workspaces/${storedWorkspaceId}/members/${user.uid}`)
            .get();
          if (memberSnap.exists) {
            memberships.push(storedWorkspaceId);
          } else {
            await adminDb
              .doc(`users/${user.uid}`)
              .update({ workspaceId: null });
            activeWorkspaceId = null;
          }
        }
        const { changed: claimsChanged } = await setWorkspaceClaims(
          user.uid,
          activeWorkspaceId,
          memberships
        );
        const headers = await buildHeadersWithOnboardedCookie(
          req,
          user.uid,
          data.onboardingCompleted,
          activeWorkspaceId !== null
        );
        return apiSuccess(
          {
            workspaceId: activeWorkspaceId,
            avatarUrl: resolvedAvatarUrl,
            firstName,
            lastName,
            displayName: composeFullName(firstName, lastName),
            claimsChanged,
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
          avatarUrl: resolvedAvatarUrl,
          firstName,
          lastName,
          displayName: composeFullName(firstName, lastName),
          claimsChanged: false,
        },
        null,
        { headers }
      ) as NextResponse;
    }

    const { workspaceId, avatarUrl } = await ensureUserRepo({
      uid: user.uid,
      email: user.email ?? null,
      authDisplayName: user.displayName ?? null,
      // Fix 1b: feed the live Google photo so shouldRefreshGooglePhoto can seed
      // a fresh signup's avatar. The hasCustomAvatar guard inside ensureUserRepo
      // (firebasestorage check) still protects any custom upload.
      photoURL: user.photoURL ?? null,
    });
    let claimsChanged = false;
    if (workspaceId) {
      const ensuredSnap = await adminDb.doc(`users/${user.uid}`).get();
      const ensuredData = (ensuredSnap.data() ?? {}) as Record<string, unknown>;
      const memberships: string[] = Array.isArray(ensuredData.workspaceMemberships)
        ? (ensuredData.workspaceMemberships as unknown[]).filter(
            (v): v is string => typeof v === "string" && v.trim() !== ""
          )
        : [];
      if (!memberships.includes(workspaceId)) memberships.push(workspaceId);
      const claimResult = await setWorkspaceClaims(
        user.uid,
        workspaceId,
        memberships
      );
      claimsChanged = claimResult.changed;
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
        claimsChanged,
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
      // Keep the public profile mirror in step with the new name so other
      // users' realtime listeners see it immediately (Phase 25.4).
      await mirrorUserProfileFromUserDoc(user.uid);
      if (composed) {
        try {
          await getAuth().updateUser(user.uid, { displayName: composed });
        } catch (e) {
          console.warn("PATCH /api/users: Auth.updateUser displayName failed:", e);
        }
      }

      // Sync the denormalized displayName on every workspace member doc so
      // dropdowns/badges that read members/{uid} don't show a stale name.
      // Other denormalized copies (feedback.creatorName, comment.userName)
      // are intentionally NOT synced — historical attributions stay as-is;
      // read APIs resolve fresh names via resolveUserName.
      try {
        const newDisplayName = resolveUserName({
          firstName,
          lastName,
          email: user.email ?? null,
        });
        const userSnap = await adminDb.doc(`users/${user.uid}`).get();
        const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
        const memberships: string[] = Array.isArray(
          userData.workspaceMemberships
        )
          ? (userData.workspaceMemberships as unknown[]).filter(
              (v): v is string => typeof v === "string" && v.trim() !== ""
            )
          : [];
        const storedWid =
          typeof userData.workspaceId === "string"
            ? userData.workspaceId.trim()
            : "";
        if (storedWid && !memberships.includes(storedWid)) {
          memberships.push(storedWid);
        }
        if (memberships.length > 0) {
          const batch = adminDb.batch();
          for (const wid of memberships) {
            const memberRef = adminDb
              .collection("workspaces")
              .doc(wid)
              .collection("members")
              .doc(user.uid);
            batch.set(
              memberRef,
              {
                displayName: newDisplayName,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
          await batch.commit();
        }
      } catch (e) {
        console.warn(
          "PATCH /api/users: member-doc displayName sync failed:",
          e
        );
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
