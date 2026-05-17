import "server-only";
import { sendEmailOrLog } from "./resend";
import { workspaceInviteEmailHtml, workspaceInviteEmailText } from "./templates/workspaceInvite";
import {
  workspaceInviteReminderHtml,
  workspaceInviteReminderText,
} from "./templates/workspaceInviteReminder";
import {
  workspaceDeletedConfirmationHtml,
  workspaceDeletedConfirmationText,
} from "./templates/workspaceDeletedConfirmation";
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

// WS-006 FIX: always use verified sender domain
// regardless of APP_URL (localhost would break Resend)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";

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
}): Promise<void> {
  const acceptUrl = `${APP_URL}/invite/${token}`;
  const props = { invitedByName, workspaceName, role, acceptUrl, expiresInDays: 30 };
  await sendEmailOrLog({
    to,
    subject: `You've been invited to join ${workspaceName}`,
    html: workspaceInviteEmailHtml(props),
    text: workspaceInviteEmailText(props),
  });
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
}): Promise<void> {
  const acceptUrl = `${APP_URL}/invite/${token}`;
  const props = { workspaceName, acceptUrl, expiresInDays };
  await sendEmailOrLog({
    to,
    subject: `Your invitation to ${workspaceName} expires in ${expiresInDays} days`,
    html: workspaceInviteReminderHtml(props),
    text: workspaceInviteReminderText(props),
  });
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
}): Promise<void> {
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
    });
  } catch (err) {
    console.error("[sendSessionInviteEmail] failed", err);
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
}): Promise<void> {
  try {
    const props = { requesterEmail, sessionName, sessionUrl, workspaceName };
    await Promise.allSettled(
      to.map((recipient) =>
        sendEmailOrLog({
          to: recipient,
          subject: `${requesterEmail} requested access to ${sessionName}`,
          html: accessRequestNotificationEmailHtml(props),
          text: accessRequestNotificationEmailText(props),
        })
      )
    );
  } catch (err) {
    console.error("[sendAccessRequestNotificationEmail] failed", err);
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
}): Promise<void> {
  try {
    const props = { approved, sessionName, sessionUrl, workspaceName };
    await sendEmailOrLog({
      to,
      subject: approved
        ? `You now have access to ${sessionName}`
        : `Access request for ${sessionName}`,
      html: accessRequestResultEmailHtml(props),
      text: accessRequestResultEmailText(props),
    });
  } catch (err) {
    console.error("[sendAccessRequestResultEmail] failed", err);
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
}): Promise<void> {
  const props = { newEmail, confirmUrl, userName };
  await sendEmailOrLog({
    to,
    subject: "Confirm your new email address",
    html: emailChangeEmailHtml(props),
    text: emailChangeEmailText(props),
  });
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: {
  to: string;
  resetUrl: string;
  userName: string;
}): Promise<void> {
  const props = { resetUrl, userName };
  await sendEmailOrLog({
    to,
    subject: "Reset your Annote password",
    html: passwordResetEmailHtml(props),
    text: passwordResetEmailText(props),
  });
}

export async function sendEmailVerification({
  to,
  verifyUrl,
  userName,
}: {
  to: string;
  verifyUrl: string;
  userName: string;
}): Promise<void> {
  const props = { verifyUrl, userName };
  await sendEmailOrLog({
    to,
    subject: "Verify your email — Annote",
    html: emailVerificationHtml(props),
    text: emailVerificationText(props),
  });
}

export async function sendWorkspaceDeletionConfirmationEmail({
  to,
  workspaceName,
  purgeDate,
}: {
  to: string;
  workspaceName: string;
  purgeDate: Date;
}): Promise<void> {
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
  });
}
