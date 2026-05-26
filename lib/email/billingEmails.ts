import "server-only";
import { sendEmailOrLog } from "./resend";
import type { EmailSendResult } from "./types";
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
import {
  seatAddedEmailHtml,
  seatAddedEmailText,
} from "./templates/seatAdded";
import {
  planChangedEmailHtml,
  planChangedEmailText,
  type PlanChangeType,
} from "./templates/planChanged";
import {
  refundIssuedEmailHtml,
  refundIssuedEmailText,
  refundIssuedSubject,
} from "./templates/refundIssued";
import { getPlanCatalog } from "@/lib/billing/getPlanCatalog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

function failureReason(err: unknown): string {
  return err instanceof Error ? err.message : "unknown";
}

export async function sendSubscriptionConfirmationEmail(params: {
  to: string;
  workspaceName: string;
  seatCount: number;
  billingCycle: "monthly" | "annual";
  nextBillingDate: Date;
}): Promise<EmailSendResult> {
  try {
    const catalog = await getPlanCatalog();
    const business = catalog.business;

    // No more `?? 19` / `?? 15.2` fallback — if the catalog is broken,
    // we want to know rather than email a wrong price.
    if (business?.pricePerSeat == null || business?.annualPricePerSeat == null) {
      console.error(
        "[sendSubscriptionConfirmationEmail] business plan catalog missing prices; skipping email"
      );
      return { sent: false, reason: "catalog-missing-prices" };
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
      templateName: "subscriptionConfirmation",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendSubscriptionConfirmationEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendSubscriptionCancelledEmail(params: {
  to: string;
  workspaceName: string;
}): Promise<EmailSendResult> {
  try {
    const catalog = await getPlanCatalog();
    const starter = catalog.starter;

    if (!starter) {
      console.error(
        "[sendSubscriptionCancelledEmail] starter plan catalog missing; skipping email"
      );
      return { sent: false, reason: "catalog-missing-starter" };
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
      templateName: "subscriptionCancelled",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendSubscriptionCancelledEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendPaymentFailedEmail(params: {
  to: string;
  workspaceName: string;
  portalUrl: string;
}): Promise<EmailSendResult> {
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
      templateName: "paymentFailed",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendPaymentFailedEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
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
}): Promise<EmailSendResult> {
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
      templateName: "renewalReceipt",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendRenewalReceiptEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
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
}): Promise<EmailSendResult> {
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
      templateName: "upcomingRenewalReminder",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendUpcomingRenewalReminderEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendCardExpiringEmail(params: {
  to: string;
  workspaceName: string;
  cardBrand: string;
  cardLast4: string;
  expiryMonth: number;
  expiryYear: number;
}): Promise<EmailSendResult> {
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
      templateName: "cardExpiring",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendCardExpiringEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendPaymentMethodUpdatedEmail(params: {
  to: string;
  workspaceName: string;
  cardBrand: string;
  cardLast4: string;
}): Promise<EmailSendResult> {
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
      templateName: "paymentMethodUpdated",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendPaymentMethodUpdatedEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendPlanChangedEmail(params: {
  ownerEmail: string;
  ownerName: string;
  workspaceName: string;
  oldPlanName: string;
  newPlanName: string;
  billingCycle: string;
  changeType: PlanChangeType;
  nextBillingDate: Date;
  prorationAmountCents: number | null;
  prorationCurrency: string | null;
  billingUrl: string;
}): Promise<EmailSendResult> {
  try {
    const ownerFirstName =
      (params.ownerName ?? "").trim().split(/\s+/)[0] || "there";
    const currency = params.prorationCurrency ?? "USD";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });
    const prorationFormatted =
      params.prorationAmountCents != null
        ? formatter.format(Math.abs(params.prorationAmountCents) / 100)
        : null;
    const prorationDirection: "charge" | "refund" | null =
      params.prorationAmountCents == null
        ? null
        : params.prorationAmountCents < 0
        ? "refund"
        : "charge";
    const nextBillingDateStr = params.nextBillingDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const props = {
      ownerFirstName,
      workspaceName: params.workspaceName,
      oldPlanName: params.oldPlanName,
      newPlanName: params.newPlanName,
      billingCycle: params.billingCycle,
      changeType: params.changeType,
      nextBillingDate: nextBillingDateStr,
      prorationFormatted,
      prorationDirection,
      billingUrl: params.billingUrl,
    };

    const subject =
      params.changeType === "upgrade"
        ? `Welcome to ${params.newPlanName}`
        : params.changeType === "downgrade"
        ? `Your plan changed to ${params.newPlanName}`
        : `Subscription update for ${params.workspaceName}`;

    await sendEmailOrLog({
      to: params.ownerEmail,
      subject,
      html: planChangedEmailHtml(props),
      text: planChangedEmailText(props),
      fromVariant: "founder",
      templateName: "planChanged",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendPlanChangedEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendRefundIssuedEmail(params: {
  ownerEmail: string;
  ownerName: string;
  amountCents: number;
  currency: string;
  last4?: string;
  refundReason?: string;
  receiptUrl?: string;
}): Promise<EmailSendResult> {
  try {
    const ownerFirstName =
      (params.ownerName ?? "").trim().split(/\s+/)[0] || "there";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (params.currency ?? "USD").toUpperCase(),
    });
    const amountFormatted = formatter.format(Math.abs(params.amountCents) / 100);

    const props = {
      ownerFirstName,
      amountFormatted,
      last4: params.last4,
      refundReason: params.refundReason,
      receiptUrl: params.receiptUrl,
    };

    await sendEmailOrLog({
      to: params.ownerEmail,
      subject: refundIssuedSubject(amountFormatted),
      html: refundIssuedEmailHtml(props),
      text: refundIssuedEmailText(props),
      fromVariant: "founder",
      templateName: "refundIssued",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendRefundIssuedEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendSeatAddedEmail(params: {
  ownerEmail: string;
  ownerName: string;
  workspaceName: string;
  newSeatCount: number;
  acceptedByName: string;
  prorationAmountCents: number | null;
  prorationCurrency: string | null;
  nextBillingDate: Date;
  billingUrl: string;
}): Promise<EmailSendResult> {
  try {
    const ownerFirstName =
      (params.ownerName ?? "").trim().split(/\s+/)[0] || "there";
    const currency = params.prorationCurrency ?? "USD";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });
    const prorationFormatted =
      params.prorationAmountCents != null
        ? formatter.format(params.prorationAmountCents / 100)
        : null;
    const nextBillingDateStr = params.nextBillingDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const props = {
      ownerFirstName,
      acceptedByName: params.acceptedByName,
      workspaceName: params.workspaceName,
      newSeatCount: params.newSeatCount,
      prorationFormatted,
      nextBillingDate: nextBillingDateStr,
      billingUrl: params.billingUrl,
    };

    await sendEmailOrLog({
      to: params.ownerEmail,
      subject: `A new seat was added to ${params.workspaceName}`,
      html: seatAddedEmailHtml(props),
      text: seatAddedEmailText(props),
      fromVariant: "founder",
      templateName: "seatAdded",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendSeatAddedEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}
