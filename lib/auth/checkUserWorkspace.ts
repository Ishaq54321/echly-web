import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";

/**
 * Determines post-login redirect: dashboard if user has a workspace, otherwise onboarding.
 */
export async function checkUserWorkspace(uid: string): Promise<"dashboard" | "onboarding"> {
  const workspaceId = await getUserWorkspaceIdRepo(uid);
  return workspaceId && workspaceId.trim() ? "dashboard" : "onboarding";
}
