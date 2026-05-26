import "server-only";
import { sendEmailOrLog } from "./resend";
import { sendEmailWithPreferencesByUid } from "./sendEmailWithPreferences";
import type { EmailSendResult } from "./types";
import { workspaceInviteEmailHtml, workspaceInviteEmailText } from "./templates/workspaceInvite";
import {
  workspaceInviteReminderHtml,
  workspaceInviteReminderText,
} from "./templates/workspaceInviteReminder";
import {
  workspaceDeletedConfirmationHtml,
  workspaceDeletedConfirmationText,
} from "./templates/workspaceDeletedConfirmation";
import {
  inviteAcceptedEmailHtml,
  inviteAcceptedEmailText,
} from "./templates/inviteAccepted";
import { sessionInviteEmailHtml, sessionInviteEmailText } from "./templates/sessionInvite";
import {
  accessRequestNotificationEmailHtml,
  accessRequestNotificationEmailText,
} from "./templates/accessRequestNotification";
import {
  accessRequestResultEmailHtml,
  accessRequestResultEmailText,
} from "./templates/accessRequestResult";
import { emailChangeEmailHtml, emailChangeEmailText } from "./templates/emailChange";
import { passwordResetEmailHtml, passwordResetEmailText } from "./templates/passwordReset";
import { emailVerificationHtml, emailVerificationText } from "./templates/emailVerification";
import {
  memberRemovedEmailHtml,
  memberRemovedEmailText,
  memberRemovedSubject,
} from "./templates/memberRemoved";
import {
  emailChangeNoticeHtml,
  emailChangeNoticeText,
  emailChangeNoticeSubject,
} from "./templates/emailChangeNotice";
import {
  ownershipTransferredOldHtml,
  ownershipTransferredOldText,
  ownershipTransferredOldSubject,
} from "./templates/ownershipTransferredOld";
import {
  ownershipTransferredNewHtml,
  ownershipTransferredNewText,
  ownershipTransferredNewSubject,
} from "./templates/ownershipTransferredNew";
import {
  workspaceDeletedMemberHtml,
  workspaceDeletedMemberText,
  workspaceDeletedMemberSubject,
} from "./templates/workspaceDeletedMember";

// WS-006 FIX: always use verified sender domain
// regardless of APP_URL (localhost would break Resend)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

function failureReason(err: unknown): string {
  return err instanceof Error ? err.message : "unknown";
}

