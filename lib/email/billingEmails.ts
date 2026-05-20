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
import {
  renewalReceiptEmailHtml,
  renewalReceiptEmailText,
} from "./templates/renewalReceipt";
import {
  upcomingRenewalReminderEmailHtml,
  upcomingRenewalReminderEmailText,
} from "./templates/upcomingRenewalReminder";
import {
  cardExpiringEmailHtml,
  cardExpiringEmailText,
} from "./templates/cardExpiring";
import {
  paymentMethodUpdatedEmailHtml,
  paymentMethodUpdatedEmailText,
} from "./templates/paymentMethodUpdated";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

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
      fromVariant: "founder",
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
      fromVariant: "founder",
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
      subject: "We couldn't process your payment",
      html: paymentFailedEmailHtml(props),
      text: paymentFailedEmailText(props),
      fromVariant: "founder",
    });
  } catch (err) {
    console.error("[sendPaymentFailedEmail] failed", err);
  }
}

export async function sendRenewalReceiptEmail(params: {
  to: string;
  workspaceName: string;
  amount: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  invoiceNumber: string | null;
  invoiceDate: Date;
  nextBillingDate: Date;
  invoicePdfUrl: string | null;
}): Promise<void> {
  try {
    const props = {
      workspaceName: params.workspaceName,
      amount: params.amount,
      seatCount: params.seatCount,
      billingCycle: params.billingCycle,
      invoiceNumber: params.invoiceNumber,
      invoiceDate: params.invoiceDate,
      nextBillingDate: params.nextBillingDate,
      invoicePdfUrl: params.invoicePdfUrl,
      settingsUrl: `${APP_URL}/settings?tab=billing`,
    };
    await sendEmailOrLog({
      to: params.to,
      subject: `Your Annote receipt — ${params.amount}`,
      html: renewalReceiptEmailHtml(props),
      text: renewalReceiptEmailText(props),
      fromVariant: "founder",
    });
  } catch (err) {
    console.error("[sendRenewalReceiptEmail] failed", err);
  }
}

export async function sendUpcomingRenewalReminderEmail(params: {
  to: string;
  workspaceName: string;
  amount: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
  cardBrand?: string;
  cardLast4?: string;
}): Promise<void> {
  try {
    const props = {
      workspaceName: params.workspaceName,
      amount: params.amount,
      seatCount: params.seatCount,
      billingCycle: params.billingCycle,
      nextBillingDate: params.nextBillingDate,
      cardBrand: params.cardBrand,
      cardLast4: params.cardLast4,
      settingsUrl: `${APP_URL}/settings?tab=billing`,
    };
    await sendEmailOrLog({
      to: params.to,
      subject: "Heads up — your Annote subscription renews soon",
      html: upcomingRenewalReminderEmailHtml(props),
      text: upcomingRenewalReminderEmailText(props),
      fromVariant: "founder",
    });
  } catch (err) {
    console.error("[sendUpcomingRenewalReminderEmail] failed", err);
  }
}

export async function sendCardExpiringEmail(params: {
  to: string;
  workspaceName: string;
  cardBrand: string;
  cardLast4: string;
  expiryMonth: number;
  expiryYear: number;
}): Promise<void> {
  try {
    const props = {
      workspaceName: params.workspaceName,
      cardBrand: params.cardBrand,
      cardLast4: params.cardLast4,
      expiryMonth: params.expiryMonth,
      expiryYear: params.expiryYear,
      portalUrl: `${APP_URL}/settings?tab=billing`,
    };
    await sendEmailOrLog({
      to: params.to,
      subject: "Your card is expiring soon",
      html: cardExpiringEmailHtml(props),
      text: cardExpiringEmailText(props),
      fromVariant: "founder",
    });
  } catch (err) {
    console.error("[sendCardExpiringEmail] failed", err);
  }
}

export async function sendPaymentMethodUpdatedEmail(params: {
  to: string;
  workspaceName: string;
  cardBrand: string;
  cardLast4: string;
}): Promise<void> {
  try {
    const props = {
      workspaceName: params.workspaceName,
      cardBrand: params.cardBrand,
      cardLast4: params.cardLast4,
    };
    await sendEmailOrLog({
      to: params.to,
      subject: "Payment method updated",
      html: paymentMethodUpdatedEmailHtml(props),
      text: paymentMethodUpdatedEmailText(props),
      fromVariant: "founder",
    });
  } catch (err) {
    console.error("[sendPaymentMethodUpdatedEmail] failed", err);
  }
}
