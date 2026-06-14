"use client";

import { useState } from "react";

/**
 * Evidence + Trust marketing content.
 *
 *  - <EvidenceBlock /> — THE EVIDENCE (dark, DevTools-grade): kicker, headline,
 *    four supporting points, the tabbed evidence panel (AI / Console / Network
 *    with copy-as-cURL / Actions with a Readable/Technical toggle), and a closing
 *    line. It renders WITHOUT its own section background so it can live inside the
 *    shared `.ag-root` dark section (BuiltForAgenciesDark) and read as one
 *    continuous dark canvas. It inherits the `--ag-*` dark tokens from `.ag-root`.
 *
 *  - <EvidenceTrust /> — the light TRUST band (privacy reassurance), its own
 *    section, placed before <Pricing />.
 *
 * The vanilla-JS interactions from the source markup (tab switching, the
 * Readable/Technical action toggle, and copy-as-cURL feedback) are reimplemented
 * as React state. All `.ev-*` / `.dt-*` styles live in marketing.css scoped under
 * `.marketing-root`.
 */

type Tab = "ai" | "console" | "network" | "actions";
type ActionView = "readable" | "technical";

const ACTIONS: ReadonlyArray<{
  title: string;
  readable: string;
  technical: string;
  time: string;
  icon: React.ReactNode;
}> = [
  {
    title: "Clicked “Add to cart”",
    readable: "on the product page for the Clay Mug",
    technical: "button.add-to-cart › /product/clay-mug",
    time: "00:12",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Navigated to /checkout",
    readable: "moved to the checkout page",
    technical: "GET /checkout · referrer /cart",
    time: "00:14",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    ),
  },
];

const POINTS: ReadonlyArray<{ icon: React.ReactNode; body: React.ReactNode }> = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    body: (
      <>
        <b>Console, network, and user actions</b> — captured on one clock,
        correlated per ticket.
      </>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="7 8 3 12 7 16" />
        <polyline points="17 8 21 12 17 16" />
        <line x1="14" y1="5" x2="10" y2="19" />
      </svg>
    ),
    body: (
      <>
        <b>Every request copies as cURL</b> — replay the failing call straight
        from the bug report.
      </>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    ),
    body: (
      <>
        <b>Two views of every action</b> — plain English for PMs, element-level
        detail for engineers.
      </>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.9 4.6L18.5 9 14 11l-2 5-2-5L5.5 9l4.6-1.4L12 3Z" />
      </svg>
    ),
    body: (
      <>
        <b>An AI that cites real evidence</b> — and says so honestly when the
        capture doesn&apos;t show the cause.
      </>
    ),
  },
];

