import { emailShell, emailButton, emailColors, plainTextShell } from "../components";

interface SubscriptionCancelledProps {
  workspaceName: string;
  upgradeUrl: string;
  starterLimits: {
    maxMembers: number | null;
    maxFeedbackPerMonth: number | null;
    aiImprovementsPerMonth: number | null;
  };
}

function formatLimit(n: number | null, suffix: string): string {
  if (n === null) return `Unlimited ${suffix}`;
  return `Up to ${n.toLocaleString()} ${suffix}`;
}

export function subscriptionCancelledEmailHtml(props: SubscriptionCancelledProps): string {
  const { workspaceName, upgradeUrl, starterLimits } = props;

  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:${emailColors.textHeading};letter-spacing:-0.02em;">
      Your subscription is canceled
    </h1>

    <p style="margin:0 0 24px;">
      Your workspace <strong style="color:${emailColors.textHeading};">${workspaceName}</strong> is now on the Starter plan. Your existing team and data are still there — we just dialed back the limits.
    </p>

    <div style="background-color:${emailColors.surfaceSubtle};border:1px solid ${emailColors.border};border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:${emailColors.textMuted};text-transform:uppercase;letter-spacing:0.05em;">
        What changes
      </p>
      <p style="margin:0 0 8px;color:${emailColors.textBody};">${formatLimit(starterLimits.maxMembers, "team members")}</p>
      <p style="margin:0 0 8px;color:${emailColors.textBody};">${formatLimit(starterLimits.maxFeedbackPerMonth, "feedback tickets a month")}</p>
      <p style="margin:0;color:${emailColors.textBody};">${formatLimit(starterLimits.aiImprovementsPerMonth, "AI improvements a month")}</p>
    </div>

    <p style="margin:0 0 24px;">
      If you'd like to come back, you can re-upgrade anytime.
    </p>

    ${emailButton("Re-upgrade to Business", upgradeUrl)}

    <p style="margin:24px 0 0;">
      Thanks for trying Annote. If there's something we could've done better, I'd love to hear it — just reply.
    </p>

    <p style="margin:24px 0 0;color:${emailColors.textMuted};">
      — Ishaq, Annote
    </p>
  `;

  return emailShell(body, {
    preheader: `Your workspace ${workspaceName} is now on the Starter plan.`,
  });
}

export function subscriptionCancelledEmailText(props: SubscriptionCancelledProps): string {
  const { workspaceName, upgradeUrl, starterLimits } = props;

  return plainTextShell(`Your subscription is canceled

Your workspace ${workspaceName} is now on the Starter plan. Your existing team and data are still there — we just dialed back the limits.

What changes
${formatLimit(starterLimits.maxMembers, "team members")}
${formatLimit(starterLimits.maxFeedbackPerMonth, "feedback tickets a month")}
${formatLimit(starterLimits.aiImprovementsPerMonth, "AI improvements a month")}

If you'd like to come back, you can re-upgrade anytime.

Re-upgrade to Business: ${upgradeUrl}

Thanks for trying Annote. If there's something we could've done better, I'd love to hear it — just reply.

— Ishaq, Annote`);
}
