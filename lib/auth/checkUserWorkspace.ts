import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

/**
 * Determines post-login redirect: dashboard if user has a workspace, otherwise onboarding.
 * System/transport failures propagate; only the domain "no workspace" case maps to onboarding.
 */
export async function checkUserWorkspace(uid: string): Promise<"dashboard" | "onboarding"> {
  try {
    await getUserWorkspaceIdRepo(uid);
    return "dashboard";
  } catch (e) {
    if (e instanceof Error && e.message === MISSING_USER_WORKSPACE_ERROR) {
      return "onboarding";
    }
    throw e;
  }
}
