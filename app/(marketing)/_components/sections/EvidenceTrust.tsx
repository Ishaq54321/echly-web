"use client";

import { useEffect, useRef, useState } from "react";

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

const TAB_ORDER: ReadonlyArray<Tab> = ["ai", "console", "network", "actions"];

function EvidencePanel() {
  const [tab, setTab] = useState<Tab>("ai");
  const [actionView, setActionView] = useState<ActionView>("readable");
  const [copied, setCopied] = useState(false);
  // Once the user clicks a tab, auto-cycling stops for good.
  const [pinned, setPinned] = useState(false);

  // Auto-advance through the tabs every 2s with the existing dt-rise animation,
  // until the user takes over by clicking a tab. Respects reduced motion.
  useEffect(() => {
    if (pinned) return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => {
      setTab((prev) => {
        const next = TAB_ORDER[(TAB_ORDER.indexOf(prev) + 1) % TAB_ORDER.length];
        return next;
      });
    }, 2000);
    return () => window.clearInterval(id);
  }, [pinned]);

  // A user clicking any tab selects it and permanently stops the auto-cycle.
  const selectTab = (next: Tab) => {
    setPinned(true);
    setTab(next);
  };

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
      </div>

      <div className="dt-tabs" role="tablist">
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "ai"}
          onClick={() => selectTab("ai")}
        >
          <span className="tdot"></span>AI
        </button>
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "console"}
          onClick={() => selectTab("console")}
        >
          Console <span className="cnt">3</span>
        </button>
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "network"}
          onClick={() => selectTab("network")}
        >
          Network <span className="cnt">3</span>
        </button>
        <button
          className="dt-tab"
          role="tab"
          aria-selected={tab === "actions"}
          onClick={() => selectTab("actions")}
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
              The AI already read the logs.
            </h3>
            <p className="ag-p ev-card-p">
              Console, network, and actions are captured on one clock — and the
              AI flags the likely cause before a dev opens the ticket.
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

/* PRIVACY / REDACTION (light) — its own section, placed before <Pricing />.
 * Ported verbatim from the standalone "Annote Privacy Section" markup: a
 * two-column split with copy + a four-up feature grid on the left and an
 * in-page redaction mockup card (POST /api/login with redacted fields) on the
 * right. The source's external `base.css` theme variables are resolved to
 * concrete values in the `.pv-*` block in marketing.css (scoped under
 * `.marketing-root`). */
