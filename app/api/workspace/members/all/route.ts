import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import {
  getWorkspaceMembersRepo,
  getWorkspacePendingInvitationsRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { resolveUserAvatars } from "@/lib/utils/resolveUserAvatar";

export const dynamic = "force-dynamic";

export type UnifiedMemberRow = {
  id: string;
  type: "member" | "invitation";
  name: string | null;
  email: string;
  role: "OWNER" | "MEMBER";
  status: "active" | "pending";
  joinedAt: { seconds: number; nanoseconds: number } | null;
  avatarUrl: string | null;
  invitationToken: string | null;
};

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

    const [members, invitations] = await Promise.all([
      getWorkspaceMembersRepo(workspaceId),
      getWorkspacePendingInvitationsRepo(workspaceId),
    ]);

    // Phase 25.1: resolve avatars LIVE from users/{uid} — the member-doc
    // snapshot is captured at invite time and never re-synced on photo
    // change, so it overrides the stale snapshot here.
    const avatarMap = await resolveUserAvatars(members.map((m) => m.uid));

    const activeRows: UnifiedMemberRow[] = [
      ...members.filter((m) => m.role === "OWNER"),
      ...members
        .filter((m) => m.role !== "OWNER")
        .sort((a, b) => a.email.localeCompare(b.email)),
    ].map((m) => ({
      id: m.uid,
      type: "member" as const,
      name: m.displayName ?? null,
      email: m.email,
      role: m.role,
      status: "active" as const,
      joinedAt: m.joinedAt
        ? { seconds: m.joinedAt.seconds, nanoseconds: m.joinedAt.nanoseconds }
        : null,
      avatarUrl: avatarMap.get(m.uid) ?? m.avatarUrl ?? null,
      invitationToken: null,
    }));

    const pendingRows: UnifiedMemberRow[] = [...invitations]
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .map((inv) => ({
        id: inv.id,
        type: "invitation" as const,
        name: null,
        email: inv.email,
        role: inv.role,
        status: "pending" as const,
        joinedAt: inv.createdAt
          ? { seconds: inv.createdAt.seconds, nanoseconds: inv.createdAt.nanoseconds }
          : null,
        avatarUrl: null,
        invitationToken: inv.id,
      }));

    return apiSuccess({
      rows: [...activeRows, ...pendingRows],
      totalMembers: activeRows.length,
      totalPending: pendingRows.length,
    });
  } catch (err) {
    console.error("GET /api/workspace/members/all:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to load members", status: 500 });
  }
}
