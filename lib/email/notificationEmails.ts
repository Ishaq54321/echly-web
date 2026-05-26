import "server-only";
import {
  sendEmailWithPreferences,
  sendEmailWithPreferencesByUid,
} from "./sendEmailWithPreferences";
import type { EmailSendResult } from "./types";
import type { UserDoc } from "@/lib/repositories/usersRepository.server";
import { commentExcerpt, displayName, greetingName } from "./helpers";
import { sessionUrl, ticketUrl, EXTENSION_INSTALL_URL } from "./urls";
import {
  checkCooldown,
  stampCooldownSent,
  type CooldownEventType,
} from "./cooldowns";
import { welcomeEmailHtml, welcomeEmailText } from "./templates/welcome";
import {
  sessionOpenedEmailHtml,
  sessionOpenedEmailText,
  sessionOpenedSubject,
} from "./templates/sessionOpened";
import {
  newCommentEmailHtml,
  newCommentEmailText,
  newCommentSubject,
} from "./templates/newComment";
import {
  mentionEmailHtml,
  mentionEmailText,
  mentionSubject,
} from "./templates/mention";
import {
  ticketAssignedEmailHtml,
  ticketAssignedEmailText,
  ticketAssignedSubject,
} from "./templates/ticketAssigned";
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
import {
  ticketResolvedEmailHtml,
  ticketResolvedEmailText,
  ticketResolvedSubject,
} from "./templates/ticketResolved";

/**
 * Phase 5 — event-driven email senders.
 *
 * These wrap the Phase 4 templates with the preference gate
 * (sendEmailWithPreferences) and resolve the right opt-out category +
 * from-variant per the locked-in decisions:
 *
 *   welcome / plan-limit*           → "lifecycle", founder voice
 *   session-opened / comment /      → "notifications", system voice
 *   mention / ticket-assigned
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
 * 2. Session opened — fires on first non-creator view (caller enforces the
 * once-per-session guard via the emailSends.firstViewerNotified transaction).
 * Notifications category, system voice.
 */
