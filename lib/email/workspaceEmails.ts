import "server-only";
import { resend } from "./resend";
import { workspaceInviteEmailHtml } from "./templates/workspaceInvite";
import { workspaceInviteReminderHtml } from "./templates/workspaceInviteReminder";
import { workspaceDeletedConfirmationHtml } from "./templates/workspaceDeletedConfirmation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";
const FROM_ADDRESS = `invites@${new URL(APP_URL).hostname}`;

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
  await resend.emails.send({
    from: FROM_ADDRESS,
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
  await resend.emails.send({
    from: FROM_ADDRESS,
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
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your workspace "${workspaceName}" has been scheduled for deletion`,
    html: workspaceDeletedConfirmationHtml({ workspaceName, purgeDate: purgeDateStr }),
  });
}
