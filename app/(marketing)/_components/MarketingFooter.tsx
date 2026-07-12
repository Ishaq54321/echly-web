"use client";

/**
 * MarketingFooter — rebuilt in the reference style (antigravity.google):
 * slogan + hairline link columns up top, a giant full-bleed wordmark whose
 * letters rise in one-by-one as the footer scrolls into view (the reference
 * animates its ANTIGRAVITY letterforms the same way), and a quiet utility
 * bar with the legal links.
 *
 * Styles live in nova.css, loaded via the _styles barrel (one canonical
 * stylesheet order on every route — see _styles/index.ts).
 */

import "../_styles";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnnoteLogo } from "./AnnoteLogo";

type FooterColumn = {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string; external?: boolean }>;
};

const COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: "Product",
    links: [
      { label: "Capture extension", href: "/docs/capturing" },
      { label: "Voice tickets", href: "/docs/tickets" },
      { label: "Sessions", href: "/docs/sharing" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { label: "QA testing", href: "/use-cases/qa-testing" },
      { label: "Design review", href: "/use-cases/design-review" },
      { label: "Client feedback", href: "/use-cases/client-feedback" },
      { label: "Agencies", href: "/use-cases/agencies" },
      { label: "Teams", href: "/use-cases/teams" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/docs/faq" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/annoteai",
        external: true,
      },
    ],
  },
];

const LEGAL = [
  { label: "Terms", href: "/marketing/terms.html" },
  { label: "Privacy", href: "/marketing/privacy.html" },
  { label: "Trust", href: "/marketing/trust.html" },
] as const;

const WORDMARK = "ANNOTE".split("");

export function MarketingFooter() {
  const markRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = markRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="nv-footer">
      <div className="nv-container">
        <div className="nv-footer-main">
          <div>
            <p className="nv-h5 nv-footer-slogan">
              Report Bugs Fast, Fix Them Faster
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav className="nv-footer-col" key={col.heading} aria-label={col.heading}>
              <p className="nv-footer-col-head">{col.heading}</p>
              {col.links.map((link) =>
                link.external || link.href.endsWith(".html") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href}>
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          ))}
        </div>
      </div>

      <div className="nv-container">
        <div
          ref={markRef}
          className={`nv-footer-wordmark${inView ? " is-in" : ""}`}
          aria-hidden="true"
        >
          {WORDMARK.map((letter, i) => (
            <span
              key={i}
              className="nv-footer-letter"
              style={{ "--nv-i": i } as React.CSSProperties}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div className="nv-footer-utility">
        <div className="nv-container">
          <div className="nv-footer-utility-inner">
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
            >
              <AnnoteLogo width={16} height={20} />
              <span className="nv-footer-copy">
                © {new Date().getFullYear()} Annote
              </span>
            </span>
            <nav className="nv-footer-utility-nav" aria-label="Legal">
              {LEGAL.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
