import type { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  getUserWorkspaceIdRepo,
  getUserByIdRepo,
} from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import {
  getWorkspaceMemberRepo,
  createWorkspaceInvitationRepo,
  getWorkspaceInvitationByEmailRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { sendWorkspaceInviteEmail } from "@/lib/email/workspaceEmails";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { createNotification } from "@/lib/repositories/notificationsRepository.server";
import type { WorkspaceMemberRole } from "@/lib/domain/workspaceMember";
import { checkPlanLimit } from "@/lib/billing/checkPlanLimit";
import type { PlanLimitError } from "@/lib/billing/checkPlanLimit";
import { planLimitReachedApiError } from "@/lib/billing/planLimitResponse";
import { resolveUserName } from "@/lib/utils/nameSplit";
import { checkRateLimit } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BATCH = 20;

type InviteStatus =
  | "invited"
  | "already_member"
  | "already_invited"
  | "invalid"
  | "error"
  | "limit_reached";

type Result = { email: string; status: InviteStatus; message?: string };

function resolveInviterName(
  data: Record<string, unknown> | null | undefined,
  fallbackEmail: string | null | undefined
): string {
  // "Someone" stays as the very last resort for notification copy
  // ("Someone invited you …"); resolveUserName handles the name ladder.
  if (!data && !fallbackEmail) return "Someone";
  return resolveUserName({
    firstName: typeof data?.firstName === "string" ? data.firstName : null,
    lastName: typeof data?.lastName === "string" ? data.lastName : null,
    authDisplayName:
      typeof data?.authDisplayName === "string" ? data.authDisplayName : null,
    email:
      (typeof data?.email === "string" ? data.email : null) ?? fallbackEmail,
  });
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: { emails?: unknown };
  try {
    body = (await req.json()) as { emails?: unknown };
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  if (!Array.isArray(body.emails)) {
    return apiError({ code: "INVALID_INPUT", message: "emails must be an array", status: 400 });
  }

  const rawEmails = body.emails as unknown[];
  if (rawEmails.length === 0) {
    return apiError({ code: "INVALID_INPUT", message: "emails is empty", status: 400 });
  }
  if (rawEmails.length > MAX_BATCH) {
    return apiError({
      code: "INVALID_INPUT",
      message: `Maximum ${MAX_BATCH} emails per batch`,
      status: 400,
    });
  }

  // Resolve workspace + auth caller for the rate-limit key.
  let workspaceId: string;
  try {
    workspaceId = await getUserWorkspaceIdRepo(user.uid);
  } catch (err) {
    console.error("POST /api/workspace/members/invite-batch:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to resolve workspace", status: 500 });
  }

  const rl = checkRateLimit({
    key: `invite-batch:${workspaceId}`,
    max: 5,
    windowMs: 15 * 60_000,
  });
  if (!rl.allowed) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Rate limit exceeded — try again later.",
      status: 429,
      init: { headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    });
  }

  try {
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    const isOwnerByField = workspace.ownerId === user.uid;
    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    const isOwnerByRole = callerMember?.role === "OWNER";
    if (!isOwnerByField && !isOwnerByRole) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only workspace owners can invite members",
        status: 403,
      });
    }

    const role: WorkspaceMemberRole = "MEMBER";
    const callerProfile = await getUserByIdRepo(user.uid);
    const inviterName = resolveInviterName(
      callerProfile as Record<string, unknown> | null,
      user.email
    );
    const callerAvatarUrl =
      typeof (callerProfile as Record<string, unknown> | null)?.avatarUrl === "string"
        ? ((callerProfile as Record<string, unknown>).avatarUrl as string)
        : typeof (callerProfile as Record<string, unknown> | null)?.photoURL === "string"
          ? ((callerProfile as Record<string, unknown>).photoURL as string)
          : null;

    // Normalize + dedupe input emails preserving first occurrence.
    const seen = new Set<string>();
    const normalized: { email: string; valid: boolean }[] = [];
    for (const raw of rawEmails) {
      if (typeof raw !== "string") {
        normalized.push({ email: String(raw), valid: false });
        continue;
      }
      const lower = raw.toLowerCase().trim();
      if (seen.has(lower)) continue;
      seen.add(lower);
      const valid = EMAIL_RE.test(lower);
      normalized.push({ email: lower, valid });
    }

    // Plan limit budget — number of slots remaining for this workspace.
    let remainingSlots = Number.POSITIVE_INFINITY;
    try {
      const currentMembers = workspace.usage?.members ?? 0;
      // We don't have direct access to the resolved limit here; a single check
      // call against currentUsage tells us if we're already at the cap.
      await checkPlanLimit({
        workspace,
        metric: "maxMembers",
        currentUsage: currentMembers,
      });
      // `checkPlanLimit` succeeds when we're under the limit. The exact number
      // of remaining slots isn't returned, so we re-check per-iteration below
      // by passing currentMembers + invitesSoFar.
      remainingSlots = Number.POSITIVE_INFINITY;
    } catch (err) {
      if ((err as PlanLimitError).code === "PLAN_LIMIT_REACHED") {
        // Workspace is already at cap — every email returns limit_reached.
        const planErr = planLimitReachedApiError(err as PlanLimitError);
        const results: Result[] = normalized.map((n) => ({
          email: n.email,
          status: "limit_reached",
          message: typeof planErr.message === "string" ? planErr.message : "Plan limit reached",
        }));
        return apiSuccess({ results });
      }
      throw err;
    }
    void remainingSlots;

    const baseMembers = workspace.usage?.members ?? 0;
    let invitesSoFar = 0;

    // Step 1 — synchronously decide each email's outcome (member / already invited / invalid / limit).
    const decisions: Array<
      | { kind: "skip"; result: Result }
      | { kind: "send"; email: string; existingInviteeUid: string | null }
    > = [];

    for (const item of normalized) {
      if (!item.valid) {
        decisions.push({ kind: "skip", result: { email: item.email, status: "invalid" } });
        continue;
      }

      // Existing user with this email?
      const existingUserSnap = await adminDb
        .collection("users")
        .where("email", "==", item.email)
        .limit(1)
        .get();
      let existingInviteeUid: string | null = null;
      if (!existingUserSnap.empty) {
        existingInviteeUid = existingUserSnap.docs[0].id;
        const existingMember = await getWorkspaceMemberRepo(workspaceId, existingInviteeUid);
        if (existingMember) {
          decisions.push({
            kind: "skip",
            result: { email: item.email, status: "already_member" },
          });
          continue;
        }
      }

      const existingInvite = await getWorkspaceInvitationByEmailRepo(workspaceId, item.email);
      if (existingInvite) {
        decisions.push({
          kind: "skip",
          result: { email: item.email, status: "already_invited" },
        });
        continue;
      }

      // Plan-limit guard for this seat.
      try {
        await checkPlanLimit({
          workspace,
          metric: "maxMembers",
          currentUsage: baseMembers + invitesSoFar,
        });
      } catch (err) {
        if ((err as PlanLimitError).code === "PLAN_LIMIT_REACHED") {
          decisions.push({
            kind: "skip",
            result: {
              email: item.email,
              status: "limit_reached",
              message: "Plan limit reached",
            },
          });
          continue;
        }
        throw err;
      }
      invitesSoFar += 1;
      decisions.push({ kind: "send", email: item.email, existingInviteeUid });
    }

    // Step 2 — create invitation docs serially (transactional doc-by-doc).
    const sendOps: Array<{ token: string; email: string; existingInviteeUid: string | null }> = [];
    for (const d of decisions) {
      if (d.kind !== "send") continue;
      const token = nanoid(32);
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
      const invitation = {
        id: token,
        workspaceId,
        email: d.email,
        role,
        status: "pending" as const,
        invitedBy: user.uid,
        invitedByName: String(inviterName),
        workspaceName: workspace.name,
        expiresAt,
        createdAt: now,
        acceptedAt: null,
        acceptedBy: null,
        reminderSentAt: null,
      };
      await createWorkspaceInvitationRepo(invitation);
      sendOps.push({ token, email: d.email, existingInviteeUid: d.existingInviteeUid });
    }

    // Step 3 — fan out emails + notifications in parallel; one failure does not block others.
    const sendResults = await Promise.allSettled(
      sendOps.map(async ({ token, email, existingInviteeUid }) => {
        const tasks: Promise<unknown>[] = [
          sendWorkspaceInviteEmail({
            to: email,
            invitedByName: String(inviterName),
            workspaceName: workspace.name,
            role,
            token,
          }),
        ];
        if (existingInviteeUid) {
          tasks.push(
            createNotification({
              userId: existingInviteeUid,
              workspaceId,
              sessionId: "",
              type: "invite.sent",
              actor: {
                id: user.uid,
                name: String(inviterName),
                photoURL: callerAvatarUrl,
              },
              title: "Workspace invitation",
              entityTitle: workspace.name,
            }).catch((notifErr) => {
              console.error("invite-batch notification create failed", notifErr);
            })
          );
        }
        await Promise.allSettled(tasks);
        return email;
      })
    );

    const sentEmails = new Set<string>();
    sendResults.forEach((r, i) => {
      if (r.status === "fulfilled") {
        sentEmails.add(sendOps[i].email);
      } else {
        console.error("invite-batch: send failed", sendOps[i].email, r.reason);
      }
    });

    // Step 4 — assemble final results in input order.
    const finalResults: Result[] = normalized.map((item) => {
      const decision = decisions.find((d) =>
        d.kind === "send" ? d.email === item.email : d.result.email === item.email
      );
      if (!decision) {
        return { email: item.email, status: "error", message: "No decision" };
      }
      if (decision.kind === "skip") return decision.result;
      return {
        email: item.email,
        status: sentEmails.has(item.email) ? "invited" : "error",
      };
    });

    return apiSuccess({ results: finalResults });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("POST /api/workspace/members/invite-batch:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to send invitations",
      status: 500,
    });
  }
}
