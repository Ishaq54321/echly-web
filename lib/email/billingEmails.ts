import "server-only";
import { sendEmailOrLog } from "./resend";
import {
  subscriptionConfirmationEmailHtml,
  subscriptionConfirmationEmailText,
} from "./templates/subscriptionConfirmation";
import {
  subscriptionCancelledEmailHtml,
  subscriptionCancelledEmailText,
} from "./templates/subscriptionCancelled";
import {
  paymentFailedEmailHtml,
  paymentFailedEmailText,
} from "./templates/paymentFailed";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";

export async function sendSubscriptionConfirmationEmail(params: {
  to: string;
  workspaceName: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
}): Promise<void> {
  try {
    const catalog = await getPlanCatalog();
    const business = catalog.business;

    // No more `?? 19` / `?? 15.2` fallback — if the catalog is broken,
    // we want to know rather than email a wrong price.
    if (business?.pricePerSeat == null || business?.annualPricePerSeat == null) {
      console.error(
        "[sendSubscriptionConfirmationEmail] business plan catalog missing prices; skipping email"
      );
      return;
    }

    const props = {
      workspaceName: params.workspaceName,
      seatCount: params.seatCount,
      billingCycle: params.billingCycle,
      nextBillingDate: params.nextBillingDate,
      settingsUrl: `${APP_URL}/settings?tab=billing`,
      pricePerSeat: business.pricePerSeat,
      annualPricePerSeat: business.annualPricePerSeat,
    };

    await sendEmailOrLog({
      to: params.to,
      subject: "You're on Annote Business — here's what's next",
      html: subscriptionConfirmationEmailHtml(props),
      text: subscriptionConfirmationEmailText(props),
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
    const catalog = await getPlanCatalog();
    const starter = catalog.starter;

    if (!starter) {
      console.error(
        "[sendSubscriptionCancelledEmail] starter plan catalog missing; skipping email"
      );
      return;
    }

    const props = {
      workspaceName: params.workspaceName,
      upgradeUrl: `${APP_URL}/settings?tab=billing`,
      starterLimits: {
        maxMembers: starter.maxMembers ?? null,
        maxFeedbackPerMonth: starter.maxFeedbackPerMonth ?? null,
        aiImprovementsPerMonth: starter.aiImprovementsPerMonth ?? null,
      },
    };

    await sendEmailOrLog({
      to: params.to,
      subject: "Your Annote subscription is canceled",
      html: subscriptionCancelledEmailHtml(props),
      text: subscriptionCancelledEmailText(props),
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
    const props = {
      workspaceName: params.workspaceName,
      portalUrl: params.portalUrl,
    };

    await sendEmailOrLog({
      to: params.to,
      subject: "Quick heads up — we couldn't charge your card",
      html: paymentFailedEmailHtml(props),
      text: paymentFailedEmailText(props),
    });
  } catch (err) {
    console.error("[sendPaymentFailedEmail] failed", err);
  }
}
