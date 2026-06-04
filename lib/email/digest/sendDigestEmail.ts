import "server-only";
import { sendEmailWithPreferences } from "../sendEmailWithPreferences";
import { greetingName } from "../helpers";
import { sessionUrl, ticketUrl, activityUrl } from "../urls";
import {
  activityDigestEmailHtml,
  activityDigestEmailText,
  type DigestSectionProps,
} from "../templates/activityDigest";
import {
  buildDigestViewModel,
  type DigestViewModel,
} from "./buildDigest";
import type { NotificationRow } from "@/lib/domain/notification";
import { getUserByIdRepo } from "@/lib/repositories/usersRepository.server";
import type { EmailSendResult } from "../types";

/**
 * Render + send one user's activity digest.
 *
 * Returns the send result PLUS the exact notification ids that were rendered
 * into the email, so the cron can transactionally stamp `digestedAt` on only
 * those docs after a confirmed send (notifications that arrived after the fetch
 * are not in this set and flow into the next run).
 *
 * Empty windows: if the grouping function yields no view-model (no
 * notifications), this returns `{ sent: false, reason: "empty", includedIds: [] }`
 * and sends NOTHING — the caller skips the user entirely.
 *
 * Preference / unsubscribe: routed through sendEmailWithPreferences with
 * category "notifications", so a user who turned notifications off (or
 * unsubscribed) is silently skipped and the unsubscribe token + List-Unsubscribe
 * headers are minted exactly like the retired instant notification emails.
 */
export async function sendActivityDigestEmail(params: {
  userId: string;
  notifications: NotificationRow[];
  truncated: boolean;
}): Promise<EmailSendResult & { includedIds: string[] }> {
  const { userId, notifications, truncated } = params;

  const model = buildDigestViewModel(notifications, { truncated });
  if (!model) {
    return { sent: false, reason: "empty", includedIds: [] };
  }

  const user = await getUserByIdRepo(userId);
  if (!user) {
    return { sent: false, reason: "user-not-found", includedIds: [] };
  }
  if (!user.email) {
    return { sent: false, reason: "no-email", includedIds: [] };
  }

  // Every notification represented in the model is "included" — we stamp the
  // full fetched set on a confirmed send. (The fetch already capped at the
  // per-user max; `truncated` only signals there were more, which stay
  // un-digested for the next run.)
  const includedIds = notifications
    .map((n) => n.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  const sections = buildSectionProps(model);
  const firstName = resolveFirstName(user);
  const truncatedNote = model.truncated
    ? `Showing your most recent ${model.totalCount} updates — open Annote to see the rest.`
    : null;
  const dashboardUrl = activityUrl();

  const result = await sendEmailWithPreferences({
    user,
    category: "notifications",
    subject: model.subject,
    htmlBuilder: (unsubscribeUrl) =>
      activityDigestEmailHtml({
        firstName,
        summaryLine: model.summaryLine,
        sections,
        truncatedNote,
        dashboardUrl,
        unsubscribeUrl,
      }),
    textBuilder: (unsubscribeUrl) =>
      activityDigestEmailText({
        firstName,
        summaryLine: model.summaryLine,
        sections,
        truncatedNote,
        dashboardUrl,
        unsubscribeUrl,
      }),
    templateName: "activityDigest",
    templateCategory: "notifications",
  });

  console.log(
    `[activity-digest] uid=${userId} sessions=${model.sessionCount} updates=${model.totalCount} sent=${result.sent}${
      !result.sent ? ` reason=${result.reason}` : ""
    }`
  );

  // Only return includedIds when the email actually went out. If the send was
  // skipped (preference-off) or failed, the caller MUST NOT stamp — leaving the
  // docs un-digested so a re-enabled/ retried run can pick them up.
  if (!result.sent) {
    return { ...result, includedIds: [] };
  }
  return { ...result, includedIds };
}

/** Turn the pure view-model into the template's render-ready section props,
 * building session + ticket deep links from ids. */
function buildSectionProps(model: DigestViewModel): DigestSectionProps[] {
  return model.sections.map((section) => {
    const sUrl = section.sessionId ? sessionUrl(section.sessionId) : null;
    return {
      sessionTitle: section.sessionTitle,
      sessionUrl: sUrl,
      lines: section.buckets.map((b) => ({
        summary: b.summary,
        links: b.items.map((item) => ({
          title: item.title,
          url:
            section.sessionId && item.feedbackId
              ? ticketUrl(section.sessionId, item.feedbackId)
              : sUrl,
        })),
      })),
    };
  });
}

function resolveFirstName(user: {
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
}): string | undefined {
  const name = greetingName({
    firstName: user.firstName,
    displayName: user.displayName,
    email: user.email,
  });
  return name === "there" ? undefined : name;
}
