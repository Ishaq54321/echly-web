import { NextResponse } from "next/server";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  addCommentRepo,
  deleteCommentRepo,
  getCommentByIdRepo,
  updateCommentRepo,
  type AddCommentData,
} from "@/lib/repositories/commentsRepository.server";
import { requireTicketActorPermission } from "@/lib/server/sessionActorPermissions";
import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { sessionWorkspaceId, userWorkspaceMatchesSession } from "@/lib/server/sessionWorkspaceScope";

function badRequest(message: string): Response {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export const POST = withAuthorization(
  "comment",
  async (req: Request, _ctx, { user }) => {

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

  const feedback = await getFeedbackByIdRepo(feedbackId);
  if (!feedback) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  const session = await getSessionByIdRepo(feedback.sessionId);
  if (!session || session.id !== sessionId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const gate = await requireTicketActorPermission(user, feedback, session, "comment");
  if (!gate.ok) {
    return NextResponse.json(
      { success: false, error: gate.message },
      { status: gate.status }
    );
  }

  if (!(await userWorkspaceMatchesSession(user.uid, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const id = await addCommentRepo(user.uid, sessionId, feedbackId, data);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("POST /api/comments:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
  },
  {
    resolveWorkspace: async (req) => {
      const body = (await req.clone().json()) as {
        feedbackId?: string;
      };
      const feedbackId = typeof body.feedbackId === "string" ? body.feedbackId.trim() : "";
      const feedback = feedbackId ? await getFeedbackByIdRepo(feedbackId) : null;
      const session = feedback ? await getSessionByIdRepo(feedback.sessionId) : null;
      return sessionWorkspaceId(session) ?? "";
    },
  }
);

export const PATCH = withAuthorization(
  "comment",
  async (req: Request, _ctx, { user }) => {

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

  const comment = await getCommentByIdRepo(commentId);
  if (!comment) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const feedbackId = typeof comment.feedbackId === "string" ? comment.feedbackId : "";
  if (!feedbackId) return badRequest("Invalid comment feedback relation");
  const feedback = await getFeedbackByIdRepo(feedbackId);
  if (!feedback) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  const session = await getSessionByIdRepo(feedback.sessionId);
  if (!(await userWorkspaceMatchesSession(user.uid, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const required = data.resolved !== undefined ? "resolve" : "comment";
  const gate = await requireTicketActorPermission(user, feedback, session, required);
  if (!gate.ok) {
    return NextResponse.json(
      { success: false, error: gate.message },
      { status: gate.status }
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
    resolveWorkspace: async (req) => {
      const body = (await req.clone().json()) as { commentId?: string };
      const commentId = typeof body.commentId === "string" ? body.commentId.trim() : "";
      const comment = commentId ? await getCommentByIdRepo(commentId) : null;
      const feedbackId = typeof comment?.feedbackId === "string" ? comment.feedbackId : "";
      const feedback = feedbackId ? await getFeedbackByIdRepo(feedbackId) : null;
      const session = feedback ? await getSessionByIdRepo(feedback.sessionId) : null;
      return sessionWorkspaceId(session) ?? "";
    },
  }
);

export const DELETE = withAuthorization(
  "comment",
  async (req: Request, _ctx, { user }) => {

  let body: { commentId?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const commentId = body.commentId?.trim();
  if (!commentId) return badRequest("Missing required fields");

  const comment = await getCommentByIdRepo(commentId);
  if (!comment) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const feedbackId = typeof comment.feedbackId === "string" ? comment.feedbackId : "";
  if (!feedbackId) return badRequest("Invalid comment feedback relation");
  const feedback = await getFeedbackByIdRepo(feedbackId);
  if (!feedback) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  const session = await getSessionByIdRepo(feedback.sessionId);
  if (!(await userWorkspaceMatchesSession(user.uid, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const gate = await requireTicketActorPermission(user, feedback, session, "comment");
  if (!gate.ok) {
    return NextResponse.json(
      { success: false, error: gate.message },
      { status: gate.status }
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
    resolveWorkspace: async (req) => {
      const body = (await req.clone().json()) as { commentId?: string };
      const commentId = typeof body.commentId === "string" ? body.commentId.trim() : "";
      const comment = commentId ? await getCommentByIdRepo(commentId) : null;
      const feedbackId = typeof comment?.feedbackId === "string" ? comment.feedbackId : "";
      const feedback = feedbackId ? await getFeedbackByIdRepo(feedbackId) : null;
      const session = feedback ? await getSessionByIdRepo(feedback.sessionId) : null;
      return sessionWorkspaceId(session) ?? "";
    },
  }
);
