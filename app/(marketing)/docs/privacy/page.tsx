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
  title: "Privacy & data protection — Annote",
  description:
    "What Annote captures, what it redacts before anything leaves your browser, and exactly what you can control yourself.",
};

const IcPower = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5 V11" />
    <path d="M7.4 6.6 a7.2 7.2 0 1 0 9.2 0" />
  </svg>
);
const IcShield = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 L19 5.6 V11 c0 4.5-3 7.6-7 9.4 C8 18.6 5 15.5 5 11 V5.6 Z" />
    <path d="M9 11.6 L11.2 13.8 L15.2 9.4" />
  </svg>
);
const IcTag = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.6 V5.2 a1.2 1.2 0 0 1 1.2-1.2 H12.6 L20 11.4 a1.5 1.5 0 0 1 0 2.1 L13.5 20 a1.5 1.5 0 0 1-2.1 0 Z" />
    <circle cx="8.3" cy="8.3" r="1.25" />
  </svg>
);
const IcAlert = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.4 V13" />
    <path d="M12 16.3 v.05" />
  </svg>
);
const IcArrowUr = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 L17 7" />
    <path d="M8.5 7 H17 V15.5" />
  </svg>
);
const IcLock = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
    <path d="M8 10.5 V8 a4 4 0 0 1 8 0 v2.5" />
  </svg>
);
const IcCheck = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 L10 17.5 L19 7" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "capture-off", label: "Capture is off", icon: IcPower },
  { id: "redaction", label: "In-browser redaction", icon: IcShield },
  { id: "markers", label: "Privacy markers", icon: IcTag },
  { id: "limits", label: "Two honest limits", icon: IcAlert },
  { id: "leaves", label: "What leaves & stays", icon: IcArrowUr },
];

