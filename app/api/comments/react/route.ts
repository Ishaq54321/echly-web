import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { tryGetAuthUser } from "@/lib/server/auth/authorize";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import { composeFullName } from "@/lib/utils/nameSplit";

export async function POST(req: NextRequest) {
  const user = await tryGetAuthUser(req);
  if (!user) return apiError({ code: "UNAUTHORIZED", message: "Unauthorized", status: 401 });

  const uid = user.uid;

  let userName = "User";
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (userDoc.exists) {
    const userData = userDoc.data();
    const composed = composeFullName(
      typeof userData?.firstName === "string" ? userData.firstName : null,
      typeof userData?.lastName === "string" ? userData.lastName : null
    );
    const emailLocal =
      typeof userData?.email === "string" ? userData.email.split("@")[0] : "";
    userName = composed || emailLocal || "User";
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
  const reactionsBefore: Record<string, { userIds: string[]; userNames: string[] }> =
    data?.reactions ?? {};
  const existing = reactionsBefore[emoji] ?? { userIds: [], userNames: [] };
  const isAdding = existing.userIds.indexOf(uid) === -1;

  try {
    if (isAdding) {
      await commentRef.update({
        [`reactions.${emoji}.userIds`]: FieldValue.arrayUnion(uid),
        [`reactions.${emoji}.userNames`]: FieldValue.arrayUnion(userName),
      });
    } else {
      // Remove using the *stored* userName so display-name drift since the original
      // react doesn't leave a stale name behind in the parallel userNames array.
      const idx = existing.userIds.indexOf(uid);
      const storedName =
        idx >= 0 && typeof existing.userNames[idx] === "string"
          ? existing.userNames[idx]
          : userName;
      await commentRef.update({
        [`reactions.${emoji}.userIds`]: FieldValue.arrayRemove(uid),
        [`reactions.${emoji}.userNames`]: FieldValue.arrayRemove(storedName),
      });
    }
    // Re-read so the client receives the post-write authoritative shape.
    const fresh = await commentRef.get();
    const reactions = (fresh.data()?.reactions ?? {}) as Record<
      string,
      { userIds: string[]; userNames: string[] }
    >;
    return apiSuccess({ reactions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle reaction";
    console.error("POST /api/comments/react:", err);
    return apiError({ code: "INTERNAL_ERROR", message: msg, status: 500 });
  }
}
