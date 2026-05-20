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
import { EXTENSION_INSTALL_URL, docsUrl } from "../urls";

interface WelcomeProps {
  /**
   * Recipient's first name for the greeting. Falls back to "there" when the
   * user doc has no firstName (caller should resolve email local-part first;
   * "there" is the last resort).
   */
  firstName?: string;
  /** Override the extension install URL (defaults to the Chrome Web Store listing). */
  installUrl?: string;
}

const DOCS_LINK = docsUrl();

export function welcomeEmailHtml({
  firstName,
  installUrl = EXTENSION_INSTALL_URL,
}: WelcomeProps): string {
  const greetingName = firstName ? escapeEmailHtml(firstName) : "there";

  return emailShellV2({
    preheader: "Thanks for signing up — here's the quick guide.",
    category: "Welcome to Annote",
    title: "You're in",
    content: emailCardV2({
      content: `
        ${emailParagraphV2(`Hey ${greetingName},`)}
        ${emailParagraphV2(
          "Thanks for signing up. Annote is, in one sentence: click anywhere on a page, say what you mean, get a clean ticket. The faster you try it on a real page, the faster it makes sense."
        )}
        ${emailParagraphV2(
          "There's one thing to do before you can capture anything — install the browser extension. It takes about thirty seconds."
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailButtonRowV2(
          emailButtonV2({ label: "Install the extension", href: installUrl })
        )}
        ${emailSpacerV2({ height: 8 })}
        ${emailParagraphV2(
          `After that, open any site and start capturing. The full guide is in <a href="${DOCS_LINK}" style="color:#5A49BF;text-decoration:underline;">our docs</a> if you want to see how it works first.`
        )}
        ${emailParagraphV2(
          "If anything feels off or you get stuck, just reply to this email. It comes to me directly.",
          { spaceAfter: 0 }
        )}
        ${emailSignoffV2("— Ishaq, Founder, Annote")}
      `,
    }),
  });
}

export function welcomeEmailText({
  firstName,
  installUrl = EXTENSION_INSTALL_URL,
}: WelcomeProps): string {
  const greetingName = firstName ?? "there";

  return plainTextShellV2({
    body: `Hey ${greetingName},

Thanks for signing up. Annote is, in one sentence: click anywhere on a page, say what you mean, get a clean ticket. The faster you try it on a real page, the faster it makes sense.

There's one thing to do before you can capture anything — install the browser extension. It takes about thirty seconds.

Install the extension: ${installUrl}

After that, open any site and start capturing. The full guide is in our docs (${DOCS_LINK}) if you want to see how it works first.

If anything feels off or you get stuck, just reply to this email. It comes to me directly.

— Ishaq, Founder, Annote`,
  });
}
