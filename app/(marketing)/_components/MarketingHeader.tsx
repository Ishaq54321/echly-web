import Link from "next/link";
import { AnnoteLogo } from "./AnnoteLogo";

type UseCase = {
  label: string;
  href: string;
  desc: string;
  icon: React.ReactNode;
};

// "Use cases" mega-dropdown — the three reviewer-facing pages. Agencies and
// Teams stay as their own top-level nav items (see NAV_LINKS below).
const USE_CASES: ReadonlyArray<UseCase> = [
  {
    label: "QA testing",
    href: "/use-cases/qa-testing",
    desc: "Bug reports with the console, network, and steps attached.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 2v3M16 2v3M9 9h6M9 13h6M9 17h3" />
        <rect x="4" y="5" width="16" height="17" rx="2" />
      </svg>
    ),
  },
  {
    label: "Design review",
    href: "/use-cases/design-review",
    desc: "Feedback pinned to the exact element on the live page.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    label: "Client feedback",
    href: "/use-cases/client-feedback",
    desc: "One link your client opens — no account, no install.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
      </svg>
    ),
  },
];

const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Agencies", href: "/use-cases/agencies" },
  { label: "Teams", href: "/use-cases/teams" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];

export function MarketingHeader({
  variant = "hero",
}: {
  // "hero" — transparent floating island over the homepage's dark hero.
  // "solid" — same dark island, but in flow at the top of a light interior page.
  variant?: "hero" | "solid";
}) {
  return (
    <header className={`mk-nav mk-nav--${variant}`}>
      <div className="mk-nav-inner">
        <Link href="/" className="mk-logo" aria-label="Annote">
          <span className="mk-logo-mark">
            <AnnoteLogo width={22} height={28} variant="white" />
          </span>
          <span className="mk-logo-word">Annote</span>
        </Link>

        <nav className="mk-nav-links" aria-label="Primary">
          <div className="mk-nav-item mk-nav-item--dropdown">
            <button
              type="button"
              className="mk-nav-trigger"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Use cases
              <span className="caret-d">▾</span>
            </button>
            <div className="mk-dropdown" role="menu" aria-label="Use cases">
              <div className="mk-dropdown-panel">
                {USE_CASES.map((uc) => (
                  <Link
                    key={uc.href}
                    href={uc.href}
                    className="mk-dropdown-item"
                    role="menuitem"
                  >
                    <span className="mk-dropdown-ico">{uc.icon}</span>
                    <span className="mk-dropdown-text">
                      <span className="mk-dropdown-label">{uc.label}</span>
                      <span className="mk-dropdown-desc">{uc.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mk-nav-cta">
          <Link className="mk-nav-link-quiet mk-nav-contact" href="/#contact">
            Contact sales
          </Link>
          <Link className="mk-nav-link-quiet" href="/login">
            Sign in
          </Link>
          <Link className="btn-primary mk-nav-signup" href="/signup">
            Get Annote
          </Link>
        </div>
      </div>
    </header>
  );
}
