import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/server/auth";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { setWorkspaceClaim } from "@/lib/server/setWorkspaceClaim";

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
  } catch (res) {
    return unauthorizedResponse(req, res as Response);
  }

  let body: WorkspacePostBody;
  try {
    body = (await req.json()) as WorkspacePostBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders(req) }
    );
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
        await setWorkspaceClaim(user.uid, preWid);
        return NextResponse.json(
          { success: true, workspaceId: preWid, userId: user.uid },
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
    return NextResponse.json(
      { success: true, workspaceId: resolvedWid, userId: user.uid },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("POST /api/workspaces:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upsert user profile" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

/** PATCH /api/workspaces — legacy endpoint, applies user-scoped profile updates only. */
export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return unauthorizedResponse(req, res as Response);
  }

  let body: WorkspacePatchBody;
  try {
    body = (await req.json()) as WorkspacePatchBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const updates =
    body.updates && typeof body.updates === "object" ? body.updates : null;

  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, error: "updates are required" },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const forbiddenFields = ["billing", "plan", "usage", "ownerId"];
  for (const key of Object.keys(updates)) {
    if (forbiddenFields.includes(key)) {
      return NextResponse.json(
        { success: false, error: `Forbidden field: ${key}` },
        { status: 403, headers: corsHeaders(req) }
      );
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
    return NextResponse.json(
      { success: false, error: "No valid fields to update" },
      { status: 400, headers: corsHeaders(req) }
    );
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
    return NextResponse.json({ success: true }, { headers: corsHeaders(req) });
  } catch (err) {
    console.error("PATCH /api/workspaces:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update workspace" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
