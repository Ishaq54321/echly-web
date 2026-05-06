import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
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
import { createWorkspaceRepo } from "@/lib/repositories/workspacesRepository.server";
import { setWorkspaceClaim } from "@/lib/server/setWorkspaceClaim";
import { composeFullName } from "@/lib/utils/nameSplit";

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

/**
 * POST /api/onboarding — completion endpoint for the multi-step onboarding flow.
 *
 * The new flow saves profile/workspace data step-by-step via PATCH /api/users
 * and PATCH /api/workspaces. This endpoint is the final commit: it flips
 * onboardingCompleted to true and issues the signed cookie that satisfies
 * the middleware gate.
 *
 * Optional workspaceName is a fallback for any client that didn't update the
 * workspace doc directly.
 */
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
    let wid =
      typeof userData.workspaceId === "string" ? userData.workspaceId.trim() : "";

    // Fresh signup completing onboarding: workspace doesn't exist yet. Create
    // it here using the name supplied by WorkspaceStep, write workspaceId on
    // the user doc, set the workspace claim.
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
      const ownerName = composeFullName(firstName, lastName) || null;
      const ownerEmail =
        typeof userData.email === "string" ? userData.email : (user.email ?? null);
      const ownerPhotoUrl =
        typeof userData.photoURL === "string" ? userData.photoURL : null;
      await createWorkspaceRepo({
        userId: user.uid,
        ownerId: user.uid,
        name: workspaceName,
        logoUrl: ownerPhotoUrl,
        ownerEmail,
        ownerName,
      });
      wid = user.uid;
      await userRef.set(
        {
          workspaceId: wid,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await setWorkspaceClaim(user.uid, wid);
    }

    await userRef.set(
      {
        onboardingCompleted: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const workspaceRef = adminDb.doc(`workspaces/${wid}`);
    const workspaceSnap = await workspaceRef.get();
    if (workspaceSnap.exists) {
      const updates: Record<string, unknown> = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (workspaceName) updates.name = workspaceName;

      // Reserve the slug atomically (transaction in slugs/{slug}). On
      // collision we silently skip — the frontend already validated via
      // /check-slug, so a race collision here is unlikely and non-fatal
      // for completing onboarding.
      if (workspaceSlug) {
        const prevSlug =
          typeof workspaceSnap.data()?.slug === "string"
            ? (workspaceSnap.data()!.slug as string)
            : null;
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

      await workspaceRef.set(updates, { merge: true });
    }

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
