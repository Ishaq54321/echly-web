import type { Metadata } from "next";
import Link from "next/link";
import {
  DocsScaffold,
  DocHero,
  ArrowIcon,
} from "../_components/docs/DocsScaffold";

export const metadata: Metadata = {
  title: "Documentation — Annote",
  description:
    "Everything you need to capture feedback, read the AI diagnosis, and run Annote for your team.",
};

/* ── Icons (thin-line set, ported from the static docs prototype) ─────────── */
const IcTarget = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 1.8 V5 M12 19 V22.2 M1.8 12 H5 M19 12 H22.2" />
  </svg>
);
const IcShield = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 L19 5.6 V11 c0 4.5-3 7.6-7 9.4 C8 18.6 5 15.5 5 11 V5.6 Z" />
    <path d="M9 11.6 L11.2 13.8 L15.2 9.4" />
  </svg>
);
const IcSparkles = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4 l1.5 4.1 L16.6 9.6 l-4.1 1.5 L11 15.2 l-1.5-4.1 L5.4 9.6 l4.1-1.5 Z" />
    <path d="M17.6 14.4 l.7 1.9 1.9 .7 -1.9 .7 -.7 1.9 -.7-1.9 -1.9-.7 1.9-.7 Z" />
  </svg>
);
const IcRocket = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 14.5 C5.5 9 9 4 14.5 3.5 C15 9 13 12.5 9.5 15 Z" />
    <circle cx="13" cy="8.5" r="1.6" />
    <path d="M5.5 14.5 C4 15 3.4 16.6 3.4 18.6 C5.4 18.6 7 18 7.5 16.5" />
    <path d="M9.5 15 c1.5 1 2.5 2.6 2 4.6" />
  </svg>
);
const IcCursor = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3.5 L9.4 19 L11.6 12.6 L18 10.4 Z" />
    <path d="M16.4 16.4 L20 20" />
    <path d="M17.5 4 V7 M16 5.5 H19" />
  </svg>
);
const IcTicket = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7.5 a1.5 1.5 0 0 1 1.5-1.5 H18.5 A1.5 1.5 0 0 1 20 7.5 V10 a2 2 0 0 0 0 4 v2.5 a1.5 1.5 0 0 1-1.5 1.5 H5.5 A1.5 1.5 0 0 1 4 16.5 V14 a2 2 0 0 0 0-4 Z" />
    <path d="M13 6.5 V8 M13 11 V13 M13 16 V17.5" />
  </svg>
);
const IcUsers = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19 c0-3 2.4-5 5.5-5 s5.5 2 5.5 5" />
    <path d="M16 5.2 a3 3 0 0 1 0 5.8" />
    <path d="M17 14.2 c2.4 .4 4 2.3 4 4.8" />
  </svg>
);
const IcSettings = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7 H13 M17 7 H20" />
    <path d="M4 17 H8 M12 17 H20" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="10" cy="17" r="2.2" />
  </svg>
);
const IcShieldPlain = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 L19 5.6 V11 c0 4.5-3 7.6-7 9.4 C8 18.6 5 15.5 5 11 V5.6 Z" />
    <path d="M12 8 V12.5 M12 15 V15.2" />
  </svg>
);
const IcBuoy = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M9.6 9.6 L5.9 5.9 M14.4 9.6 L18.1 5.9 M9.6 14.4 L5.9 18.1 M14.4 14.4 L18.1 18.1" />
  </svg>
);
const IcSearch = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.4 15.4 L20 20" />
  </svg>
);

/* ── Start-here cards ─────────────────────────────────────────────────────── */
const START_CARDS = [
  {
    href: "/docs/getting-started#capture",
    icon: IcTarget,
    title: "Capture your first bug",
    desc: "The full path from a broken thing to a finished, AI-diagnosed ticket.",
    cta: "Get started",
  },
  {
    href: "/docs/privacy",
    icon: IcShield,
    title: "What Annote captures & how your data is protected",
    desc: "What's collected, and how it's redacted in your browser before it's sent.",
    cta: "Read privacy",
  },
  {
    href: "/docs/tickets#reading-the-diagnosis",
    icon: IcSparkles,
    title: "Reading the AI diagnosis",
    desc: "The verdict badges, the likely cause, and the suggested fix on every ticket.",
    cta: "Learn the diagnosis",
  },
];

/* ── Section index groups ─────────────────────────────────────────────────── */
type PageLink = { href: string; title: string; desc: string };
type Group = { id: string; icon: React.ReactNode; kicker: string; title: string; links: PageLink[] };

