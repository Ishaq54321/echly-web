"use client";

/**
 * NovaDiagnosis — "Already diagnosed", rebuilt from scratch: copy on the
 * left, and on the right a Linear-grade diagnosis card — white surface,
 * hairlines, mono micro-labels, one accent — with four WORKING tabs
 * (AI · Console · Network · Actions), a verdict chip, inline evidence
 * tokens, and quiet panel-switch fades. Replaces the old forklifted
 * flagship band entirely.
 */

import { useState } from "react";
import {
  ListOrdered,
  MousePointerClick,
  Navigation,
  ShieldCheck,
  Sparkles,
  Terminal,
  Waypoints,
} from "lucide-react";
import { Reveal } from "../../nova/Reveal";

type Tab = "ai" | "console" | "network" | "actions";

const TABS: Array<{ id: Tab; label: string; count?: number }> = [
  { id: "ai", label: "AI" },
  { id: "console", label: "Console", count: 3 },
  { id: "network", label: "Network", count: 4 },
  { id: "actions", label: "Actions" },
];

function AiPanel() {
  return (
    <div className="nv-dx-panel">
      <div className="nv-dx-verdict-row">
        <span className="nv-dx-spark">
          <Sparkles size={13} strokeWidth={2} />
        </span>
        <b>AI analysis</b>
        <span className="nv-dx-verdict">
          <i />
          Related · High confidence
        </span>
      </div>

      <p className="nv-dx-title">
        Profile page shows another user&rsquo;s name after login.
      </p>

      <p className="nv-dx-label">Likely cause</p>
      <p className="nv-dx-cause">
        <code>GET /api/me</code> returned <code className="ok">200</code> with
        a cached response for a different <code>userId</code> — the request
        succeeded, so nothing errored. The stale payload is the bug.
      </p>

      <div className="nv-dx-rule" />

      <p className="nv-dx-label">Cited evidence</p>
      <div className="nv-dx-evrow">
        <span className="nv-dx-ev">GET /api/me · 200 · 38ms</span>
        <span className="nv-dx-ev">response: userId mismatch</span>
        <span className="nv-dx-ev">console: 0 errors</span>
      </div>

      <div className="nv-dx-reporter">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="nv-photo"
          src="/marketing/people/Maya.jpg"
          alt=""
          width={20}
          height={20}
        />
        <span>
          Reported by <b>Maya</b> · 2m ago
        </span>
        <em>
          <ShieldCheck size={11} strokeWidth={2} />
          AI-generated · review before acting
        </em>
      </div>
    </div>
  );
}

function ConsolePanel() {
  return (
    <div className="nv-dx-panel nv-dx-panel--mono">
      <div className="nv-dx-row">
        <i className="nv-dx-dot" />
        <span>console.info(&lsquo;hydrated&rsquo;)</span>
        <em>09:41:02</em>
      </div>
      <div className="nv-dx-row">
        <i className="nv-dx-dot" />
        <span>console.log(&lsquo;profile mounted&rsquo;)</span>
        <em>09:41:03</em>
      </div>
      <div className="nv-dx-row is-warn">
        <i className="nv-dx-dot" />
        <span>stale cache read · /api/me</span>
        <em>09:41:04</em>
      </div>
      <p className="nv-dx-foot">3 entries · captured with the click</p>
    </div>
  );
}

function NetworkPanel() {
  return (
    <div className="nv-dx-panel nv-dx-panel--mono">
      <div className="nv-dx-row">
        <b>GET</b>
        <span>/api/session</span>
        <u className="ok">200</u>
        <em>31ms</em>
      </div>
      <div className="nv-dx-row is-hot">
        <b>GET</b>
        <span>/api/me</span>
        <u className="ok">200</u>
        <em>38ms</em>
      </div>
      <div className="nv-dx-row">
        <b>GET</b>
        <span>/api/flags</span>
        <u className="ok">200</u>
        <em>12ms</em>
      </div>
      <div className="nv-dx-row">
        <b>POST</b>
        <span>/api/track</span>
        <u className="ok">204</u>
        <em>19ms</em>
      </div>
      <p className="nv-dx-foot">every request copies as cURL</p>
    </div>
  );
}

function ActionsPanel() {
  return (
    <div className="nv-dx-panel">
      <div className="nv-dx-act">
        <span className="nv-dx-act-ic">
          <Navigation size={12} strokeWidth={2} />
        </span>
        <span>
          Navigated to <b>/profile</b>
        </span>
        <em>00:09</em>
      </div>
      <div className="nv-dx-act">
        <span className="nv-dx-act-ic">
          <MousePointerClick size={12} strokeWidth={2} />
        </span>
        <span>
          Clicked <b>&ldquo;Account&rdquo;</b>
        </span>
        <em>00:12</em>
      </div>
      <div className="nv-dx-act">
        <span className="nv-dx-act-ic">
          <ListOrdered size={12} strokeWidth={2} />
        </span>
        <span>
          Saw <b>wrong display name</b>
        </span>
        <em>00:14</em>
      </div>
      <p className="nv-dx-foot">user steps · correlated on one clock</p>
    </div>
  );
}

export function NovaDiagnosis() {
  const [tab, setTab] = useState<Tab>("ai");

  return (
    <section className="nv-diagnosis">
      <div className="nv-container">
        <div className="nv-diagnosis-grid">
          <Reveal className="nv-diagnosis-copy">
            <p className="nv-eyebrow">Already diagnosed</p>
            <h2 className="nv-h3">
              Your engineers open the ticket.
              <br />
              <span className="nv-dim">The cause is already there.</span>
            </h2>
            <p className="nv-body">
              Annote reads the console, the network, and what the user did —
              and tells your team the likely cause before anyone opens the
              ticket. The reporter said it in plain words. The AI did the
              engineering.
            </p>
          </Reveal>

          <Reveal delay={150} threshold={0.15}>
            <div className="nv-dx-card">
              <span className="nv-dx-live">
                <Waypoints size={11} strokeWidth={2.2} />
                Live demo
              </span>
              <div className="nv-dx-tabs" role="tablist" aria-label="Evidence">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    className={`nv-dx-tab${tab === t.id ? " is-active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    {t.id === "ai" && <Sparkles size={12} strokeWidth={2} />}
                    {t.id === "console" && (
                      <Terminal size={12} strokeWidth={2} />
                    )}
                    {t.label}
                    {t.count != null && <i>{t.count}</i>}
                  </button>
                ))}
              </div>
              <div className="nv-dx-body" key={tab}>
                {tab === "ai" && <AiPanel />}
                {tab === "console" && <ConsolePanel />}
                {tab === "network" && <NetworkPanel />}
                {tab === "actions" && <ActionsPanel />}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