export function EvidenceTrust() {
  return (
    <section className="pv">
      <div className="pv-grid" />
      <div className="pv-wrap">
        <div className="pv-split">
          {/* LEFT : copy */}
          <div className="pv-copy">
            <span className="pv-eyebrow">
              <span className="mk">✦</span>Handled with care
            </span>
            <h2 className="pv-h">Quietly careful with your data.</h2>
            <p className="pv-p">
              Annote redacts secrets and common PII patterns right in the page
              as it captures — <strong>before anything is stored or sent</strong>
              . It never reads what users type, runs on just four browser
              permissions, and uses no third-party analytics.
            </p>

            <div className="pv-feats">
              <div className="pv-feat">
                <span className="pv-feat-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="6.5" width="18" height="5.5" rx="1.5" />
                    <path d="M3 17h10" />
                  </svg>
                </span>
                <div>
                  <div className="pv-feat-t">Redacted in-page</div>
                  <div className="pv-feat-d">
                    Secrets masked before they&apos;re buffered.
                  </div>
                </div>
              </div>
              <div className="pv-feat">
                <span className="pv-feat-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9 7-.4 1-.9 1.8-1.6 2.6M6.6 6.7C3.9 8.2 3 10.7 3 12c0 0 4 7 9 7a8.6 8.6 0 0 0 3.4-.7" />
                    <path d="M3 3l18 18" />
                  </svg>
                </span>
                <div>
                  <div className="pv-feat-t">Never reads input values</div>
                  <div className="pv-feat-d">
                    We capture which field, never what&apos;s typed.
                  </div>
                </div>
              </div>
              <div className="pv-feat">
                <span className="pv-feat-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="15" r="4" />
                    <path d="M10.8 12.2 19 4M16 7l2.5 2.5M13.5 9.5 16 12" />
                  </svg>
                </span>
                <div>
                  <div className="pv-feat-t">Four permissions</div>
                  <div className="pv-feat-d">No cookies, no history, no webRequest.</div>
                </div>
              </div>
              <div className="pv-feat">
                <span className="pv-feat-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 21V11M12 21V8M19 21v-5" />
                    <path d="M3 4l18 16" />
                  </svg>
                </span>
                <div>
                  <div className="pv-feat-t">No third-party analytics</div>
                  <div className="pv-feat-d">Zero tracking SDKs in the product.</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT : redaction mockup */}
          <div className="pv-stage">
            <div className="pv-timing">
              <b>5ms</b> redaction
            </div>
            <div className="pv-card">
              <div className="pv-cardhead">
                <span className="pv-method">POST</span>
                <span className="pv-reqline">
                  <b>/api/login</b>
                </span>
                <span className="pv-status">
                  <i></i>200 OK
                </span>
              </div>

              <div className="pv-rows">
                <div className="pv-sectlabel">Captured request</div>

                <div className="pv-row">
                  <span className="pv-key">
                    Authorization<span className="c">:</span>
                  </span>
                  <span className="pv-val">
                    <span className="pv-redacted">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="10.5" width="16" height="10" rx="2" />
                        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
                      </svg>
                      &lt;redacted&gt;
                    </span>
                  </span>
                </div>

                <div className="pv-row">
                  <span className="pv-key">
                    email<span className="c">:</span>
                  </span>
                  <span className="pv-val">
                    <span className="pv-redacted">&lt;redacted&gt;</span>
                  </span>
                </div>

                <div className="pv-row">
                  <span className="pv-key">
                    password<span className="c">:</span>
                  </span>
                  <span className="pv-val">
                    <span className="pv-dots">••••••••••</span>
                  </span>
                </div>

                <div className="pv-row">
                  <span className="pv-key">
                    cardNumber<span className="c">:</span>
                  </span>
                  <span className="pv-val">
                    <span className="pv-redacted">&lt;redacted&gt;</span>
                  </span>
                </div>

                <div className="pv-row kept">
                  <span className="pv-key">
                    userId<span className="c">:</span>
                  </span>
                  <span className="pv-val">
                    usr_8f2a1c <span className="pv-kept-tag">· kept</span>
                  </span>
                </div>
              </div>

              <div className="pv-cardfoot">
                <span className="pv-caption">
                  <span className="dot"></span>Redacted in the page · before it
                  left the browser
                </span>
                <span className="pv-microtag">
                  <span className="pip">
                    <i></i>fail-closed
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* AI DIAGNOSIS — the "Already diagnosed" flagship band, ported from the
 * standalone "Annote — The cause is already there" markup. A deep-indigo
 * spotlight room (drifting ghosted log fragments + technical grid + violet
 * bloom) interrupting the near-white page so the white diagnosis card glows as
 * a single spotlit object, framed by three supporting points and a closing
 * line. The source's foreign theme vars resolve to concrete values in the
 * `.dx-` block in marketing.css (scoped under `.marketing-root`).
 *
 * Constraints vs. the source: the band is NOT full-bleed — it borrows the dark
 * `.ag-root` section's inset width (calc(100% - 96px) / max 1440px, centered)
 * and 32px rounded corners. The source's inline-script behaviours are
 * reimplemented in React: the drifting log columns are generated here, and the
 * scroll-triggered "lit" reveal is an IntersectionObserver in a useEffect that
 * respects prefers-reduced-motion (and plays once). */

const LOG_FRAGMENTS: ReadonlyArray<string> = [
  "GET /api/me 200", "console: 0 errors", "response: userId mismatch", "redacted",
  "GET /checkout 304", "PATCH /api/order/8f2a 200", "session.replay attached", "200 OK",
  "X-Request-Id: 7c1f…e90", "userId: usr_8f2a1c", "latency 38ms", "cached · stale payload",
  "GET /api/flags 200", "POST /api/login 200", "Set-Cookie: <redacted>", "expected usr_8f2a1c",
  "console.log('mounted')", "GET /assets/app.js 200", "got usr_44b0 · mismatch", "Authorization: <redacted>",
  "captured 1 session · 4.2s", "PUT /settings 204", "ticket #4821", "no error surfaced",
  "GET /api/me 200", "email: <redacted>", "diagnosis · high confidence", "review before acting",
];

/* Deterministic drifting-log columns. The source randomised line content,
 * column offset and duration at runtime; here the layout is derived from a
 * fixed index so the markup is stable across server/client renders (no hydration
 * mismatch) and needs no runtime script. Each column doubles its lines so the
 * -50% translate loops seamlessly. */
function FlagCodeColumns() {
  const cols = 6;
  const rows = 26;
  return (
    <>
      {Array.from({ length: cols }, (_, i) => {
        // The line set, rendered twice so the -50% drift loops seamlessly.
        const cell = (k: number, pass: number) => {
          const idx = (i * 7 + k * 3) % LOG_FRAGMENTS.length;
          const tier = (i + k) % 5 === 0 ? "hi" : (i + k) % 3 === 0 ? "lo" : "";
          return (
            <span key={`${pass}-${k}`} className={tier}>
              {LOG_FRAGMENTS[idx]}
            </span>
          );
        };
        return (
          <div
            key={i}
            className="dx-code-col"
            style={
              {
                left: `${i * (100 / cols) - 1}%`,
                "--dur": `${70 + ((i * 13) % 46)}s`,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: rows }, (_, k) => cell(k, 0))}
            {Array.from({ length: rows }, (_, k) => cell(k, 1))}
          </div>
        );
      })}
    </>
  );
}

