// DEV-ONLY email preview route. Renders the real (V2-migrated) email
// templates with placeholder data so they can be eyeballed in a browser
// without sending real email. Hard-gated: 404 when NODE_ENV === "production".
//
// Path is the literal /dev/... segment (NOT a route group) so the URL matches
// the documented path. Visit e.g.
//   http://localhost:3000/dev/email-preview/password-reset
//
// `?text=1` returns the plain-text alternative instead of HTML — used to
// eyeball the text/plain part (VALIDATION Test 5).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { passwordResetEmailHtml, passwordResetEmailText } from "@/lib/email/templates/passwordReset";
import { emailVerificationHtml, emailVerificationText } from "@/lib/email/templates/emailVerification";
import { emailChangeEmailHtml, emailChangeEmailText } from "@/lib/email/templates/emailChange";
import { workspaceInviteEmailHtml, workspaceInviteEmailText } from "@/lib/email/templates/workspaceInvite";
import { workspaceInviteReminderHtml, workspaceInviteReminderText } from "@/lib/email/templates/workspaceInviteReminder";
import { sessionInviteEmailHtml, sessionInviteEmailText } from "@/lib/email/templates/sessionInvite";
import { accessRequestNotificationEmailHtml, accessRequestNotificationEmailText } from "@/lib/email/templates/accessRequestNotification";
import { accessRequestResultEmailHtml, accessRequestResultEmailText } from "@/lib/email/templates/accessRequestResult";
import { subscriptionConfirmationEmailHtml, subscriptionConfirmationEmailText } from "@/lib/email/templates/subscriptionConfirmation";
import { subscriptionCancelledEmailHtml, subscriptionCancelledEmailText } from "@/lib/email/templates/subscriptionCancelled";
import { paymentFailedEmailHtml, paymentFailedEmailText } from "@/lib/email/templates/paymentFailed";
import { workspaceDeletedConfirmationHtml, workspaceDeletedConfirmationText } from "@/lib/email/templates/workspaceDeletedConfirmation";
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/email/templates/welcome";
import { sessionOpenedEmailHtml, sessionOpenedEmailText } from "@/lib/email/templates/sessionOpened";
import { newCommentEmailHtml, newCommentEmailText } from "@/lib/email/templates/newComment";
import { mentionEmailHtml, mentionEmailText } from "@/lib/email/templates/mention";
import { ticketAssignedEmailHtml, ticketAssignedEmailText } from "@/lib/email/templates/ticketAssigned";
import { planLimitApproachingEmailHtml, planLimitApproachingEmailText } from "@/lib/email/templates/planLimitApproaching";
import { planLimitHitEmailHtml, planLimitHitEmailText } from "@/lib/email/templates/planLimitHit";
import { inviteAcceptedEmailHtml, inviteAcceptedEmailText } from "@/lib/email/templates/inviteAccepted";
import { seatAddedEmailHtml, seatAddedEmailText } from "@/lib/email/templates/seatAdded";
import { ticketResolvedEmailHtml, ticketResolvedEmailText } from "@/lib/email/templates/ticketResolved";
import { memberRemovedEmailHtml, memberRemovedEmailText } from "@/lib/email/templates/memberRemoved";
import { emailChangeNoticeHtml, emailChangeNoticeText } from "@/lib/email/templates/emailChangeNotice";
import { planChangedEmailHtml, planChangedEmailText } from "@/lib/email/templates/planChanged";
import {
  ownershipTransferredOldHtml,
  ownershipTransferredOldText,
} from "@/lib/email/templates/ownershipTransferredOld";
import {
  ownershipTransferredNewHtml,
  ownershipTransferredNewText,
} from "@/lib/email/templates/ownershipTransferredNew";
import {
  workspaceDeletedMemberHtml,
  workspaceDeletedMemberText,
} from "@/lib/email/templates/workspaceDeletedMember";
import { refundIssuedEmailHtml, refundIssuedEmailText } from "@/lib/email/templates/refundIssued";
import {
  activityDigestEmailHtml,
  activityDigestEmailText,
} from "@/lib/email/templates/activityDigest";
import { commentExcerpt } from "@/lib/email/helpers";

export const dynamic = "force-dynamic";

const NEXT_BILLING = new Date("2026-06-19T00:00:00Z");

