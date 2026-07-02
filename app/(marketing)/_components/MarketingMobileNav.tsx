"use client";

/**
 * <MarketingMobileNav />
 *
 * The mobile-only nav: a hamburger button in the bar that opens a premium,
 * full-screen menu overlay. Desktop (>1100px) hides the button entirely (CSS),
 * so this renders nothing visible there and the desktop nav in MarketingHeader
 * is untouched.
 *
 * The menu is a full-viewport, on-brand dark surface with the site's real
 * destinations (pulled from the shared navData so it can't drift from desktop):
 *   - "Use cases" group: QA testing / Design review / Client feedback
 *   - Top-level: Agencies, Teams, Pricing, Docs
 *   - Actions: Contact sales + Sign in (secondary), Get Annote (primary button)
 *
 * Behaviour: locks body scroll while open, closes on link tap / Escape / X /
 * backdrop, and animates open/close.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { AnnoteLogo } from "./AnnoteLogo";
import { USE_CASES, NAV_LINKS } from "./navData";

export function MarketingMobileNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll + close on Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="mk-nav-burger"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span className="mk-nav-burger-lines" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>

      <div
        className={`mk-mobile-menu${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
      >
        <div className="mk-mobile-menu-top">
          <Link href="/" className="mk-mobile-menu-logo" aria-label="Annote" onClick={close}>
            <span className="mk-mobile-menu-mark">
              <AnnoteLogo width={26} height={33} variant="white" />
            </span>
            <span className="mk-mobile-menu-word">Annote</span>
          </Link>
          <button
            type="button"
            className="mk-mobile-menu-close"
            aria-label="Close menu"
            onClick={close}
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        <nav className="mk-mobile-menu-body" aria-label="Mobile">
          <div className="mk-mobile-group">
            <span className="mk-mobile-group-label">Use cases</span>
            <ul className="mk-mobile-usecases">
              {USE_CASES.map((uc) => (
                <li key={uc.href}>
                  <Link href={uc.href} className="mk-mobile-usecase" onClick={close}>
                    <span className="mk-mobile-usecase-ico">{uc.icon}</span>
                    <span className="mk-mobile-usecase-text">
                      <span className="mk-mobile-usecase-label">{uc.label}</span>
                      <span className="mk-mobile-usecase-desc">{uc.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mk-mobile-group">
            <span className="mk-mobile-group-label">Explore</span>
            <ul className="mk-mobile-links">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="mk-mobile-link" onClick={close}>
                    {link.label}
                    <span className="mk-mobile-link-arrow" aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="mk-mobile-menu-foot">
          <Link className="btn-primary mk-mobile-cta" href="/signup" onClick={close}>
            Get Annote
          </Link>
          <div className="mk-mobile-foot-links">
            <Link className="mk-mobile-foot-link" href="/login" onClick={close}>
              Sign in
            </Link>
            <span className="mk-mobile-foot-sep" aria-hidden="true">·</span>
            <Link className="mk-mobile-foot-link" href="/#contact" onClick={close}>
              Contact sales
            </Link>
          </div>
          <span className="mk-mobile-foot-tag">Capture. Speak. Ship the fix.</span>
        </div>
      </div>
    </>
  );
}
