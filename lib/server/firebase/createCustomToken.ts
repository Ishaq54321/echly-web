import "server-only";

import "@/lib/server/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function createShareAuthToken(params: {
  sessionId: string;
  role: "VIEWER" | "RESOLVER";
}) {
  const { sessionId, role } = params;

  const uid = `share_${sessionId}_${Date.now()}`;

  const claims = {
    sessionId,
    role,
    isShareUser: true,
  };

  const auth = getAuth();

  const token = await auth.createCustomToken(uid, claims);

  return token;
}
