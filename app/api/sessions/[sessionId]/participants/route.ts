import { NextRequest } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import { tryGetAuthUser } from "@/lib/server/auth/authorize";
import { resolveUserName } from "@/lib/utils/nameSplit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await tryGetAuthUser(req);
    if (!user?.uid) return apiError({ code: "UNAUTHORIZED", message: "Unauthorized", status: 401 });

    const { sessionId } = await params;
    if (!sessionId) return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });

    const membersSnap = await adminDb.collection("sessions").doc(sessionId).collection("members").get();

    const userIds = new Set<string>();
    membersSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.userId) userIds.add(data.userId);
    });

    const sessionDoc = await adminDb.collection("sessions").doc(sessionId).get();
    const sessionData = sessionDoc.data();
    if (sessionData?.userId) userIds.add(sessionData.userId);
    if (sessionData?.createdByUserId) userIds.add(sessionData.createdByUserId);

    // Fetch workspace members
    const workspaceId = sessionData?.workspaceId;
    if (workspaceId) {
      const workspaceMembersSnap = await adminDb.collection("workspaces").doc(workspaceId).collection("members").get();
      workspaceMembersSnap.docs.forEach((doc) => {
        const uid = doc.id || doc.data()?.userId;
        if (uid) userIds.add(uid);
      });
    }

    const participants: { uid: string; displayName: string; email: string; avatarUrl: string | null }[] = [];

    const userDocs = await Promise.all(
      Array.from(userIds).map((uid) => adminDb.collection("users").doc(uid).get())
    );

    userDocs.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data();
        participants.push({
          uid: doc.id,
          displayName: resolveUserName({
            firstName:
              typeof data?.firstName === "string" ? data.firstName : null,
            lastName:
              typeof data?.lastName === "string" ? data.lastName : null,
            authDisplayName:
              typeof data?.authDisplayName === "string"
                ? data.authDisplayName
                : null,
            email: typeof data?.email === "string" ? data.email : null,
          }),
          email: data?.email || "",
          // Phase 25.1: avatarUrl (uploaded) takes precedence over the
          // legacy/OAuth photoURL — match resolveUserAvatar ordering.
          avatarUrl: data?.avatarUrl || data?.photoURL || null,
        });
      }
    });

    return apiSuccess({ participants });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch participants";
    return apiError({ code: "INTERNAL_ERROR", message, status: 500 });
  }
}
