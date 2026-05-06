"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionEntryCta } from "@/components/dashboard/hooks/useSessionEntryCta";
import styles from "./EmptyDashboardCarousel.module.css";

const SLIDE_INTERVAL_MS = 6000;

const SLIDE_LABELS = [
  "01 / 03 — Capture",
  "02 / 03 — Share",
  "03 / 03 — Resolve",
] as const;

const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M5 3.5v9l8-4.5-8-4.5z" fill="#fff" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 2.5v8M4.5 7l3.5 3.5L11.5 7M3 13h10"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type SlideId = 0 | 1 | 2;

type CtaSpec = {
  label: string;
  icon: React.ReactNode;
  helper: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export default function EmptyDashboardCarousel() {
  const [current, setCurrent] = useState<SlideId>(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const { isInstalled, startingRecorder, triggerCta } = useSessionEntryCta();

  const goTo = useCallback((idx: number) => {
    const next = ((idx % 3) + 3) % 3;
    setCurrent(next as SlideId);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (((c + 1) % 3) as SlideId));
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (((c + 2) % 3) as SlideId));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setInterval(() => {
      setCurrent((c) => (((c + 1) % 3) as SlideId));
    }, SLIDE_INTERVAL_MS);
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused, current]);

  // Restart fill animation on slide change
  useEffect(() => {
    const dot = dotRefs.current[current];
    if (!dot) return;
    void dot.offsetWidth;
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Unified CTA across all slides — flips only on extension install state
  const cta: CtaSpec = isInstalled
    ? {
        label: "Start Session",
        icon: <PlayIcon />,
        helper: (
          <>
            <span className={styles.pulse} />
            Takes less than 10 seconds
          </>
        ),
        onClick: triggerCta,
        disabled: startingRecorder,
      }
    : {
        label: "Download Extension",
        icon: <DownloadIcon />,
        helper: <>Free · Chrome &amp; Edge · 30 sec install</>,
        onClick: triggerCta,
        disabled: startingRecorder,
      };

  return (
    <div className={styles.carouselWrap}>
      <div
        className={styles.carousel}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={styles.stage}>
          {/* ============ SLIDE 1 — CAPTURE ============ */}
          <article
            className={`${styles.slide} ${current === 0 ? styles.slideActive : ""}`}
            data-idx={0}
            aria-hidden={current !== 0}
          >
            <div className={styles.slideText}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowNum}>01</span>
                <span className={styles.eyebrowDot} />
                <span>Capture</span>
              </div>
              <h2 className={styles.slideTitle}>Click. Speak. Done.</h2>
              <p className={styles.lede}>
                Tap anywhere on the page, describe the issue by voice or text — Echly&apos;s
                AI turns it into a detailed ticket automatically.
              </p>
              <CtaRow cta={cta} />
            </div>

            <div className={styles.slideIllus}>
              <div className={styles.illusFrame}>
                <CaptureIllustration />
              </div>
            </div>
          </article>

          {/* ============ SLIDE 2 — SHARE ============ */}
          <article
            className={`${styles.slide} ${current === 1 ? styles.slideActive : ""}`}
            data-idx={1}
            aria-hidden={current !== 1}
          >
            <div className={styles.slideText}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowNum}>02</span>
                <span className={styles.eyebrowDot} />
                <span>Share</span>
              </div>
              <h2 className={styles.slideTitle}>One link. Full context.</h2>
              <p className={styles.lede}>
                Share a session link with anyone. They see every ticket, screenshot and
                comment — no signup, no setup, no friction.
              </p>
              <CtaRow cta={cta} />
            </div>

            <div className={styles.slideIllus}>
              <div className={styles.illusFrame}>
                <ShareIllustration />
              </div>
            </div>
          </article>

          {/* ============ SLIDE 3 — RESOLVE ============ */}
          <article
            className={`${styles.slide} ${current === 2 ? styles.slideActive : ""}`}
            data-idx={2}
            aria-hidden={current !== 2}
          >
            <div className={styles.slideText}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowNum}>03</span>
                <span className={styles.eyebrowDot} />
                <span>Resolve</span>
              </div>
              <h2 className={styles.slideTitle}>Resolve it together.</h2>
              <p className={styles.lede}>
                Assign, discuss and close out issues as a team — threaded comments,
                @mentions and status, all without leaving the session.
              </p>
              <CtaRow cta={cta} />
            </div>

            <div className={styles.slideIllus}>
              <div className={styles.illusFrame}>
                <ResolveIllustration />
              </div>
            </div>
          </article>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.dots} role="tablist">
            {[0, 1, 2].map((i) => {
              const isActive = current === i;
              return (
                <button
                  key={i}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  type="button"
                  className={[
                    styles.dotBtn,
                    isActive ? styles.dotBtnActive : "",
                    isActive && !paused ? styles.dotPlaying : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span className={styles.dotFill} />
                </button>
              );
            })}
          </div>
          <div className={styles.footerMeta}>{SLIDE_LABELS[current]}</div>
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={prev}
              aria-label="Previous slide"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3l-5 5 5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={next}
              aria-label="Next slide"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CtaRow({ cta }: { cta: CtaSpec }) {
  return (
    <div className={styles.ctaRow}>
      <button
        type="button"
        className={styles.btnPrimary}
        onClick={cta.onClick}
        disabled={cta.disabled}
      >
        {cta.icon}
        <span>{cta.label}</span>
      </button>
      <span className={styles.btnHelper}>{cta.helper}</span>
    </div>
  );
}

/* ====================== ILLUSTRATIONS ====================== */

function CaptureIllustration() {
  return (
    <div className={styles.card1Stage}>
      {/* Browser with capture overlay */}
      <div className={`${styles.browser} ${styles.c1Browser}`}>
        <div className={styles.browserBar}>
          <div className={styles.browserTl}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.browserUrl}>app.acme.com/dashboard</div>
        </div>
        <div className={styles.c1BrowserBody}>
          <div className={`${styles.c1MockRow} ${styles.c1MockRowMed}`} />
          <div className={`${styles.c1MockRow} ${styles.c1MockRowShort}`} />
          <div className={styles.c1MockImg} />
          <div className={`${styles.c1MockRow} ${styles.c1MockRowMed}`} />
          <div className={`${styles.c1MockRow} ${styles.c1MockRowShort}`} />
        </div>
        <div className={styles.c1Selection}>
          <span className={`${styles.c1Corner} ${styles.c1CornerTl}`} />
          <span className={`${styles.c1Corner} ${styles.c1CornerTr}`} />
          <span className={`${styles.c1Corner} ${styles.c1CornerBl}`} />
          <span className={`${styles.c1Corner} ${styles.c1CornerBr}`} />
        </div>
      </div>

      {/* Mic */}
      <div className={styles.c1Mic} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="6" y="2" width="4" height="8" rx="2" fill="#fff" />
          <path
            d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2"
            stroke="#fff"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <div className={`${styles.c1MicWave} ${styles.c1MicWaveLeft}`}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={`${styles.c1MicWave} ${styles.c1MicWaveRight}`}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      {/* AI sparkle badge */}
      <div className={`${styles.aiBadge} ${styles.aiBadgeC1}`} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 2 L9 6 L13 7 L9 8 L8 12 L7 8 L3 7 L7 6 Z" fill="#fff" />
          <circle cx="12.5" cy="3.5" r="1" fill="#fff" />
          <circle cx="3" cy="11" r="0.7" fill="#fff" />
        </svg>
      </div>

      {/* Flow arrow */}
      <svg className={styles.c1Flow} viewBox="0 0 80 24" fill="none">
        <path
          d="M2 12 C 24 12, 36 4, 78 12"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
        <path
          d="M72 7 L78 12 L72 17"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Ticket card */}
      <div className={styles.c1Ticket}>
        <div className={styles.c1TicketHead}>
          <span className={styles.c1TicketId}>ECH-247</span>
          <span className={styles.c1TicketPill}>Bug</span>
        </div>
        <h4 className={styles.c1TicketTitle}>
          Submit button overlaps with footer on mobile checkout
        </h4>
        <div className={styles.c1TicketMeta}>
          <span className={styles.c1Chip}>
            <span className={styles.c1Cdot} style={{ background: "#1775E0" }} />
            Checkout
          </span>
          <span className={styles.c1Chip}>
            <span className={styles.c1Cdot} style={{ background: "#C2410C" }} />
            iPhone&nbsp;Safari
          </span>
          <span className={styles.c1Chip}>375×812</span>
        </div>
        <div className={styles.c1TicketThumb} />
      </div>
    </div>
  );
}

