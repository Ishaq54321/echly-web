import "server-only";
import { sendEmailOrLog } from "./resend";
import { subscriptionConfirmationEmailHtml } from "./templates/subscriptionConfirmation";
import { subscriptionCancelledEmailHtml } from "./templates/subscriptionCancelled";
import { paymentFailedEmailHtml } from "./templates/paymentFailed";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";

export async function sendSubscriptionConfirmationEmail(params: {
  to: string;
  workspaceName: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
}): Promise<void> {
  try {
    await sendEmailOrLog({
      to: params.to,
      subject: "Welcome to Echly Business!",
      html: subscriptionConfirmationEmailHtml({
        workspaceName: params.workspaceName,
        seatCount: params.seatCount,
        billingCycle: params.billingCycle,
        nextBillingDate: params.nextBillingDate,
        settingsUrl: `${APP_URL}/settings?tab=billing`,
      }),
    });
  } catch (err) {
    console.error("[sendSubscriptionConfirmationEmail] failed", err);
  }
}

export async function sendSubscriptionCancelledEmail(params: {
  to: string;
  workspaceName: string;
}): Promise<void> {
  try {
    await sendEmailOrLog({
      to: params.to,
      subject: "Your Echly Business subscription has ended",
      html: subscriptionCancelledEmailHtml({
        workspaceName: params.workspaceName,
        upgradeUrl: `${APP_URL}/settings?tab=billing`,
      }),
    });
  } catch (err) {
    console.error("[sendSubscriptionCancelledEmail] failed", err);
  }
}

export async function sendPaymentFailedEmail(params: {
  to: string;
  workspaceName: string;
  portalUrl: string;
}): Promise<void> {
  try {
    await sendEmailOrLog({
      to: params.to,
      subject: "Action needed: Payment failed for Echly",
      html: paymentFailedEmailHtml({
        workspaceName: params.workspaceName,
        portalUrl: params.portalUrl,
      }),
    });
  } catch (err) {
    console.error("[sendPaymentFailedEmail] failed", err);
  }
}
