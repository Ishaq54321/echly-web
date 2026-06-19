import type { Metadata } from "next";
import {
  DocsScaffold,
  DocHero,
  DocLayout,
  DocSection,
  Note,
  RailFoot,
  type DocNavItem,
} from "../../_components/docs/DocsScaffold";

export const metadata: Metadata = {
  title: "Troubleshooting — Annote",
  description:
    "The messages you might run into — what each one means, and the quickest way past it.",
};

const IcMic = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11 a6.5 6.5 0 0 0 13 0" />
    <path d="M12 17.5 V21 M8.5 21 H15.5" />
  </svg>
);
const IcSparkles = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4 l1.5 4.1 L16.6 9.6 l-4.1 1.5 L11 15.2 l-1.5-4.1 L5.4 9.6 l4.1-1.5 Z" />
    <path d="M17.6 14.4 l.7 1.9 1.9 .7 -1.9 .7 -.7 1.9 -.7-1.9 -1.9-.7 1.9-.7 Z" />
  </svg>
);
const IcRefresh = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.5 12 a7.5 7.5 0 1 1-2.1-5.2" />
    <path d="M19.7 4.2 V8.4 H15.5" />
  </svg>
);
const IcGauge = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16 a8 8 0 0 1 16 0" />
    <path d="M12 16 L15.8 10.8" />
    <circle cx="12" cy="16" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "mic", label: "Microphone issues", icon: IcMic },
  { id: "ai", label: "AI diagnosis", icon: IcSparkles },
  { id: "sync", label: "Sync & session", icon: IcRefresh },
  { id: "limits", label: "Plan limits", icon: IcGauge },
];

export default function TroubleshootingPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Troubleshooting"
        sub="The messages you might run into — what each one means, and the quickest way past it."
        meta={["4 SECTIONS", "COMMON MESSAGES", "QUICK FIXES"]}
      />

      <DocLayout
        sections={SECTIONS}
        railFoot={
          <RailFoot
            text="Still stuck after trying these? We're quick to respond."
            href="#"
            label="Contact support"
          />
        }
      >
        <DocSection id="mic" num="01" kicker="Voice" title="Microphone issues" icon={IcMic}>
          <div className="msgs">
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>Annote needs your microphone
                </span>
              </div>
              <div className="msg-a">
                Annote doesn&apos;t have mic access yet. Click{" "}
                <span className="ui">&quot;Try again&quot;</span> and allow access in the
                browser prompt, or switch to <span className="ui">Write</span> to type
                instead.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>Microphone is blocked
                </span>
              </div>
              <div className="msg-a">
                Access was denied for this site. Follow the three on-screen steps to
                re-enable it in your browser; Annote detects when it&apos;s back on.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>This site doesn&apos;t allow voice
                  recording
                </span>
              </div>
              <div className="msg-a">
                The website itself blocks microphone use through its security policy. This
                isn&apos;t something Annote can change — switch to{" "}
                <span className="ui">Write</span> for this site.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>No audio detected
                </span>
              </div>
              <div className="msg-a">
                Your mic was on but Annote didn&apos;t hear anything. Check that the right
                microphone is selected and try again.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>Couldn&apos;t process audio
                </span>
              </div>
              <div className="msg-a">
                The transcription didn&apos;t go through. Retry; if it persists, switch to{" "}
                <span className="ui">Write</span>.
              </div>
            </div>
          </div>
        </DocSection>

        <DocSection
          id="ai"
          num="02"
          kicker="Diagnosis"
          title="When the AI diagnosis doesn't appear"
          icon={IcSparkles}
        >
          <div className="msgs">
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>AI processing failed
                </span>
              </div>
              <div className="msg-a">
                The ticket was saved, but the automatic write-up didn&apos;t complete. The
                capture (screenshot, console, network, actions) is still attached; you can
                edit the ticket manually.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>Analyzing… taking longer than expected
                </span>
              </div>
              <div className="msg-a">
                Diagnosis is still running. Use{" "}
                <span className="ui">&quot;Retry analysis&quot;</span> if it stalls.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>AI analysis unavailable
                </span>
              </div>
              <div className="msg-a">
                The analysis request failed. Retry from the ticket&apos;s{" "}
                <span className="ui">Dev Tools</span> panel.
              </div>
            </div>
          </div>
          <Note>
            <b>Worth knowing:</b> a <b>&quot;No related capture&quot;</b> verdict does not
            mean there&apos;s no bug. It means the captured evidence didn&apos;t contain
            anything bearing on what you reported — the issue still stands.
          </Note>
        </DocSection>

        <DocSection
          id="sync"
          num="03"
          kicker="Connection"
          title="Sync and session issues"
          icon={IcRefresh}
        >
          <div className="msgs">
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>Retrying feedback sync…
                </span>
                <span className="q">
                  <span className="qm">&quot;</span>Temporary sync issue. We&apos;ll retry
                  on your next scroll or refresh
                </span>
              </div>
              <div className="msg-a">
                Your ticket is saved locally and Annote is reattempting the upload.
                Scrolling or refreshing nudges it; nothing is lost.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>Could not start session. Try again.
                </span>
              </div>
              <div className="msg-a">
                The session didn&apos;t start. Confirm you&apos;re signed in to the Annote
                website in this browser, then retry.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span
                  className="q"
                  style={{
                    background: "var(--d-primary-soft)",
                    borderColor: "var(--d-primary-soft-2)",
                    color: "var(--d-primary-ink)",
                  }}
                >
                  Your session ended on its own
                </span>
              </div>
              <div className="msg-a">
                Sessions end automatically after <b>30 minutes of inactivity</b>. Start a
                new one to keep capturing.
              </div>
            </div>
          </div>
        </DocSection>

        <DocSection
          id="limits"
          num="04"
          kicker="Plan"
          title="Reaching a plan limit"
          icon={IcGauge}
        >
          <div className="msgs">
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>You&apos;ve reached your session limit
                </span>
                <span className="q">
                  <span className="qm">&quot;</span>You&apos;ve reached your monthly limit
                </span>
              </div>
              <div className="msg-a">
                Your workspace hit its plan&apos;s cap for the month. The owner can upgrade
                from the dashboard to lift it. On the free{" "}
                <span className="ui">Starter</span> plan the caps are <b>50 tickets</b> and{" "}
                <b>5 members</b>.
              </div>
            </div>
            <div className="msg">
              <div className="msg-q">
                <span className="q">
                  <span className="qm">&quot;</span>Monthly AI limit reached
                </span>
              </div>
              <div className="msg-a">
                You&apos;ve used this month&apos;s AI write-ups. It resets on the date
                shown; capture still works, just without the automatic diagnosis until
                then.
              </div>
            </div>
          </div>
        </DocSection>
      </DocLayout>
    </DocsScaffold>
  );
}
