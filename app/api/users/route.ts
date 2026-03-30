import type { NextRequest } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import {
  ensureUserRepo,
  updateUserFieldsRepo,
  getUserWorkspaceIdRepo,
} from "@/lib/repositories/usersRepository.server";
import { corsHeaders } from "@/lib/server/cors";
import { setWorkspaceClaim } from "@/lib/server/setWorkspaceClaim";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

type UserPatchBody = {
  role?: string;
  companySize?: string;
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
    await ensureUserRepo({
      uid: user.uid,
      email: user.email ?? null,
    });
    let workspaceId: string;
    try {
      workspaceId = await getUserWorkspaceIdRepo(user.uid);
    } catch (inner) {
      if (
        inner instanceof Error &&
        inner.message === MISSING_USER_WORKSPACE_ERROR
      ) {
        return apiSuccess({ workspaceId: null }, null, {
          headers: corsHeaders(req),
        });
      }
      throw inner;
    }
    await setWorkspaceClaim(user.uid, workspaceId);
    return apiSuccess({ workspaceId }, null, { headers: corsHeaders(req) });
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

  if (!role && !companySize) {
    return apiError({
      code: "INVALID_INPUT",
      message: "No updates provided",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    await updateUserFieldsRepo(user.uid, {
      role: role || undefined,
      companySize: companySize || undefined,
    });
    return apiSuccess({}, null, { headers: corsHeaders(req) });
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
