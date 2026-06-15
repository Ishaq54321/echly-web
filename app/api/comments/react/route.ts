import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getCommentByIdRepo } from "@/lib/repositories/commentsRepository.server";
import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import { resolveUserName, NAME_FALLBACK } from "@/lib/utils/nameSplit";

type Reaction = { userIds: string[]; userNames: string[] };
type CommentRow = Record<string, unknown> & {
  feedbackId?: string;
};

export const POST = withAuthorization(
  "comment",
  async (req: Request, ctx, { user, userWorkspaceId }) => {
    const uid = user.uid;

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

    const comment =
      ctx.preloaded?.comment !== undefined
        ? (ctx.preloaded.comment as CommentRow | null)
        : await getCommentByIdRepo(commentId.trim());

    const feedbackId =
      comment && typeof comment.feedbackId === "string" ? comment.feedbackId.trim() : "";

    // Authorization: react requires view access to the comment's session, same
    // as the other comment routes (see app/api/comments/route.ts PATCH/DELETE).
    const pre = ctx.preloaded;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      feedbackId: feedbackId || undefined,
      ...(pre && pre.feedback !== undefined
        ? {
            feedback: pre.feedback as Feedback | null,
            session: pre.session as Session | null,
          }
        : {}),
    });
    if (!context.access?.capabilities.canView) {
      return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
    }
    if (!comment) {
      return apiError({ code: "NOT_FOUND", message: "Comment not found", status: 404 });
    }
    if (!feedbackId) {
      return apiError({ code: "INVALID_INPUT", message: "Invalid comment feedback relation", status: 400 });
    }
    if (!context.feedback) {
      return apiError({ code: "NOT_FOUND", message: "Comment not found", status: 404 });
    }

    let userName: string = NAME_FALLBACK.UNKNOWN;
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      userName = resolveUserName({
        firstName:
          typeof userData?.firstName === "string" ? userData.firstName : null,
        lastName:
          typeof userData?.lastName === "string" ? userData.lastName : null,
        authDisplayName:
          typeof userData?.authDisplayName === "string"
            ? userData.authDisplayName
            : null,
        email: typeof userData?.email === "string" ? userData.email : null,
      });
    }

    const commentRef = adminDb.collection("comments").doc(commentId.trim());
    const reactionsBefore = (comment.reactions ?? {}) as Record<string, Reaction>;
    const existing: Reaction = reactionsBefore[emoji] ?? { userIds: [], userNames: [] };
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
      const reactions = (fresh.data()?.reactions ?? {}) as Record<string, Reaction>;
      return apiSuccess({ reactions });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle reaction";
      console.error("POST /api/comments/react:", err);
      return apiError({ code: "INTERNAL_ERROR", message: msg, status: 500 });
    }
  },
  {
    resolveWorkspace: async (req, user, _ctx, viewerWorkspaceId) => {
      const body = (await req.clone().json()) as { commentId?: string };
      const commentId = typeof body.commentId === "string" ? body.commentId.trim() : "";
      const comment = commentId ? await getCommentByIdRepo(commentId) : null;
      const feedbackId = typeof comment?.feedbackId === "string" ? comment.feedbackId : "";
      const context = await buildRequestContext({
        req,
        authenticatedUser: user,
        userWorkspaceId: viewerWorkspaceId,
        feedbackId: feedbackId || undefined,
      });
      return {
        workspaceId: context.sessionWorkspaceId ?? "",
        feedback: context.feedback,
        session: context.session,
        comment,
      };
    },
  }
);
