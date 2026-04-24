import { NextRequest } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { tryGetAuthUser } from "@/lib/server/auth/authorize";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";

export async function POST(req: NextRequest) {
  const user = await tryGetAuthUser(req);
  if (!user) return apiError({ code: "UNAUTHORIZED", message: "Unauthorized", status: 401 });

  const uid = user.uid;

  let userName = "User";
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (userDoc.exists) {
    const userData = userDoc.data();
    userName = userData?.displayName || userData?.name || "User";
  }

  let body: { commentId?: string; emoji?: string };
  try {
    body = await req.json();
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const { commentId, emoji } = body;
  if (!commentId || !emoji) {
    return apiError({ code: "INVALID_INPUT", message: "Missing commentId or emoji", status: 400 });
  }

  const commentRef = adminDb.collection("comments").doc(commentId);
  const commentSnap = await commentRef.get();
  if (!commentSnap.exists) {
    return apiError({ code: "NOT_FOUND", message: "Comment not found", status: 404 });
  }

  const data = commentSnap.data();
  const reactions: Record<string, { userIds: string[]; userNames: string[] }> = data?.reactions ?? {};
  const existing = reactions[emoji] ?? { userIds: [], userNames: [] };

  const userIndex = existing.userIds.indexOf(uid);
  if (userIndex > -1) {
    existing.userIds.splice(userIndex, 1);
    existing.userNames.splice(userIndex, 1);
    if (existing.userIds.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = existing;
    }
  } else {
    existing.userIds.push(uid);
    existing.userNames.push(userName);
    reactions[emoji] = existing;
  }

  try {
    await commentRef.update({ reactions });
    return apiSuccess({ reactions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle reaction";
    console.error("POST /api/comments/react:", err);
    return apiError({ code: "INTERNAL_ERROR", message: msg, status: 500 });
  }
}
