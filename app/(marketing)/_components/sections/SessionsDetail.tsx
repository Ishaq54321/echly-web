"use client";

import { useState } from "react";

type Status = "open" | "progress" | "review" | "resolved";

type SessionTicket = {
  title: string;
  page: string;
  browser: string;
  os: string;
  status: Status;
  statusLabel: string;
  comments: ReadonlyArray<{ avatar: "a1" | "a2" | "a3"; name: string; text: string }>;
};

const TICKETS: ReadonlyArray<SessionTicket> = [
  {
    title: "New project button missing loading state",
    page: "aurora.com/dashboard",
    browser: "Chrome 124",
    os: "macOS",
    status: "open",
    statusLabel: "Open",
    comments: [
      {
        avatar: "a1",
        name: "Maya",
        text: "Clicking it twice creates duplicate projects — we need a spinner the moment it's pressed.",
      },
      {
        avatar: "a2",
        name: "Daniel",
        text: "Should be a 2-line fix in DashboardHeader. Adding to the next dev push.",
      },
    ],
  },
  {
    title: "Sidebar collapses on first navigation",
    page: "aurora.com/settings",
    browser: "Safari 17",
    os: "macOS",
    status: "progress",
    statusLabel: "In progress",
    comments: [
      {
        avatar: "a3",
        name: "Sarah",
        text: "Reproduces every time on a fresh login. Localstorage isn't being read on hydrate.",
      },
      {
        avatar: "a1",
        name: "Maya",
        text: "Reassigning to Daniel — he owns the layout shell this quarter.",
      },
    ],
  },
  {
    title: "Empty state copy reads as an error",
    page: "aurora.com/projects",
    browser: "Chrome 124",
    os: "Windows 11",
    status: "review",
    statusLabel: "In review",
    comments: [
      {
        avatar: "a2",
        name: "Daniel",
        text: "Reworded to \"Nothing here yet — create your first project to begin.\" Ready for review.",
      },
      {
        avatar: "a3",
        name: "Sarah",
        text: "Looks great — ship it.",
      },
    ],
  },
  {
    title: "Save modal closes too fast on success",
    page: "aurora.com/settings/profile",
    browser: "Chrome 124",
    os: "macOS",
    status: "resolved",
    statusLabel: "Resolved",
    comments: [
      {
        avatar: "a1",
        name: "Maya",
        text: "Bumped the auto-close delay from 600ms to 1.4s and added a checkmark animation.",
      },
      {
        avatar: "a3",
        name: "Sarah",
        text: "Confirmed on staging, marking resolved.",
      },
    ],
  },
  {
    title: "Pricing toggle skips the annual savings copy",
    page: "aurora.com/pricing",
    browser: "Firefox 124",
    os: "macOS",
    status: "open",
    statusLabel: "Open",
    comments: [
      {
        avatar: "a3",
        name: "Sarah",
        text: "The \"save 20%\" pill disappears the moment you flip the toggle. Should stay anchored.",
      },
    ],
  },
  {
    title: "Onboarding tooltip overlaps the close button",
    page: "aurora.com/welcome",
    browser: "Edge 125",
    os: "Windows 11",
    status: "progress",
    statusLabel: "In progress",
    comments: [
      {
        avatar: "a2",
        name: "Daniel",
        text: "Tooltip arrow offset is wrong on viewports under 1024px. Fixing the popover positioner.",
      },
    ],
  },
];

export function SessionsDetail() {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const active = TICKETS[selected];

  return (
    <section id="teams" className="sessions-detail">
      <div className="sd-head">
        <span className="section-eyebrow">Sessions</span>
        <h2 className="sd-h">
          A session is the whole story,
          <br />
          not a single ticket.
        </h2>
        <p className="sd-p">
          Every capture from one sitting groups into a session. Send one link,
          everyone sees the same thing — no signup needed.
        </p>
      </div>

      <div className="sd-stage">
        {/* Phase 2B: replace with real <FourZoneLayout> + mockSession + mockTickets */}
        <div className="sd-window">
          <div className="sd-list">
            <div className="sd-list-h">
              <span className="sd-list-name">
                <span className="sd-list-dot" />
                Aurora · dashboard QA · May 18
              </span>
              <span className="sd-list-count">6 open</span>
            </div>
            {TICKETS.map((t, i) => (
              <button
                key={i}
                type="button"
                className={`sd-item${i === selected ? " is-sel" : ""}`}
                onClick={() => setSelected(i)}
              >
                <span className="sd-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="sd-text" />
                <span className={`sd-status ${t.status}`}>{t.statusLabel}</span>
              </button>
            ))}
          </div>

          <div className="sd-detail">
            <div className="sd-presence">
              <span className="sd-av a1">MA</span>
              <span className="sd-av a2">DT</span>
              <span className="sd-av a3">SK</span>
              <span className="sd-presence-text">3 viewing now</span>
            </div>
            <h3 className="sd-detail-tit" key={`tit-${selected}`}>
              {active.title}
            </h3>
            <div className="sd-detail-meta" key={`meta-${selected}`}>
              <span>{active.page}</span>
              <span className="sd-sep">·</span>
              <span>{active.browser}</span>
              <span className="sd-sep">·</span>
              <span>{active.os}</span>
            </div>
            <div className="sd-thumb">
              <div className="sd-thumb-chrome">
                <i />
                <i />
                <i />
              </div>
              <div className="sd-thumb-body">
                <div className="sd-thumb-side" />
                <div className="sd-thumb-main">
                  <div className="sd-thumb-row" />
                  <div className="sd-thumb-row s" />
                  <div className="sd-thumb-cta" />
                  <div className="sd-thumb-highlight" />
                </div>
              </div>
            </div>
            <div className="sd-comments">
              {active.comments.map((c, i) => (
                <div className="sd-comment" key={`${selected}-${i}`}>
                  <span className={`av ${c.avatar}`} />
                  <div>
                    <b>{c.name}</b> &nbsp;{c.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="sd-share">
              <span className="sd-share-url">
                annote.app/s/aurora-dashboard-may18
              </span>
              <button
                type="button"
                className={`sd-share-copy${copied ? " copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
