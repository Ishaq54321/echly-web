/**
 * FinalCTA â€” the closing moment of the marketing page.
 *
 * Atmospheric, branded closing band: a deep-indigo gradient core lifting to
 * periwinkle at the edges, drifting soft-light clouds, a ghosted flowing
 * code/log background, a faded technical grid and a radial bloom behind the
 * headline. One eyebrow, one headline, one sub, two CTAs (primary + Chrome
 * extension).
 *
 * Ported verbatim from the reference design. Styles live in marketing.css
 * (namespaced under .marketing-root) and the flowing-code background +
 * reveal-on-scroll behaviour are built in the effect below.
 */
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const CODE_FRAGMENTS = [
  "POST /api/cart 200",
  "console.error('payment failed')",
  "GET /checkout 304",
  "ticket filed Â· #4821",
  "Authorization: <redacted>",
  "PATCH /api/order/8f2a 200",
  "redacted",
  "session.replay attached",
  "DELETE /cart/item 204",
  "TypeError: undefined is not a function",
  "POST /api/login 401",
  "email: <redacted>",
  "captured 1 session Â· 4.2s",
  "GET /api/user/me 200",
  "console.warn('retry 2/3')",
  "X-Request-Id: 7c1fâ€¦e90",
  "cardNumber: <redacted>",
  "steps to reproduce â†“",
  "PUT /settings 204",
  "fail-closed Â· ok",
  "POST /api/cart 500",
  "ticket #4822 assigned",
  "stack trace Â· 14 frames",
  "GET /assets/app.js 200",
  "repro: add item â†’ refresh",
  "console.log('mounted')",
  "redacted in-page",
  "POST /api/checkout 422",
  "Set-Cookie: <redacted>",
  "latency 182ms",
  "GET /api/flags 200",
  "expected 200, got 500",
  "attached: console + network",
  "userId: usr_8f2a1c",
  "POST /api/login 200",
];

export function FinalCTA() {
  const codeHostRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Build the ghosted, flowing code background.
  useEffect(() => {
    const host = codeHostRef.current;
    if (!host) return;

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = () =>
      CODE_FRAGMENTS[(Math.random() * CODE_FRAGMENTS.length) | 0];

    const cols = window.innerWidth < 760 ? 3 : 5;
    for (let i = 0; i < cols; i++) {
      const col = document.createElement("div");
      col.className = "cta-code-col";
      col.style.left = i * (100 / cols) + rnd(-3, 3) + "%";
      col.style.setProperty("--dur", (48 + rnd(0, 40)).toFixed(0) + "s");
      col.style.opacity = rnd(0.6, 1).toFixed(2);

      // duplicate the run so the -50% loop is seamless
      let lines = "";
      const n = 26;
      for (let k = 0; k < n; k++) {
        const cls =
          Math.random() < 0.22 ? "hi" : Math.random() < 0.4 ? "lo" : "";
        lines += '<span class="' + cls + '">' + pick() + "</span>";
      }
      col.innerHTML = lines + lines;
      host.appendChild(col);
    }

    return () => {
      host.replaceChildren();
    };
  }, []);

  // Reveal on scroll.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll(".reveal"));

    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    const vh = window.innerHeight || 800;
    els.forEach((e) => {
      if (e.getBoundingClientRect().top < vh * 0.94) {
        e.classList.add("in");
      } else {
        io.observe(e);
      }
    });

    return () => io.disconnect();
  }, []);

  return (
    <section className="cta" ref={sectionRef}>
      <div className="cta-wash" />
      <div className="cta-clouds">
        <span className="cloud c1" />
        <span className="cloud c2" />
        <span className="cloud c3" />
        <span className="cloud c4" />
      </div>
      <div className="cta-code" ref={codeHostRef} />
      <div className="cta-grid" />
      <div className="cta-bloom" />

      <div className="wrap">
        <div className="cta-inner">
          <div className="cta-copy">
            <span className="cta-eyebrow reveal">
              <span className="mk" />
              Ready when you are
            </span>
            <h2 className="cta-h reveal" style={{ ["--d" as string]: ".05s" }}>
              Try it on the next QA pass.
            </h2>
            <p className="cta-sub reveal" style={{ ["--d" as string]: ".1s" }}>
              Free to start. No credit card. Captures load in under a second.
            </p>
          </div>

          <div
            className="cta-btns reveal"
            style={{ ["--d" as string]: ".15s" }}
          >
            <Link className="cta-btn cta-btn--primary" href="/signup">
              Get Annote for free
              <span className="arr">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </span>
            </Link>
            <a
              className="cta-btn cta-btn--light"
              href="https://chrome.google.com/webstore/detail/annote"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3.4" />
                <path d="M12 8.6V2.6M12 21.4v-6M8.6 12H2.6M21.4 12h-6" />
              </svg>
              Install Chrome Extension
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
