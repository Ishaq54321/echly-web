import type { Metadata } from "next";
import { AiDiagnosisCard } from "../../_components/sections/EvidenceTrust";
import {
  UseCaseScaffold,
  UseCaseHero,
  FeatureRow,
  ClosingCTA,
  RelatedUseCases,
  LockGlyph,
  CaptureWave,
  ShareGlyph,
} from "../../_components/usecases/UseCaseScaffold";

export const metadata: Metadata = {
  title: "QA Testing Tool — Capture Bugs With Full Context",
  alternates: { canonical: "/use-cases/qa-testing" },
  description:
    "File a bug the moment you see it. Annote captures the console, network, and your steps automatically, so repro steps write themselves.",
};

export default function QaTestingPage() {
  return (
    <UseCaseScaffold>
      <UseCaseHero
        eyebrow="QA Testing"
        title={
          <>
            Bug reports that don’t{" "}
            <span className="grad">need a follow-up.</span>
          </>
        }
        sub="Stop writing “steps to reproduce” by hand. Walk the build, speak each defect out loud, and Annote files a ticket with the console, the network calls, and your exact actions already captured on one clock."
        micro="Free to start · No credit card · Built for the people who find the bugs"
      />

      {/* 01 — Capture */}
      <FeatureRow
        num="01"
        kicker="Capture"
        title="Catch it the moment it breaks."
        media={
          <div className="uc-mock">
            <div className="uc-mock-bar">
              <div className="uc-dots">
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div className="uc-mock-url">
                <LockGlyph />
                <b>app.acme.com</b>/checkout<span className="tag">staging</span>
              </div>
            </div>
            <div className="uc-mock-body">
              <div className="uc-skel">
                <div className="ln t" style={{ width: "52%" }}></div>
                <div className="ln" style={{ width: "72%" }}></div>
                <div className="blk">
                  <span className="ph"></span>
                  <div className="col">
                    <div className="ln" style={{ width: "64%" }}></div>
                    <div className="ln" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
              <div className="uc-target" style={{ marginTop: "16px" }}>
                <span className="sel">span.order-total</span>
                <span className="lab">Order total</span>
                <span className="val" style={{ fontSize: "13px", color: "var(--uc-rose)" }}>
                  shows NaN
                </span>
              </div>
              <div className="uc-cap float">
                <CaptureWave />
                <span className="vt">
                  “Total reads NaN right after I apply the promo code…”
                </span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Click the broken element and say what went wrong. Annote freezes the
          page state, captures the element and environment, and turns your voice
          note into a structured defect — no context lost between finding it and
          filing it.
        </p>
      </FeatureRow>

      {/* 02 — Evidence */}
      <FeatureRow
        reversed
        num="02"
        kicker="Evidence"
        title="Every repro step, captured on one clock."
        media={
          <div className="uc-mock">
            <div className="uc-sess-head">
              <span className="uc-sess-brand">
                <span className="mk">A</span>Acme · Regression
              </span>
              <div className="uc-sess-meta">
                <span className="uc-sess-live">
                  <i></i>3 reviewing
                </span>
                <span className="uc-sess-share">
                  <ShareGlyph />
                  Share
                </span>
              </div>
            </div>
            <div
              className="uc-presence"
              style={{ borderTop: 0, borderBottom: "1px solid var(--uc-line)" }}
            >
              <span className="uc-av-stack">
                <span className="uc-av s b1">M</span>
                <span className="uc-av s b3">D</span>
                <span className="uc-av s b2">S</span>
                <span className="uc-av-more">+2</span>
              </span>
              <span className="lbl">
                <b>QA</b> filing defects · evidence attached to each
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-group">
                Critical<span className="ct">2</span>
              </div>
              <div className="uc-rail-row sel">
                <span className="ric">FN</span>
                <span className="rt">Promo code leaves order total as NaN</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">FN</span>
                <span className="rt">Add-to-cart stays disabled after stock returns</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-group">
                Open<span className="ct">3</span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">UI</span>
                <span className="rt">Toast overlaps sticky footer on tablet</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">A11Y</span>
                <span className="rt">Focus ring missing on filter dropdown</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">PERF</span>
                <span className="rt">List refetches on every keystroke</span>
                <span className="rs"></span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Console logs, network requests, and the user&rsquo;s actions are
          recorded together and time-aligned — so the engineer sees exactly what
          happened, in order, without asking you to do it again.
        </p>
        <p className="uc-feat-p">
          Environment, browser, and OS are stamped on automatically.
        </p>
      </FeatureRow>

      {/* 03 — Handoff */}
      <FeatureRow
        num="03"
        kicker="Handoff"
        title="Hand it off, watch it close."
        media={
          <div className="uc-mock">
            <div className="uc-sess-head">
              <span className="uc-sess-brand">
                <span className="mk">A</span>Acme · Sprint 24
              </span>
              <div className="uc-sess-meta">
                <span className="uc-sess-live">
                  <i></i>3 reviewing
                </span>
                <span className="uc-sess-share">
                  <ShareGlyph />
                  Share
                </span>
              </div>
            </div>
            <div
              className="uc-presence"
              style={{ borderTop: 0, borderBottom: "1px solid var(--uc-line)" }}
            >
              <span className="uc-av-stack">
                <span className="uc-av s b1">M</span>
                <span className="uc-av s b3">D</span>
                <span className="uc-av s b2">S</span>
                <span className="uc-av-more">+2</span>
              </span>
              <span className="lbl">
                <b>5 resolved</b> this pass · 3 still open
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-group">
                Open<span className="ct">3</span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">UI</span>
                <span className="rt">Toast overlaps sticky footer on tablet</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">A11Y</span>
                <span className="rt">Focus ring missing on filter dropdown</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">FN</span>
                <span className="rt">Promo code leaves total as NaN</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-group">
                Resolved<span className="ct">5</span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">FN</span>
                <span className="rt">Add-to-cart re-enables after stock returns</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">PERF</span>
                <span className="rt">List no longer refetches per keystroke</span>
                <span className="rs"></span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Send a session link and your engineers open every defect with its full
          context in the browser — no signup. Status moves through Open, In
          progress, and Resolved, so a regression pass is something you finish,
          not something you re-explain.
        </p>
      </FeatureRow>

      {/* 04 — Dev-ready (shared flagship AI band) */}
      <AiDiagnosisCard />

      <RelatedUseCases current="qa-testing" />
      <ClosingCTA title="Run your next regression pass with the evidence attached." />
    </UseCaseScaffold>
  );
}
