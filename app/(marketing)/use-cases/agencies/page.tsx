import type { Metadata } from "next";
import { AiDiagnosisCard } from "../../_components/sections/EvidenceTrust";
import {
  UseCaseScaffold,
  UseCaseHero,
  FeatureRow,
  ClosingCTA,
  LockGlyph,
  CaptureWave,
  ShareGlyph,
  SendGlyph,
} from "../../_components/usecases/UseCaseScaffold";

export const metadata: Metadata = {
  title: "Annote for Agencies — From client QA to dev handoff, in one place.",
  description:
    "Walk the build, capture every issue by voice, and hand your developers tickets that are already complete — screenshot, technical evidence, and AI diagnosis attached. One session, one link, your logo on it.",
};

export default function AgenciesPage() {
  return (
    <UseCaseScaffold>
      <UseCaseHero
        eyebrow="For Agencies"
        title={
          <>
            From client QA to dev handoff,{" "}
            <span className="grad">in one place.</span>
          </>
        }
        sub="Walk the build, capture every issue by voice, and hand your developers tickets that are already complete — screenshot, technical evidence, and AI diagnosis attached. One session, one link, your logo on it."
        micro="Free to start · No credit card · Built for studios shipping client work"
      />

      {/* 01 — Walk the build */}
      <FeatureRow
        num="01"
        kicker="QA"
        title="Walk the build. Speak the issues."
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
                <b>aurora.studio</b>/pricing<span className="tag">staging</span>
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
                  overlaps footer
                </span>
              </div>
              <div className="uc-cap float">
                <CaptureWave />
                <span className="vt">
                  “The trial button overlaps the footer on tablet…”
                </span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Click anything that needs work on a staging or live site and say
          what&rsquo;s wrong in plain words. Annote captures the element, the
          page, and the technical context behind it, and turns your voice note
          into a clean, structured ticket.
        </p>
        <p className="uc-feat-p">
          No selection tools, no cropping, no writing tickets by hand after the
          call.
        </p>
      </FeatureRow>

      {/* 02 — Every reviewer, one session */}
      <FeatureRow
        reversed
        num="02"
        kicker="Session"
        title="Every reviewer, one session."
        media={
          <div className="uc-mock">
            <div className="uc-sess-head">
              <span className="uc-sess-brand">
                <span className="mk studio">A</span>Aurora · May 18
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
                <b>Maya</b>, Daniel, Sarah &amp; 2 more dropping feedback
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-group">
                Open<span className="ct">5</span>
              </div>
              <div className="uc-rail-row sel">
                <span className="ric">UI</span>
                <span className="rt">Hover state on card disappears after first</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">A11Y</span>
                <span className="rt">Legend overlaps data on dark mode</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">FN</span>
                <span className="rt">Add-to-cart stays disabled after stock returns</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">UI</span>
                <span className="rt">Settings save fires twice on Enter</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-group">
                Resolved<span className="ct">1</span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">NV</span>
                <span className="rt">Notification badge persists after read</span>
                <span className="rs"></span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Designers, PMs, and QA all drop feedback into the same session — no
          more collating issues across Slack threads, email, and spreadsheets.
        </p>
        <p className="uc-feat-p">
          Everything for a project lives in <b>one organized place</b> you can
          come back to and add to.
        </p>
      </FeatureRow>

      {/* 03 — Share a link */}
      <FeatureRow
        num="03"
        kicker="Share"
        title="Share a link your client actually opens."
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
                <b>annote.app</b>/s/aurora-may18<span className="tag">no signup</span>
              </div>
            </div>
            <div className="uc-sess-title">
              <h4>Aurora — May 18</h4>
              <p>12 tickets · 3 reviewing now · you&rsquo;re viewing as a guest</p>
            </div>
            <div className="uc-cmt" style={{ paddingTop: "6px" }}>
              <div className="uc-cmt-row">
                <span className="uc-av m b2">J</span>
                <div className="uc-cmt-bub">
                  <div className="uc-cmt-head">
                    <span className="uc-cmt-name">Jordan (client)</span>
                    <span className="uc-cmt-time">opened · 2m ago</span>
                  </div>
                  <div className="uc-cmt-body client">
                    Love this — can the hero headline sit a little higher on
                    mobile?
                  </div>
                </div>
              </div>
              <div className="uc-cmt-row">
                <span className="uc-av m b3">D</span>
                <div className="uc-cmt-bub">
                  <div className="uc-cmt-head">
                    <span className="uc-cmt-name">Daniel</span>
                    <span className="uc-cmt-time">replied · just now</span>
                  </div>
                  <div className="uc-cmt-body">
                    On it — pinned to the hero block, status moved to{" "}
                    <b>In progress</b>.
                  </div>
                  <span className="uc-cmt-react">👍 2</span>
                </div>
              </div>
            </div>
            <div className="uc-cmt-input">
              <span className="field">Leave a comment…</span>
              <span className="send">
                <SendGlyph />
              </span>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Send one link. Clients and stakeholders open it in the browser — no
          signup, no install, no new tool to learn. They see who&rsquo;s
          assigned, follow each ticket&rsquo;s status, and leave comments like
          they would on a doc.
        </p>
        <p className="uc-feat-p">
          The extension is only for the people doing the capturing.
        </p>
      </FeatureRow>

      {/* 04 — Your brand */}
      <FeatureRow
        reversed
        num="04"
        kicker="Branding"
        title="Your brand, not ours."
        media={
          <div className="uc-mock">
            <div className="uc-brand-bar">
              <span className="uc-brand-logo">
                <span className="gl">N</span>Northwind Studio
              </span>
              <span className="by">
                <span>shared via</span>
                <span className="pw">
                  <span className="mk">✦</span>Annote
                </span>
              </span>
            </div>
            <div className="uc-brand-sub">
              <h4>Q2 client QA · May 18</h4>
              <span className="ct">
                6 tickets · walk through, leave notes, resolve as you go.
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-row">
                <span className="ric">UI</span>
                <span className="rt">Onboarding step skips on back arrow</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">A11Y</span>
                <span className="rt">Chart legend overlaps data on dark mode</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">FN</span>
                <span className="rt">Add to cart re-enables after stock returns</span>
                <span className="rs"></span>
              </div>
            </div>
            <div className="uc-presence">
              <span className="uc-av-stack">
                <span className="uc-av s b1">M</span>
                <span className="uc-av s b3">D</span>
                <span className="uc-av s b2">S</span>
              </span>
              <span className="lbl">
                Branded for <b>Northwind</b> — clients never see another logo.
              </span>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          On <b>Business</b>, put your own logo on the sessions you share with
          clients, so the handoff looks like your studio — polished,
          professional, yours.
        </p>
      </FeatureRow>

      {/* 05 — Dev-ready (shared flagship AI band) */}
      <AiDiagnosisCard />

      <ClosingCTA title="Try Annote on your next client QA pass." />
    </UseCaseScaffold>
  );
}
