import {
  deleteSessionRepo,
  getSessionByIdRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
  updateSessionAccessLevelRepo,
} from "@/lib/repositories/sessionsRepository.server";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { parseAccessLevelStrict } from "@/lib/domain/accessLevel";
import { serializeSession } from "@/lib/server/serializeSession";
import { hydrateOwnerBranding } from "@/lib/server/hydrateOwnerBranding";
import { log } from "@/lib/utils/logger";
import {
  withAuthorization,
  type HandlerContext,
  type HandlerUser,
} from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Session } from "@/lib/domain/session";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  createActivityEvent,
  resolveActorForActivityEvent,
} from "@/lib/repositories/activityEventsRepository.server";

type PatchBody = { title?: string; archived?: boolean; accessLevel?: string };

async function resolveSessionWorkspaceId(
  req: Request,
  user: HandlerUser,
  ctx: HandlerContext,
  viewerWorkspaceId: string
) {
  const id = await routeParamId(ctx);
  const context = await buildRequestContext({
    req,
    authenticatedUser: user,
    userWorkspaceId: viewerWorkspaceId,
    sessionId: id?.trim() || undefined,
  });
  return {
    workspaceId: context.sessionWorkspaceId ?? "",
    session: context.session,
  };
}

/**
 * GET /api/sessions/:id — optional auth.
 * Response: `{ success, data: { session, request }, access }` via {@link buildRequestContext} → {@link getAccessContext}.
 */
export async function GET(req: Request, ctx: HandlerContext) {
  const id = await routeParamId(ctx);
  if (!id) {
    return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
  }

  const loaded = await getSessionByIdRepo(id);
  if (!loaded) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }
  const context = await buildRequestContext({
    req,
    sessionId: id,
    session: loaded,
    optionalAuth: true,
  });
  const { access, session } = context;

  if (!access?.capabilities.canView) {
    return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
  }
  if (!session) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  const sessionWithBranding = await hydrateOwnerBranding(session);
  const sessionJson = serializeSession(sessionWithBranding, access);
  const request =
    context.accessRequest ?? ({ pendingResolve: false } as const);
  return apiSuccess({ session: sessionJson, request }, access);
}

