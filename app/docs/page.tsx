// Stub /docs page (Phase 3). The welcome email links here; this gives that
// link a real destination until proper docs exist. Intentionally minimal —
// "WHAT WE'RE NOT DOING" rules out building real docs in this phase.

// Chrome Web Store listing. Uses the same placeholder the rest of the app
// uses (see ExtensionStep / useSessionEntryCta); all get the real extension
// id at the same time when the listing is published.
const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/echly/PLACEHOLDER";

export const metadata = {
  title: "Docs · Annote",
  description: "Annote documentation — coming soon.",
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6]">
      <div className="max-w-2xl mx-auto p-8 pt-16">
        <a
          href="https://annote.ai"
          className="inline-block mb-8 text-lg font-semibold text-[#15101F] no-underline"
        >
          Annote
        </a>

        <h1 className="text-3xl font-semibold text-[#15101F] mb-4">
          Docs are coming soon.
        </h1>

        <p className="text-[#54495F] leading-relaxed mb-6">
          We&apos;re working on a proper guide. For now, the fastest way to
          learn Annote is to install the extension and try it on any page —
          select anything, leave feedback, done.
        </p>

        <p className="text-[#54495F] leading-relaxed mb-8">
          Got questions? Just email me directly at{" "}
          <a
            href="mailto:ishaq@annote.ai"
            className="text-[#5A49BF] underline"
          >
            ishaq@annote.ai
          </a>{" "}
          — I read everything.
        </p>

        <a
          href={CHROME_WEB_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#15101F] text-white px-6 py-3 rounded-md font-medium no-underline"
        >
          Install the extension
        </a>

        <p className="mt-10 text-sm">
          <a href="https://annote.ai" className="text-[#54495F] underline">
            ← Back to Annote
          </a>
        </p>
      </div>
    </main>
  );
}
