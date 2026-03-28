import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  ensureUserRepo,
  updateUserFieldsRepo,
  getUserWorkspaceIdRepo,
} from "@/lib/repositories/usersRepository.server";
import { corsHeaders } from "@/lib/server/cors";
import { setWorkspaceClaim } from "@/lib/server/setWorkspaceClaim";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

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
  } catch (res) {
    return unauthorizedResponse(req, res as Response);
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
        return NextResponse.json(
          { success: true, workspaceId: null },
          { headers: corsHeaders(req) }
        );
      }
      throw inner;
    }
    await setWorkspaceClaim(user.uid, workspaceId);
    return NextResponse.json(
      { success: true, workspaceId },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("POST /api/users:", err);
    return NextResponse.json(
      { success: false, error: "Failed to ensure user" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

/** PATCH /api/users — update user profile fields. */
export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return unauthorizedResponse(req, res as Response);
  }

  let body: UserPatchBody;
  try {
    body = (await req.json()) as UserPatchBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const role = typeof body.role === "string" ? body.role.trim() : "";
  const companySize = typeof body.companySize === "string" ? body.companySize.trim() : "";

  if (!role && !companySize) {
    return NextResponse.json(
      { success: false, error: "No updates provided" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  try {
    await updateUserFieldsRepo(user.uid, {
      role: role || undefined,
      companySize: companySize || undefined,
    });
    return NextResponse.json({ success: true }, { headers: corsHeaders(req) });
  } catch (err) {
    console.error("PATCH /api/users:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