export async function sendSessionOpenedEmail(params: {
  owner: UserLike;
  viewerName: string;
  sessionId: string;
  sessionName: string;
}): Promise<EmailSendResult> {
  const { owner, viewerName, sessionId, sessionName } = params;
  const props = {
    recipientName: viewerName,
    sessionName,
    sessionUrl: sessionUrl(sessionId),
  };

  const result = await sendEmailWithPreferences({
    user: owner,
    category: "notifications",
    subject: sessionOpenedSubject(viewerName),
    htmlBuilder: (unsubscribeUrl) =>
      sessionOpenedEmailHtml({ ...props, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      sessionOpenedEmailText({ ...props, unsubscribeUrl }),
    templateName: "sessionOpened",
    templateCategory: "notifications",
  });
  console.log(
    `[session-opened-email] owner=${owner.uid} session=${sessionId} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );
  return result;
}

/**
 * 3. New comment — fires per recipient (ticket owner/assignee, minus the
 * commenter and any mentioned users). Loads the recipient doc by uid.
 * Notifications category, system voice.
 */
export async function sendNewCommentEmail(params: {
  recipientUid: string;
  actorUid: string;
  commenterName: string;
  ticketTitle: string;
  sessionName: string;
  message: string;
  sessionId: string;
  feedbackId: string;
}): Promise<EmailSendResult> {
  const {
    recipientUid,
    actorUid,
    commenterName,
    ticketTitle,
    sessionName,
    message,
    sessionId,
    feedbackId,
  } = params;

  const cooldown = await applyCooldownGate({
    recipientUid,
    actorUid,
    eventType: "newComment",
    label: "new-comment-email",
    feedbackId,
  });
  if (!cooldown.ok) return cooldown.result;

  const excerpt = commentExcerpt(message);
  const props = {
    commenterName,
    ticketTitle,
    sessionName,
    commentExcerpt: excerpt,
    commentUrl: ticketUrl(sessionId, feedbackId),
  };

  const result = await sendEmailWithPreferencesByUid({
    uid: recipientUid,
    category: "notifications",
    subject: newCommentSubject(commenterName, ticketTitle),
    htmlBuilder: (unsubscribeUrl) =>
      newCommentEmailHtml({ ...props, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      newCommentEmailText({ ...props, unsubscribeUrl }),
    templateName: "newComment",
    templateCategory: "notifications",
  });
  if (result.sent) {
    void stampCooldownSent({
      recipientUid,
      actorUid,
      eventType: "newComment",
    });
  }
  console.log(
    `[new-comment-email] recipient=${recipientUid} feedback=${feedbackId} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );
  return result;
}

/**
 * 4. Mention — fires per mentioned user. Loads the recipient doc by uid.
 * Notifications category, system voice.
 */
export async function sendMentionEmail(params: {
  recipientUid: string;
  actorUid: string;
  mentionerName: string;
  ticketTitle: string;
  sessionName: string;
  message: string;
  sessionId: string;
  feedbackId: string;
}): Promise<EmailSendResult> {
  const {
    recipientUid,
    actorUid,
    mentionerName,
    ticketTitle,
    sessionName,
    message,
    sessionId,
    feedbackId,
  } = params;

  const cooldown = await applyCooldownGate({
    recipientUid,
    actorUid,
    eventType: "mention",
    label: "mention-email",
    feedbackId,
  });
  if (!cooldown.ok) return cooldown.result;

  const excerpt = commentExcerpt(message);
  const props = {
    mentionerName,
    ticketTitle,
    sessionName,
    commentExcerpt: excerpt,
    commentUrl: ticketUrl(sessionId, feedbackId),
  };

  const result = await sendEmailWithPreferencesByUid({
    uid: recipientUid,
    category: "notifications",
    subject: mentionSubject(mentionerName, ticketTitle),
    htmlBuilder: (unsubscribeUrl) =>
      mentionEmailHtml({ ...props, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      mentionEmailText({ ...props, unsubscribeUrl }),
    templateName: "mention",
    templateCategory: "notifications",
  });
  if (result.sent) {
    void stampCooldownSent({
      recipientUid,
      actorUid,
      eventType: "mention",
    });
  }
  console.log(
    `[mention-email] recipient=${recipientUid} feedback=${feedbackId} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );
  return result;
}

/**
 * 5. Ticket assigned — fires on assignment change (caller skips
 * self-assignment and no-op changes). Loads the assignee doc by uid.
 * Notifications category, system voice.
 */
export async function sendTicketAssignedEmail(params: {
  assigneeUid: string;
  actorUid: string;
  assignerName: string;
  ticketTitle: string;
  sessionName: string;
  sessionId: string;
  feedbackId: string;
}): Promise<EmailSendResult> {
  const {
    assigneeUid,
    actorUid,
    assignerName,
    ticketTitle,
    sessionName,
    sessionId,
    feedbackId,
  } = params;

  const cooldown = await applyCooldownGate({
    recipientUid: assigneeUid,
    actorUid,
    eventType: "ticketAssigned",
    label: "ticket-assigned-email",
    feedbackId,
  });
  if (!cooldown.ok) return cooldown.result;

  const props = {
    assignerName,
    ticketTitle,
    sessionName,
    ticketUrl: ticketUrl(sessionId, feedbackId),
  };

  const result = await sendEmailWithPreferencesByUid({
    uid: assigneeUid,
    category: "notifications",
    subject: ticketAssignedSubject(assignerName),
    htmlBuilder: (unsubscribeUrl) =>
      ticketAssignedEmailHtml({ ...props, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      ticketAssignedEmailText({ ...props, unsubscribeUrl }),
    templateName: "ticketAssigned",
    templateCategory: "notifications",
  });
  if (result.sent) {
    void stampCooldownSent({
      recipientUid: assigneeUid,
      actorUid,
      eventType: "ticketAssigned",
    });
  }
  console.log(
    `[ticket-assigned-email] assignee=${assigneeUid} feedback=${feedbackId} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );
  return result;
}

/**
 * 6. Plan limit approaching — fires once per billing cycle when usage crosses
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
 * 7. Plan limit hit — fires once per billing cycle when usage hits 100%
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

/**
 * 8. Ticket resolved — fires when a ticket's status changes to "resolved".
 * Sent to the original reporter (skips self-resolves). Loads the recipient
 * doc by uid. Notifications category, system voice.
 */
export async function sendTicketResolvedEmail(params: {
  recipientUid: string;
  actorUid: string;
  ticketTitle: string;
  sessionName: string;
  resolverName: string;
  ticketUrl: string;
  resolutionNote?: string;
}): Promise<EmailSendResult> {
  const {
    recipientUid,
    actorUid,
    ticketTitle,
    sessionName,
    resolverName,
    ticketUrl,
    resolutionNote,
  } = params;

  const cooldown = await applyCooldownGate({
    recipientUid,
    actorUid,
    eventType: "ticketResolved",
    label: "ticket-resolved-email",
  });
  if (!cooldown.ok) return cooldown.result;

  const { getUserByIdRepo } = await import(
    "@/lib/repositories/usersRepository.server"
  );
  const recipient = await getUserByIdRepo(recipientUid);
  if (!recipient) {
    return { sent: false, reason: "user-not-found" };
  }
  const reporterFirstName = greetingNameForUser(recipient) ?? "there";
  const props = {
    reporterFirstName,
    resolverName,
    ticketTitle,
    sessionName,
    ticketUrl,
    resolutionNote,
  };

  const result = await sendEmailWithPreferences({
    user: recipient,
    category: "notifications",
    subject: ticketResolvedSubject(ticketTitle),
    htmlBuilder: (unsubscribeUrl) =>
      ticketResolvedEmailHtml({ ...props, unsubscribeUrl }),
    textBuilder: (unsubscribeUrl) =>
      ticketResolvedEmailText({ ...props, unsubscribeUrl }),
    templateName: "ticketResolved",
    templateCategory: "notifications",
  });
  if (result.sent) {
    void stampCooldownSent({
      recipientUid,
      actorUid,
      eventType: "ticketResolved",
    });
  }
  console.log(
    `[ticket-resolved-email] recipient=${recipientUid} sent=${result.sent}${
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

/**
 * Apply the per-actor cooldown gate before composing/sending. Returns
 * `{ ok: true }` when the caller should proceed; otherwise returns the
 * suppressed `EmailSendResult` so the dispatcher can short-circuit.
 *
 * Cooldown is checked BEFORE the preference gate — it's the cheaper check,
 * and short-circuiting here avoids loading the recipient user doc for sends
 * we know we'd drop. The post-send stamp is written by the caller after a
 * confirmed send (so opt-outs don't accumulate phantom stamps).
 */
async function applyCooldownGate(params: {
  recipientUid: string;
  actorUid: string;
  eventType: CooldownEventType;
  label: string;
  feedbackId?: string;
}): Promise<{ ok: true } | { ok: false; result: EmailSendResult }> {
  const { recipientUid, actorUid, eventType, label, feedbackId } = params;
  // Defensive: missing actor means we can't bucket the cooldown — let it
  // through. The natural per-event dedup at the trigger site is still active.
  if (!actorUid || !recipientUid) return { ok: true };
  const check = await checkCooldown({ recipientUid, actorUid, eventType });
  if (check.ok) return { ok: true };
  const suffix = feedbackId ? ` feedback=${feedbackId}` : "";
  console.log(
    `[${label}] recipient=${recipientUid}${suffix} sent=false reason=cooldown actor=${actorUid} eventType=${eventType}`
  );
  return { ok: false, result: { sent: false, reason: "cooldown" } };
}

/** Re-export so callers resolving a viewer/commenter name use the same logic. */
export { displayName };
