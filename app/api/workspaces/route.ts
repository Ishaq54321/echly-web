/*
 * CRITICAL PATH TRACE — new user signup (normal path):
 * 1. Firebase Auth creates account
 * 2. WorkspaceProvider calls POST /api/users
 * 3. ensureUserRepo → createWorkspaceRepo
 *    → addWorkspaceMemberRepo called ✓ (WS-001 fix)
 *    → addWorkspaceMembershipRepo called ✓ (WS-001 fix)
 * 4. User goes through onboarding
 * 5. POST /api/workspaces fires
 * 6. Early-return guard fires (workspaceId already set)
 * 7. Heal check runs — member doc already exists → skip ✓ (WS-002 fix)
 * 8. setWorkspaceClaim called ✓
 * 9. User lands on dashboard
 * 10. User opens Members tab, clicks Invite
 * 11. Invite API: isOwnerByField = true (ownerId === uid) ✓ (WS-004 fix)
 * 12. No 403 — invite proceeds ✓
 */
import type { NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";
import { getUserWorkspaceIdRepo, addWorkspaceMembershipRepo } from "@/lib/repositories/usersRepository.server";
import {
  addWorkspaceMemberRepo,
  getWorkspaceMemberRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { setWorkspaceClaim } from "@/lib/server/setWorkspaceClaim";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

type WorkspacePostBody = {
  name?: string;
  logoUrl?: string | null;
  role?: string;
  companySize?: string;
};

type WorkspacePatchBody = {
  updates: Record<string, unknown>;
};

function unauthorizedResponse(req: NextRequest, errRes: Response): NextResponse {
  return new NextResponse(errRes.body, {
    status: errRes.status,
    statusText: errRes.statusText,
    headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
  });
}

/** POST /api/workspaces — legacy endpoint, now user-scoped only. */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  let body: WorkspacePostBody;
  try {
    body = (await req.json()) as WorkspacePostBody;
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "My Account";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const companySize = typeof body.companySize === "string" ? body.companySize.trim() : "";

  try {
    const userRef = adminDb.doc(`users/${user.uid}`);
    const preSnap = await userRef.get();
    if (preSnap.exists) {
      const preWid =
        typeof (preSnap.data() as { workspaceId?: unknown })?.workspaceId === "string"
          ? String((preSnap.data() as { workspaceId: string }).workspaceId).trim()
          : "";
      if (preWid) {
        // WS-002 FIX: ensure owner member doc exists even on early-return path
        // (handles workspaces created before Phase 2 fix and any race conditions)
        try {
          const existingMember = await getWorkspaceMemberRepo(preWid, user.uid);
          if (!existingMember) {
            await addWorkspaceMemberRepo(preWid, {
              uid: user.uid,
              email: user.email ?? "",
              displayName: user.displayName ?? null,
              avatarUrl: null,
              role: "OWNER",
              joinedAt: Timestamp.now(),
              invitedBy: null,
            });
            await addWorkspaceMembershipRepo(user.uid, preWid);
          }
        } catch (healErr) {
          // Non-fatal — log but continue. User can still use app.
          console.error("[WS-002 heal] member doc heal failed:", healErr);
        }
        await setWorkspaceClaim(user.uid, preWid);
        return apiSuccess(
          { workspaceId: preWid, userId: user.uid },
          null,
          { headers: corsHeaders(req) }
        );
      }
    }

    const workspaceRef = adminDb.collection("workspaces").doc();
    const newWorkspaceId = workspaceRef.id;
    const workspacePayload = defaultWorkspaceDoc({
      ownerId: user.uid,
      name,
      logoUrl: body.logoUrl ?? null,
    });

    await adminDb.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const existingWid =
        userSnap.exists &&
        typeof (userSnap.data() as { workspaceId?: unknown })?.workspaceId === "string"
          ? String((userSnap.data() as { workspaceId: string }).workspaceId).trim()
          : "";
      if (existingWid) {
        return;
      }

      tx.set(workspaceRef, {
        ...workspacePayload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (!userSnap.exists) {
        tx.set(userRef, {
          uid: user.uid,
          email: user.email ?? null,
          displayName: name,
          avatarUrl: body.logoUrl ?? null,
          workspaceId: newWorkspaceId,
          ...(role && { role }),
          ...(companySize && { companySize }),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        tx.set(
          userRef,
          {
            displayName: name,
            avatarUrl: body.logoUrl ?? null,
            workspaceId: newWorkspaceId,
            ...(role && { role }),
            ...(companySize && { companySize }),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    });

    const after = await userRef.get();
    const resolvedWid =
      typeof (after.data() as { workspaceId?: unknown } | undefined)?.workspaceId === "string"
        ? String((after.data() as { workspaceId: string }).workspaceId).trim()
        : "";
    if (!resolvedWid) {
      throw new Error("Missing workspaceId after workspace provisioning");
    }

    await setWorkspaceClaim(user.uid, resolvedWid);

    // WS-003 FIX: member doc write is critical — do not swallow
    try {
      const userSnap2 = await adminDb.doc(`users/${user.uid}`).get();
      const userData = (userSnap2.data() ?? {}) as Record<string, unknown>;
      await addWorkspaceMemberRepo(resolvedWid, {
        uid: user.uid,
        email: typeof userData.email === "string" ? userData.email : (user.email ?? ""),
        displayName: typeof userData.displayName === "string" ? userData.displayName : null,
        avatarUrl: typeof userData.avatarUrl === "string" ? userData.avatarUrl : null,
        role: "OWNER",
        joinedAt: Timestamp.now(),
        invitedBy: null,
      });
      await addWorkspaceMembershipRepo(user.uid, resolvedWid);
    } catch (memberErr) {
      console.error("[workspace creation] CRITICAL: member doc failed", memberErr);
      // Return error — client will retry. Workspace doc exists
      // but we report failure so client doesn't proceed with a broken state.
      return apiError({
        code: "INTERNAL_ERROR",
        message: "Workspace created but membership setup failed. Please refresh and try again.",
        status: 500,
        init: { headers: corsHeaders(req) },
      });
    }

    return apiSuccess(
      { workspaceId: resolvedWid, userId: user.uid },
      null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("POST /api/workspaces:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to upsert user profile",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}

/** PATCH /api/workspaces — legacy endpoint, applies user-scoped profile updates only. */
export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  let body: WorkspacePatchBody;
  try {
    body = (await req.json()) as WorkspacePatchBody;
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const updates =
    body.updates && typeof body.updates === "object" ? body.updates : null;

  if (!updates || Object.keys(updates).length === 0) {
    return apiError({
      code: "INVALID_INPUT",
      message: "updates are required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const forbiddenFields = ["billing", "plan", "usage", "ownerId"];
  for (const key of Object.keys(updates)) {
    if (forbiddenFields.includes(key)) {
      return apiError({
        code: "FORBIDDEN",
        message: `Forbidden field: ${key}`,
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
  }

  const allowedUpdates = {
    name:
      typeof updates.name === "string" && updates.name.trim()
        ? updates.name.trim()
        : undefined,
    logoUrl:
      typeof updates.logoUrl === "string" || updates.logoUrl === null
        ? updates.logoUrl
        : undefined,
  };

  const cleanedUpdates = Object.fromEntries(
    Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
  );

  if (Object.keys(cleanedUpdates).length === 0) {
    return apiError({
      code: "INVALID_INPUT",
      message: "No valid fields to update",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    await adminDb.doc(`workspaces/${workspaceId}`).set(
      {
        ...cleanedUpdates,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return apiSuccess({}, null, { headers: corsHeaders(req) });
  } catch (err) {
    console.error("PATCH /api/workspaces:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to update workspace",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
