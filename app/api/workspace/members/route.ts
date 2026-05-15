import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { getWorkspaceMembersRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import type { WorkspaceMember } from "@/lib/domain/workspaceMember";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { resolveUserName } from "@/lib/utils/nameSplit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);

    const members = await getWorkspaceMembersRepo(workspaceId);

    const sorted: WorkspaceMember[] = [
      ...members.filter((m) => m.role === "OWNER"),
      ...members
        .filter((m) => m.role !== "OWNER")
        .sort((a, b) =>
          (a.displayName ?? a.email).localeCompare(b.displayName ?? b.email)
        ),
    ];

    // Always read the LATEST user doc for every member. This sidesteps
    // member-doc staleness on read paths: resolveUserName composes from the
    // fresh users/{uid} data, falling back to the member-doc snapshot only
    // when the user doc is missing (defensive — shouldn't happen).
    const userRefs = sorted.map((m) => adminDb.doc(`users/${m.uid}`));
    const userSnaps =
      userRefs.length > 0 ? await adminDb.getAll(...userRefs) : [];

    const userByUid: Record<string, Record<string, unknown> | null> = {};
    userSnaps.forEach((snap, i) => {
      userByUid[sorted[i]!.uid] = snap.exists
        ? (snap.data() as Record<string, unknown>)
        : null;
    });

    const enriched: WorkspaceMember[] = sorted.map((m) => {
      const data = userByUid[m.uid] ?? null;
      const avatarFromUser =
        typeof data?.avatarUrl === "string"
          ? data.avatarUrl
          : typeof data?.photoURL === "string"
            ? data.photoURL
            : null;

      return {
        ...m,
        // Phase 25.1: live users/{uid} avatar OVERRIDES the member-doc
        // snapshot (which is captured at invite time and goes stale on
        // photo change — there is no fan-out). Snapshot is only a
        // defensive fallback if the user doc is missing entirely.
        avatarUrl: avatarFromUser ?? m.avatarUrl ?? null,
        displayName: resolveUserName({
          firstName:
            typeof data?.firstName === "string" ? data.firstName : null,
          lastName: typeof data?.lastName === "string" ? data.lastName : null,
          authDisplayName:
            typeof data?.authDisplayName === "string"
              ? data.authDisplayName
              : null,
          // Defensive: fall back to the member-doc snapshot if the user doc
          // is missing entirely.
          displayName: m.displayName,
          email: m.email ?? (typeof data?.email === "string" ? data.email : null),
        }),
      };
    });

    const serialized = enriched.map((m) => ({
      ...m,
      joinedAt: m.joinedAt
        ? { seconds: m.joinedAt.seconds, nanoseconds: m.joinedAt.nanoseconds }
        : null,
    }));

    return apiSuccess({ members: serialized });
  } catch (err) {
    console.error("GET /api/workspace/members:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to load members", status: 500 });
  }
}
