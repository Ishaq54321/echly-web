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
  SendGlyph,
} from "../../_components/usecases/UseCaseScaffold";

export const metadata: Metadata = {
  title: "Design Review Tool — Feedback On the Exact Element",
  alternates: { canonical: "/use-cases/design-review" },
  description:
    "Point at the pixel, say what's off. Annote pins design feedback to the exact component with a screenshot, in one shared review session.",
};

export default function DesignReviewPage() {
  return (
    <UseCaseScaffold>
      <UseCaseHero
        eyebrow="Design Review"
        title={
          <>
            Design feedback pinned{" "}
            <span className="grad">to the pixel.</span>
          </>
        }
        sub="Point at the exact element, say what’s off, and Annote captures it on the live page — the spacing, the state, the component itself — so the fix is obvious and nothing gets lost in a comment thread."
        micro="Free to start · No credit card · Works on any live or staging site"
      />

      {/* 01 — Capture */}
      <FeatureRow
        num="01"
        kicker="Capture"
        title="Point. Speak. Pinned."
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
                <b>app.acme.com</b>/pricing<span className="tag">staging</span>
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
                <span className="sel">button.cta-primary</span>
                <span className="lab">Start free trial</span>
                <span className="val" style={{ fontSize: "13px", color: "var(--uc-rose)" }}>
                  padding too tight
                </span>
              </div>
              <div className="uc-cap float">
                <CaptureWave />
                <span className="vt">
                  “This CTA needs more breathing room — bump the vertical padding.”
                </span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Click the element that needs work and say what should change. Annote
          pins the note to that exact node on the live page and captures its
          real computed styles — so &ldquo;make it breathe&rdquo; becomes a
          specific, locatable change.
        </p>
      </FeatureRow>

      {/* 02 — Together */}
      <FeatureRow
        reversed
        num="02"
        kicker="Together"
        title="Designers, PMs, and engineers in one review."
        media={
          <div className="uc-mock">
            <div className="uc-sess-head">
              <span className="uc-sess-brand">
                <span className="mk">A</span>Acme · Marketing site
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
                <b>Maya</b>, Daniel, Sarah &amp; 2 more reviewing the build
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-group">
                Open<span className="ct">4</span>
              </div>
              <div className="uc-rail-row sel">
                <span className="ric">UI</span>
                <span className="rt">CTA needs more vertical padding</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">TY</span>
                <span className="rt">Hero headline tracking too loose at 72px</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">UI</span>
                <span className="rt">Card hover state disappears after first</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">CN</span>
                <span className="rt">Pricing copy still says &ldquo;beta&rdquo;</span>
                <span className="rs"></span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Everyone drops notes into the same session against the same build —
          design intent, product questions, and feasibility all in one place
          instead of scattered across DMs and screenshots.
        </p>
        <p className="uc-feat-p">
          Each note carries the element and page it belongs to, so there&rsquo;s
          never a &ldquo;which button?&rdquo; reply.
        </p>
      </FeatureRow>

      {/* 03 — Resolve */}
      <FeatureRow
        num="03"
        kicker="Resolve"
        title="Resolve like you would on a doc."
        media={
          <div className="uc-mock">
            <div className="uc-sess-title">
              <h4>Acme — Marketing site review</h4>
              <p>8 notes · 3 reviewing now · resolve as the build updates</p>
            </div>
            <div className="uc-cmt" style={{ paddingTop: "6px" }}>
              <div className="uc-cmt-row">
                <span className="uc-av m b2">S</span>
                <div className="uc-cmt-bub">
                  <div className="uc-cmt-head">
                    <span className="uc-cmt-name">Sarah (design)</span>
                    <span className="uc-cmt-time">on the CTA · 3m ago</span>
                  </div>
                  <div className="uc-cmt-body client">
                    More vertical padding here — it reads cramped next to the
                    headline.
                  </div>
                </div>
              </div>
              <div className="uc-cmt-row">
                <span className="uc-av m b3">D</span>
                <div className="uc-cmt-bub">
                  <div className="uc-cmt-head">
                    <span className="uc-cmt-name">Daniel (eng)</span>
                    <span className="uc-cmt-time">replied · just now</span>
                  </div>
                  <div className="uc-cmt-body">
                    Bumped to 16px and shipped to staging — marked{" "}
                    <b>Resolved</b>.
                  </div>
                  <span className="uc-cmt-react">❤ 1</span>
                </div>
              </div>
            </div>
            <div className="uc-cmt-input">
              <span className="field">Reply or resolve…</span>
              <span className="send">
                <SendGlyph />
              </span>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Reply in-thread, react, and mark notes resolved as the build catches
          up. Reviewers follow each item&rsquo;s status in the browser — no new
          tool to learn, no signup to leave a comment.
        </p>
      </FeatureRow>

      {/* 04 — Dev-ready (shared flagship AI band) */}
      <AiDiagnosisCard />

      <RelatedUseCases current="design-review" />
      <ClosingCTA title="Make your next design review pixel-exact." />
    </UseCaseScaffold>
  );
}
