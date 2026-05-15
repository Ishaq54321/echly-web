import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  signOnboardedToken,
  buildOnboardedCookieString,
} from "@/lib/server/onboardingCookie";
import { isValidSlug } from "@/lib/utils/slugify";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";
import { resolveUserName } from "@/lib/utils/nameSplit";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";

export const dynamic = "force-dynamic";

const MAX_WORKSPACE_NAME_LEN = 80;

type OnboardingBody = {
  workspaceName?: string;
  workspaceSlug?: string;
};

function unauthorizedResponse(req: NextRequest, errRes: Response): NextResponse {
  return new NextResponse(errRes.body, {
    status: errRes.status,
    statusText: errRes.statusText,
    headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  let body: OnboardingBody = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text) as OnboardingBody;
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const workspaceName =
    typeof body.workspaceName === "string" ? body.workspaceName.trim() : "";
  const workspaceSlug =
    typeof body.workspaceSlug === "string"
      ? body.workspaceSlug.trim().toLowerCase()
      : "";

  if (workspaceName.length > MAX_WORKSPACE_NAME_LEN) {
    return apiError({
      code: "INVALID_INPUT",
      message: `workspaceName must be ${MAX_WORKSPACE_NAME_LEN} characters or fewer`,
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  if (workspaceSlug && !isValidSlug(workspaceSlug)) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid slug format",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const userRef = adminDb.doc(`users/${user.uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return apiError({
        code: "NOT_FOUND",
        message: "User document not found",
        status: 404,
        init: { headers: corsHeaders(req) },
      });
    }
    const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
    const existingWid =
      typeof userData.workspaceId === "string" ? userData.workspaceId.trim() : "";

    // BUG-1: Reject onboarding for already-onboarded users so a replay of this
    // endpoint cannot overwrite the user's primary workspace. Re-issue cookie.
    if (userData.onboardingCompleted === true && existingWid) {
      const wsSnap = await adminDb.doc(`workspaces/${existingWid}`).get();
      if (wsSnap.exists) {
        const token = await signOnboardedToken(user.uid);
        const headers = new Headers(corsHeaders(req));
        headers.append("Set-Cookie", buildOnboardedCookieString(token));
        return apiSuccess(
          { workspaceId: existingWid, alreadyOnboarded: true },
          null,
          { headers }
        );
      }
    }

    let wid = existingWid;
    let createdNewWorkspace = false;

    if (!wid) {
      if (!workspaceName) {
        return apiError({
          code: "INVALID_INPUT",
          message: "workspaceName is required to complete onboarding",
          status: 400,
          init: { headers: corsHeaders(req) },
        });
      }

      const firstName =
        typeof userData.firstName === "string" ? userData.firstName : null;
      const lastName =
        typeof userData.lastName === "string" ? userData.lastName : null;
      const ownerEmail =
        typeof userData.email === "string"
          ? userData.email
          : (user.email ?? "");
      const ownerName = resolveUserName({
        firstName,
        lastName,
        authDisplayName:
          typeof userData.authDisplayName === "string"
            ? userData.authDisplayName
            : null,
        email: ownerEmail || null,
      });
      const ownerPhotoUrl =
        typeof userData.photoURL === "string" ? userData.photoURL : null;
      const ownerAvatarUrl =
        typeof userData.avatarUrl === "string"
          ? userData.avatarUrl
          : ownerPhotoUrl;

      wid = user.uid;

      // Reserve slug first (transaction). If it fails non-fatally, we proceed
      // without slug — the rest of onboarding shouldn't be blocked.
      let reservedSlug: string | null = null;
      if (workspaceSlug) {
        try {
          const newRef = adminDb.doc(`slugs/${workspaceSlug}`);
          await adminDb.runTransaction(async (tx) => {
            const newSnap = await tx.get(newRef);
            if (newSnap.exists) {
              const data = (newSnap.data() ?? {}) as Record<string, unknown>;
              if (data.workspaceId !== wid) throw new Error("SLUG_TAKEN");
              return;
            }
            tx.set(newRef, {
              workspaceId: wid,
              createdAt: FieldValue.serverTimestamp(),
            });
          });
          reservedSlug = workspaceSlug;
        } catch (slugErr) {
          console.warn("POST /api/onboarding: slug reservation failed", slugErr);
        }
      }

      const payload = defaultWorkspaceDoc({
        ownerId: user.uid,
        name: workspaceName,
        logoUrl: ownerPhotoUrl,
        ...(reservedSlug ? { slug: reservedSlug } : {}),
      });

      // INT-1: All Firestore writes for onboarding go in a single batch so they
      // succeed or fail together. Auth claim is set after the commit (idempotent
      // on retry).
      const workspaceRef = adminDb.doc(`workspaces/${wid}`);
      const memberRef = adminDb.doc(`workspaces/${wid}/members/${user.uid}`);

      const batch = adminDb.batch();
      batch.create(workspaceRef, {
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      batch.set(memberRef, {
        uid: user.uid,
        email: ownerEmail,
        displayName: ownerName,
        avatarUrl: ownerAvatarUrl,
        role: "OWNER",
        joinedAt: Timestamp.now(),
        invitedBy: null,
      });
      batch.set(
        userRef,
        {
          workspaceId: wid,
          onboardingCompleted: true,
          workspaceMemberships: FieldValue.arrayUnion(wid),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      try {
        await batch.commit();
        createdNewWorkspace = true;
      } catch (err: unknown) {
        const code = (err as { code?: number })?.code;
        if (code === 6 /* ALREADY_EXISTS */) {
          // Workspace already exists (concurrent retry). Fall through to the
          // "existing workspace" branch below and re-set the claim.
        } else {
          throw err;
        }
      }
    }

    // For existing workspaces (or losing-race retries), apply name/slug updates
    // and ensure onboardingCompleted is set. Skip when we just created in the
    // batch above (already set there).
    if (!createdNewWorkspace) {
      const workspaceRef = adminDb.doc(`workspaces/${wid}`);
      const workspaceSnap = await workspaceRef.get();
      if (workspaceSnap.exists) {
        const wsData = workspaceSnap.data() ?? {};
        const updates: Record<string, unknown> = {
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (workspaceName) updates.name = workspaceName;

        if (workspaceSlug) {
          const prevSlug =
            typeof wsData.slug === "string" ? (wsData.slug as string) : null;
          try {
            const newRef = adminDb.doc(`slugs/${workspaceSlug}`);
            const prevRef =
              prevSlug && prevSlug !== workspaceSlug
                ? adminDb.doc(`slugs/${prevSlug}`)
                : null;
            await adminDb.runTransaction(async (tx) => {
              const newSnap = await tx.get(newRef);
              if (newSnap.exists) {
                const data = (newSnap.data() ?? {}) as Record<string, unknown>;
                if (data.workspaceId !== wid) throw new Error("SLUG_TAKEN");
                return;
              }
              tx.set(newRef, {
                workspaceId: wid,
                createdAt: FieldValue.serverTimestamp(),
              });
              if (prevRef) tx.delete(prevRef);
            });
            updates.slug = workspaceSlug;
          } catch (slugErr) {
            console.warn("POST /api/onboarding: slug reservation failed", slugErr);
          }
        }

        const batch = adminDb.batch();
        batch.set(workspaceRef, updates, { merge: true });
        batch.set(
          userRef,
          {
            workspaceId: wid,
            onboardingCompleted: true,
            workspaceMemberships: FieldValue.arrayUnion(wid),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        await batch.commit();
      }
    }

    // Auth claim — non-Firestore, can't batch. Idempotent on retry.
    // Read post-write user doc to pick up the freshly-unioned memberships array.
    const postSnap = await userRef.get();
    const postData = (postSnap.data() ?? {}) as Record<string, unknown>;
    const memberships: string[] = Array.isArray(postData.workspaceMemberships)
      ? (postData.workspaceMemberships as unknown[]).filter(
          (v): v is string => typeof v === "string" && v.trim() !== ""
        )
      : [];
    if (!memberships.includes(wid)) memberships.push(wid);
    await setWorkspaceClaims(user.uid, wid, memberships);

    const token = await signOnboardedToken(user.uid);
    const headers = new Headers(corsHeaders(req));
    headers.append("Set-Cookie", buildOnboardedCookieString(token));
    return apiSuccess({ workspaceId: wid }, null, { headers });
  } catch (err) {
    console.error("POST /api/onboarding:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to complete onboarding",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
