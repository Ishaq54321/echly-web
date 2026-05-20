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

export const dynamic = "force-dynamic";

const NEXT_BILLING = new Date("2026-06-19T00:00:00Z");

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
    const p = { firstName: "Sam" };
    return { html: welcomeEmailHtml(p), text: welcomeEmailText(p) };
  },
  "session-opened": () => {
    const p = {
      recipientName: "Sarah Chen",
      sessionName: "Homepage redesign feedback",
      sessionUrl: "https://annote.ai/s/PLACEHOLDER",
    };
    return {
      html: sessionOpenedEmailHtml(p),
      text: sessionOpenedEmailText(p),
    };
  },
  "new-comment": () => {
    const p = {
      commenterName: "Jordan Lee",
      ticketTitle: "CTA button is below the fold on mobile",
      sessionName: "Homepage redesign feedback",
      commentExcerpt:
        "Confirmed on iPhone 14 — the primary button only shows after a scroll. We should pull it up above the testimonial block.",
      commentUrl: "https://annote.ai/s/PLACEHOLDER#feedback-abc123",
    };
    return { html: newCommentEmailHtml(p), text: newCommentEmailText(p) };
  },
  "mention": () => {
    const p = {
      mentionerName: "Jordan Lee",
      ticketTitle: "CTA button is below the fold on mobile",
      sessionName: "Homepage redesign feedback",
      commentExcerpt:
        "@sam can you take this one? It overlaps with the nav work you're already doing.",
      commentUrl: "https://annote.ai/s/PLACEHOLDER#feedback-abc123",
    };
    return { html: mentionEmailHtml(p), text: mentionEmailText(p) };
  },
  "ticket-assigned": () => {
    const p = {
      assignerName: "Jordan Lee",
      ticketTitle: "CTA button is below the fold on mobile",
      sessionName: "Homepage redesign feedback",
      ticketUrl: "https://annote.ai/s/PLACEHOLDER#feedback-abc123",
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
