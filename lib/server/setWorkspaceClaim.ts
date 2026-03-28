import "server-only";

import { adminAuth } from "@/lib/firebase/admin";

export async function setWorkspaceClaim(uid: string, workspaceId: string) {
  const user = await adminAuth.getUser(uid);
  const currentWorkspaceId = user.customClaims?.workspaceId;

  if (currentWorkspaceId === workspaceId) {
    return;
  }

  console.log("Setting claim for", uid, workspaceId);

  await adminAuth.setCustomUserClaims(uid, {
    ...user.customClaims,
    workspaceId,
  });
}
