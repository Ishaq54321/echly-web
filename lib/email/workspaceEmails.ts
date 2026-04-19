import "server-only";
import { sendEmailOrLog } from "./resend";
import { workspaceInviteEmailHtml } from "./templates/workspaceInvite";
import { workspaceInviteReminderHtml } from "./templates/workspaceInviteReminder";
import { workspaceDeletedConfirmationHtml } from "./templates/workspaceDeletedConfirmation";

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
