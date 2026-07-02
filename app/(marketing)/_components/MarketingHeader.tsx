import Link from "next/link";
import { AnnoteLogo } from "./AnnoteLogo";
import { MarketingMobileNav } from "./MarketingMobileNav";
import { USE_CASES, NAV_LINKS } from "./navData";

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

        {/* Mobile-only: hamburger + full-screen menu. Hidden >1100px (CSS), so
            the desktop nav above is unaffected. */}
        <MarketingMobileNav />
      </div>
    </header>
  );
}
