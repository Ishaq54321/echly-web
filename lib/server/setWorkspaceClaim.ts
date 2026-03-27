import "server-only";

import { adminAuth } from "@/lib/firebase/admin";

export async function setWorkspaceClaim(uid: string, workspaceId: string) {
  await adminAuth.setCustomUserClaims(uid, {
    workspaceId,
  });
}
