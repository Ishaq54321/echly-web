import {
  ADD_COMMENT_FEEDBACK_MISSING,
  addCommentRepo,
  deleteCommentRepo,
  getCommentByIdRepo,
  updateCommentRepo,
  type AddCommentData,
} from "@/lib/repositories/commentsRepository.server";
import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

function badRequest(message: string) {
  return apiError({ code: "INVALID_INPUT", message, status: 400 });
}

type CommentRow = Record<string, unknown> & { feedbackId?: string };

export const POST = withAuthorization(
  "comment",
  async (req: Request, ctx, { user, userWorkspaceId }) => {
    let body: {
      sessionId?: string;
      feedbackId?: string;
      data?: AddCommentData;
    };
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const sessionId = body.sessionId?.trim();
    const feedbackId = body.feedbackId?.trim();
    const data = body.data;
    if (!sessionId || !feedbackId || !data) {
      return badRequest("Missing required fields");
    }

    const pre = ctx.preloaded;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      feedbackId,
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
    if (!context.access?.capabilities.canComment) {
      return apiError({ code: "FORBIDDEN", message: "Insufficient permission", status: 403 });
    }
    if (context.session && context.session.id !== sessionId) {
      return apiError({ code: "INVALID_INPUT", message: "Session mismatch", status: 400 });
    }
    try {
      const id = await addCommentRepo(user.uid, sessionId, feedbackId, data);
      return apiSuccess({ id });
    } catch (err) {
      if (err instanceof Error && err.message === ADD_COMMENT_FEEDBACK_MISSING) {
        return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
      }
      console.error("POST /api/comments:", err);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  {
    resolveWorkspace: async (req, user, _ctx, viewerWorkspaceId) => {
      const body = (await req.clone().json()) as {
        feedbackId?: string;
      };
      const feedbackId = typeof body.feedbackId === "string" ? body.feedbackId.trim() : "";
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
      };
    },
  }
);

export const PATCH = withAuthorization(
  "comment",
  async (req: Request, ctx, { user, userWorkspaceId }) => {
    let body: {
      commentId?: string;
      data?: { message?: string; resolved?: boolean; position?: { xPercent: number; yPercent: number } };
    };
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const commentId = body.commentId?.trim();
    const data = body.data;
    if (!commentId || !data) return badRequest("Missing required fields");

    const comment =
      ctx.preloaded?.comment !== undefined
        ? (ctx.preloaded.comment as CommentRow | null)
        : await getCommentByIdRepo(commentId);

    const feedbackId =
      comment && typeof comment.feedbackId === "string" ? comment.feedbackId.trim() : "";

    const editsCommentBody =
      data.message !== undefined || data.position !== undefined;

    const pre = ctx.preloaded;
    const needsResolve = data.resolved !== undefined;
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
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    if (!feedbackId) return badRequest("Invalid comment feedback relation");
    if (!context.feedback) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    if (needsResolve && !context.access?.capabilities.canResolve) {
      return apiError({ code: "FORBIDDEN", message: "Insufficient permission", status: 403 });
    }
    if (editsCommentBody && !context.access?.capabilities.canComment) {
      return apiError({ code: "FORBIDDEN", message: "Insufficient permission", status: 403 });
    }
    try {
      await updateCommentRepo(commentId, data);
      return apiSuccess({});
    } catch (err) {
      console.error("PATCH /api/comments:", err);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
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

export const DELETE = withAuthorization(
  "comment",
  async (req: Request, ctx, { user, userWorkspaceId }) => {
    let body: { commentId?: string };
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const commentId = body.commentId?.trim();
    if (!commentId) return badRequest("Missing required fields");

    const comment =
      ctx.preloaded?.comment !== undefined
        ? (ctx.preloaded.comment as CommentRow | null)
        : await getCommentByIdRepo(commentId);

    const feedbackId =
      comment && typeof comment.feedbackId === "string" ? comment.feedbackId.trim() : "";

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
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    if (!feedbackId) return badRequest("Invalid comment feedback relation");
    if (!context.feedback) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    const commentAuthor =
      typeof comment.userId === "string" ? comment.userId.trim() : "";
    const isOwn = commentAuthor === user.uid;
    const cap = context.access.capabilities;
    if (isOwn) {
      if (!cap.canDeleteOwnComment) {
        return apiError({ code: "FORBIDDEN", message: "Insufficient permission", status: 403 });
      }
    } else if (!cap.canResolve) {
      return apiError({ code: "FORBIDDEN", message: "Insufficient permission", status: 403 });
    }
    try {
      await deleteCommentRepo(commentId);
      return apiSuccess({});
    } catch (err) {
      console.error("DELETE /api/comments:", err);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
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
