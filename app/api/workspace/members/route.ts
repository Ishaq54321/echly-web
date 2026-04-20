import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { getWorkspaceMembersRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import type { WorkspaceMember } from "@/lib/domain/workspaceMember";
import { adminDb } from "@/lib/server/firebaseAdmin";

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

    const membersNeedingAvatar = sorted.filter((m) => !m.avatarUrl);
    let membersWithAvatars: WorkspaceMember[] = sorted;

    if (membersNeedingAvatar.length > 0) {
      const userRefs = membersNeedingAvatar.map((m) => adminDb.doc(`users/${m.uid}`));
      const userSnaps = await adminDb.getAll(...userRefs);

      const avatarByUid: Record<string, string | null> = {};
      userSnaps.forEach((snap, i) => {
        const uid = membersNeedingAvatar[i]!.uid;
        const data = snap.exists ? (snap.data() as Record<string, unknown>) : null;
        avatarByUid[uid] =
          typeof data?.avatarUrl === "string" ? data.avatarUrl :
          typeof data?.photoURL === "string" ? data.photoURL : null;
      });

      membersWithAvatars = sorted.map((m) => ({
        ...m,
        avatarUrl: m.avatarUrl ?? avatarByUid[m.uid] ?? null,
      }));
    }

    const serialized = membersWithAvatars.map((m) => ({
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
