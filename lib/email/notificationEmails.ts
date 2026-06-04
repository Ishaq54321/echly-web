import "server-only";
import { sendEmailWithPreferences } from "./sendEmailWithPreferences";
import type { EmailSendResult } from "./types";
import type { UserDoc } from "@/lib/repositories/usersRepository.server";
import { displayName, greetingName } from "./helpers";
import { EXTENSION_INSTALL_URL } from "./urls";
import { welcomeEmailHtml, welcomeEmailText } from "./templates/welcome";
import {
  planLimitApproachingEmailHtml,
  planLimitApproachingEmailText,
  planLimitApproachingSubject,
} from "./templates/planLimitApproaching";
import {
  planLimitHitEmailHtml,
  planLimitHitEmailText,
  planLimitHitSubject,
} from "./templates/planLimitHit";

/**
 * LIFECYCLE email senders (welcome + plan-limit).
 *
 * History: this module previously also held the eight event-driven NOTIFICATION
 * senders (session-opened, new-comment, mention, ticket-assigned,
 * ticket-resolved) plus a 30-minute per-actor cooldown. As of the DIGEST
 * CUTOVER, every notification-category email was retired in favor of the daily
 * activity digest (lib/email/digest/*), which reads the in-app `notifications`
 * collection. The cooldown (lib/email/cooldowns.ts) was removed with them — it
 * existed only to throttle those instant sends, which no longer happen. The
 * digest's natural per-day batching is the throttle now.
 *
 * What remains here are the LIFECYCLE sends, which stay instant and unchanged:
 *   welcome / plan-limit*  → "lifecycle" category, founder voice.
 *
 * Every function is fire-and-forget at the call site: callers wrap them in
 * .catch(...) (or fireAndForget) so an email failure never blocks the request.
 * Each returns { sent, reason } for logging.
 */

type UserLike = Pick<
  UserDoc,
  "uid" | "email" | "emailPreferences" | "firstName" | "lastName"
> & {
  displayName?: string | null;
  authDisplayName?: string | null;
};

/**
 * 1. Welcome email — fires once on signup completion. Idempotency is enforced
 * by the caller (ensureUserRepo sets emailSends.welcome before dispatching);
 * this just renders + sends. Lifecycle category, founder voice.
 */
export async function sendWelcomeEmail(params: {
  user: UserLike;
  installUrl?: string;
}): Promise<EmailSendResult> {
  const { user } = params;
  const firstName =
    (user.firstName ?? "").trim() ||
    (user.displayName ?? "").trim() ||
    undefined;
  const installUrl = params.installUrl ?? EXTENSION_INSTALL_URL;

  const result = await sendEmailWithPreferences({
    user,
    category: "lifecycle",
    subject: "Welcome to Annote — one thing to do first",
    htmlBuilder: (unsubscribeUrl) =>
      welcomeEmailHtml({ firstName, installUrl, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      welcomeEmailText({ firstName, installUrl, unsubscribeUrl }),
    fromVariant: "founder",
    templateName: "welcome",
    templateCategory: "lifecycle",
  });
  console.log(
    `[welcome-email] uid=${user.uid} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );
  return result;
}

/**
 * 2. Plan limit approaching — fires once per billing cycle when usage crosses
 * 80% (caller enforces the once-per-cycle guard via
 * workspace.planLimitWarnings.approaching.lastSentAt). Lifecycle, founder.
 */
export async function sendPlanLimitApproachingEmail(params: {
  owner: UserLike;
  planName: string;
  usageCount: number;
  planLimit: number;
  workspaceName: string;
  daysRemaining: number;
  resetDate: string;
  upgradeUrl: string;
}): Promise<EmailSendResult> {
  const { owner, planName } = params;
  const firstName = greetingNameForUser(owner);
  const props = {
    firstName,
    planName,
    usageCount: params.usageCount,
    planLimit: params.planLimit,
    workspaceName: params.workspaceName,
    daysRemaining: params.daysRemaining,
    resetDate: params.resetDate,
    upgradeUrl: params.upgradeUrl,
  };

  const result = await sendEmailWithPreferences({
    user: owner,
    category: "lifecycle",
    subject: planLimitApproachingSubject(planName),
    htmlBuilder: (unsubscribeUrl) =>
      planLimitApproachingEmailHtml({ ...props, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      planLimitApproachingEmailText({ ...props, unsubscribeUrl }),
    fromVariant: "founder",
    templateName: "planLimitApproaching",
    templateCategory: "lifecycle",
  });
  console.log(
    `[plan-approaching-email] owner=${owner.uid} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );
  return result;
}

/**
 * 3. Plan limit hit — fires once per billing cycle when usage hits 100%
 * (caller enforces the once-per-cycle guard via
 * workspace.planLimitWarnings.hit.lastSentAt). Lifecycle, founder.
 */
export async function sendPlanLimitHitEmail(params: {
  owner: UserLike;
  planLimit: number;
  workspaceName: string;
  resetDate: string;
  upgradeUrl: string;
}): Promise<EmailSendResult> {
  const { owner } = params;
  const firstName = greetingNameForUser(owner);
  const props = {
    firstName,
    planLimit: params.planLimit,
    workspaceName: params.workspaceName,
    resetDate: params.resetDate,
    upgradeUrl: params.upgradeUrl,
  };

  const result = await sendEmailWithPreferences({
    user: owner,
    category: "lifecycle",
    subject: planLimitHitSubject(),
    htmlBuilder: (unsubscribeUrl) =>
      planLimitHitEmailHtml({ ...props, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      planLimitHitEmailText({ ...props, unsubscribeUrl }),
    fromVariant: "founder",
    templateName: "planLimitHit",
    templateCategory: "lifecycle",
  });
  console.log(
    `[plan-hit-email] owner=${owner.uid} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );
  return result;
}

/** Founder-voice greeting target ("Hey {x},"); undefined → template uses "there". */
function greetingNameForUser(user: UserLike): string | undefined {
  const name = greetingName({
    firstName: user.firstName,
    displayName: user.displayName,
    email: user.email,
  });
  return name === "there" ? undefined : name;
}

/** Re-export so callers resolving a viewer/commenter name use the same logic. */
export { displayName };