export function AiDiagnosisCard() {
  const [lit, setLit] = useState(false);
  // Marks JS as live (set on mount via rAF, a callback — not synchronously in
  // the effect body). The card's hidden/dimmed pre-animation states only apply
  // under `.dx-js`, so SSR / no-JS shows the fully settled card rather than a
  // blank one. Applied before `.lit` so the entrance transition has a hidden
  // starting state to animate from. Mirrors the source's `.js` <html> gate.
  const [dxJs, setDxJs] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const diagRef = useRef<HTMLDivElement | null>(null);
  const diagWrapRef = useRef<HTMLDivElement | null>(null);
  const causeBodyRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const tabBodyRef = useRef<HTMLDivElement | null>(null);
  const ranRef = useRef(false);

  // The "live diagnosis" timeline — a faithful port of the source's
  // runDiagnosis(): analyse → verdict → summary → stream the cause word by word
  // (tokens lighting up in place) → snap evidence chips in → footer → settle
  // into a gentle idle float. Driven imperatively over refs because it streams
  // text node-by-node; React just owns the static markup. Declared as a hoisted
  // function so the scroll effect below can reference it. Returns a cleanup that
  // clears any pending timers/intervals.
  function runDiagnosis(reduce: boolean): () => void {
    if (ranRef.current) return () => {};
    ranRef.current = true;
    const diag = diagRef.current;
    const wrap = diagWrapRef.current;
    const body = causeBodyRef.current;
    if (!diag || !body) return () => {};

    const timers: number[] = [];
    const intervals: number[] = [];

    const STATES = ["s-verdict", "s-summary", "s-cause", "s-evid", "s-foot"];

    // Settled state — also the reduced-motion shortcut.
    const finalState = () => {
      STATES.forEach((c) => diag.classList.add(c));
      diag.querySelectorAll(".dx-pill").forEach((p) => p.classList.add("in"));
      diag
        .querySelectorAll("code.dx-inl")
        .forEach((c) => c.classList.remove("dim"));
    };
    if (reduce) {
      finalState();
      return () => {};
    }

    // Dim every code token so they can "light up" as the cause streams in.
    diag.querySelectorAll("code.dx-inl").forEach((c) => c.classList.add("dim"));

    // Word-by-word streaming of the likely cause, lighting tokens in place.
    const streamCause = (done: () => void) => {
      const nodes = Array.from(body.childNodes);
      const units: HTMLElement[] = [];
      body.innerHTML = "";
      nodes.forEach((node) => {
        if (node.nodeType === 3) {
          (node.textContent || "").split(/(\s+)/).forEach((p) => {
            if (p === "") return;
            if (/^\s+$/.test(p)) {
              body.appendChild(document.createTextNode(p));
              return;
            }
            const s = document.createElement("span");
            s.className = "dx-w";
            s.textContent = p;
            body.appendChild(s);
            units.push(s);
          });
        } else {
          const el = node as HTMLElement;
          body.appendChild(el);
          units.push(el);
        }
      });
      const caret = document.createElement("span");
      caret.className = "dx-caret";
      body.appendChild(caret);
      let i = 0;
      const t = window.setInterval(() => {
        if (i >= units.length) {
          window.clearInterval(t);
          caret.remove();
          done();
          return;
        }
        const u = units[i++];
        // Defensive: a detached/missing node can occur if the timeline is
        // re-entered (e.g. a dev double-mount) — skip rather than crash.
        if (!u || !u.classList) return;
        u.classList.add("in");
        if (u.tagName === "CODE") {
          u.classList.remove("dim");
          if (u.classList.contains("ok")) u.classList.add("pulse");
        }
      }, 26);
      intervals.push(t);
    };

    // 1 — analyzing beat (sparkle pulse + scan sweep + progress shimmer)
    diag.classList.add("analyzing");
    // 2 — verdict pill pops in
    timers.push(
      window.setTimeout(() => {
        diag.classList.remove("analyzing");
        diag.classList.add("s-verdict");
      }, 650),
    );
    // 3 — summary fades in
    timers.push(window.setTimeout(() => diag.classList.add("s-summary"), 900));
    // 4 — likely cause streams in, tokens light up
    timers.push(
      window.setTimeout(() => {
        diag.classList.add("s-cause");
        streamCause(() => {
          // 5 — divider + evidence chips snap in one by one
          timers.push(
            window.setTimeout(() => {
              diag.classList.add("s-evid");
              const pills = diag.querySelectorAll(".dx-pill");
              pills.forEach((p, idx) =>
                timers.push(
                  window.setTimeout(() => p.classList.add("in"), idx * 74),
                ),
              );
              // 6 — footer fades in last
              timers.push(
                window.setTimeout(
                  () => diag.classList.add("s-foot"),
                  pills.length * 74 + 170,
                ),
              );
              // settle into a gentle idle float
              timers.push(
                window.setTimeout(
                  () => wrap && wrap.classList.add("settled"),
                  pills.length * 74 + 760,
                ),
              );
            }, 140),
          );
        });
      }, 1150),
    );

    return () => {
      timers.forEach(window.clearTimeout);
      intervals.forEach(window.clearInterval);
    };
  }

  // Light the band on scroll-into-view (plays once), then run the diagnosis
  // timeline ~300ms later — the same sequencing as the source's inline script.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Mark JS as live on the next frame (a callback, so no synchronous setState
    // in the effect body), before the band is lit — gives the card a hidden
    // starting state to animate from.
    const jsRaf = window.requestAnimationFrame(() => setDxJs(true));

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timers: number[] = [];
    let stopDiagnosis: (() => void) | undefined;
    const light = () => {
      setLit(true);
      timers.push(
        window.setTimeout(
          () => {
            stopDiagnosis = runDiagnosis(reduce);
          },
          reduce ? 0 : 300,
        ),
      );
    };

    const cleanup = () => {
      window.cancelAnimationFrame(jsRaf);
      timers.forEach(window.clearTimeout);
      stopDiagnosis?.();
    };

    if (reduce || !("IntersectionObserver" in window)) {
      const raf = window.requestAnimationFrame(light);
      return () => {
        window.cancelAnimationFrame(raf);
        cleanup();
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            light();
            io.disconnect();
          }
        });
      },
      { threshold: 0.28 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cleanup();
    };
  }, []);

  // Pause the infinite drifting flag-code columns (and the card's idle shimmer
  // loops) whenever this flagship band is scrolled out of view — pure perf, no
  // visible change. Separate from the one-shot "light + run diagnosis" observer
  // above (which disconnects after firing); this one lives for the page.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e) el.classList.toggle("mk-anim-paused", !e.isIntersecting);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Tabbed evidence panel — AI · Console · Network · Actions. A port of the
  // source's tabbed-panel script: animated underline indicator, height-morphing
  // body, the network "culprit" drawer + copy-as-cURL, the actions
  // readable/technical toggle, and the console filter chips. Driven imperatively
  // over refs (DOM measuring + class toggles); React owns the static markup.
  useEffect(() => {
    const diag = diagRef.current;
    const tabs = tabsRef.current;
    const body = tabBodyRef.current;
    if (!diag || !tabs || !body) return;

    const ind = tabs.querySelector<HTMLElement>(".dx-tab-ind");
    const btns = Array.from(tabs.querySelectorAll<HTMLButtonElement>(".dx-tab"));
    const panels: Record<string, HTMLElement> = {};
    diag.querySelectorAll<HTMLElement>(".dx-tab-panel").forEach((p) => {
      const name = p.dataset.panel;
      if (name) panels[name] = p;
    });
    let current = "ai";
    const timers: number[] = [];
    const cleanups: Array<() => void> = [];

    const place = () => {
      const b = tabs.querySelector<HTMLElement>(".dx-tab.active");
      if (b && ind) {
        ind.style.left = b.offsetLeft + "px";
        ind.style.width = b.offsetWidth + "px";
      }
    };
    const autoH = () => {
      if (panels[current]?.classList.contains("active")) body.style.height = "auto";
    };

    const raf = window.requestAnimationFrame(place);
    const onResize = () => {
      place();
      autoH();
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    const go = (name: string) => {
      if (name === current) return;
      const nextP = panels[name];
      const curP = panels[current];
      if (!nextP || !curP) return;
      const startH = body.offsetHeight;
      curP.classList.remove("active");
      curP.setAttribute("aria-hidden", "true");
      nextP.classList.add("active");
      nextP.setAttribute("aria-hidden", "false");
      const endH = nextP.offsetHeight;
      body.style.height = startH + "px";
      void body.getBoundingClientRect();
      body.style.height = endH + "px";
      const target = name;
      timers.push(
        window.setTimeout(() => {
          if (current === target) body.style.height = "auto";
        }, 440),
      );
      btns.forEach((b) => {
        const on = b.dataset.tab === name;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      current = name;
      place();
    };

    btns.forEach((b) => {
      const onClick = () => go(b.dataset.tab || "ai");
      const onKey = (e: KeyboardEvent) => {
        const i = btns.indexOf(b);
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const n = btns[(i + 1) % btns.length];
          n.focus();
          go(n.dataset.tab || "ai");
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const p = btns[(i - 1 + btns.length) % btns.length];
          p.focus();
          go(p.dataset.tab || "ai");
        }
      };
      b.addEventListener("click", onClick);
      b.addEventListener("keydown", onKey);
      cleanups.push(() => {
        b.removeEventListener("click", onClick);
        b.removeEventListener("keydown", onKey);
      });
    });

    // Network — culprit drawer toggle + copy-as-cURL
    const culprit = diag.querySelector<HTMLElement>(".dx-net-row.culprit");
    if (culprit) {
      const cells = culprit.querySelector<HTMLElement>(".dx-nr-cells");
      const onCellsClick = () => {
        culprit.classList.toggle("open");
        autoH();
      };
      cells?.addEventListener("click", onCellsClick);
      cleanups.push(() => cells?.removeEventListener("click", onCellsClick));

      const curl = culprit.querySelector<HTMLButtonElement>(".dx-curl");
      if (curl) {
        const onCurl = (e: Event) => {
          e.stopPropagation();
          const t = curl.querySelector<HTMLElement>(".dx-curl-t");
          const old = t ? t.textContent : "";
          curl.classList.add("copied");
          if (t) t.textContent = "Copied";
          try {
            navigator.clipboard?.writeText(
              "curl 'https://api.annote.app/api/me' -H 'authorization: <redacted>'",
            );
          } catch {
            /* clipboard may be unavailable — ignore */
          }
          timers.push(
            window.setTimeout(() => {
              curl.classList.remove("copied");
              if (t) t.textContent = old;
            }, 1400),
          );
        };
        curl.addEventListener("click", onCurl);
        cleanups.push(() => curl.removeEventListener("click", onCurl));
      }
    }

    // Actions — readable / technical toggle
    const acts = diag.querySelector<HTMLElement>(".dx-acts");
    diag.querySelectorAll<HTMLButtonElement>(".dx-seg-b").forEach((sb) => {
      const onClick = () => {
        diag
          .querySelectorAll<HTMLElement>(".dx-seg-b")
          .forEach((x) => x.classList.toggle("active", x === sb));
        const tech = sb.dataset.mode === "technical";
        if (acts) {
          acts.classList.toggle("tech", tech);
          acts.querySelectorAll<HTMLElement>(".dx-act-txt").forEach((t) => {
            const next = t.getAttribute(tech ? "data-technical" : "data-readable");
            if (next != null) t.textContent = next;
          });
        }
        autoH();
      };
      sb.addEventListener("click", onClick);
      cleanups.push(() => sb.removeEventListener("click", onClick));
    });

    // Console — filter chips (Logs toggles rows; Errors/Warnings are 0)
    diag.querySelectorAll<HTMLButtonElement>(".dx-fchip").forEach((fc) => {
      const onClick = () => {
        fc.classList.toggle("active");
        if (fc.dataset.f === "logs") {
          const rows = diag.querySelector<HTMLElement>(".dx-con-rows");
          if (rows) rows.style.display = fc.classList.contains("active") ? "" : "none";
          autoH();
        }
      };
      fc.addEventListener("click", onClick);
      cleanups.push(() => fc.removeEventListener("click", onClick));
    });

    return () => {
      window.cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section className="dxband-gutter">
      <section
        ref={sectionRef}
        className={
          "dxflag" + (dxJs ? " dx-js" : "") + (lit ? " lit" : "")
        }
        aria-label="Already-diagnosed flagship section"
      >
        <div className="dx-grid" />
        <div className="dx-code" aria-hidden="true">
          <FlagCodeColumns />
        </div>
        <div className="dx-bloom" />

        <div className="dx-wrap">
          <div className="dx-head">
            <span className="dx-eyebrow">
              <span className="spk">✦</span>Already diagnosed
            </span>
            <h2 className="dx-h">
              Your engineers open the ticket.
              <br />
              <span className="dim">The cause is already there.</span>
            </h2>
            <p className="dx-sub">
              Annote reads the console, the network, and what the user did — and
              tells your team the likely cause before anyone opens the ticket.
              The reporter said it in plain words. The AI did the engineering.
            </p>
          </div>

          {/* the spotlit centerpiece — driven by a JS "live diagnosis" timeline
              (analyse → verdict → summary → stream cause → snap evidence →
              footer → settle into an idle float). See the runDiagnosis effect. */}
          <div className="dx-stage">
            <div className="dx-diag-wrap" ref={diagWrapRef}>
              <div className="dx-diag" ref={diagRef} aria-label="AI diagnosis card">
                <div className="dx-diag-prog"></div>
                <div className="dx-diag-scan"></div>

                {/* live-demo pill — the purple "Demo" tag from the WhatTheySee
                    section's pill, relabelled, overlapping the card's top-right */}
                <span className="dx-livepill" aria-hidden="true">
                  <span className="dx-livepill-tag">Live demo</span>
                </span>

                {/* tabbed evidence panel: AI · Console · Network · Actions */}
                <div className="dx-tabs" role="tablist" aria-label="Captured evidence" ref={tabsRef}>
                  <button className="dx-tab active" type="button" data-tab="ai" role="tab" aria-selected="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c.3 2.4.9 4 1.9 5.1C15 9.1 16.6 9.7 19 10c-2.4.3-4 .9-5.1 1.9C12.9 13 12.3 14.6 12 17c-.3-2.4-.9-4-1.9-5.1C9 10.9 7.4 10.3 5 10c2.4-.3 4-.9 5.1-1.9C11.1 7 11.7 5.4 12 3Z" />
                    </svg>
                    AI
                  </button>
                  <button className="dx-tab" type="button" data-tab="console" role="tab" aria-selected="false">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 8 4 4-4 4" />
                      <path d="M13 16h6" />
                    </svg>
                    Console <span className="dx-tcount">3</span>
                  </button>
                  <button className="dx-tab" type="button" data-tab="network" role="tab" aria-selected="false">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19v-7M9.3 19V5M14.7 19v-6M20 19v-9" />
                    </svg>
                    Network <span className="dx-tcount">4</span>
                  </button>
                  <button className="dx-tab" type="button" data-tab="actions" role="tab" aria-selected="false">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 6h12M8 12h12M8 18h12" />
                      <path d="M4 6h.01M4 12h.01M4 18h.01" />
                    </svg>
                    Actions
                  </button>
                  <span className="dx-tab-ind"></span>
                </div>

                <div className="dx-tab-body" ref={tabBodyRef}>
                  {/* ----- AI panel (the live diagnosis) ----- */}
                  <div className="dx-tab-panel active" data-panel="ai" role="tabpanel">
                    <div className="dx-d-head">
                      <div className="dx-ai-ico">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.2c.35 3.06 1.1 5.18 2.46 6.54C15.82 10.1 17.94 10.85 21 11.2c-3.06.35-5.18 1.1-6.54 2.46C13.1 15.02 12.35 17.14 12 20.2c-.35-3.06-1.1-5.18-2.46-6.54C8.18 12.3 6.06 11.55 3 11.2c3.06-.35 5.18-1.1 6.54-2.46C10.9 7.38 11.65 5.26 12 2.2Z" />
                          <path d="M19 3.2c.16 1 .42 1.64.96 2.18.54.54 1.18.8 2.18.96-1 .16-1.64.42-2.18.96-.54.54-.8 1.18-.96 2.18-.16-1-.42-1.64-.96-2.18-.54-.54-1.18-.8-2.18-.96 1-.16 1.64-.42 2.18-.96.54-.54.8-1.18.96-2.18Z" opacity="0.7" />
                        </svg>
                      </div>
                      <span className="dx-d-label">AI analysis</span>
                      <div className="dx-head-right">
                        <span className="dx-analyzing-label">
                          Analyzing capture
                          <span className="dots">
                            <i></i>
                            <i></i>
                            <i></i>
                          </span>
                        </span>
                        <span className="dx-conf">
                          <span className="dot"></span>Related · High confidence
                        </span>
                      </div>
                    </div>

                    <div className="dx-summary">
                      Profile page shows another user&rsquo;s name after login.
                    </div>

                    <div className="dx-cause">
                      <div className="dx-sec-label">Likely cause</div>
                      <div className="dx-body" ref={causeBodyRef}>
                        <code className="dx-inl">GET /api/me</code> returned{" "}
                        <code
                          className="dx-inl ok dx-tip"
                          data-tip="200 OK — the request looked completely healthy"
                        >
                          200
                        </code>{" "}
                        with a cached response for a different{" "}
                        <code className="dx-inl id">userId</code> — the request
                        succeeded, so nothing errored. The stale payload is the
                        bug.
                      </div>
                    </div>

                    <div className="dx-divider-w">
                      <div className="dx-divider"></div>
                    </div>

                    <div className="dx-evidence">
                      <div className="dx-sec-label">Cited evidence</div>
                      <div className="dx-pills">
                        <span
                          className="dx-pill dx-tip"
                          data-tip="Network · request succeeded in 38ms"
                        >
                          GET /api/me<span className="sep">·</span>
                          <span className="ok">200</span>
                          <span className="sep">·</span>38ms
                        </span>
                        <span
                          className="dx-pill dx-tip"
                          data-tip="Response body · returned the wrong userId"
                        >
                          response: userId mismatch
                        </span>
                        <span
                          className="dx-pill dx-tip"
                          data-tip="Console · nothing was ever thrown"
                        >
                          console: <span className="ok">0 errors</span>
                        </span>
                      </div>
                    </div>

                    <div className="dx-foot">
                      <span className="dx-tag">
                        <svg className="g" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                          <line x1="12" y1="11" x2="12" y2="16" />
                          <circle cx="12" cy="7.6" r="0.6" fill="currentColor" stroke="none" />
                        </svg>
                        AI-generated · review before acting
                      </span>
                    </div>
                  </div>

                  {/* ----- Console panel ----- */}
                  <div className="dx-tab-panel" data-panel="console" role="tabpanel" aria-hidden="true">
                    <div className="dx-con-bar">
                      <span className="dx-con-sum">
                        <span className="ok">0</span> errors
                        <span className="dx-con-dot">·</span>3 logs
                      </span>
                      <div className="dx-con-filters">
                        <button className="dx-fchip" type="button" data-f="errors">
                          Errors <span className="fc">0</span>
                        </button>
                        <button className="dx-fchip" type="button" data-f="warnings">
                          Warnings <span className="fc">0</span>
                        </button>
                        <button className="dx-fchip active" type="button" data-f="logs">
                          Logs <span className="fc">3</span>
                        </button>
                      </div>
                    </div>
                    <div className="dx-con-rows">
                      <div className="dx-con-row">
                        <span className="dx-con-lvl log">log</span>
                        <span className="dx-con-txt">profile mounted</span>
                      </div>
                      <div className="dx-con-row">
                        <span className="dx-con-lvl info">info</span>
                        <span className="dx-con-txt">
                          fetching <span className="ct-path">/api/me</span>
                        </span>
                      </div>
                      <div className="dx-con-row">
                        <span className="dx-con-lvl log">log</span>
                        <span className="dx-con-txt">
                          me:{" "}
                          <span className="ct-obj">
                            {"{ userId: "}
                            <span className="ct-str">&lsquo;usr_44b0&rsquo;</span>
                            {", name: "}
                            <span className="ct-str">&lsquo;A. Okafor&rsquo;</span>
                            {" }"}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="dx-con-note">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      No errors or warnings in this capture — every log looked
                      normal.
                    </div>
                  </div>

                  {/* ----- Network panel ----- */}
                  <div className="dx-tab-panel" data-panel="network" role="tabpanel" aria-hidden="true">
                    <div className="dx-net-head">
                      <span className="dx-nh">Status</span>
                      <span className="dx-nh">Method</span>
                      <span className="dx-nh">Name</span>
                      <span className="dx-nh time">Time</span>
                    </div>
                    <div className="dx-net-rows">
                      <div className="dx-net-row culprit open">
                        <div className="dx-nr-cells">
                          <span className="dx-nr">
                            <span className="dx-st-ok">200</span>
                          </span>
                          <span className="dx-nr-method">GET</span>
                          <span className="dx-nr-name">
                            /api/me{" "}
                            <svg className="dx-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 6 6 6-6 6" />
                            </svg>
                          </span>
                          <span className="dx-nr-time">38ms</span>
                        </div>
                        <div className="dx-nr-drawer">
                          <div className="dx-nr-drawer-in">
                            <div className="dx-dr-pad">
                              <div className="dx-dr-head">
                                <span className="dx-dr-cap">Response body</span>
                                <button className="dx-curl" type="button">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="11" height="11" rx="2" />
                                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                                  </svg>
                                  <span className="dx-curl-t">Copy as cURL</span>
                                </button>
                              </div>
                              <pre className="dx-dr-body">{"{\n  \"userId\": "}<span className="bad">&quot;usr_8f2a&quot;</span>{",\n  \"name\": "}<span className="bad">&quot;M. Rivera&quot;</span>{"\n}"}</pre>
                              <div className="dx-dr-note">
                                ↑ cached response, wrong user
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="dx-net-row">
                        <div className="dx-nr-cells">
                          <span className="dx-nr">
                            <span className="dx-st-ok">200</span>
                          </span>
                          <span className="dx-nr-method">GET</span>
                          <span className="dx-nr-name">/api/flags</span>
                          <span className="dx-nr-time">22ms</span>
                        </div>
                      </div>
                      <div className="dx-net-row">
                        <div className="dx-nr-cells">
                          <span className="dx-nr">
                            <span className="dx-st-ok">200</span>
                          </span>
                          <span className="dx-nr-method">POST</span>
                          <span className="dx-nr-name">/api/login</span>
                          <span className="dx-nr-time">140ms</span>
                        </div>
                      </div>
                      <div className="dx-net-row">
                        <div className="dx-nr-cells">
                          <span className="dx-nr">
                            <span className="dx-st-ok">200</span>
                          </span>
                          <span className="dx-nr-method">GET</span>
                          <span className="dx-nr-name">/assets/app.js</span>
                          <span className="dx-nr-time">12ms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ----- Actions panel ----- */}
                  <div className="dx-tab-panel" data-panel="actions" role="tabpanel" aria-hidden="true">
                    <div className="dx-act-bar">
                      <span className="dx-act-cap">User journey</span>
                      <div className="dx-seg" role="group" aria-label="View mode">
                        <button className="dx-seg-b active" type="button" data-mode="readable">
                          Readable
                        </button>
                        <button className="dx-seg-b" type="button" data-mode="technical">
                          Technical
                        </button>
                      </div>
                    </div>
                    <ol className="dx-acts">
                      <li className="dx-act">
                        <span className="dx-act-node"></span>
                        <span
                          className="dx-act-txt"
                          data-readable="Logged in as A. Okafor"
                          data-technical="POST /api/login → 200 · usr_44b0"
                        >
                          Logged in as A. Okafor
                        </span>
                      </li>
                      <li className="dx-act">
                        <span className="dx-act-node"></span>
                        <span
                          className="dx-act-txt"
                          data-readable="Navigated to /profile"
                          data-technical="GET /profile → 200"
                        >
                          Navigated to /profile
                        </span>
                      </li>
                      <li className="dx-act flagged">
                        <span className="dx-act-node"></span>
                        <span
                          className="dx-act-txt"
                          data-readable="Profile loaded — showing M. Rivera"
                          data-technical="GET /api/me → 200 · usr_8f2a (stale)"
                        >
                          Profile loaded — showing M. Rivera
                        </span>
                        <span className="dx-act-flag">symptom</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
