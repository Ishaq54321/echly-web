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

export const dynamic = "force-dynamic";

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

    return apiSuccess(
      {
        uid: user.uid,
        email: user.email ?? null,
        displayName: (data.displayName as string | undefined) ?? userRecord.displayName ?? null,
        avatarUrl: (data.avatarUrl as string | undefined) ?? null,
        authProvider,
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
  displayName?: string;
};

function unauthorizedResponse(req: NextRequest, errRes: Response): NextResponse {
  return new NextResponse(errRes.body, {
    status: errRes.status,
    statusText: errRes.statusText,
    headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
  });
}

/** POST /api/users — ensure user exists. */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  try {
    const existingSnap = await adminDb.doc(`users/${user.uid}`).get();
    if (existingSnap.exists) {
      const data = existingSnap.data() as Record<string, unknown>;
      const storedWorkspaceId = typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
      if (storedWorkspaceId) {
        await setWorkspaceClaim(user.uid, storedWorkspaceId);
        return apiSuccess(
          { workspaceId: storedWorkspaceId, avatarUrl: (data.avatarUrl as string | undefined) ?? null },
          null,
          { headers: corsHeaders(req) }
        );
      }
    }

    const { workspaceId, avatarUrl } = await ensureUserRepo({
      uid: user.uid,
      email: user.email ?? null,
    });
    await setWorkspaceClaim(user.uid, workspaceId);
    return apiSuccess({ workspaceId, avatarUrl }, null, { headers: corsHeaders(req) });
  } catch (err) {
    console.error("POST /api/users:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to ensure user",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
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
  const rawDisplayName = typeof body.displayName === "string" ? body.displayName.trim() : "";

  if (!role && !companySize && !rawDisplayName) {
    return apiError({
      code: "INVALID_INPUT",
      message: "No updates provided",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  if (rawDisplayName && rawDisplayName.length > 60) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Display name must be 60 characters or fewer",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const displayName = rawDisplayName;

  try {
    if (displayName) {
      await adminDb.doc(`users/${user.uid}`).set(
        {
          displayName,
          name: displayName,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await getAuth().updateUser(user.uid, { displayName });
    }
    if (role || companySize) {
      await updateUserFieldsRepo(user.uid, {
        role: role || undefined,
        companySize: companySize || undefined,
      });
    }
    return apiSuccess(
      displayName ? { displayName } : {},
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