const GROUPS: Group[] = [
  {
    id: "getting-started",
    icon: IcRocket,
    kicker: "01 · Getting Started",
    title: "Getting Started",
    links: [
      { href: "/docs/getting-started#what", title: "What is Annote", desc: "The three-beat model: click, speak or type, get a structured ticket." },
      { href: "/docs/getting-started#install", title: "Install the extension", desc: "Add Annote to Chrome and pin it to your toolbar." },
      { href: "/docs/getting-started#connect", title: "Sign in & connect", desc: "Why there's no login in the extension, and how it connects." },
      { href: "/docs/getting-started#capture", title: "Capture your first bug", desc: "The full path from broken thing to finished ticket." },
    ],
  },
  {
    id: "capturing-feedback",
    icon: IcCursor,
    kicker: "02 · Capturing Feedback",
    title: "Capturing Feedback",
    links: [
      { href: "/docs/capturing#starting-a-session", title: "Starting & ending a session", desc: "Open the tray, capture across tabs, the idle timeout." },
      { href: "/docs/capturing#voice-vs-write", title: "Voice vs. Write", desc: "Two ways to give feedback and when to use each." },
      { href: "/docs/capturing#what-gets-captured", title: "What gets captured", desc: "Console, network, actions, screenshot, and voice, explained." },
      { href: "/docs/capturing#editing-mid-session", title: "Editing captures mid-session", desc: "Adjust a ticket before you move on." },
    ],
  },
  {
    id: "working-with-tickets",
    icon: IcTicket,
    kicker: "03 · Working with Tickets",
    title: "Working with Tickets",
    links: [
      { href: "/docs/tickets#reading-the-diagnosis", title: "Reading the AI diagnosis", desc: "The verdict badges, likely cause, and suggested fix." },
      { href: "/docs/tickets#console-network-actions", title: "Console, Network & Actions panels", desc: "Reading the raw evidence behind a ticket." },
      { href: "/docs/tickets#resolve-assign-prioritize", title: "Resolve, assign & prioritize", desc: "Move a ticket through your team's workflow." },
      { href: "/docs/tickets#comments-and-discussion", title: "Comments & discussion", desc: "Mentions, attachments, and the discussion inbox." },
    ],
  },
  {
    id: "sharing",
    icon: IcUsers,
    kicker: "04 · Sharing & Collaboration",
    title: "Sharing & Collaboration",
    links: [
      { href: "/docs/sharing#sharing-a-session", title: "Sharing a session", desc: "Share by email or link, with view/comment/resolve access tiers." },
      { href: "/docs/sharing#activity-and-presence", title: "Activity & presence", desc: "The workspace activity feed and who's viewing." },
    ],
  },
  {
    id: "admin",
    icon: IcSettings,
    kicker: "05 · Admin & Workspace",
    title: "Admin & Workspace",
    links: [
      { href: "/docs/admin#workspace-and-team", title: "Workspace & team setup", desc: "Create a workspace, invite teammates, roles and seats." },
      { href: "/docs/admin#plans-and-billing", title: "Plans & billing", desc: "Tiers, what's included, and managing your subscription." },
      { href: "/docs/admin#account-and-settings", title: "Account & settings", desc: "Profile, notifications, and security." },
    ],
  },
  {
    id: "trust",
    icon: IcShieldPlain,
    kicker: "06 · Trust & Troubleshooting",
    title: "Trust & Troubleshooting",
    links: [
      { href: "/docs/privacy", title: "Privacy & data protection", desc: "How Annote redacts data in your browser before it's sent." },
      { href: "/docs/privacy-markers", title: "Privacy markers reference", desc: "Attributes and classes to control what's captured." },
      { href: "/docs/troubleshooting", title: "Troubleshooting", desc: "Fixes for mic, AI, sync, session, and plan-limit messages." },
      { href: "/docs/faq", title: "FAQ", desc: "Quick answers to the most common questions." },
    ],
  },
];

export default function DocsHomePage() {
  return (
    <DocsScaffold>
      <DocHero
        center
        eyebrow="Help Center"
        title="Annote Documentation"
        sub="Everything you need to capture feedback, read the AI diagnosis, and run Annote for your team."
      >
        <div className="search">
          <label className="search-field">
            <span className="s-ico">{IcSearch}</span>
            <input type="text" placeholder="Search the docs…" aria-label="Search the docs" />
            <span className="kbd">⌘ K</span>
          </label>
          <div className="search-hint">
            <span>Popular:</span>
            <Link href="/docs/getting-started#capture">Capture a bug</Link>
            <span className="sep">·</span>
            <Link href="/docs/privacy">Data protection</Link>
            <span className="sep">·</span>
            <Link href="/docs/troubleshooting">Microphone fixes</Link>
          </div>
        </div>
      </DocHero>

      {/* START HERE */}
      <section className="start">
        <div className="wrap">
          <div className="strip-label">
            <span className="sl-txt">Start here</span>
            <span className="sl-line" />
          </div>
          <div className="start-grid">
            {START_CARDS.map((c) => (
              <Link key={c.href} className="start-card" href={c.href}>
                <div className="sc-ico">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <span className="sc-go">
                  {c.cta} <span className="arr"><ArrowIcon /></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION INDEX */}
      <section className="index">
        <div className="wrap">
          <div className="index-grid">
            {GROUPS.map((g) => (
              <div className="group" id={g.id} key={g.id}>
                <div className="group-head">
                  <div className="group-ico">{g.icon}</div>
                  <div className="gh-txt">
                    <div className="g-kicker">{g.kicker}</div>
                    <h2>{g.title}</h2>
                  </div>
                </div>
                {g.links.map((l) => (
                  <Link className="page-link" href={l.href} key={l.href}>
                    <span className="pl-dot" />
                    <div className="pl-body">
                      <div className="pl-title">
                        {l.title}{" "}
                        <span className="pl-arr"><ArrowIcon /></span>
                      </div>
                      <p className="pl-desc">{l.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING BAND */}
      <section className="closer">
        <div className="wrap closer-inner">
          <div className="cl-ico">{IcBuoy}</div>
          <div className="cl-txt">
            <h4>Can&apos;t find what you need?</h4>
            <p>Our team is quick to respond — reach out and we&apos;ll point you to the right place.</p>
          </div>
          <div className="cl-act">
            <Link className="doc-btn-ghost" href="/docs/faq">Browse the FAQ</Link>
            <Link className="btn-primary" href="/#contact">
              Contact support <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </DocsScaffold>
  );
}