export async function sendWorkspaceInviteEmail({
  to,
  invitedByName,
  workspaceName,
  role,
  token,
}: {
  to: string;
  invitedByName: string;
  workspaceName: string;
  role: string;
  token: string;
}): Promise<EmailSendResult> {
  try {
    const acceptUrl = `${APP_URL}/invite/${token}`;
    const props = { invitedByName, workspaceName, role, acceptUrl, expiresInDays: 30 };
    await sendEmailOrLog({
      to,
      subject: `You've been invited to join ${workspaceName}`,
      html: workspaceInviteEmailHtml(props),
      text: workspaceInviteEmailText(props),
      templateName: "workspaceInvite",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendWorkspaceInviteEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendWorkspaceInviteReminderEmail({
  to,
  workspaceName,
  token,
  expiresInDays,
}: {
  to: string;
  workspaceName: string;
  token: string;
  expiresInDays: number;
}): Promise<EmailSendResult> {
  try {
    const acceptUrl = `${APP_URL}/invite/${token}`;
    const props = { workspaceName, acceptUrl, expiresInDays };
    await sendEmailOrLog({
      to,
      subject: `Your invitation to ${workspaceName} expires in ${expiresInDays} days`,
      html: workspaceInviteReminderHtml(props),
      text: workspaceInviteReminderText(props),
      templateName: "workspaceInviteReminder",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendWorkspaceInviteReminderEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendSessionInviteEmail({
  to,
  invitedByName,
  sessionName,
  workspaceName,
  accessLevel,
  sessionUrl,
  requiresAccount = false,
}: {
  to: string;
  invitedByName: string;
  sessionName: string;
  workspaceName: string;
  accessLevel: "view" | "resolve";
  sessionUrl: string;
  requiresAccount?: boolean;
}): Promise<EmailSendResult> {
  try {
    const props = {
      invitedByName,
      sessionName,
      workspaceName,
      accessLevel,
      sessionUrl,
      requiresAccount,
    };
    await sendEmailOrLog({
      to,
      subject: `You've been invited to view ${sessionName}`,
      html: sessionInviteEmailHtml(props),
      text: sessionInviteEmailText(props),
      templateName: "sessionInvite",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendSessionInviteEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendAccessRequestNotificationEmail({
  to,
  requesterEmail,
  sessionName,
  sessionUrl,
  workspaceName,
}: {
  to: string[];
  requesterEmail: string;
  sessionName: string;
  sessionUrl: string;
  workspaceName: string;
}): Promise<EmailSendResult> {
  try {
    const props = { requesterEmail, sessionName, sessionUrl, workspaceName };
    const results = await Promise.allSettled(
      to.map((recipient) =>
        sendEmailOrLog({
          to: recipient,
          subject: `${requesterEmail} requested access to ${sessionName}`,
          html: accessRequestNotificationEmailHtml(props),
          text: accessRequestNotificationEmailText(props),
          templateName: "accessRequestNotification",
          templateCategory: "transactional",
        })
      )
    );
    const firstRejection = results.find((r) => r.status === "rejected");
    if (firstRejection && firstRejection.status === "rejected") {
      const reason = failureReason(firstRejection.reason);
      console.error("[sendAccessRequestNotificationEmail] at least one recipient failed:", firstRejection.reason);
      return { sent: false, reason };
    }
    return { sent: true };
  } catch (err) {
    console.error("[sendAccessRequestNotificationEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendAccessRequestResultEmail({
  to,
  approved,
  sessionName,
  sessionUrl,
  workspaceName,
}: {
  to: string;
  approved: boolean;
  sessionName: string;
  sessionUrl: string;
  workspaceName: string;
}): Promise<EmailSendResult> {
  try {
    const props = { approved, sessionName, sessionUrl, workspaceName };
    await sendEmailOrLog({
      to,
      subject: approved
        ? `You now have access to ${sessionName}`
        : `Access request for ${sessionName}`,
      html: accessRequestResultEmailHtml(props),
      text: accessRequestResultEmailText(props),
      templateName: "accessRequestResult",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendAccessRequestResultEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendEmailChangeConfirmation({
  to,
  newEmail,
  confirmUrl,
  userName,
}: {
  to: string;
  newEmail: string;
  confirmUrl: string;
  userName: string;
}): Promise<EmailSendResult> {
  try {
    const props = { newEmail, confirmUrl, userName };
    await sendEmailOrLog({
      to,
      subject: "Confirm your new email address",
      html: emailChangeEmailHtml(props),
      text: emailChangeEmailText(props),
      templateName: "emailChange",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendEmailChangeConfirmation] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: {
  to: string;
  resetUrl: string;
  userName: string;
}): Promise<EmailSendResult> {
  try {
    const props = { resetUrl, userName };
    await sendEmailOrLog({
      to,
      subject: "Reset your Annote password",
      html: passwordResetEmailHtml(props),
      text: passwordResetEmailText(props),
      templateName: "passwordReset",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendPasswordResetEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendEmailVerification({
  to,
  verifyUrl,
  userName,
}: {
  to: string;
  verifyUrl: string;
  userName: string;
}): Promise<EmailSendResult> {
  try {
    const props = { verifyUrl, userName };
    await sendEmailOrLog({
      to,
      subject: "Verify your email — Annote",
      html: emailVerificationHtml(props),
      text: emailVerificationText(props),
      templateName: "emailVerification",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendEmailVerification] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendWorkspaceDeletionConfirmationEmail({
  to,
  workspaceName,
  purgeDate,
}: {
  to: string;
  workspaceName: string;
  purgeDate: Date;
}): Promise<EmailSendResult> {
  try {
    const purgeDateStr = purgeDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const props = { workspaceName, purgeDate: purgeDateStr };
    await sendEmailOrLog({
      to,
      subject: `Your workspace "${workspaceName}" has been scheduled for deletion`,
      html: workspaceDeletedConfirmationHtml(props),
      text: workspaceDeletedConfirmationText(props),
      fromVariant: "founder",
      templateName: "workspaceDeletedConfirmation",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendWorkspaceDeletionConfirmationEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

/**
 * Member-removed notice. Sent to the removed user so they know their access
 * is gone. This is a workspace-state notification, not optional notification
 * spam, so it bypasses preferences and goes via sendEmailOrLog directly.
 */
export async function sendMemberRemovedEmail({
  removedEmail,
  removedName,
  workspaceName,
  removerName,
  dashboardUrl,
}: {
  removedEmail: string;
  removedName: string;
  workspaceName: string;
  removerName: string;
  dashboardUrl: string;
}): Promise<EmailSendResult> {
  try {
    const removedFirstName =
      (removedName ?? "").trim().split(/\s+/)[0] || "there";
    const props = {
      removedFirstName,
      workspaceName,
      removerName,
      dashboardUrl,
    };
    await sendEmailOrLog({
      to: removedEmail,
      subject: memberRemovedSubject(workspaceName),
      html: memberRemovedEmailHtml(props),
      text: memberRemovedEmailText(props),
      templateName: "memberRemoved",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendMemberRemovedEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

/**
 * Email-change security notice. Sent to the ORIGINAL email after an
 * email-change request, so the account's rightful owner is alerted even if
 * someone else initiated the change. Security-critical: must always send,
 * never gated by preferences.
 */
export async function sendEmailChangeNoticeEmail({
  originalEmail,
  userName,
  newEmail,
  passwordResetUrl,
}: {
  originalEmail: string;
  userName: string;
  newEmail: string;
  passwordResetUrl: string;
}): Promise<EmailSendResult> {
  try {
    const firstName = (userName ?? "").trim().split(/\s+/)[0] || "there";
    const props = { firstName, newEmail, passwordResetUrl };
    await sendEmailOrLog({
      to: originalEmail,
      subject: emailChangeNoticeSubject(),
      html: emailChangeNoticeHtml(props),
      text: emailChangeNoticeText(props),
      templateName: "emailChangeNotice",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendEmailChangeNoticeEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

/**
 * Notify the PREVIOUS owner after a workspace ownership transfer.
 * Security-significant: bypasses preferences via sendEmailOrLog directly.
 */
export async function sendOwnershipTransferredOldEmail({
  previousOwnerEmail,
  previousOwnerName,
  workspaceName,
  newOwnerName,
  newOwnerEmail,
}: {
  previousOwnerEmail: string;
  previousOwnerName: string;
  workspaceName: string;
  newOwnerName: string;
  newOwnerEmail: string;
}): Promise<EmailSendResult> {
  try {
    const previousOwnerFirstName =
      (previousOwnerName ?? "").trim().split(/\s+/)[0] || "there";
    const props = {
      previousOwnerFirstName,
      workspaceName,
      newOwnerName,
      newOwnerEmail,
    };
    await sendEmailOrLog({
      to: previousOwnerEmail,
      subject: ownershipTransferredOldSubject(workspaceName),
      html: ownershipTransferredOldHtml(props),
      text: ownershipTransferredOldText(props),
      templateName: "ownershipTransferredOld",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendOwnershipTransferredOldEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

/**
 * Notify the NEW owner after a workspace ownership transfer.
 * Billing-implicating: bypasses preferences via sendEmailOrLog directly.
 */
export async function sendOwnershipTransferredNewEmail({
  newOwnerEmail,
  newOwnerName,
  previousOwnerName,
  workspaceName,
  planName,
  seatCount,
  nextBillingDate,
  priceFormatted,
  settingsUrl,
}: {
  newOwnerEmail: string;
  newOwnerName: string;
  previousOwnerName: string;
  workspaceName: string;
  planName: string | null;
  seatCount: number | null;
  nextBillingDate: Date | null;
  priceFormatted: string | null;
  settingsUrl: string;
}): Promise<EmailSendResult> {
  try {
    const newOwnerFirstName =
      (newOwnerName ?? "").trim().split(/\s+/)[0] || "there";
    const nextBillingDateStr = nextBillingDate
      ? nextBillingDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const props = {
      newOwnerFirstName,
      previousOwnerName,
      workspaceName,
      planName,
      seatCount,
      nextBillingDate: nextBillingDateStr,
      priceFormatted,
      settingsUrl,
    };
    await sendEmailOrLog({
      to: newOwnerEmail,
      subject: ownershipTransferredNewSubject(workspaceName),
      html: ownershipTransferredNewHtml(props),
      text: ownershipTransferredNewText(props),
      fromVariant: "founder",
      templateName: "ownershipTransferredNew",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendOwnershipTransferredNewEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

/**
 * Notify a non-owner workspace member that their workspace has been
 * scheduled for deletion. The owner already receives
 * sendWorkspaceDeletionConfirmationEmail; this fans out the same event
 * to the remaining members so they can export their work before the
 * purge date. Bypasses preferences — workspace state change, not opt-in.
 */
export async function sendWorkspaceDeletedMemberEmail({
  memberEmail,
  memberName,
  workspaceName,
  ownerName,
  deletionDate,
}: {
  memberEmail: string;
  memberName: string;
  workspaceName: string;
  ownerName: string;
  deletionDate: Date;
}): Promise<EmailSendResult> {
  try {
    const memberFirstName =
      (memberName ?? "").trim().split(/\s+/)[0] || "there";
    const deletionDateStr = deletionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const props = {
      memberFirstName,
      workspaceName,
      ownerName,
      deletionDate: deletionDateStr,
    };
    await sendEmailOrLog({
      to: memberEmail,
      subject: workspaceDeletedMemberSubject(workspaceName),
      html: workspaceDeletedMemberHtml(props),
      text: workspaceDeletedMemberText(props),
      templateName: "workspaceDeletedMember",
      templateCategory: "transactional",
    });
    return { sent: true };
  } catch (err) {
    console.error("[sendWorkspaceDeletedMemberEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}

export async function sendInviteAcceptedEmail({
  inviterUid,
  inviterName,
  acceptedByName,
  acceptedByEmail,
  workspaceName,
  memberCount,
  workspaceMembersUrl,
}: {
  inviterUid: string;
  inviterName: string;
  acceptedByName: string;
  acceptedByEmail: string;
  workspaceName: string;
  memberCount: number;
  workspaceMembersUrl: string;
}): Promise<EmailSendResult> {
  try {
    const inviterFirstName = (inviterName ?? "").trim().split(/\s+/)[0] || "there";
    const props = {
      inviterFirstName,
      acceptedByName,
      acceptedByEmail,
      workspaceName,
      memberCount,
      workspaceMembersUrl,
    };
    return await sendEmailWithPreferencesByUid({
      uid: inviterUid,
      category: "notifications",
      subject: `${acceptedByName} joined your workspace`,
      htmlBuilder: (unsubscribeUrl) =>
        inviteAcceptedEmailHtml({ ...props, unsubscribeUrl }),
      textBuilder: (unsubscribeUrl) =>
        inviteAcceptedEmailText({ ...props, unsubscribeUrl }),
      templateName: "inviteAccepted",
      templateCategory: "notifications",
    });
  } catch (err) {
    console.error("[sendInviteAcceptedEmail] failed:", err);
    return { sent: false, reason: failureReason(err) };
  }
}
