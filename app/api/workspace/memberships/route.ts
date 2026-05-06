import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { addWorkspaceMembershipRepo } from "@/lib/repositories/userMembershipsRepository.server";
import type { WorkspacePlan } from "@/lib/domain/workspace";

export const dynamic = "force-dynamic";

export type WorkspaceMembership = {
  workspaceId: string;
  name: string;
  logoUrl: string | null;
  plan: string;
  isOwner: boolean;
};

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const userSnap = await adminDb.doc(`users/${user.uid}`).get();
    const userData = (userSnap.exists ? userSnap.data() ?? {} : {}) as Record<string, unknown>;

    const rawMemberships = userData.workspaceMemberships;
    const membershipIds: string[] = Array.isArray(rawMemberships)
      ? (rawMemberships as unknown[]).filter((v): v is string => typeof v === "string" && v.trim() !== "")
      : [];
    const wasInArray = new Set(membershipIds);

    // Also include their own workspaceId if not already present
    const ownWid = typeof userData.workspaceId === "string" ? userData.workspaceId.trim() : "";
    if (ownWid && !wasInArray.has(ownWid)) {
      membershipIds.push(ownWid);
      // Self-heal: persist the missing entry so future reads don't need this fallback.
      // Idempotent (arrayUnion). Fire-and-forget — does not block the response.
      addWorkspaceMembershipRepo(user.uid, ownWid).catch((err) => {
        console.warn("[memberships] self-heal failed", { uid: user.uid, wid: ownWid, err });
      });
    }

    if (membershipIds.length === 0) {
      return apiSuccess({ memberships: [] });
    }

    const workspaceDocs = await Promise.all(
      membershipIds.map((wid) => adminDb.doc(`workspaces/${wid}`).get())
    );

    const memberships: WorkspaceMembership[] = workspaceDocs
      .filter((snap) => snap.exists)
      .map((snap) => {
        const data = (snap.data() ?? {}) as Record<string, unknown>;
        const billing = data.billing as { plan?: WorkspacePlan } | undefined;
        return {
          workspaceId: snap.id,
          name: typeof data.name === "string" ? data.name : "Workspace",
          logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : null,
          plan: billing?.plan ?? "free",
          isOwner: data.ownerId === user.uid,
        };
      });

    // Sort: user's own workspace first, then alphabetically
    memberships.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      return a.name.localeCompare(b.name);
    });

    return apiSuccess({ memberships });
  } catch (err) {
    console.error("GET /api/workspace/memberships:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to load memberships", status: 500 });
  }
}
