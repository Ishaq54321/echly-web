// Phase 1 placeholder for the marketing home. Rendered from app/page.tsx
// (the smart root), which means it is NOT mounted inside (marketing)/layout
// and therefore does not receive MarketingHeader/MarketingFooter chrome.
//
// Phase 2 will either:
//   (a) compose MarketingHeader + MarketingFooter directly inside the home
//       so the smart root can keep rendering this component, or
//   (b) move the marketing home into (marketing)/page.tsx and make the
//       smart root forward to it.
// Either decision is deferred to Phase 2 — for Phase 1 the placeholder is
// intentionally self-contained.

export function MarketingHome() {
  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--surface-page)" }}
    >
      <div className="max-w-2xl px-6 py-24 text-center">
        <h1
          className="mb-4 text-4xl font-semibold"
          style={{ color: "var(--text-heading)" }}
        >
          Annote — Marketing Home Placeholder
        </h1>
        <p
          className="mb-8 text-lg"
          style={{ color: "var(--text-body)" }}
        >
          Foundation is wired up. Phase 2 will replace this with the real
          landing page.
        </p>
        <p
          className="text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          You are viewing this because you are not logged in.
          <br />
          Logged-in users would have been redirected to /dashboard.
        </p>
      </div>
    </main>
  );
}
