import { redirect } from "next/navigation";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribeToken";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { UnsubscribeForm } from "./UnsubscribeForm";

// No auth: the signed token IS the authorization. Never statically rendered.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unsubscribe · Annote",
  robots: { index: false, follow: false },
};

const CATEGORY_LABEL: Record<string, string> = {
  lifecycle: "onboarding and product",
  notifications: "comment, mention, and assignment",
  digest: "weekly digest",
  marketing: "product announcement",
  all: "non-essential",
};

function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? "non-essential";
}

/**
 * Server action: applies the opt-out. This is intentionally a POST (form
 * submit) rather than a side effect of rendering the page on GET. Email
 * security scanners and inbox link-prefetchers (Gmail, Outlook, Proofpoint)
 * issue GET requests to every link in an email; doing the write on GET would
 * silently unsubscribe users whose provider scans links. The page below
 * auto-submits this form on load so it still feels one-click for real
 * browsers, with a manual button as the no-JS fallback.
 */
async function applyUnsubscribe(formData: FormData): Promise<void> {
  "use server";

  const token = String(formData.get("token") ?? "");
  const verified = verifyUnsubscribeToken(token);
  if (!verified.ok) {
    // Token re-checked server-side; never trust the client round-trip.
    redirect(`/unsubscribe?token=${encodeURIComponent(token)}`);
  }

  const update: Record<string, boolean> = {};
  if (verified.category === "all") {
    update["emailPreferences.lifecycle"] = false;
    update["emailPreferences.notifications"] = false;
    update["emailPreferences.digest"] = false;
    update["emailPreferences.marketing"] = false;
  } else {
    update[`emailPreferences.${verified.category}`] = false;
  }

  await adminDb.collection("users").doc(verified.uid).update(update);

  redirect(
    `/unsubscribe?token=${encodeURIComponent(token)}&done=1`
  );
}

const PAGE_WRAP =
  "min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4";
const CARD =
  "bg-white rounded-lg p-8 max-w-md w-full border border-[#ECECEA]";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token, done } = await searchParams;

  if (!token) {
    return (
      <main className={PAGE_WRAP}>
        <div className={CARD}>
          <h1 className="text-2xl font-semibold text-[#15101F]">
            Invalid unsubscribe link
          </h1>
          <p className="mt-2 text-[#54495F]">
            This link is missing its token. Open the link directly from the
            email, or email{" "}
            <a
              href="mailto:ishaq@annote.ai"
              className="text-[#5A49BF] underline"
            >
              ishaq@annote.ai
            </a>{" "}
            and we&apos;ll sort it out.
          </p>
        </div>
      </main>
    );
  }

  const verified = verifyUnsubscribeToken(token);
  if (!verified.ok) {
    return (
      <main className={PAGE_WRAP}>
        <div className={CARD}>
          <h1 className="text-2xl font-semibold text-[#15101F]">
            This unsubscribe link isn&apos;t valid
          </h1>
          <p className="mt-2 text-[#54495F]">
            It may have been altered or copied incorrectly. Open the link
            directly from the email, or email{" "}
            <a
              href="mailto:ishaq@annote.ai"
              className="text-[#5A49BF] underline"
            >
              ishaq@annote.ai
            </a>{" "}
            to be removed manually.
          </p>
        </div>
      </main>
    );
  }

  const label = categoryLabel(verified.category);

  // Post-submit confirmation state (server action redirects back with ?done=1).
  if (done === "1") {
    return (
      <main className={PAGE_WRAP}>
        <div className={CARD}>
          <h1 className="text-2xl font-semibold text-[#15101F]">
            You&apos;re unsubscribed
          </h1>
          <p className="mt-2 text-[#54495F]">
            You won&apos;t receive {label} emails from Annote anymore.
          </p>
          <p className="mt-4 text-sm text-[#54495F]">
            You&apos;ll still get transactional emails (password reset, billing
            receipts, security alerts) — these are required for account
            security and can&apos;t be turned off.
          </p>
          <p className="mt-6 text-sm text-[#54495F]">
            Changed your mind?{" "}
            {/* TODO(post-launch): build /settings notifications tab so this
                resubscribe link lands on a real preferences UI. For Phase 3
                the tab doesn't exist yet; the unsubscribe flow stands alone. */}
            <a
              href="/settings?tab=notifications"
              className="text-[#5A49BF] underline"
            >
              Manage email preferences
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={PAGE_WRAP}>
      <div className={CARD}>
        <h1 className="text-2xl font-semibold text-[#15101F]">
          Unsubscribe from {label} emails?
        </h1>
        <p className="mt-2 text-[#54495F]">
          Confirm and you won&apos;t receive {label} emails from Annote
          anymore. Transactional emails (password reset, billing, security)
          will still come through.
        </p>
        <UnsubscribeForm action={applyUnsubscribe} token={token} />
      </div>
    </main>
  );
}
