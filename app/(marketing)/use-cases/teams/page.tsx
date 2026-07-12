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
  title: "Annote for Product Teams — Bugs Devs Can Act On",
  alternates: { canonical: "/use-cases/teams" },
  description:
    "Every bug your team reports in one shared session — with console, network, and an AI that flags the likely cause before a dev opens it.",
};

export default function TeamsPage() {
  return (
    <UseCaseScaffold>
      <UseCaseHero
        eyebrow="For Product Teams"
        title={
          <>
            From “it’s broken” to a ticket{" "}
            <span className="grad">engineers can act on.</span>
          </>
        }
        sub="Your PMs, designers, and support team spot issues all day. Annote turns each one into a structured ticket — console, network calls, and the exact steps already attached — so engineers spend their time fixing, not reproducing."
        micro="Free to start · No credit card · Works on staging and production"
      />

      {/* 01 — Capture */}
      <FeatureRow
        num="01"
        kicker="Capture"
        title="See it, say it. It’s filed."
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
                <b>app.acme.com</b>/dashboard<span className="tag">staging</span>
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
                <span className="sel">section.revenue-chart</span>
                <span className="lab">Revenue (Q2)</span>
                <span className="val" style={{ fontSize: "13px", color: "var(--uc-rose)" }}>
                  renders empty
                </span>
              </div>
              <div className="uc-cap float">
                <CaptureWave />
                <span className="vt">
                  “The revenue chart loads empty until I resize the window…”
                </span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Click the element that&rsquo;s wrong on any page and describe the
          problem out loud. Annote captures the element, the page, and the
          technical context behind it, transcribes your voice, and drafts a
          clean, structured ticket.
        </p>
        <p className="uc-feat-p">
          No screenshots to annotate, no writing repro steps by hand after the
          fact.
        </p>
      </FeatureRow>

      {/* 02 — Triage */}
      <FeatureRow
        reversed
        num="02"
        kicker="Triage"
        title="Every report lands on one board."
        media={
          <div className="uc-mock">
            <div className="uc-sess-head">
              <span className="uc-sess-brand">
                <span className="mk">A</span>Acme · Sprint 24
              </span>
              <div className="uc-sess-meta">
                <span className="uc-sess-live">
                  <i></i>4 reviewing
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
                <b>Maya</b>, Daniel, Sarah &amp; 2 more filing into this board
              </span>
            </div>
            <div className="uc-rail">
              <div className="uc-rail-group">
                Open<span className="ct">5</span>
              </div>
              <div className="uc-rail-row sel">
                <span className="ric">UI</span>
                <span className="rt">Revenue chart renders empty on first load</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">FN</span>
                <span className="rt">Promo code leaves total as NaN</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row">
                <span className="ric">A11Y</span>
                <span className="rt">Focus ring missing on filter dropdown</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">PERF</span>
                <span className="rt">Dashboard refetches on every keystroke</span>
                <span className="rs"></span>
              </div>
              <div className="uc-rail-group">
                Resolved<span className="ct">1</span>
              </div>
              <div className="uc-rail-row done">
                <span className="ric">NV</span>
                <span className="rt">Sidebar badge persists after read</span>
                <span className="rs"></span>
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Product, design, support, and QA all file into the same session — no
          more chasing issues across Slack threads, email, and three
          spreadsheets.
        </p>
        <p className="uc-feat-p">
          Everything for a release lives in <b>one organized place</b> your team
          can sort, assign, and work down together.
        </p>
      </FeatureRow>

      {/* 03 — Integrations */}
      <FeatureRow
        num="03"
        kicker="Integrations"
        title="Ships into the tools you already work in."
        media={
          <div className="uc-mock" style={{ padding: "18px" }}>
            <div className="uc-tk">
              <div className="uc-tk-h">
                <span className="uc-tk-id">ANN-4821</span>
                <span className="uc-tk-status open">Open</span>
              </div>
              <div className="uc-tk-t">
                Checkout total shows NaN after applying promo code
              </div>
              <div className="uc-tk-meta">
                <span className="uc-chip dot">staging</span>
                <span className="uc-chip">Chrome 124 · macOS</span>
                <span className="uc-chip">console: 1 error</span>
                <span className="uc-chip">network: 6 reqs</span>
              </div>
              <div className="uc-tk-foot">
                <span className="uc-av s b1">M</span>
                Maya
                <span className="uc-pri-pill high" style={{ marginLeft: "8px" }}>
                  High
                </span>
                <span className="sp"></span>
                pushed to Linear · ENG-2210
              </div>
            </div>
            <div className="uc-tk">
              <div className="uc-tk-h">
                <span className="uc-tk-id">ANN-4822</span>
                <span className="uc-tk-status prog">In progress</span>
              </div>
              <div className="uc-tk-t">
                Revenue chart renders empty until a window resize
              </div>
              <div className="uc-tk-meta">
                <span className="uc-chip dot">production</span>
                <span className="uc-chip">Safari 17</span>
                <span className="uc-chip">repro: 3 steps</span>
              </div>
              <div className="uc-tk-foot">
                <span className="uc-av s b3">D</span>
                Daniel
                <span className="sp"></span>
                synced to Jira · ACME-118
              </div>
            </div>
          </div>
        }
      >
        <p className="uc-feat-p">
          Push any ticket to Jira, Linear, or GitHub with one click — the
          evidence, environment, and repro steps travel with it, so nothing gets
          re-typed or lost in translation.
        </p>
        <p className="uc-feat-p">
          Status syncs both ways, so the board and your tracker never drift
          apart.
        </p>
      </FeatureRow>

      {/* 04 — Dev-ready (shared flagship AI band) */}
      <AiDiagnosisCard />

      <RelatedUseCases current="teams" />
      <ClosingCTA title="Turn your next bug into a ticket, not a thread." />
    </UseCaseScaffold>
  );
}
