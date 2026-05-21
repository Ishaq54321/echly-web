import Link from "next/link";

// Marketing header — intentionally NOT a reuse of components/layout/GlobalHeader.
// GlobalHeader fires authFetch("/api/workspace/member-count") and subscribes
// to billing/notifications stores on mount; none of that is safe (or useful)
// for logged-out visitors. This is a clean, dependency-free header.

const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "#pricing" },
  { label: "Changelog", href: "#changelog" },
];

export function MarketingHeader() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        background: "var(--surface-page)",
        borderColor: "transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight"
          style={{ color: "var(--text-heading)" }}
        >
          Annote
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm transition-colors hover:opacity-100"
              style={{ color: "var(--text-body)" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm transition-colors"
            style={{ color: "var(--text-body)" }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--brand)" }}
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </div>
    </header>
  );
}
