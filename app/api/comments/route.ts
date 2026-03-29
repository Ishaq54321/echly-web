import { NextResponse } from "next/server";
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

function badRequest(message: string): Response {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
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
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      feedbackId,
      ...(pre && pre.feedback !== undefined
        ? {
            feedback: pre.feedback as Feedback | null,
            session: pre.session as Session | null,
          }
        : {}),
    });
    if (!context.access?.canComment) {
      return NextResponse.json(
        { success: false, error: "Insufficient permission" },
        { status: 403 }
      );
    }
    if (context.session && context.session.id !== sessionId) {
      return NextResponse.json({ success: false, error: "Session mismatch" }, { status: 400 });
    }
    try {
      const id = await addCommentRepo(user.uid, sessionId, feedbackId, data);
      return NextResponse.json({ success: true, id });
    } catch (err) {
      if (err instanceof Error && err.message === ADD_COMMENT_FEEDBACK_MISSING) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      }
      console.error("POST /api/comments:", err);
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
  },
  {
    resolveWorkspace: async (req, user, _ctx, viewerWorkspaceId) => {
      const body = (await req.clone().json()) as {
        feedbackId?: string;
      };
      const feedbackId = typeof body.feedbackId === "string" ? body.feedbackId.trim() : "";
      const context = await buildRequestContext({
        userId: user.uid,
        userEmail: user.email,
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
    if (!comment) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const feedbackId = typeof comment.feedbackId === "string" ? comment.feedbackId : "";
    if (!feedbackId) return badRequest("Invalid comment feedback relation");

    const editsCommentBody =
      data.message !== undefined || data.position !== undefined;

    const pre = ctx.preloaded;
    const needsResolve = data.resolved !== undefined;
    const context = await buildRequestContext({
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      feedbackId,
      ...(pre && pre.feedback !== undefined
        ? {
            feedback: pre.feedback as Feedback | null,
            session: pre.session as Session | null,
          }
        : {}),
    });
    if (!context.feedback) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (needsResolve && !context.access?.canResolve) {
      return NextResponse.json(
        { success: false, error: "Insufficient permission" },
        { status: 403 }
      );
    }
    if (editsCommentBody && !context.access?.canComment) {
      return NextResponse.json(
        { success: false, error: "Insufficient permission" },
        { status: 403 }
      );
    }
    try {
      await updateCommentRepo(commentId, data);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("PATCH /api/comments:", err);
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
  },
  {
    resolveWorkspace: async (req, user, _ctx, viewerWorkspaceId) => {
      const body = (await req.clone().json()) as { commentId?: string };
      const commentId = typeof body.commentId === "string" ? body.commentId.trim() : "";
      const comment = commentId ? await getCommentByIdRepo(commentId) : null;
      const feedbackId = typeof comment?.feedbackId === "string" ? comment.feedbackId : "";
      const context = await buildRequestContext({
        userId: user.uid,
        userEmail: user.email,
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
    if (!comment) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const feedbackId = typeof comment.feedbackId === "string" ? comment.feedbackId : "";
    if (!feedbackId) return badRequest("Invalid comment feedback relation");

    const pre = ctx.preloaded;
    const context = await buildRequestContext({
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      feedbackId,
      ...(pre && pre.feedback !== undefined
        ? {
            feedback: pre.feedback as Feedback | null,
            session: pre.session as Session | null,
          }
        : {}),
    });
    if (!context.feedback) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!context.access?.canResolve) {
      return NextResponse.json(
        { success: false, error: "Insufficient permission" },
        { status: 403 }
      );
    }
    try {
      await deleteCommentRepo(commentId);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("DELETE /api/comments:", err);
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
  },
  {
    resolveWorkspace: async (req, user, _ctx, viewerWorkspaceId) => {
      const body = (await req.clone().json()) as { commentId?: string };
      const commentId = typeof body.commentId === "string" ? body.commentId.trim() : "";
      const comment = commentId ? await getCommentByIdRepo(commentId) : null;
      const feedbackId = typeof comment?.feedbackId === "string" ? comment.feedbackId : "";
      const context = await buildRequestContext({
        userId: user.uid,
        userEmail: user.email,
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