export default function PrivacyPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Privacy & data protection"
        sub="What Annote captures, what it redacts before anything leaves your browser, and exactly what you can control yourself."
        meta={["5 SECTIONS", "IN-BROWSER REDACTION", "PRIVACY-FIRST"]}
      />

      <DocLayout
        sections={SECTIONS}
        railFoot={
          <RailFoot
            text="Need the full marker list? See the dedicated reference."
            href="/docs/privacy-markers"
            label="Privacy markers reference"
          />
        }
      >
        <DocSection
          id="capture-off"
          num="01"
          kicker="By default"
          title="Capture is off until you start"
          icon={IcPower}
        >
          <p className="lead">Annote captures nothing until you start a session.</p>
          <p>
            The extension loads on the pages you visit, but it sits inactive — in
            transparent passthrough — until you open the tray and begin a session. It is
            not recording your browsing in the background, and there is no always-on
            capture.
          </p>
          <p>When you end a session (or close the tray), capture stops and the buffer is cleared.</p>
        </DocSection>

        <DocSection
          id="redaction"
          num="02"
          kicker="On your machine"
          title="Redaction happens in your browser, before anything is sent"
          icon={IcShield}
        >
          <p className="lead">
            This is the part most tools don&apos;t do: Annote redacts sensitive data on
            your own machine, before any of it leaves your browser.
          </p>
          <p>
            As your console, network, and action data are captured, Annote automatically
            replaces sensitive patterns — JSON Web Tokens, email addresses, card-like
            numbers, phone numbers, API keys (such as Stripe, GitHub, and Slack keys),
            Authorization headers, and Cookie headers — with safe placeholders like{" "}
            <code>&lt;jwt&gt;</code>, <code>&lt;email&gt;</code>, <code>&lt;card&gt;</code>,
            or <code>&lt;redacted&gt;</code>.
          </p>
          <p>
            Network request headers go further: authorization, cookie, and common
            API-token and secret headers are stripped out entirely. Sensitive form-field
            values — passwords, hidden fields, credit-card fields — are never captured at
            all.
          </p>
          <Note last icon={IcShield}>
            <b>All of this happens at capture time, in your browser,</b> so the raw values
            are gone before the data is ever attached to a ticket.
          </Note>
        </DocSection>

        <DocSection
          id="markers"
          num="03"
          kicker="Your control"
          title="What you can control yourself: privacy markers"
          icon={IcTag}
        >
          <p className="lead">
            If there are parts of your own pages you want to keep out of capture, you can
            mark them in your HTML.
          </p>
          <p>
            Annote honors the standard session-replay markers, so if you already use a
            tool like FullStory you may have these in place already.
          </p>
          <ul className="facts">
            <li>
              <code>[data-private]</code>, <code>.fs-exclude</code>, <code>.fs-block</code>,{" "}
              <code>[data-annote-mask]</code> — <strong>fully withhold</strong> the element.
              Annote records that an interaction happened, but keeps the element&apos;s text
              and attributes out.
            </li>
            <li>
              <code>.fs-mask</code>, <code>[data-rr-is-password]</code> —{" "}
              <strong>keep the element&apos;s structure</strong> but drop its text and labels.
            </li>
            <li>
              <code>.fs-unmask</code>, <code>[data-annote-blur=&apos;false&apos;]</code> —{" "}
              <strong>override</strong> a surrounding masked region for one specific element
              (the closest marker wins).
            </li>
          </ul>
          <p>
            These markers apply to user-action capture and to console capture (when you log
            a DOM element).
          </p>
          <figure className="code">
            <div className="frame">
              <div className="bar">
                <span className="d" />
                <span className="d" />
                <span className="d" />
                <span className="fname">checkout.html</span>
              </div>
              <pre>
                <span className="c">&lt;!-- fully withheld from capture --&gt;</span>
                {"\n"}
                <span className="t">&lt;div</span> <span className="a">data-private</span>
                <span className="t">&gt;</span>
                {"\n"}  <span className="t">&lt;span&gt;</span>Card ending{" "}
                <span className="s">4242</span>
                <span className="t">&lt;/span&gt;</span>
                {"\n"}
                <span className="t">&lt;/div&gt;</span>
                {"\n\n"}
                <span className="c">&lt;!-- masked region, one field unmasked --&gt;</span>
                {"\n"}
                <span className="t">&lt;form</span> <span className="a">class</span>=
                <span className="s">&quot;fs-mask&quot;</span>
                <span className="t">&gt;</span>
                {"\n"}  <span className="t">&lt;input</span> <span className="a">name</span>=
                <span className="s">&quot;coupon&quot;</span> <span className="a">class</span>=
                <span className="s">&quot;fs-unmask&quot;</span>
                <span className="t">&gt;</span>
                {"\n"}
                <span className="t">&lt;/form&gt;</span>
              </pre>
            </div>
            <figcaption>
              <span className="fc-ico">{IcTag}</span>
              Markers placed directly on your own page elements
            </figcaption>
          </figure>
        </DocSection>

        <DocSection
          id="limits"
          num="04"
          kicker="Plainly stated"
          title="The two honest limits"
          icon={IcAlert}
        >
          <p className="lead">
            Two things these markers do <strong>not</strong> do, stated plainly so there
            are no surprises.
          </p>
          <Note amber icon={IcAlert}>
            <b>Markers do not redact network requests, headers, or bodies.</b> Network data
            is protected by the automatic pattern redaction described above — not by
            markers. Adding <code>data-private</code> to an element does not hide an API
            response.
          </Note>
          <Note amber last icon={IcAlert}>
            <b>Markers do not edit the screenshot.</b> The screenshot is a picture of the
            visible part of the tab at the moment you capture. Markers hide text from the
            captured data, not from the image. If something sensitive is visible on screen
            when you capture, it will be in the screenshot. Screenshots are stored at a
            unique, unguessable link — but anyone who has that link can open the image, so
            treat a capture link as sensitive and share it only with people who should see
            it.
          </Note>
        </DocSection>

        <DocSection
          id="leaves"
          num="05"
          kicker="The boundary"
          title="What leaves your browser, and what stays"
          icon={IcArrowUr}
        >
          <p className="lead">
            A clear line between the two — after the in-browser redaction above has already
            run.
          </p>
          <div className="flow">
            <div className="fcard leaves">
              <div className="fhead">
                <span className="fh-ico">{IcArrowUr}</span>
                <h3>Leaves your browser</h3>
              </div>
              <ul>
                <li>
                  The <strong>redacted</strong> console, network, and action data attached
                  to a ticket you file
                </li>
                <li>
                  The <strong>screenshot</strong> of the visible tab
                </li>
                <li>
                  If you use Voice, your <strong>microphone audio</strong> — sent to a
                  transcription service to turn your speech into text
                </li>
              </ul>
            </div>
            <div className="fcard stays">
              <div className="fhead">
                <span className="fh-ico">{IcLock}</span>
                <h3>Stays on your machine</h3>
              </div>
              <ul>
                <li>
                  {IcCheck}Anything captured while <strong>no session is active</strong>
                </li>
                <li>
                  {IcCheck}The buffer, if you start but <strong>never file</strong>
                </li>
                <li>
                  {IcCheck}Anything matched by redaction (
                  <strong>replaced before sending</strong>)
                </li>
                <li>
                  {IcCheck}The <strong>text you type</strong> into your own page&apos;s
                  fields — the action timeline never records what you type
                </li>
              </ul>
            </div>
          </div>
        </DocSection>
      </DocLayout>
    </DocsScaffold>
  );
}
