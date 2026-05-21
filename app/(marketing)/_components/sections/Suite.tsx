"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowIcon } from "../icons";

type TabId = "capture" | "voice" | "sessions" | "integrations";

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: string }> = [
  { id: "capture", label: "Capture", icon: "st-cap" },
  { id: "voice", label: "Voice", icon: "st-voi" },
  { id: "sessions", label: "Sessions", icon: "st-ses" },
  { id: "integrations", label: "Integrations", icon: "st-int" },
];

export function Suite() {
  const [activeTab, setActiveTab] = useState<TabId>("capture");

  return (
    <section id="product" className="suite">
      <div className="suite-head">
        <h2 className="suite-h">Your Annote suite</h2>
        <Link className="btn-soft" href="/signup">
          Get the suite
        </Link>
      </div>

      <div className="suite-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`suite-tab${activeTab === tab.id ? " is-on" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={`st-ico ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Phase 2B: each viz block below is a static visual placeholder.
          - Capture viz → real <BrowserFrame> + element selection demo
          - Voice viz → real <RecordingMicOrb> with mock transcript
          - Sessions viz → mini <FourZoneLayout> preview
          - Integrations viz → real integration cards */}

      <article
        className={`panel${activeTab === "capture" ? " is-on" : ""}`}
        data-panel="capture"
      >
        <header className="panel-h">
          <span className="panel-h-ico st-cap" />
          Capture
        </header>
        <div className="panel-body">
          <div className="panel-copy">
            <h3 className="panel-title">
              Click anything,
              <br />
              capture everything.
            </h3>
            <p className="panel-sub">
              On any live site, Annote captures the element, the page, and the
              context — automatically.
            </p>
            <a className="panel-link" href="#capture">
              Learn more about Capture <ArrowIcon size={11} />
            </a>
            <ul className="panel-bullets">
              <li>Element, page, viewport — all captured</li>
              <li>No selection tool, no cropping</li>
              <li>Works on any URL, live or staging</li>
              <li>Browser, OS, and screen size baked in</li>
            </ul>
          </div>
          <div className="panel-viz">
            <div className="viz-sky" />
            <div className="viz-card viz-browser">
              <div className="vb-chrome">
                <i />
                <i />
                <i />
                <span className="vb-url">aurora.com/dashboard</span>
              </div>
              <div className="vb-grid">
                <span />
                <span className="vb-target" />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="vb-select" />
              <div className="vb-tag">New project · 132×32</div>
            </div>
          </div>
        </div>
      </article>

      <article
        className={`panel${activeTab === "voice" ? " is-on" : ""}`}
        data-panel="voice"
      >
        <header className="panel-h">
          <span className="panel-h-ico st-voi" />
          Voice
        </header>
        <div className="panel-body">
          <div className="panel-copy">
            <h3 className="panel-title">
              Speak in your
              <br />
              own words.
            </h3>
            <p className="panel-sub">
              AI turns rough speech into a polished ticket. Title, description,
              severity, tags — written for you.
            </p>
            <a className="panel-link" href="#voice">
              Learn more about Voice <ArrowIcon size={11} />
            </a>
            <ul className="panel-bullets">
              <li>One-tap recording in the extension</li>
              <li>Rough notes → polished ticket</li>
              <li>Edit, rewrite, or send as-is</li>
              <li>Transcript saved for context</li>
            </ul>
          </div>
          <div className="panel-viz">
            <div className="viz-meadow" />
            <div className="viz-card viz-mic">
              <div className="vm-head">Voice note</div>
              <div className="vm-wave" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => (
                  <i key={i} />
                ))}
              </div>
              <div className="vm-trans">
                &ldquo;The New project button doesn&apos;t show a loading state
                — feels stuck.&rdquo;
              </div>
              <div className="vm-foot">
                <span className="vm-time">0:11</span>
                <button type="button" className="vm-polish">
                  Polish ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article
        className={`panel${activeTab === "sessions" ? " is-on" : ""}`}
        data-panel="sessions"
      >
        <header className="panel-h">
          <span className="panel-h-ico st-ses" />
          Sessions
        </header>
        <div className="panel-body">
          <div className="panel-copy">
            <h3 className="panel-title">
              A session is the
              <br />
              whole story.
            </h3>
            <p className="panel-sub">
              Group everything you capture in one sitting. Send one link — your
              team, your client, anyone sees the same thing.
            </p>
            <a className="panel-link" href="#sessions">
              Learn more about Sessions <ArrowIcon size={11} />
            </a>
            <ul className="panel-bullets">
              <li>One URL, no signup to view</li>
              <li>Real-time comments and replies</li>
              <li>Status: open → in progress → resolved</li>
              <li>White-label for client work</li>
            </ul>
          </div>
          <div className="panel-viz">
            <div className="viz-dawn" />
            <div className="viz-card viz-session">
              <div className="vs-head">
                <span className="vs-name">Aurora · dashboard QA</span>
                <span className="vs-count">6 open</span>
              </div>
              <div className="vs-row is-on">
                <span className="vs-num">01</span>
                <span>New project button missing loading state</span>
                <span className="vs-pill">Open</span>
              </div>
              <div className="vs-row">
                <span className="vs-num">02</span>
                <span>Sidebar collapses on first navigation</span>
                <span className="vs-pill pill-p">In progress</span>
              </div>
              <div className="vs-row">
                <span className="vs-num">03</span>
                <span>Empty state copy reads as an error</span>
                <span className="vs-pill pill-r">Review</span>
              </div>
              <div className="vs-row">
                <span className="vs-num">04</span>
                <span>Save modal closes too fast</span>
                <span className="vs-pill pill-d">Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article
        className={`panel${activeTab === "integrations" ? " is-on" : ""}`}
        data-panel="integrations"
      >
        <header className="panel-h">
          <span className="panel-h-ico st-int" />
          Integrations
        </header>
        <div className="panel-body">
          <div className="panel-copy">
            <h3 className="panel-title">
              Lands where your
              <br />
              team already works.
            </h3>
            <p className="panel-sub">
              Linear, Jira, GitHub, Notion, Slack — structured tickets flow
              into your stack with one click.
            </p>
            <a className="panel-link" href="#integrations">
              Learn more about Integrations <ArrowIcon size={11} />
            </a>
            <ul className="panel-bullets">
              <li>Push to Linear, Jira, GitHub, ClickUp</li>
              <li>Notify in Slack or email</li>
              <li>Two-way sync — status flows back</li>
              <li>Connect Webflow, Framer, Shopify</li>
            </ul>
          </div>
          <div className="panel-viz">
            <div className="viz-emerald" />
            <div className="viz-card viz-stack">
              <div className="vi-head">Pushed to</div>
              <div className="vi-tool">
                <div className="vi-tool-sq" />
                <span>Linear · Aurora / Web</span>
                <span className="vi-go">→</span>
              </div>
              <div className="vi-tool">
                <div className="vi-tool-sq c2" />
                <span>GitHub · aurora/web</span>
                <span className="vi-go">→</span>
              </div>
              <div className="vi-tool">
                <div className="vi-tool-sq c3" />
                <span>Slack · #design-qa</span>
                <span className="vi-go">→</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