/** PATCH /api/sessions/:id — update session; body: { title?: string, archived?: boolean }. */
export const PATCH = withAuthorization(
  "update_session",
  async (
    req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const start = Date.now();
    log("[API] PATCH /api/sessions/[sessionId] start");
    const id = await routeParamId(ctx);
    if (!id) {
      return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
    }
    let body: PatchBody;
    try {
      body = await req.json();
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
    }

    if (ctx.preloaded?.session === undefined) {
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!context.session) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    const sess = context.session;

    const hasTitle = typeof body.title === "string" && body.title.trim() !== "";
    const hasArchived = typeof body.archived === "boolean";
    const rawAccess = body.accessLevel;
    const hasAccessLevel = rawAccess !== undefined;
    const validAccessLevel: AccessLevel | null = hasAccessLevel
      ? parseAccessLevelStrict(typeof rawAccess === "string" ? rawAccess.trim() : rawAccess)
      : null;

    if (hasAccessLevel && validAccessLevel === null) {
      return apiError({ code: "INVALID_INPUT", message: "Invalid accessLevel", status: 400 });
    }

    if (validAccessLevel != null && !context.access?.capabilities.canResolve) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if ((hasTitle || hasArchived) && !context.access?.capabilities.canComment) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }

    const currentTitle = (sess.title ?? "").trim();
    const nextTitle = hasTitle ? body.title!.trim() : currentTitle;
    const titleChanged = hasTitle && nextTitle !== currentTitle;

    const currentlyArchived = sess.archived === true || sess.isArchived === true;
    const archiveChanged =
      hasArchived && body.archived !== currentlyArchived;

    const accessChanged =
      validAccessLevel != null && validAccessLevel !== sess.accessLevel;

    if (!titleChanged && !archiveChanged && !accessChanged) {
      return apiSuccess(
        {
          session: serializeSession(sess, context.access!),
          changedFields: [] as ("title" | "archived" | "accessLevel")[],
        },
        context.access!
      );
    }

    try {
      const changedFields: ("title" | "archived" | "accessLevel")[] = [];
      const tasks: Promise<void>[] = [];
      if (titleChanged) {
        changedFields.push("title");
        tasks.push(updateSessionTitleRepo(id, nextTitle));
      }
      if (archiveChanged) {
        changedFields.push("archived");
        const wid =
          typeof sess.workspaceId === "string" ? sess.workspaceId.trim() : "";
        tasks.push(updateSessionArchivedRepo(id, body.archived!, wid));
      }
      if (accessChanged && validAccessLevel != null) {
        changedFields.push("accessLevel");
        tasks.push(updateSessionAccessLevelRepo(id, validAccessLevel));
      }
      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      const workspaceId =
        typeof sess.workspaceId === "string" ? sess.workspaceId.trim() : "";
      const actorId = user.uid.trim();
      if (workspaceId && actorId) {
        const actor = await resolveActorForActivityEvent(actorId);
        const sessionTitleForMeta =
          (titleChanged ? nextTitle : currentTitle).trim() || "Untitled Session";
        if (archiveChanged && body.archived === true) {
          await createActivityEvent({
            workspaceId,
            sessionId: id,
            eventType: "session.archived",
            actorId,
            actorName: actor.actorName,
            actorPhotoURL: actor.actorPhotoURL,
            metadata: { sessionTitle: sessionTitleForMeta },
          });
        }
        const settingsChangedFields = changedFields.filter(
          (f) => !(f === "archived" && body.archived === true)
        );
        if (settingsChangedFields.length > 0) {
          await createActivityEvent({
            workspaceId,
            sessionId: id,
            eventType: "session.settings_changed",
            actorId,
            actorName: actor.actorName,
            actorPhotoURL: actor.actorPhotoURL,
            metadata: {
              sessionTitle: sessionTitleForMeta,
              changedFields: settingsChangedFields,
            },
          });
        }
      }

      const updated: Session = {
        ...sess,
        ...(titleChanged ? { title: nextTitle } : {}),
        ...(archiveChanged
          ? { archived: body.archived!, isArchived: body.archived! }
          : {}),
        ...(accessChanged && validAccessLevel != null
          ? { accessLevel: validAccessLevel }
          : {}),
        ...(tasks.length > 0 ? { updatedAt: new Date() } : {}),
      };
      log("[API] PATCH /api/sessions/[sessionId] duration:", Date.now() - start);
      return apiSuccess(
        {
          session: serializeSession(updated, context.access!),
          changedFields,
        },
        context.access!
      );
    } catch (err) {
      console.error("PATCH /api/sessions/[sessionId]:", err);
      log("[API] PATCH /api/sessions/[sessionId] duration (error):", Date.now() - start);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);

/** DELETE /api/sessions/:id — permanently delete session and all tickets/comments. */
export const DELETE = withAuthorization(
  "update_session",
  async (
    req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const start = Date.now();
    log("[API] DELETE /api/sessions/[sessionId] start");
    const id = await routeParamId(ctx);
    if (!id) {
      return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!context.access?.capabilities.canDeleteTicket) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!context.session) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    const sessionTitle = context.session.title ?? "Untitled Session";
    try {
      await deleteSessionRepo(id);
      const actorId = user.uid.trim();
      const workspaceId =
        typeof context.session.workspaceId === "string"
          ? context.session.workspaceId.trim()
          : "";
      if (actorId && workspaceId) {
        const resolvedActor = await resolveActorForActivityEvent(actorId);
        await createActivityEvent({
          workspaceId,
          sessionId: id,
          eventType: "session.deleted",
          actorId,
          actorName: resolvedActor.actorName,
          actorPhotoURL: resolvedActor.actorPhotoURL,
          metadata: { sessionTitle },
        });
      }
      log("[API] DELETE /api/sessions/[sessionId] duration:", Date.now() - start);
      return apiSuccess({}, context.access!);
    } catch (err) {
      console.error("DELETE /api/sessions/[sessionId]:", err);
      log("[API] DELETE /api/sessions/[sessionId] duration (error):", Date.now() - start);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);
