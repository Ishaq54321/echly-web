"use client";

import { useState } from "react";

type PersonaId = "agencies" | "design" | "product" | "dev" | "qa";

type VizRow =
  | { kind: "card"; head: string; value: string; line?: "full" | "fill" }
  | { kind: "list"; items: ReadonlyArray<{ tone: "ok" | "warn" | "err" | "neutral"; text: string }> };

type Persona = {
  id: PersonaId;
  label: string;
  tagline: string;
  bullets: ReadonlyArray<string>;
  vizTitle: string;
  vizBody: ReadonlyArray<VizRow>;
};

const PERSONAS: ReadonlyArray<Persona> = [
  {
    id: "agencies",
    label: "Agencies",
    tagline: "Send clients a link. Get structured tickets back.",
    bullets: [
      "Branded sessions on your domain — clients never see Annote.",
      "No accounts to create, no installs to chase.",
      "Tickets ship straight to Linear, Jira, ClickUp.",
    ],
    vizTitle: "Aurora — client review",
    vizBody: [
      { kind: "card", head: "Open tickets", value: "12", line: "fill" },
      { kind: "card", head: "Avg. polish", value: "0.8s", line: "full" },
      {
        kind: "list",
        items: [
          { tone: "ok", text: "Maya sent 4 captures" },
          { tone: "ok", text: "Jordan added 2 comments" },
          { tone: "warn", text: "1 ticket awaiting your reply" },
        ],
      },
      {
        kind: "list",
        items: [
          { tone: "neutral", text: "Branded as aurora.studio" },
          { tone: "neutral", text: "Synced to Linear · Aurora/Web" },
        ],
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    tagline: "Live design feedback, threaded on the actual UI.",
    bullets: [
      "Pin comments to the exact element and viewport.",
      "Loop in PMs and devs with a single link.",
      "Resolve in-place when the fix ships.",
    ],
    vizTitle: "Design QA — homepage v3",
    vizBody: [
      { kind: "card", head: "Open threads", value: "7", line: "fill" },
      { kind: "card", head: "Resolved", value: "23", line: "full" },
      {
        kind: "list",
        items: [
          { tone: "ok", text: "Hero gradient revisited" },
          { tone: "warn", text: "Mobile spacing on pricing" },
          { tone: "err", text: "CTA contrast at AA" },
        ],
      },
      {
        kind: "list",
        items: [
          { tone: "neutral", text: "Figma frame linked" },
          { tone: "neutral", text: "Storybook variant linked" },
        ],
      },
    ],
  },
  {
    id: "product",
    label: "Product",
    tagline: "Customer feedback, but with the actual screen.",
    bullets: [
      "Every report comes with context — page, device, repro steps.",
      "Cluster by area so themes surface fast.",
      "Decisions, not inboxes.",
    ],
    vizTitle: "Onboarding · Q2 voice of customer",
    vizBody: [
      { kind: "card", head: "Tickets this week", value: "48", line: "fill" },
      { kind: "card", head: "Themes detected", value: "6", line: "full" },
      {
        kind: "list",
        items: [
          { tone: "err", text: "Empty state confusion (14)" },
          { tone: "warn", text: "Sign-up form friction (9)" },
          { tone: "ok", text: "Pricing clarity request (6)" },
        ],
      },
      {
        kind: "list",
        items: [
          { tone: "neutral", text: "Synced to Productboard" },
          { tone: "neutral", text: "Auto-tagged by area" },
        ],
      },
    ],
  },
  {
    id: "dev",
    label: "Engineering",
    tagline: "Repro steps, console, network — all already in the ticket.",
    bullets: [
      "Console logs, network errors, and DOM snapshot baked in.",
      "Push to GitHub or Linear with one click.",
      "Stay out of Figma; stay in your IDE.",
    ],
    vizTitle: "Engineering · sprint 24",
    vizBody: [
      { kind: "card", head: "Bugs assigned", value: "9", line: "fill" },
      { kind: "card", head: "Closed this week", value: "14", line: "full" },
      {
        kind: "list",
        items: [
          { tone: "err", text: "Hydration mismatch on /pricing" },
          { tone: "warn", text: "Slow query on dashboard" },
          { tone: "ok", text: "Console errors on settings" },
        ],
      },
      {
        kind: "list",
        items: [
          { tone: "neutral", text: "Linked to GitHub PRs" },
          { tone: "neutral", text: "Reproduces in staging" },
        ],
      },
    ],
  },
  {
    id: "qa",
    label: "QA",
    tagline: "Bug triage that actually starts with a repro.",
    bullets: [
      "Step-by-step capture across pages, all in one session.",
      "Severity, browser, and OS auto-attached.",
      "Push verified bugs straight to your tracker.",
    ],
    vizTitle: "QA · regression sweep",
    vizBody: [
      { kind: "card", head: "Sweeps run", value: "5", line: "fill" },
      { kind: "card", head: "Regressions", value: "11", line: "full" },
      {
        kind: "list",
        items: [
          { tone: "err", text: "Safari 17 — checkout fails" },
          { tone: "warn", text: "Firefox — form misalignment" },
          { tone: "ok", text: "Chrome 124 — clean run" },
        ],
      },
      {
        kind: "list",
        items: [
          { tone: "neutral", text: "Synced to Jira" },
          { tone: "neutral", text: "Triaged by severity" },
        ],
      },
    ],
  },
];

export function Personas() {
  const [activeId, setActiveId] = useState<PersonaId>("agencies");
  const [isOut, setIsOut] = useState(false);

  function handleSelect(id: PersonaId) {
    if (id === activeId) return;
    setIsOut(true);
    window.setTimeout(() => {
      setActiveId(id);
      setIsOut(false);
    }, 150);
  }

  const active = PERSONAS.find((p) => p.id === activeId) ?? PERSONAS[0];

  return (
    <section id="personas" className="personas">
      <div className="pers-head">
        <span className="section-eyebrow">Who it&apos;s for</span>
        <h2 className="pers-h">
          Different teams.
          <br />
          Same friction.
        </h2>
        <p className="pers-p">The capture is the same. The destination changes.</p>
      </div>
      <div className="pers-tabs" role="tablist">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === activeId}
            className={`pers-tab${p.id === activeId ? " is-on" : ""}`}
            onClick={() => handleSelect(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="pers-stage">
        <div className="pers-grid">
          <div className="pers-copy">
            <h3 className={`pers-tagline${isOut ? " is-out" : ""}`}>
              {active.tagline}
            </h3>
            <ul className={`pers-bullets${isOut ? " is-out" : ""}`}>
              {active.bullets.map((b, i) => (
                <li key={i} className="pers-bullet">
                  <span className="num">0{i + 1}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pers-viz">
            <div className="pers-viz-h">
              <span className="pers-viz-tit">{active.vizTitle}</span>
              <span className="pers-viz-dot" />
            </div>
            <div className={`pers-viz-body${isOut ? " is-out" : ""}`}>
              {active.vizBody.map((row, i) => {
                if (row.kind === "card") {
                  return (
                    <div className="pv-card" key={i}>
                      <span className="pv-card-h">{row.head}</span>
                      <span className="pv-card-v">{row.value}</span>
                      <span
                        className={`pv-line${row.line === "fill" ? " fill" : ""}`}
                      />
                    </div>
                  );
                }
                return (
                  <div className="pv-card" key={i}>
                    <div className="pv-list">
                      {row.items.map((it, j) => (
                        <div className="pv-row" key={j}>
                          <span
                            className={`ico${it.tone === "neutral" ? "" : ` ${it.tone}`}`}
                          />
                          <span>{it.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
