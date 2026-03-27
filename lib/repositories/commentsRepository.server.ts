import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";

/**
 * Server-only subset of comments repository.
 * Use this from API routes / other server repositories.
 *
 * (Client realtime helpers stay in `commentsRepository.ts` for now.)
 */

const DELETE_SESSION_COMMENTS_LIMIT = 500;

/**
 * Deletes all comments for a session. Used when deleting a session.
 * Returns the number of docs deleted so callers can update workspace.stats.
 */
export async function deleteAllCommentsForSessionRepo(
  sessionId: string
): Promise<number> {
  const snapshot = await adminDb
    .collection("comments")
    .where("sessionId", "==", sessionId)
    .limit(DELETE_SESSION_COMMENTS_LIMIT)
    .get();
  const count = snapshot.docs.length;
  await Promise.all(snapshot.docs.map((d) => d.ref.delete()));
  return count;
}