function EvidencePanel() {
  const [tab, setTab] = useState<Tab>("ai");
  const [actionView, setActionView] = useState<ActionView>("readable");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="dt">
      <div className="dt-bar">
        <div className="dt-dots">
          <i></i>
          <i></i>
          <i></i>
        </div>
        <span className="dt-bar-id">
          <b>ANN-2231</b> · cart total shows $75 for two $25 items
        </span>
        <span className="dt-bar-right">
          <span className="dt-live"></span>ATTACHED EVIDENCE
        </span>
      </div>

      <div className="dt-tabs" role="tablist">
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "ai"}
          onClick={() => setTab("ai")}
        >
          <span className="tdot"></span>AI
        </button>
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "console"}
          onClick={() => setTab("console")}
        >
          Console <span className="cnt">3</span>
        </button>
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "network"}
          onClick={() => setTab("network")}
        >
          Network <span className="cnt">3</span>
        </button>
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "actions"}
          onClick={() => setTab("actions")}
        >
          Actions <span className="cnt">2</span>
        </button>
      </div>

      <div className="dt-body">
        {/* AI */}
        {tab === "ai" && (
          <div className="dt-panel" data-panel="ai" data-on="1">
            <div className="dt-aitop">
              <span className="dt-verdict">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Related
                <span className="sep"></span>
                <span className="conf">
                  <i></i>High confidence
                </span>
              </span>
              <span className="dt-aibadge">
                <span className="mk">✦</span>AI analysis
              </span>
            </div>
            <p className="dt-cause">
              The <code>/api/cart</code> response returned <code>total=75</code>{" "}
              for two <b>$25</b> items — the bug is in the{" "}
              <b>cart display logic</b>, not the request.
            </p>
            <p className="dt-fixlabel">Suggested fix</p>
            <ol className="dt-steps">
              <li className="dt-step">
                <span className="n">1</span>
                <span className="st">
                  Format <code>total</code> from cents to dollars before it
                  renders in <code>CartSummary</code>.
                </span>
              </li>
              <li className="dt-step">
                <span className="n">2</span>
                <span className="st">
                  Add a test for the two-item case — expect <code>$50.00</code>,
                  not <code>$75</code>.
                </span>
              </li>
              <li className="dt-step">
                <span className="n">3</span>
                <span className="st">
                  Confirm <code>/checkout</code> reads the total through the same
                  formatter.
                </span>
              </li>
            </ol>
            <span className="dt-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
              </svg>
              AI-generated · review before acting
            </span>
          </div>
        )}

        {/* Console */}
        {tab === "console" && (
          <div className="dt-panel" data-panel="console" data-on="1">
            <div className="dt-console">
              <div className="dt-crow err">
                <span className="gl">✕</span>
                <span>Uncaught TypeError: total.toFixed is not a function</span>
              </div>
              <div className="dt-trace">
                at <span className="fn">formatPrice</span> (utils/price.ts:12:9) ·
                at <span className="fn">CartSummary</span> (cart.tsx:42:18)
              </div>
              <div className="dt-crow err">
                <span className="gl">✕</span>
                <span>
                  Cart rendered “$75” for 2 × <span className="src">$25.00</span> —
                  expected “$50.00”
                </span>
              </div>
              <div className="dt-crow warn">
                <span className="gl">⚠</span>
                <span>
                  Received <span className="src">NaN</span> for the children
                  attribute on &lt;CartTotal /&gt;
                </span>
              </div>
              <div className="dt-cmeta">
                3 messages · captured on the same clock as Network &amp; Actions
              </div>
            </div>
          </div>
        )}

        {/* Network */}
        {tab === "network" && (
          <div className="dt-panel" data-panel="network" data-on="1">
            <div className="dt-net">
              <div className="dt-netgrid">
                <div className="dt-nethead">
                  <span>Name</span>
                  <span>Status</span>
                  <span>Type</span>
                  <span>Time</span>
                </div>
                <div className="dt-netrow sel">
                  <span className="nm">
                    <span className="verb post">POST</span>
                    <span className="path">/api/cart</span>
                  </span>
                  <span className="st ok">
                    <i></i>200
                  </span>
                  <span className="ty">xhr</span>
                  <span className="tm">88 ms</span>
                </div>
                <div className="dt-netrow">
                  <span className="nm">
                    <span className="verb get">GET</span>
                    <span className="path">/api/session</span>
                  </span>
                  <span className="st ok">
                    <i></i>200
                  </span>
                  <span className="ty">fetch</span>
                  <span className="tm">142 ms</span>
                </div>
                <div className="dt-netrow">
                  <span className="nm">
                    <span className="verb get">GET</span>
                    <span className="path">/cart</span>
                  </span>
                  <span className="st notmod">
                    <i></i>304
                  </span>
                  <span className="ty">doc</span>
                  <span className="tm">61 ms</span>
                </div>
              </div>
              <div className="dt-curl">
                <span className="pre">
                  <s>curl</s> -X POST <em>https://shop.acme.dev</em>/api/cart -d
                  &apos;{'{"items":2,"price":25}'}&apos;
                </span>
                <button className="dt-copy" type="button" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="11" height="11" rx="2" />
                        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                      </svg>
                      Copy as cURL
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {tab === "actions" && (
          <div className="dt-panel" data-panel="actions" data-on="1">
            <div className="dt-acthead">
              <span className="dt-actlabel">User actions · this session</span>
              <span className="dt-toggle">
                <button
                  type="button"
                  aria-pressed={actionView === "readable"}
                  onClick={() => setActionView("readable")}
                >
                  Readable
                </button>
                <button
                  type="button"
                  aria-pressed={actionView === "technical"}
                  onClick={() => setActionView("technical")}
                >
                  Technical
                </button>
              </span>
            </div>
            <div className="dt-acts">
              {ACTIONS.map((a) => (
                <div className="dt-act" key={a.title}>
                  <span className="ai">{a.icon}</span>
                  <span className="atx">
                    <span className="at">{a.title}</span>
                    <span className="ad">
                      {actionView === "readable" ? a.readable : a.technical}
                    </span>
                  </span>
                  <span className="ats">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * THE EVIDENCE — a full-width fifth card in the same family as the 2×2
 * lifecycle grid above (QA / Team / Review / Ship). It reuses the `.ag-card`
 * surface (glassy panel, accent bloom, top sheen, hover glow), the numbered
 * `.ag-eyebrow` label, and the `.ag-h` headline so it reads as part of the same
 * set. Rendered inside the shared `.ag-root` dark section, so it inherits the
 * `--ag-*` dark tokens and shares one continuous background. The DevTools panel
 * sits in the card's "stage" (right column on desktop).
 */
export function EvidenceBlock() {
  return (
    <div className="ev-block">
      <article className="ag-card ev-card">
        <div className="ev-card-grid">
          <div className="ag-card-head ev-card-head">
            <div className="ag-eyebrow ev-card-eyebrow">
              <span className="ev-card-eyebrow-mark">✦</span>05 · EVIDENCE
            </div>
            <h3 className="ag-h ev-card-h">
              Underneath every ticket,
              <br />
              what developers actually need.
            </h3>
            <p className="ag-p ev-card-p">
              Reporters never think about this part — it&apos;s just there when an
              engineer opens the ticket.
            </p>

            <div className="ev-points">
              {POINTS.map((p, i) => (
                <div className="ev-point" key={i}>
                  <span className="ev-pt-ic">{p.icon}</span>
                  <span className="ev-pt-tx">{p.body}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ev-card-stage">
            <div className="ev-panel-wrap">
              <EvidencePanel />
            </div>
          </div>
        </div>

        <p className="ev-closer">
          <q>Which button? What were you even doing?</q> —{" "}
          <b>answered automatically, every time.</b>
        </p>
      </article>
    </div>
  );
}

/* TRUST (light, quiet band) — its own section, placed before <Pricing />. */
export function EvidenceTrust() {
  return (
    <section className="ev-trust-root">
      <div className="ev-trust-wrap">
        <div className="ev-trust-kicker">
          <span className="mk">✦</span>
          <span>HANDLED WITH CARE</span>
        </div>
        <h2 className="ev-trust-h">Quietly careful with your data.</h2>
        <p className="ev-trust-p">
          Annote redacts secrets and common PII patterns right in the page as it
          captures — <b>before anything is stored or sent</b>. It never reads
          what users type, runs on just four browser permissions, and uses no
          third-party analytics.
        </p>
        <div className="ev-trust-chips">
          <span className="ev-trust-chip">
            <i></i>Redacted in-page
          </span>
          <span className="ev-trust-chip">
            <i></i>Never reads input values
          </span>
          <span className="ev-trust-chip">
            <i></i>4 permissions
          </span>
          <span className="ev-trust-chip">
            <i></i>No third-party analytics
          </span>
        </div>
      </div>
    </section>
  );
}
