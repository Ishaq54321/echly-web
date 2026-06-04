import {
  emailShellV2,
  emailCardV2,
  emailButtonV2,
  emailButtonRowV2,
  emailParagraphV2,
  emailSpacerV2,
  emailSignoffV2,
  escapeEmailHtml,
  plainTextShellV2,
  EMAIL_COLORS,
  EMAIL_SIZES,
} from "../components";

/**
 * Activity digest email — one email per user, one card per session, with
 * per-event-type summary lines. This is the ONLY notification-category email
 * after the digest cutover (all instant notification emails were retired).
 *
 * The template is render-only: it takes a fully-resolved model (links already
 * built by the dispatcher) so it stays free of server-only / env concerns and
 * matches how every other Phase-4 template receives pre-built URLs as props.
 */

/** A summary line within a session card, e.g. "12 new comments from 4 people". */
export interface DigestLineProps {
  /** Human one-liner (already composed by the pure grouping function). */
  summary: string;
  /** Optional representative ticket links (rendered inline after the summary). */
  links: Array<{ title: string; url: string | null }>;
}

export interface DigestSectionProps {
  sessionTitle: string;
  /** Deep link to the session (null → no link, title rendered as plain text). */
  sessionUrl: string | null;
  lines: DigestLineProps[];
}

export interface ActivityDigestProps {
  /** Greeting target, e.g. "Maya"; falls back to a generic greeting if absent. */
  firstName?: string;
  /** Top-line summary, e.g. "You have 18 updates across 3 sessions." */
  summaryLine: string;
  sections: DigestSectionProps[];
  /** When the user's notifications were capped; render a "+N more" note. */
  truncatedNote?: string | null;
  /** Link to the in-app activity/dashboard view ("See everything in Annote"). */
  dashboardUrl: string;
  /** Signed unsubscribe URL — threaded through by sendEmailWithPreferences. */
  unsubscribeUrl?: string;
}

/** One representative-ticket link line under a summary, e.g. "→ Login button…". */
function renderItemLinks(
  links: Array<{ title: string; url: string | null }>
): string {
  const rendered = links
    .map((l) => {
      const safeTitle = escapeEmailHtml(l.title);
      if (l.url) {
        return `<span style="white-space:nowrap;"><a href="${l.url}" style="color:${EMAIL_COLORS.linkColor};text-decoration:none;">${safeTitle}</a></span>`;
      }
      return `<span style="white-space:nowrap;">${safeTitle}</span>`;
    })
    .join('<span style="color:' + EMAIL_COLORS.hairline + ';">&nbsp;·&nbsp;</span>');
  if (!rendered) return "";
  return `<tr><td style="padding:2px 0 0 0;font-size:13px;color:${EMAIL_COLORS.textSecondary};line-height:1.5;">${rendered}</td></tr>`;
}

/** A single session card: title (linked) + bullet-ish summary lines. */
function renderSection(section: DigestSectionProps): string {
  const safeTitle = escapeEmailHtml(section.sessionTitle);
  const titleHtml = section.sessionUrl
    ? `<a href="${section.sessionUrl}" style="color:${EMAIL_COLORS.textPrimary};text-decoration:none;">${safeTitle}</a>`
    : safeTitle;

  const lineRows = section.lines
    .map((line) => {
      const safeSummary = escapeEmailHtml(line.summary);
      const summaryRow = `<tr><td style="padding:0;font-size:${EMAIL_SIZES.bodyFontSize}px;color:${EMAIL_COLORS.textPrimary};line-height:1.5;">${safeSummary}</td></tr>`;
      return `${summaryRow}${renderItemLinks(line.links)}`;
    })
    // 12px gap between summary lines within a card.
    .join(`<tr><td style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>`);

  return emailCardV2({
    content: `
      <tr><td style="padding:0 0 14px 0;font-size:17px;font-weight:600;color:${EMAIL_COLORS.textPrimary};line-height:1.3;letter-spacing:-0.01em;">${titleHtml}</td></tr>
      ${lineRows}
    `,
  });
}

export function activityDigestSubject(subject: string): string {
  // The subject is computed by the pure grouping function (buildDigestSubject)
  // and passed straight through; this indirection keeps the call site uniform
  // with the other templates that export a *Subject helper.
  return subject;
}

export function activityDigestEmailHtml({
  firstName,
  summaryLine,
  sections,
  truncatedNote,
  dashboardUrl,
  unsubscribeUrl,
}: ActivityDigestProps): string {
  const greeting = firstName ? `Hi ${escapeEmailHtml(firstName)},` : "Hi there,";

  const sectionCards = sections
    .map(renderSection)
    // 16px between session cards, matching the kit's multi-card spacing.
    .join(emailSpacerV2({ height: 16 }));

  const truncatedRow = truncatedNote
    ? emailSpacerV2({ height: 16 }) +
      emailCardV2({
        content: `<tr><td style="padding:0;font-size:13px;color:${EMAIL_COLORS.textSecondary};line-height:1.5;">${escapeEmailHtml(
          truncatedNote
        )}</td></tr>`,
      })
    : "";

  // Lead card: greeting + summary + CTA into the app. Subsequent cards are the
  // per-session sections. The shell's category/title strip is intentionally not
  // used here (the digest leads with its own greeting card).
  const leadCard = emailCardV2({
    content: `
      ${emailParagraphV2(escapeEmailHtml(greeting))}
      ${emailParagraphV2(escapeEmailHtml(summaryLine), { spaceAfter: 8 })}
      ${emailButtonRowV2(
        emailButtonV2({ label: "Open Annote", href: dashboardUrl })
      )}
      ${emailSignoffV2("Here's what happened since your last digest:")}
    `,
  });

  return emailShellV2({
    preheader: summaryLine,
    unsubscribeUrl,
    content: `
      ${leadCard}
      ${emailSpacerV2({ height: 16 })}
      ${sectionCards}
      ${truncatedRow}
    `,
  });
}

export function activityDigestEmailText({
  firstName,
  summaryLine,
  sections,
  truncatedNote,
  dashboardUrl,
  unsubscribeUrl,
}: ActivityDigestProps): string {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const sectionBlocks = sections
    .map((section) => {
      const header = section.sessionUrl
        ? `${section.sessionTitle} (${section.sessionUrl})`
        : section.sessionTitle;
      const lines = section.lines
        .map((line) => {
          const linkSuffix = line.links
            .filter((l) => l.url)
            .map((l) => `${l.title}: ${l.url}`)
            .join("\n      ");
          return linkSuffix
            ? `  - ${line.summary}\n      ${linkSuffix}`
            : `  - ${line.summary}`;
        })
        .join("\n");
      return `${header}\n${lines}`;
    })
    .join("\n\n");

  const truncatedBlock = truncatedNote ? `\n\n${truncatedNote}` : "";

  return plainTextShellV2({
    unsubscribeUrl,
    body: `${greeting}

${summaryLine}

${sectionBlocks}${truncatedBlock}

Open Annote: ${dashboardUrl}

— Annote`,
  });
}
