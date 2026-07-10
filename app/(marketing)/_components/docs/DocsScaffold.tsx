import "../../_styles";

import { Fragment } from "react";
import Link from "next/link";
import { MarketingHeader } from "../MarketingHeader";
import { MarketingFooter } from "../MarketingFooter";
import { DocScrollSpy } from "./DocScrollSpy";

/* ── Shared chrome ──────────────────────────────────────────────────────────
   Every docs route mounts the fixed nova header and the marketing footer, and
   scopes its body under `.marketing-root .docs` where docs.css hangs its
   retinted tokens + prose vocabulary. `nv-root` puts the page on the nova
   base (white canvas, Google Sans Flex, cool greys) so docs read as one
   system with the homepage and blog. */
export function DocsScaffold({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-root nv-root">
      <MarketingHeader variant="solid" />
      <main className="docs">{children}</main>
      <MarketingFooter />
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────────
   `meta` is the small mono dot-separated strip under the sub (subpages).
   `center` switches to the centered index-style hero (used by /docs home). */
export function DocHero({
  eyebrow,
  title,
  sub,
  meta,
  center = false,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: React.ReactNode;
  meta?: string[];
  center?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={"doc-hero" + (center ? " center" : "")}>
      <div className="wrap">
        <span className="hero-eyebrow">
          <span className="pip" />
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p className="hero-sub">{sub}</p>
        {meta && meta.length > 0 && (
          <div className="hero-meta">
            {meta.map((m, i) => (
              <Fragment key={m}>
                {i > 0 && <span className="dot" />}
                <span className="mono">{m}</span>
              </Fragment>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export type DocNavItem = { id: string; label: string; icon: React.ReactNode };

/* ── Doc body layout (main column + sticky right-rail TOC + mobile jump) ──────
   Pass `sections` for the TOC/jump nav and `railFoot` for the "next page" card.
   Set `solo` for reference pages that want a single centered column. */
export function DocLayout({
  sections,
  railFoot,
  railCard,
  solo = false,
  children,
}: {
  sections: DocNavItem[];
  railFoot?: React.ReactNode;
  railCard?: React.ReactNode;
  solo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="doc">
      <DocScrollSpy ids={sections.map((s) => s.id)} />
      <div className={"wrap doc-grid" + (solo ? " solo" : "")}>
        <div className="col-main">
          <nav className="jump" aria-label="Jump to section">
            <div className="jump-scroll">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} data-jump={s.id}>
                  <span className="j-ico">{s.icon}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </nav>
          {children}
        </div>

        {!solo && (
          <aside className="rail">
            {railCard}
            <div className="toc-label">On this page</div>
            <nav className="toc" aria-label="On this page">
              {sections.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} data-toc={s.id}>
                  <span className="t-ico">{s.icon}</span>
                  {s.label}
                  <span className="t-num">{String(i + 1).padStart(2, "0")}</span>
                </a>
              ))}
            </nav>
            {railFoot}
          </aside>
        )}
      </div>
    </main>
  );
}

/* ── A documentation section (numbered icon header + prose) ──────────────── */
export function DocSection({
  id,
  num,
  kicker,
  title,
  icon,
  children,
}: {
  id: string;
  num: string;
  kicker: string;
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="sec" id={id}>
      <div className="sec-head">
        <div className="sec-ico">{icon}</div>
        <div className="sec-headtext">
          <span className="sec-num">
            <b>{num}</b> &nbsp;·&nbsp; {kicker}
          </span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="prose">{children}</div>
    </section>
  );
}

/* ── Screenshot slot. With `src` it renders the asset; without, a placeholder
   matching the caption (mirrors the prototype's <image-slot> empty state). ── */
export function DocFigure({
  src,
  caption,
}: {
  src?: string;
  caption: string;
}) {
  return (
    <figure className="shot">
      <div className="frame">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={caption} />
        ) : (
          <div className="slot">{caption}</div>
        )}
      </div>
      <figcaption>
        <span className="fc-ico">
          <CamIcon />
        </span>
        <b>{caption}</b>
      </figcaption>
    </figure>
  );
}

/* ── Callout note (default violet, or amber for cautions) ─────────────────── */
export function Note({
  amber = false,
  last = false,
  icon,
  children,
}: {
  amber?: boolean;
  last?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={"note" + (amber ? " amber" : "") + (last ? " last" : "")}>
      <div className="n-ico">{icon ?? <InfoIcon />}</div>
      <div className="n-body">{children}</div>
    </div>
  );
}

/* ── "Next page" rail card ───────────────────────────────────────────────── */
export function RailFoot({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <div className="rail-foot">
      <p>{text}</p>
      <Link href={href}>
        {label}{" "}
        <span className="arr">
          <ArrowIcon />
        </span>
      </Link>
    </div>
  );
}

/* ── Shared inline icons (thin-line, matches the prototype symbol set) ────── */
export function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function CamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5h3l1.4-2h7.2L16 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 18v-8A1.5 1.5 0 0 1 3 8.5Z" />
      <circle cx="11" cy="13.5" r="3" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.6v.2" />
    </svg>
  );
}
