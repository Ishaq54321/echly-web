import Link from "next/link";
import { AnnoteLogo } from "./AnnoteLogo";

const NAV_LINKS: ReadonlyArray<{ label: string; href: string; caret?: boolean }> = [
  { label: "Product", href: "#product", caret: true },
  { label: "Agencies", href: "#agencies" },
  { label: "Teams", href: "#teams" },
  { label: "Pricing", href: "#pricing" },
];

export function MarketingHeader() {
  return (
    <header className="mk-nav mk-nav--hero">
      <div className="mk-nav-inner">
        <Link href="/" className="mk-logo" aria-label="Annote">
          <span className="mk-logo-mark">
            <AnnoteLogo width={22} height={28} variant="gradient" />
          </span>
          <span className="mk-logo-word">Annote</span>
        </Link>

        <nav className="mk-nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
              {link.caret ? <span className="caret-d">▾</span> : null}
            </a>
          ))}
        </nav>

        <div className="mk-nav-cta">
          <a className="mk-nav-link-quiet" href="#contact">
            Contact sales
          </a>
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
