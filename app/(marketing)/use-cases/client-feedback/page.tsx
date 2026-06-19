import type { Metadata } from "next";
import { AiDiagnosisCard } from "../../_components/sections/EvidenceTrust";
import {
  UseCaseScaffold,
  UseCaseHero,
  FeatureRow,
  ClosingCTA,
  LockGlyph,
  ShareGlyph,
  SendGlyph,
} from "../../_components/usecases/UseCaseScaffold";

export const metadata: Metadata = {
  title:
    "Annote for Client Feedback — One link your client opens. No account, no install.",
  description:
    "Share a session and your client reviews in the browser, follows each item’s status, and leaves comments like a doc. The extension is only for the people doing the capturing.",
};

export default function ClientFeedbackPage() {
  return (
    <UseCaseScaffold>
      <UseCaseHero
        eyebrow="Client Feedback"
        title={
          <>
            One link your client opens —{" "}
            <span className="grad">no account, no install.</span>
          </>
        }
        sub="Share a session and your client reviews right in the browser: they see who’s assigned, follow each item’s status, and leave comments like they would on a doc. The extension is only for the people doing the capturing."
        micro="Free to start · No credit card · Clients never sign up"
      />

      {/* 01 — Share */}
      <FeatureRow
        num="01"
        kicker="Share"
        title="Send a link, not a login."
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
                <b>annote.app</b>/s/northwind-may18
                <span className="tag">no signup</span>
              </div>
            </div>
            <div className="uc-sess-title">
              <h4>Northwind — Client review</h4>
              <p>6 items · 2 reviewing now · you&rsquo;re viewing as a guest</p>
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
          One link opens the whole session in any browser — no signup, no
          install, no new tool for your client to learn. They review on their
          own time and you see every comment land in real time.
        </p>
      </FeatureRow>

      {/* 02 — Branding */}
      <FeatureRow
        reversed
        num="02"
        kicker="Branding"
        title="Your brand on every handoff."
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
              <h4>Client review · May 18</h4>
              <span className="ct">
                6 items · walk through, leave notes, resolve as you go.
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-row">
                <span className="ric">UI</span>
                <span className="rt">Hero headline sits too low on mobile</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">CN</span>
                <span className="rt">Pricing copy still says &ldquo;beta&rdquo;</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">UI</span>
                <span className="rt">Footer logo swapped to current mark</span>
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
          On <b>Business</b>, put your own logo on the sessions you share, so the
          review looks like your studio — polished, professional, yours. Clients
          never see another company&rsquo;s mark on your work.
        </p>
      </FeatureRow>

      {/* 03 — Track */}
      <FeatureRow
        num="03"
        kicker="Track"
        title="Everyone sees the same status."
        media={
          <div className="uc-mock">
            <div className="uc-sess-head">
              <span className="uc-sess-brand">
                <span className="mk">N</span>Northwind · Client
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
                <b>Jordan</b> &amp; 1 more from the client side, viewing live
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-group">
                Open<span className="ct">3</span>
              </div>
              <div className="uc-rail-row sel">
                <span className="ric">UI</span>
                <span className="rt">Hero headline sits too low on mobile</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">CN</span>
                <span className="rt">Pricing copy still says &ldquo;beta&rdquo;</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">UI</span>
                <span className="rt">Testimonial avatars look pixelated</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-group">
                Resolved<span className="ct">3</span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">UI</span>
                <span className="rt">Footer logo swapped to current mark</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">CN</span>
                <span className="rt">Contact email corrected in footer</span>
                <span className="rs"></span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Clients follow each item from Open to Resolved without a status
          meeting. When something changes, they see it — so &ldquo;did you get my
          note?&rdquo; stops being a conversation.
        </p>
      </FeatureRow>

      <AiDiagnosisCard />

      <ClosingCTA title="Share your next round with a link your client actually opens." />
    </UseCaseScaffold>
  );
}
