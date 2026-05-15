/*
 * POST handler removed in Fix #1. Onboarding completion now flows through
 * POST /api/onboarding. PATCH handler remains for workspace settings updates.
 */
import type { NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspaceMemberRepo, addWorkspaceMemberRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { addWorkspaceMembershipRepo } from "@/lib/repositories/userMembershipsRepository.server";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { NextResponse } from "next/server";
import { generateSlug, isValidSlug } from "@/lib/utils/slugify";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";
import {
  MAX_WORKSPACES_PER_USER,
  assertCanJoinAnotherWorkspace,
  WorkspaceLimitError,
} from "@/lib/domain/workspaceLimits";

/**
 * Atomically reserves `slug` for `workspaceId` (writing slugs/{slug}) and
 * releases the previous slug if any. Throws "SLUG_TAKEN" if another workspace
 * already owns it.
 */
async function reserveSlug(opts: {
  workspaceId: string;
  newSlug: string;
  previousSlug?: string | null;
}): Promise<void> {
  const { workspaceId, newSlug, previousSlug } = opts;
  const newRef = adminDb.doc(`slugs/${newSlug}`);
  const prevRef =
    previousSlug && previousSlug !== newSlug
      ? adminDb.doc(`slugs/${previousSlug}`)
      : null;

  await adminDb.runTransaction(async (tx) => {
    const newSnap = await tx.get(newRef);
    if (newSnap.exists) {
      const data = (newSnap.data() ?? {}) as Record<string, unknown>;
      if (data.workspaceId !== workspaceId) {
        throw new Error("SLUG_TAKEN");
      }
      // Already owned by this workspace — no-op write.
      return;
    }
    tx.set(newRef, {
      workspaceId,
      createdAt: FieldValue.serverTimestamp(),
    });
    if (prevRef) {
      tx.delete(prevRef);
    }
  });
}

const MAX_WORKSPACE_NAME_LEN = 80;

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

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

/** POST /api/workspaces — creates an additional workspace for an authenticated user.
 *  Does NOT change the user's active workspaceId. The caller switches via switchWorkspace().
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  let body: { name?: string; slug?: string };
  try {
    body = (await req.json()) as { name?: string; slug?: string };
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return apiError({
      code: "INVALID_INPUT",
      message: "name is required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }
  if (name.length > MAX_WORKSPACE_NAME_LEN) {
    return apiError({
      code: "INVALID_INPUT",
      message: `name must be ${MAX_WORKSPACE_NAME_LEN} characters or fewer`,
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const requestedSlug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const slugCandidate = requestedSlug || generateSlug(name);
  if (slugCandidate && !isValidSlug(slugCandidate)) {
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
        message: "User not found",
        status: 404,
        init: { headers: corsHeaders(req) },
      });
    }
    const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
    const ownerEmail =
      typeof userData.email === "string" ? userData.email : (user.email ?? "");
    const firstNameStr = typeof userData.firstName === "string" ? userData.firstName : "";
    const lastNameStr = typeof userData.lastName === "string" ? userData.lastName : "";
    const composedName = `${firstNameStr} ${lastNameStr}`.trim();
    const ownerName = composedName || null;
    const ownerAvatarUrl =
      typeof userData.avatarUrl === "string" ? userData.avatarUrl : null;

    const currentMemberships: string[] = Array.isArray(userData.workspaceMemberships)
      ? (userData.workspaceMemberships as unknown[]).filter(
          (v): v is string => typeof v === "string" && v.trim() !== ""
        )
      : [];
    try {
      // Pass a sentinel that won't be in the array so creating a NEW workspace
      // always counts as adding one (forces the cap check).
      assertCanJoinAnotherWorkspace(currentMemberships, "__new__");
    } catch (err) {
      if (err instanceof WorkspaceLimitError) {
        return apiError({
          code: "FORBIDDEN",
          message: `You're in the maximum ${MAX_WORKSPACES_PER_USER} workspaces. Please contact the Annote team to be added to more, or leave one of your current workspaces.`,
          status: 403,
          data: {
            reason: "WORKSPACE_LIMIT_REACHED",
            currentCount: err.currentCount,
            max: MAX_WORKSPACES_PER_USER,
          },
          init: { headers: corsHeaders(req) },
        });
      }
      throw err;
    }

    const newRef = adminDb.collection("workspaces").doc();

    // Reserve slug before writing the workspace doc so a duplicate slug fails fast.
    let finalSlug: string | null = null;
    if (slugCandidate) {
      try {
        await reserveSlug({ workspaceId: newRef.id, newSlug: slugCandidate });
        finalSlug = slugCandidate;
      } catch (err) {
        if ((err as Error).message === "SLUG_TAKEN") {
          return apiError({
            code: "INVALID_INPUT",
            message: "SLUG_TAKEN",
            status: 409,
            init: { headers: corsHeaders(req) },
          });
        }
        throw err;
      }
    }

    const payload = defaultWorkspaceDoc({
      ownerId: user.uid,
      name,
      logoUrl: null,
      slug: finalSlug,
    });
    await newRef.set({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await addWorkspaceMemberRepo(newRef.id, {
      uid: user.uid,
      email: ownerEmail,
      displayName: ownerName,
      avatarUrl: ownerAvatarUrl,
      role: "OWNER",
      joinedAt: Timestamp.now(),
      invitedBy: null,
    });
    await addWorkspaceMembershipRepo(user.uid, newRef.id);

    // The newly created workspace becomes the user's active workspace
    // (matches "default to most recently used").
    await userRef.set(
      {
        workspaceId: newRef.id,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedMemberships = currentMemberships.includes(newRef.id)
      ? currentMemberships
      : [...currentMemberships, newRef.id];
    await setWorkspaceClaims(user.uid, newRef.id, updatedMemberships);

    return apiSuccess(
      { workspaceId: newRef.id, name, logoUrl: null },
      null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("POST /api/workspaces:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to create workspace",
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

  const slugInput =
    typeof updates.slug === "string" ? updates.slug.trim().toLowerCase() : undefined;

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

  if (Object.keys(cleanedUpdates).length === 0 && slugInput === undefined) {
    return apiError({
      code: "INVALID_INPUT",
      message: "No valid fields to update",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  if (slugInput !== undefined && slugInput && !isValidSlug(slugInput)) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid slug format",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({
        code: "FORBIDDEN",
        message: "Only workspace owners can update workspace settings",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }

    // Reserve the new slug atomically before touching the workspace doc.
    if (slugInput !== undefined && slugInput) {
      try {
        const wsSnap = await adminDb.doc(`workspaces/${workspaceId}`).get();
        const prevSlug =
          typeof wsSnap.data()?.slug === "string"
            ? (wsSnap.data()!.slug as string)
            : null;
        await reserveSlug({
          workspaceId,
          newSlug: slugInput,
          previousSlug: prevSlug,
        });
        (cleanedUpdates as Record<string, unknown>).slug = slugInput;
      } catch (err) {
        if ((err as Error).message === "SLUG_TAKEN") {
          return apiError({
            code: "INVALID_INPUT",
            message: "SLUG_TAKEN",
            status: 409,
            init: { headers: corsHeaders(req) },
          });
        }
        throw err;
      }
    }

    await adminDb.doc(`workspaces/${workspaceId}`).set(
      {
        ...cleanedUpdates,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return apiSuccess({ slug: (cleanedUpdates as Record<string, unknown>).slug ?? null }, null, { headers: corsHeaders(req) });
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
