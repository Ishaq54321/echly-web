import "server-only";
import { sendEmailOrLog } from "./resend";
import { workspaceInviteEmailHtml } from "./templates/workspaceInvite";
import { workspaceInviteReminderHtml } from "./templates/workspaceInviteReminder";
import { workspaceDeletedConfirmationHtml } from "./templates/workspaceDeletedConfirmation";
import { sessionInviteEmailHtml } from "./templates/sessionInvite";
import { accessRequestNotificationEmailHtml } from "./templates/accessRequestNotification";
import { accessRequestResultEmailHtml } from "./templates/accessRequestResult";

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
  await sendEmailOrLog({
    to,
    subject: `You've been invited to join ${workspaceName}`,
    html: workspaceInviteEmailHtml({
      invitedByName,
      workspaceName,
      role,
      acceptUrl,
      expiresInDays: 30,
    }),
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
  await sendEmailOrLog({
    to,
    subject: `Your invitation to ${workspaceName} expires in ${expiresInDays} days`,
    html: workspaceInviteReminderHtml({ workspaceName, acceptUrl, expiresInDays }),
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
    await sendEmailOrLog({
      to,
      subject: `You've been invited to view ${sessionName}`,
      html: sessionInviteEmailHtml({
        invitedByName,
        sessionName,
        workspaceName,
        accessLevel,
        sessionUrl,
        requiresAccount,
      }),
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
    await Promise.allSettled(
      to.map((recipient) =>
        sendEmailOrLog({
          to: recipient,
          subject: `${requesterEmail} requested access to ${sessionName}`,
          html: accessRequestNotificationEmailHtml({
            requesterEmail,
            sessionName,
            sessionUrl,
            workspaceName,
          }),
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
    await sendEmailOrLog({
      to,
      subject: approved
        ? `You now have access to ${sessionName}`
        : `Access request for ${sessionName}`,
      html: accessRequestResultEmailHtml({ approved, sessionName, sessionUrl, workspaceName }),
    });
  } catch (err) {
    console.error("[sendAccessRequestResultEmail] failed", err);
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
}): Promise<void> {
  const purgeDateStr = purgeDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  await sendEmailOrLog({
    to,
    subject: `Your workspace "${workspaceName}" has been scheduled for deletion`,
    html: workspaceDeletedConfirmationHtml({ workspaceName, purgeDate: purgeDateStr }),
  });
}