function ShareIllustration() {
  return (
    <div className={styles.card2Stage}>
      {/* "no signup" chip */}
      <div className={styles.c2Nosignup}>
        <span className={styles.c2Ck}>
          <svg width="6" height="6" viewBox="0 0 8 8" fill="none">
            <path
              d="M1.5 4 L3.2 5.6 L6.5 2.2"
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        no signup needed
      </div>

      {/* shareable link */}
      <div className={styles.c2Link}>
        <span className={styles.c2LkIcon}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path
              d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className={styles.c2LkText}>echly.app/s/q7n2</span>
        <span className={styles.c2LkCopy}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              rx="1.4"
              stroke="#fff"
              strokeWidth="1.3"
            />
            <path
              d="M7.5 3V2.2a.7.7 0 0 0-.7-.7H2.7a.7.7 0 0 0-.7.7v4.1a.7.7 0 0 0 .7.7H3.5"
              stroke="#fff"
              strokeWidth="1.3"
            />
          </svg>
        </span>
      </div>

      {/* rays */}
      <svg
        className={styles.c2Rays}
        viewBox="0 0 110 340"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="rayGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1775E0" stopOpacity="0" />
            <stop offset="40%" stopColor="#1775E0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1775E0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 170 C 30 170, 50 50, 110 50"
          stroke="url(#rayGrad)"
          strokeWidth="1.4"
          strokeDasharray="3 4"
          fill="none"
        />
        <path
          d="M0 170 C 30 170, 50 110, 110 110"
          stroke="url(#rayGrad)"
          strokeWidth="1.4"
          strokeDasharray="3 4"
          fill="none"
        />
        <path
          d="M0 170 C 30 170, 50 170, 110 170"
          stroke="url(#rayGrad)"
          strokeWidth="1.4"
          strokeDasharray="3 4"
          fill="none"
        />
        <path
          d="M0 170 C 30 170, 50 230, 110 230"
          stroke="url(#rayGrad)"
          strokeWidth="1.4"
          strokeDasharray="3 4"
          fill="none"
        />
        <path
          d="M0 170 C 30 170, 50 290, 110 290"
          stroke="url(#rayGrad)"
          strokeWidth="1.4"
          strokeDasharray="3 4"
          fill="none"
        />
      </svg>

      {/* Session preview */}
      <div className={styles.c2Session}>
        <div className={styles.c2SessionBar}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <rect
              x="2.5"
              y="3.5"
              width="11"
              height="9"
              rx="2"
              stroke="#1775E0"
              strokeWidth="1.5"
            />
            <path d="M2.5 6.5h11" stroke="#1775E0" strokeWidth="1.5" />
          </svg>
          <span className={styles.c2SessionTtl}>Checkout v2 — feedback</span>
          <span className={styles.c2Stack}>
            <span className={`${styles.c2StackAv} ${styles.avA}`}>L</span>
            <span className={`${styles.c2StackAv} ${styles.avB}`}>M</span>
            <span className={`${styles.c2StackAv} ${styles.avC}`}>R</span>
          </span>
        </div>
        <div className={styles.c2SessionBody}>
          <div className={`${styles.c2Tk} ${styles.c2TkHl}`}>
            <div className={styles.c2TkThumb} />
            <div className={styles.c2TkTitle}>
              Submit button overlaps footer
              <span className={styles.c2TkMeta}>3 comments · iPhone Safari</span>
            </div>
            <span className={styles.c2TkPill}>Bug</span>
          </div>
          <div className={styles.c2Tk}>
            <div className={`${styles.c2TkThumb} ${styles.c2TkThumbB}`} />
            <div className={styles.c2TkTitle}>
              Promo code field is cut off
              <span className={styles.c2TkMeta}>1 comment · Chrome</span>
            </div>
            <span className={`${styles.c2TkPill} ${styles.c2TkPillDo}`}>UI</span>
          </div>
          <div className={styles.c2Tk}>
            <div className={`${styles.c2TkThumb} ${styles.c2TkThumbG}`} />
            <div className={styles.c2TkTitle}>
              Apple Pay flickers on tap
              <span className={styles.c2TkMeta}>resolved · 2 comments</span>
            </div>
            <span className={`${styles.c2TkPill} ${styles.c2TkPillOk}`}>Done</span>
          </div>
        </div>
        <div className={styles.c2SessionFoot}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#78716C" strokeWidth="1.4" />
            <path
              d="M5 8l2 2 4-4"
              stroke="#78716C"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Anyone with the link can <b>view &amp; comment</b>
        </div>
      </div>
    </div>
  );
}

