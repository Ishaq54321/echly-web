import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailParagraphV2,
  emailSignoffV2,
  emailSpacerV2,
  escapeEmailHtml,
  plainTextShellV2,
} from "../components";

interface WorkspaceDeletedConfirmationProps {
  workspaceName: string;
  purgeDate: string;
  /** Phase-5 optional: recipient first name for the greeting. Falls back to "there". */
  firstName?: string;
  /**
   * Phase-5 optional: URL to the restore/cancel-deletion affordance.
   *
   * AUDIT (Phase 2): the settings page has NO "Cancel deletion" / "Restore
   * workspace" affordance today — only a one-way "Delete Workspace" that
   * schedules purge. No API route clears `deletedAt`. So callers cannot pass
   * a real restoreUrl yet; when absent the email renders WITHOUT a CTA and
   * uses reply-to-cancel copy (matches the current product behavior — the
   * cron purge is the only path, reversible only by contacting a human).
   * When a restore UI ships, Phase 5 passes restoreUrl and the "Restore
   * workspace" button + restore copy activate automatically.
   */
  restoreUrl?: string;
}

export function workspaceDeletedConfirmationHtml({
  workspaceName,
  purgeDate,
  firstName,
  restoreUrl,
}: WorkspaceDeletedConfirmationProps): string {
  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";
  const safeWorkspace = escapeEmailHtml(workspaceName);
  const safePurge = escapeEmailHtml(purgeDate);

  // Restore-capable variant (Phase 5): real "Restore workspace" CTA.
  if (restoreUrl) {
    return emailShellV2({
      preheader: "Restore anytime within 30 days.",
      category: "Workspace deleted",
      title: "Your workspace is gone",
      metadata: `Can be restored until ${safePurge}`,
      content: emailCardV2({
        content: `
          ${emailParagraphV2(`Hey ${greetingName},`)}
          ${emailParagraphV2(
            `You scheduled <strong>"${safeWorkspace}"</strong> for deletion. Everything (sessions, captures, comments, members) will be permanently deleted on <strong>${safePurge}</strong> — 30 days from today.`
          )}
          ${emailParagraphV2("You can restore the workspace anytime before that date.")}
          ${emailSpacerV2({ height: 8 })}
          ${emailButtonRowV2(emailButtonV2({ label: "Restore workspace", href: restoreUrl }))}
          ${emailSpacerV2({ height: 8 })}
          ${emailParagraphV2(
            `After ${safePurge}, the workspace and all its data is gone. There's no recovery after that.`
          )}
          ${emailParagraphV2(
            "If you deleted this by mistake or have questions, just reply.",
            { spaceAfter: 0 }
          )}
          ${emailSignoffV2("— Ishaq, Founder, Annote")}
        `,
      }),
    });
  }

  // No-CTA fallback (current product reality — no restore UI exists).
  return emailShellV2({
    preheader: "Reply within 30 days to cancel.",
    category: "Workspace deleted",
    title: "Your workspace is gone",
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          `You scheduled <strong>"${safeWorkspace}"</strong> for deletion. Everything (sessions, captures, comments, members) will be permanently deleted on <strong>${safePurge}</strong> — 30 days from today.`
        )}
        ${emailParagraphV2(
          `After ${safePurge}, the workspace and all its data is gone. There's no recovery after that.`
        )}
        ${emailParagraphV2(
          "If you deleted this by mistake and want to cancel, just reply to this email within 30 days and we'll stop the deletion before it runs.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function workspaceDeletedConfirmationText({
  workspaceName,
  purgeDate,
  firstName,
  restoreUrl,
}: WorkspaceDeletedConfirmationProps): string {
  const greetingName = firstName ?? "there";

  if (restoreUrl) {
    return plainTextShellV2({
      body: `Hey ${greetingName},

You scheduled "${workspaceName}" for deletion. Everything (sessions, captures, comments, members) will be permanently deleted on ${purgeDate} — 30 days from today.

You can restore the workspace anytime before that date.

Restore workspace: ${restoreUrl}

After ${purgeDate}, the workspace and all its data is gone. There's no recovery after that.

If you deleted this by mistake or have questions, just reply.

— Ishaq, Founder, Annote`,
    });
  }

  return plainTextShellV2({
    body: `Hey ${greetingName},

You scheduled "${workspaceName}" for deletion. Everything (sessions, captures, comments, members) will be permanently deleted on ${purgeDate} — 30 days from today.

After ${purgeDate}, the workspace and all its data is gone. There's no recovery after that.

If you deleted this by mistake and want to cancel, just reply to this email within 30 days and we'll stop the deletion before it runs.

— Ishaq, Founder, Annote`,
  });
}
