"use client";

/**
 * MarketingHeader — rebuilt in the reference style (antigravity.google):
 *
 *   • Fixed, translucent-white bar with backdrop blur; turns opaque white the
 *     moment the page is scrolled or any panel is open.
 *   • Hides on scroll-down / reveals on scroll-up (5px delta threshold,
 *     0.3s ease-in-out transform — same behaviour as the reference).
 *   • Full-width dropdown panels that animate their height open under the bar:
 *     a big statement headline on the left, a stagger-revealed link column on
 *     the right, chevrons that slide right on hover, and a page scrim behind.
 *   • Compact pill nav items, near-black pill CTA on the right.
 *   • Mobile (<1100px): burger → full-screen white menu with accordions.
 *
 * The `variant` prop is kept for API compatibility with the interior-page
 * scaffolds (docs / use-cases). Both variants render the same fixed bar; a
 * spacer keeps in-flow content below it.
 *
 * All styles live in nova.css, loaded via the _styles barrel (one canonical
 * stylesheet order on every route — see _styles/index.ts).
 */

import "../_styles";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { AnnoteLogo } from "./AnnoteLogo";
import { MarketingFonts } from "./MarketingFonts";
import { NAV_ITEMS, type NavDropdown } from "./navData";

/** Internal links go through next/link; static .html files need a plain <a>. */
function NavAnchor({
  href,
  className,
  children,
  onClick,
  style,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  if (href.endsWith(".html") || href.startsWith("http")) {
    return (
      <a href={href} className={className} onClick={onClick} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick} style={style}>
      {children}
    </Link>
  );
}

function DropdownPanel({
  dropdown,
  onNavigate,
}: {
  dropdown: NavDropdown | null;
  onNavigate: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!dropdown) {
      setHeight(0);
      return;
    }
    const node = contentRef.current;
    if (node) setHeight(node.offsetHeight);
  }, [dropdown]);

  return (
    <div className="nv-dd" style={{ height }} aria-hidden={!dropdown}>
      <div ref={contentRef}>
        {dropdown && (
          <div className="nv-container">
            <div className="nv-dd-inner">
              <div>
                <h2 className="nv-h4 nv-dd-title">{dropdown.title}</h2>
                {dropdown.overviewHref && (
                  <Link
                    href={dropdown.overviewHref}
                    className="nv-arrow-link nv-dd-overview"
                    onClick={onNavigate}
                  >
                    {dropdown.overviewLabel ?? "See overview"}
                    <ChevronRight size={16} strokeWidth={2} />
                  </Link>
                )}
              </div>
              <nav className="nv-dd-links" aria-label={dropdown.title}>
                {dropdown.sublinks.map((sub, i) => (
                  <NavAnchor
                    key={sub.href + sub.label}
                    href={sub.href}
                    className="nv-dd-link"
                    onClick={onNavigate}
                    style={{ "--nv-i": i } as React.CSSProperties}
                  >
                    {sub.icon && (
                      <span className="nv-dd-link-ico">{sub.icon}</span>
                    )}
                    {sub.label}
                    <span className="nv-dd-link-arrow" aria-hidden="true">
                      <ChevronRight size={16} strokeWidth={2} />
                    </span>
                  </NavAnchor>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** The app shell scrolls on <body>, so read whichever scroller is active. */
function getScrollTop(): number {
  return Math.max(
    window.scrollY || 0,
    document.body.scrollTop || 0,
    document.documentElement.scrollTop || 0,
  );
}

export function MarketingHeader({
  variant = "hero",
}: {
  variant?: "hero" | "solid";
}) {
  void variant; // both variants share the fixed light bar

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubId, setMobileSubId] = useState<string | null>(null);
  const lastY = useRef(0);

  const closeAll = useCallback(() => {
    setOpenId(null);
    setMobileOpen(false);
    setMobileSubId(null);
  }, []);

  // Scroll: opaque past 0, hide on downward travel, reveal on upward.
  // NB: `scroll` doesn't bubble and the shell scrolls on <body>, so listen in
  // the capture phase on document.
  useEffect(() => {
    const onScroll = () => {
      const y = getScrollTop();
      setScrolled(y > 0);
      if (y <= 0) {
        setHidden(false);
        lastY.current = y;
        return;
      }
      const delta = y - lastY.current;
      if (delta > 5) {
        setHidden(true);
        setOpenId(null);
      } else if (delta < -5) {
        setHidden(false);
      }
      if (Math.abs(delta) > 5) lastY.current = y;
    };
    onScroll();
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  // Escape closes any open surface.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAll]);

  // Body scroll lock while the mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const openDropdown = NAV_ITEMS.find((n) => n.dropdown?.id === openId)
    ?.dropdown ?? null;

  const headerCls = [
    "nv-header",
    scrolled ? "is-scrolled" : "",
    hidden && !mobileOpen ? "is-hidden" : "",
    openId ? "is-dd-open" : "",
    mobileOpen ? "is-menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <MarketingFonts />
      <header className={headerCls} onMouseLeave={() => setOpenId(null)}>
        <div className="nv-container">
          <div className="nv-header-bar">
            <Link
              href="/"
              className="nv-logo"
              aria-label="Annote"
              onClick={closeAll}
            >
              <AnnoteLogo width={19} height={24} />
              <span className="nv-logo-word">Annote</span>
            </Link>

            <nav className="nv-nav" aria-label="Primary">
              {NAV_ITEMS.map((item) =>
                item.dropdown ? (
                  <button
                    key={item.label}
                    type="button"
                    className={`nv-nav-item${
                      openId === item.dropdown.id ? " is-open" : ""
                    }`}
                    aria-haspopup="true"
                    aria-expanded={openId === item.dropdown.id}
                    onMouseEnter={() => setOpenId(item.dropdown!.id)}
                    onFocus={() => setOpenId(item.dropdown!.id)}
                    onClick={() =>
                      setOpenId((cur) =>
                        cur === item.dropdown!.id ? null : item.dropdown!.id,
                      )
                    }
                  >
                    {item.label}
                    <span className="nv-nav-chevron" aria-hidden="true">
                      <ChevronDown size={15} strokeWidth={2} />
                    </span>
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className="nv-nav-item"
                    onMouseEnter={() => setOpenId(null)}
                    onFocus={() => setOpenId(null)}
                    onClick={closeAll}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="nv-header-actions">
              <Link
                href="/login"
                className="nv-btn nv-btn--nav"
                onMouseEnter={() => setOpenId(null)}
                onClick={closeAll}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="nv-btn nv-btn--nav-primary"
                onMouseEnter={() => setOpenId(null)}
                onClick={closeAll}
              >
                Get Annote
              </Link>
              <button
                type="button"
                className="nv-burger"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => {
                  setMobileOpen((v) => !v);
                  setMobileSubId(null);
                }}
              >
                {mobileOpen ? (
                  <X size={20} strokeWidth={2} />
                ) : (
                  <Menu size={20} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop dropdown panel — slides open under the bar */}
        <DropdownPanel dropdown={openDropdown} onNavigate={closeAll} />
      </header>

      {/* Page scrim behind an open dropdown */}
      <div
        className={`nv-dd-scrim${openId ? " is-visible" : ""}`}
        aria-hidden="true"
        onMouseEnter={() => setOpenId(null)}
      />

      {/* Mobile full-screen menu */}
      <div
        className={`nv-mobile${mobileOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        {NAV_ITEMS.map((item) =>
          item.dropdown ? (
            <div key={item.label}>
              <button
                type="button"
                className={`nv-mobile-item${
                  mobileSubId === item.dropdown.id ? " is-open" : ""
                }`}
                aria-expanded={mobileSubId === item.dropdown.id}
                onClick={() =>
                  setMobileSubId((cur) =>
                    cur === item.dropdown!.id ? null : item.dropdown!.id,
                  )
                }
              >
                {item.label}
                <span className="nv-nav-chevron" aria-hidden="true">
                  <ChevronDown size={20} strokeWidth={2} />
                </span>
              </button>
              <div
                className={`nv-mobile-sub${
                  mobileSubId === item.dropdown.id ? " is-open" : ""
                }`}
              >
                {item.dropdown.sublinks.map((sub) => (
                  <NavAnchor
                    key={sub.href + sub.label}
                    href={sub.href}
                    className="nv-dd-link"
                    onClick={closeAll}
                  >
                    {sub.icon && (
                      <span className="nv-dd-link-ico">{sub.icon}</span>
                    )}
                    {sub.label}
                  </NavAnchor>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href!}
              className="nv-mobile-item"
              onClick={closeAll}
            >
              {item.label}
            </Link>
          ),
        )}

        <div className="nv-mobile-foot">
          <Link
            href="/signup"
            className="nv-btn nv-btn--primary"
            onClick={closeAll}
          >
            Get Annote
          </Link>
          <Link href="/login" className="nv-btn nv-btn--tonal" onClick={closeAll}>
            Sign in
          </Link>
        </div>
      </div>

      {/* Keeps in-flow page content below the fixed bar */}
      <div className="nv-page-offset" aria-hidden="true" />
    </>
  );
}
