import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { listSessionMembers } from "@/lib/repositories/sessionMembersRepository.server";
import { adminDb } from "@/lib/server/firebaseAdmin";

export const dynamic = "force-dynamic";

type InviteItem = {
  email: string;
  access: "view" | "resolve";
  status: "pending" | "active";
  createdAt: Date | null;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId: sessionIdRaw } = await params;
  const sessionId = typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
    });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (!context.access?.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have permission to view members",
      status: 403,
    });
  }

  const members = await listSessionMembers(sessionId);

  const invitesSnap = await adminDb.collection(`sessions/${sessionId}/invites`).get();

  const invites: InviteItem[] = invitesSnap.docs
    .map((doc) => {
      const data = doc.data();
      const email = typeof data.email === "string" ? data.email : "";
      const access = data.access === "resolve" ? "resolve" : data.access === "view" ? "view" : null;
      const status = data.status === "pending" ? "pending" : data.status === "active" ? "active" : null;
      if (!email || !access || !status) return null;

      return {
        email,
        access,
        status,
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    })
    .filter((item): item is InviteItem => item !== null);

  const items = [
    ...members.map((m) => ({
      type: "member" as const,
      id: m.userId,
      email: m.email,
      access: m.access,
      status: "active" as const,
      createdAt: m.createdAt,
    })),
    ...invites.map((i) => ({
      type: "invite" as const,
      id: i.email,
      email: i.email,
      access: i.access,
      status: i.status,
      createdAt: i.createdAt,
    })),
  ];

  items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "member" ? -1 : 1;
    }

    return (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0);
  });

  return apiSuccess({
    items,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId: sessionIdRaw } = await params;
  const sessionId = typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
    });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (!context.access?.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have permission",
      status: 403,
    });
  }

  if (!context.session) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  let body: { type?: unknown; id?: unknown; access?: unknown };
  try {
    body = (await req.json()) as { type?: unknown; id?: unknown; access?: unknown };
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
    });
  }

  const { type, id: idRaw, access } = body;

  if (!type || !idRaw) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid request",
    });
  }

  const id = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!id) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid request",
    });
  }

  if (access !== "view" && access !== "resolve") {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid access level",
    });
  }

  if (type === "member") {
    if (id === context.session.createdByUserId.trim()) {
      return apiError({
        code: "FORBIDDEN",
        message: "Cannot change the session owner's access",
        status: 403,
      });
    }

    const ref = adminDb.doc(`sessions/${sessionId}/members/${id}`);

    const snap = await ref.get();

    if (!snap.exists) {
      return apiError({
        code: "NOT_FOUND",
        message: "Member not found",
        status: 404,
      });
    }

    await ref.update({
      access,
    });

    return apiSuccess({
      type: "member_updated",
    });
  }

  if (type === "invite") {
    const snap = await adminDb
      .collection(`sessions/${sessionId}/invites`)
      .where("email", "==", id)
      .limit(1)
      .get();

    if (snap.empty) {
      return apiError({
        code: "NOT_FOUND",
        message: "Invite not found",
        status: 404,
      });
    }

    await snap.docs[0].ref.update({
      access,
    });

    return apiSuccess({
      type: "invite_updated",
    });
  }

  return apiError({
    code: "INVALID_INPUT",
    message: "Invalid type",
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId: sessionIdRaw } = await params;
  const sessionId = typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
    });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (!context.access?.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have permission",
      status: 403,
    });
  }

  if (!context.session) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  let body: { type?: unknown; id?: unknown };
  try {
    body = (await req.json()) as { type?: unknown; id?: unknown };
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
    });
  }

  const { type, id: idRaw } = body;

  if (!type || !idRaw) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid request",
    });
  }

  const id = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!id) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid request",
    });
  }

  if (type === "member") {
    if (id === context.session.createdByUserId.trim()) {
      return apiError({
        code: "FORBIDDEN",
        message: "Cannot remove the session owner",
        status: 403,
      });
    }

    const ref = adminDb.doc(`sessions/${sessionId}/members/${id}`);

    const snap = await ref.get();

    if (!snap.exists) {
      return apiError({
        code: "NOT_FOUND",
        message: "Member not found",
        status: 404,
      });
    }

    await ref.delete();

    return apiSuccess({
      type: "member_removed",
    });
  }

  if (type === "invite") {
    const snap = await adminDb
      .collection(`sessions/${sessionId}/invites`)
      .where("email", "==", id)
      .limit(1)
      .get();

    if (snap.empty) {
      return apiError({
        code: "NOT_FOUND",
        message: "Invite not found",
        status: 404,
      });
    }

    await snap.docs[0].ref.delete();

    return apiSuccess({
      type: "invite_removed",
    });
  }

  return apiError({
    code: "INVALID_INPUT",
    message: "Invalid type",
  });
}