function ResolveIllustration() {
  return (
    <div className={styles.card3Stage}>
      {/* Ticket with thread */}
      <div className={styles.c3Ticket}>
        <div className={styles.c3TkHead}>
          <div className={styles.c3TkId}>ECH-247</div>
          <h4 className={styles.c3TkTitle}>
            Submit button overlaps footer on mobile checkout
          </h4>
          <div className={styles.c3TkRow}>
            <span className={styles.c3Assign}>
              <span className={`${styles.c3AssignAv} ${styles.avD}`}>JR</span>
              Assigned to <b>&nbsp;Jamie</b>
            </span>
            <span className={styles.c3Resolved}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6.2 L4.8 8.8 L10 3.4"
                  stroke="#15803D"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Resolved
            </span>
          </div>
        </div>
        <div className={styles.c3Thread}>
          <div className={styles.c3Msg}>
            <div className={`${styles.c3MsgAv} ${styles.avA}`}>LP</div>
            <div className={styles.c3MsgBubble}>
              <span className={styles.c3MsgName}>Lena</span>
              <span className={styles.c3MsgTime}>2h</span>
              Repros on iOS 17 only —{" "}
              <span className={styles.c3Mention}>@jamie</span> can you take a look?
            </div>
          </div>
          <div className={`${styles.c3Msg} ${styles.c3MsgReply}`}>
            <div className={`${styles.c3MsgAv} ${styles.avD}`}>JR</div>
            <div className={styles.c3MsgBubble}>
              <span className={styles.c3MsgName}>Jamie</span>
              <span className={styles.c3MsgTime}>1h</span>
              Got it. Padding on{" "}
              <code className={styles.c3InlineCode}>.cta-bar</code> was wrong.
              Pushing fix now.
            </div>
          </div>
          <div
            className={`${styles.c3Msg} ${styles.c3MsgReply} ${styles.c3MsgMine}`}
          >
            <div className={`${styles.c3MsgAv} ${styles.avB}`}>M</div>
            <div className={styles.c3MsgBubble}>
              <span className={styles.c3MsgName}>Maya</span>
              <span className={styles.c3MsgTime}>just now</span>
              Verified on staging — looks great{" "}
              <span className={styles.c3Mention}>@jamie</span> 🎉
            </div>
          </div>
        </div>
      </div>

      {/* Assignment chip */}
      <div className={styles.c3AssignedPop}>
        <span className={`${styles.c3AssignedPopAv} ${styles.avD}`}>JR</span>
        Assigned to Jamie
      </div>

      {/* Team / presence card */}
      <div className={styles.c3Team}>
        <div className={styles.c3TeamH}>On this session</div>
        <div className={styles.c3TeamStack}>
          <span className={`${styles.c3TeamAv} ${styles.avA}`}>LP</span>
          <span className={`${styles.c3TeamAv} ${styles.avD}`}>JR</span>
          <span className={`${styles.c3TeamAv} ${styles.avB}`}>M</span>
          <span className={`${styles.c3TeamAv} ${styles.avC}`}>RS</span>
          <span className={`${styles.c3TeamAv} ${styles.c3TeamAvMore}`}>+3</span>
        </div>
        <div className={styles.c3TeamRow}>
          <span className={styles.c3TeamPres} />
          <span>
            <b>4 teammates</b> active now
          </span>
        </div>
      </div>
    </div>
  );
}