// Fake but realistically-shaped unsubscribe URL — preference-gated templates
// receive this so the dev preview shows the "Unsubscribe · annote.ai" footer
// row exactly as production renders it. Transactional templates leave their
// `unsubscribeUrl` prop unset and render the bare "annote.ai" footer.
const PREVIEW_UNSUBSCRIBE_URL =
  "https://annote.ai/unsubscribe?token=PREVIEW_TOKEN";

interface Variant {
  html: string;
  text: string;
}

const TEMPLATES: Record<string, () => Variant> = {
  "password-reset": () => {
    const p = { resetUrl: "https://annote.ai/reset/PLACEHOLDER", userName: "Sam Rivera" };
    return { html: passwordResetEmailHtml(p), text: passwordResetEmailText(p) };
  },
  "email-verification": () => {
    const p = { verifyUrl: "https://annote.ai/verify/PLACEHOLDER", userName: "Sam Rivera" };
    return { html: emailVerificationHtml(p), text: emailVerificationText(p) };
  },
  "email-change": () => {
    const p = {
      newEmail: "new.address@example.com",
      confirmUrl: "https://annote.ai/confirm-email/PLACEHOLDER",
      userName: "Sam Rivera",
    };
    return { html: emailChangeEmailHtml(p), text: emailChangeEmailText(p) };
  },
  "workspace-invite": () => {
    const p = {
      invitedByName: "Jordan Lee",
      workspaceName: "Acme Design",
      role: "MEMBER",
      acceptUrl: "https://annote.ai/invite/PLACEHOLDER",
      expiresInDays: 30,
    };
    return { html: workspaceInviteEmailHtml(p), text: workspaceInviteEmailText(p) };
  },
  "workspace-invite-reminder": () => {
    const p = {
      workspaceName: "Acme Design",
      acceptUrl: "https://annote.ai/invite/PLACEHOLDER",
      expiresInDays: 3,
    };
    return { html: workspaceInviteReminderHtml(p), text: workspaceInviteReminderText(p) };
  },
  "session-invite": () => {
    const p = {
      invitedByName: "Jordan Lee",
      invitedByEmail: "jordan@acme.com",
      sessionName: "Homepage redesign feedback",
      workspaceName: "Acme Design",
      accessLevel: "view" as const,
      sessionUrl: "https://annote.ai/s/PLACEHOLDER",
      requiresAccount: false,
    };
    return { html: sessionInviteEmailHtml(p), text: sessionInviteEmailText(p) };
  },
  "session-invite-account": () => {
    const p = {
      invitedByName: "Jordan Lee",
      sessionName: "Homepage redesign feedback",
      workspaceName: "Acme Design",
      accessLevel: "resolve" as const,
      sessionUrl: "https://annote.ai/s/PLACEHOLDER",
      requiresAccount: true,
    };
    return { html: sessionInviteEmailHtml(p), text: sessionInviteEmailText(p) };
  },
  "access-request-notification": () => {
    const p = {
      requesterEmail: "outsider@example.com",
      sessionName: "Homepage redesign feedback",
      sessionUrl: "https://annote.ai/s/PLACEHOLDER",
      workspaceName: "Acme Design",
    };
    return {
      html: accessRequestNotificationEmailHtml(p),
      text: accessRequestNotificationEmailText(p),
    };
  },
  "access-request-approved": () => {
    const p = {
      approved: true,
      sessionName: "Homepage redesign feedback",
      sessionUrl: "https://annote.ai/s/PLACEHOLDER",
      workspaceName: "Acme Design",
    };
    return {
      html: accessRequestResultEmailHtml(p),
      text: accessRequestResultEmailText(p),
    };
  },
  "access-request-rejected": () => {
    const p = {
      approved: false,
      sessionName: "Homepage redesign feedback",
      sessionUrl: "https://annote.ai/s/PLACEHOLDER",
      workspaceName: "Acme Design",
    };
    return {
      html: accessRequestResultEmailHtml(p),
      text: accessRequestResultEmailText(p),
    };
  },
  "subscription-confirmation": () => {
    const p = {
      workspaceName: "Acme Design",
      seatCount: 5,
      billingCycle: "monthly" as const,
      nextBillingDate: NEXT_BILLING,
      settingsUrl: "https://annote.ai/settings?tab=billing",
      pricePerSeat: 19,
      annualPricePerSeat: 15.2,
      firstName: "Sam",
    };
    return {
      html: subscriptionConfirmationEmailHtml(p),
      text: subscriptionConfirmationEmailText(p),
    };
  },
  "subscription-cancelled": () => {
    const p = {
      workspaceName: "Acme Design",
      upgradeUrl: "https://annote.ai/settings?tab=billing",
      starterLimits: { maxMembers: 3, maxFeedbackPerMonth: 50, aiImprovementsPerMonth: 20 },
      firstName: "Sam",
      periodEndDate: "June 19, 2026",
    };
    return {
      html: subscriptionCancelledEmailHtml(p),
      text: subscriptionCancelledEmailText(p),
    };
  },
  "payment-failed": () => {
    const p = {
      workspaceName: "Acme Design",
      portalUrl: "https://annote.ai/settings?tab=billing",
      firstName: "Sam",
      cardBrand: "Visa",
      cardLast4: "4242",
      retryDate: "May 22, 2026",
    };
    return { html: paymentFailedEmailHtml(p), text: paymentFailedEmailText(p) };
  },
  "workspace-deleted": () => {
    // No restoreUrl — exercises the no-CTA fallback (current product reality).
    const p = {
      workspaceName: "Acme Design",
      purgeDate: "June 18, 2026",
      firstName: "Sam",
    };
    return {
      html: workspaceDeletedConfirmationHtml(p),
      text: workspaceDeletedConfirmationText(p),
    };
  },
  "workspace-deleted-restore": () => {
    // With restoreUrl — exercises the Phase-5 "Restore workspace" CTA variant.
    const p = {
      workspaceName: "Acme Design",
      purgeDate: "June 18, 2026",
      firstName: "Sam",
      restoreUrl: "https://annote.ai/settings?tab=advanced",
    };
    return {
      html: workspaceDeletedConfirmationHtml(p),
      text: workspaceDeletedConfirmationText(p),
    };
  },

  // ── Phase 4: new event-driven templates ──
  "welcome": () => {
    const p = { firstName: "Sam", unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL };
    return { html: welcomeEmailHtml(p), text: welcomeEmailText(p) };
  },
  "session-opened": () => {
    const p = {
      recipientName: "Sarah Chen",
      sessionName: "Homepage redesign feedback",
      sessionUrl: "https://annote.ai/s/PLACEHOLDER",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return {
      html: sessionOpenedEmailHtml(p),
      text: sessionOpenedEmailText(p),
    };
  },
  "new-comment": () => {
    // Pass raw stored comment text through commentExcerpt() so the preview
    // exercises the mention-markup flattening (a raw `@[Name](uid)` reaching
    // this template would be a regression — see commentExcerpt in
    // lib/email/helpers.ts).
    const p = {
      commenterName: "Jordan Lee",
      ticketTitle: "CTA button is below the fold on mobile",
      sessionName: "Homepage redesign feedback",
      commentExcerpt: commentExcerpt(
        "@[Sam Chen](abc123XYZ) confirmed on iPhone 14 — the primary button only shows after a scroll. We should pull it up above the testimonial block."
      ),
      commentUrl: "https://annote.ai/s/PLACEHOLDER#feedback-abc123",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return { html: newCommentEmailHtml(p), text: newCommentEmailText(p) };
  },
  "mention": () => {
    const p = {
      mentionerName: "Jordan Lee",
      ticketTitle: "CTA button is below the fold on mobile",
      sessionName: "Homepage redesign feedback",
      commentExcerpt: commentExcerpt(
        "@[Sam Chen](abc123XYZ) can you take this one? It overlaps with the nav work you're already doing."
      ),
      commentUrl: "https://annote.ai/s/PLACEHOLDER#feedback-abc123",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return { html: mentionEmailHtml(p), text: mentionEmailText(p) };
  },
  "ticket-assigned": () => {
    const p = {
      assignerName: "Jordan Lee",
      ticketTitle: "CTA button is below the fold on mobile",
      sessionName: "Homepage redesign feedback",
      ticketUrl: "https://annote.ai/s/PLACEHOLDER#feedback-abc123",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return {
      html: ticketAssignedEmailHtml(p),
      text: ticketAssignedEmailText(p),
    };
  },
  "plan-approaching": () => {
    const p = {
      firstName: "Sam",
      planName: "Starter",
      usageCount: 40,
      planLimit: 50,
      workspaceName: "Acme Design",
      daysRemaining: 6,
      resetDate: "June 19, 2026",
      upgradeUrl: "https://annote.ai/settings?tab=billing",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return {
      html: planLimitApproachingEmailHtml(p),
      text: planLimitApproachingEmailText(p),
    };
  },
  "plan-hit": () => {
    const p = {
      firstName: "Sam",
      planLimit: 50,
      workspaceName: "Acme Design",
      resetDate: "June 19, 2026",
      upgradeUrl: "https://annote.ai/settings?tab=billing",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return { html: planLimitHitEmailHtml(p), text: planLimitHitEmailText(p) };
  },

  // ── Phase A: tier-1 missing emails ──
  "invite-accepted": () => {
    const p = {
      inviterFirstName: "Ishaq",
      acceptedByName: "Sarah Chen",
      acceptedByEmail: "sarah@acme.com",
      workspaceName: "Acme Engineering",
      memberCount: 4,
      workspaceMembersUrl: "https://annote.ai/settings?tab=workspace",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return { html: inviteAcceptedEmailHtml(p), text: inviteAcceptedEmailText(p) };
  },
  "seat-added": () => {
    const p = {
      ownerFirstName: "Ishaq",
      acceptedByName: "Sarah Chen",
      workspaceName: "Acme Engineering",
      newSeatCount: 4,
      prorationFormatted: "$7.18",
      nextBillingDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      billingUrl: "https://annote.ai/settings/billing",
    };
    return { html: seatAddedEmailHtml(p), text: seatAddedEmailText(p) };
  },
  "ticket-resolved": () => {
    const p = {
      reporterFirstName: "Ishaq",
      resolverName: "Sarah Chen",
      ticketTitle: "Login button broken on iOS Safari",
      sessionName: "Acme onboarding flow",
      ticketUrl: "https://annote.ai/s/PLACEHOLDER#feedback-abc123",
      resolutionNote:
        "Fixed by removing the legacy event listener — should ship in 2.4.1.",
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
    };
    return {
      html: ticketResolvedEmailHtml(p),
      text: ticketResolvedEmailText(p),
    };
  },
  "member-removed": () => {
    const p = {
      removedFirstName: "Alex",
      workspaceName: "Acme Engineering",
      removerName: "Ishaq",
      dashboardUrl: "https://annote.ai/dashboard",
    };
    return {
      html: memberRemovedEmailHtml(p),
      text: memberRemovedEmailText(p),
    };
  },
  "email-change-notice": () => {
    const p = {
      firstName: "Ishaq",
      newEmail: "ishaq@new.com",
      passwordResetUrl: "https://annote.ai/forgot-password",
    };
    return {
      html: emailChangeNoticeHtml(p),
      text: emailChangeNoticeText(p),
    };
  },
  // ── Phase C: tier-3 polish emails ──
  "plan-changed-upgrade": () => {
    const p = {
      ownerFirstName: "Ishaq",
      workspaceName: "Acme Engineering",
      oldPlanName: "Business Monthly",
      newPlanName: "Business Annual",
      billingCycle: "annual",
      changeType: "upgrade" as const,
      nextBillingDate: "June 19, 2027",
      prorationFormatted: "$156.00",
      prorationDirection: "charge" as const,
      billingUrl: "https://annote.ai/settings?tab=billing",
    };
    return { html: planChangedEmailHtml(p), text: planChangedEmailText(p) };
  },
  "plan-changed-downgrade": () => {
    const p = {
      ownerFirstName: "Ishaq",
      workspaceName: "Acme Engineering",
      oldPlanName: "Business Annual",
      newPlanName: "Business Monthly",
      billingCycle: "monthly",
      changeType: "downgrade" as const,
      nextBillingDate: "June 19, 2026",
      prorationFormatted: null,
      prorationDirection: null,
      billingUrl: "https://annote.ai/settings?tab=billing",
    };
    return { html: planChangedEmailHtml(p), text: planChangedEmailText(p) };
  },
  "ownership-transferred-old": () => {
    const p = {
      previousOwnerFirstName: "Ishaq",
      workspaceName: "Acme Engineering",
      newOwnerName: "Sarah Chen",
      newOwnerEmail: "sarah@acme.com",
    };
    return {
      html: ownershipTransferredOldHtml(p),
      text: ownershipTransferredOldText(p),
    };
  },
  "ownership-transferred-new": () => {
    const p = {
      newOwnerFirstName: "Sarah",
      previousOwnerName: "Ishaq",
      workspaceName: "Acme Engineering",
      planName: "Business Monthly",
      seatCount: 5,
      nextBillingDate: "June 19, 2026",
      priceFormatted: "$95.00/month",
      settingsUrl: "https://annote.ai/settings?tab=workspace",
    };
    return {
      html: ownershipTransferredNewHtml(p),
      text: ownershipTransferredNewText(p),
    };
  },
  "workspace-deleted-member": () => {
    const p = {
      memberFirstName: "Alex",
      workspaceName: "Acme Engineering",
      ownerName: "Ishaq",
      deletionDate: "June 20, 2026",
    };
    return {
      html: workspaceDeletedMemberHtml(p),
      text: workspaceDeletedMemberText(p),
    };
  },
  "refund-issued": () => {
    const p = {
      ownerFirstName: "Ishaq",
      amountFormatted: "$24.99",
      last4: "4242",
      refundReason: "a request from you",
      receiptUrl: "https://pay.stripe.com/receipts/PLACEHOLDER",
    };
    return { html: refundIssuedEmailHtml(p), text: refundIssuedEmailText(p) };
  },

  // ── Digest cutover: the one notification-category email ──
  "activity-digest": () => {
    const p = {
      firstName: "Sam",
      summaryLine: "You have 18 updates across 3 sessions.",
      dashboardUrl: "https://annote.ai/activity",
      truncatedNote: null,
      unsubscribeUrl: PREVIEW_UNSUBSCRIBE_URL,
      sections: [
        {
          sessionTitle: "Homepage redesign feedback",
          sessionUrl: "https://annote.ai/s/SESSION1",
          lines: [
            {
              summary: "2 mentions from Jordan Lee and Sarah Chen",
              links: [
                {
                  title: "CTA button is below the fold on mobile",
                  url: "https://annote.ai/s/SESSION1#feedback-abc",
                },
              ],
            },
            {
              summary: "12 new comments from 4 people",
              links: [
                {
                  title: "Hero copy is too long",
                  url: "https://annote.ai/s/SESSION1#feedback-def",
                },
                {
                  title: "Footer links overlap on tablet",
                  url: "https://annote.ai/s/SESSION1#feedback-ghi",
                },
              ],
            },
          ],
        },
        {
          sessionTitle: "Acme onboarding flow",
          sessionUrl: "https://annote.ai/s/SESSION2",
          lines: [
            {
              summary: "1 new ticket from Maya",
              links: [
                {
                  title: "Login button broken on iOS Safari",
                  url: "https://annote.ai/s/SESSION2#feedback-jkl",
                },
              ],
            },
            { summary: "3 tickets resolved from Sarah Chen", links: [] },
          ],
        },
        {
          sessionTitle: "Mobile nav exploration",
          sessionUrl: "https://annote.ai/s/SESSION3",
          lines: [{ summary: "2 views", links: [] }],
        },
      ],
    };
    return {
      html: activityDigestEmailHtml(p),
      text: activityDigestEmailText(p),
    };
  },

  "seat-added-no-proration": () => {
    const p = {
      ownerFirstName: "Ishaq",
      acceptedByName: "Sarah Chen",
      workspaceName: "Acme Engineering",
      newSeatCount: 4,
      prorationFormatted: null,
      nextBillingDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      billingUrl: "https://annote.ai/settings/billing",
    };
    return { html: seatAddedEmailHtml(p), text: seatAddedEmailText(p) };
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ template: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not available in production", { status: 404 });
  }

  const { template } = await params;
  const render = TEMPLATES[template];

  if (!render) {
    const available = Object.keys(TEMPLATES).sort().join(", ");
    return new NextResponse(
      `Unknown template "${template}". Available: ${available}`,
      { status: 404 }
    );
  }

  const variant = render();
  const wantText = req.nextUrl.searchParams.get("text") === "1";

  return new NextResponse(wantText ? variant.text : variant.html, {
    headers: {
      "Content-Type": wantText
        ? "text/plain; charset=utf-8"
        : "text/html; charset=utf-8",
    },
  });
}
