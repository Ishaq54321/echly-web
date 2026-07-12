import type { Metadata } from "next";
import {
  DocsScaffold,
  DocHero,
  DocLayout,
  DocSection,
  DocFigure,
  Note,
  RailFoot,
  type DocNavItem,
} from "../../_components/docs/DocsScaffold";

export const metadata: Metadata = {
  title: "Getting Started — Annote",
  alternates: { canonical: "/docs/getting-started" },
  description:
    "Install Annote, connect your account, and file your first bug in under five minutes.",
};

const IcCursor = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3.5 L9.4 19 L11.6 12.6 L18 10.4 Z" />
    <path d="M16.4 16.4 L20 20" />
    <path d="M17.5 4 V7 M16 5.5 H19" />
  </svg>
);
const IcPuzzle = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 4.5a1.6 1.6 0 0 1 3.2 0c0 .6-.3 1-.3 1.5h3.1v3.1c.5 0 .9-.3 1.5-.3a1.6 1.6 0 0 1 0 3.2c-.6 0-1-.3-1.5-.3v3.6c0 .55-.45 1-1 1h-3.1c0-.5.3-.9.3-1.5a1.6 1.6 0 0 0-3.2 0c0 .6.3 1 .3 1.5H5.5c-.55 0-1-.45-1-1v-3.1c-.5 0-.9.3-1.5.3a1.6 1.6 0 0 1 0-3.2c.6 0 1 .3 1.5.3V5.5c0-.55.45-1 1-1h3.1c0 .5-.3.9-.3 1.5" />
  </svg>
);
const IcShield = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 L19 5.6 V11 c0 4.5-3 7.6-7 9.4 C8 18.6 5 15.5 5 11 V5.6 Z" />
    <path d="M9 11.6 L11.2 13.8 L15.2 9.4" />
  </svg>
);
const IcTarget = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 1.8 V5 M12 19 V22.2 M1.8 12 H5 M19 12 H22.2" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "what", label: "What is Annote", icon: IcCursor },
  { id: "install", label: "Install the extension", icon: IcPuzzle },
  { id: "connect", label: "Sign in & connect", icon: IcShield },
  { id: "capture", label: "Capture your first bug", icon: IcTarget },
];

export default function GettingStartedPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Getting Started"
        sub="Install Annote, connect your account, and file your first bug in under five minutes."
        meta={["4 SECTIONS", "~5 MIN READ", "CHROME EXTENSION"]}
      />

      <DocLayout
        sections={SECTIONS}
        railFoot={
          <RailFoot
            text="Stuck on a step or something looks off? We're quick to respond."
            href="/docs/troubleshooting"
            label="Contact support"
          />
        }
      >
        <DocSection id="what" num="01" kicker="Overview" title="What is Annote" icon={IcCursor}>
          <p className="lead">
            Annote turns a vague bug report into something a developer can act on. Instead of
            typing &ldquo;the save button is broken&rdquo; into Slack, you click the thing
            that&apos;s broken, say or type what&apos;s wrong, and Annote writes a structured
            ticket for you — automatically attaching a screenshot plus the technical evidence
            behind the bug: the console errors, the network requests, and the actions you took
            leading up to it.
          </p>
          <p>
            The flow is always the same three beats:{" "}
            <strong>click an element → speak or type what&apos;s wrong → Annote&apos;s AI writes the ticket</strong>{" "}
            and diagnoses the likely cause. Your team picks it up in the Annote dashboard,
            already triaged.
          </p>
          <Note>
            <b>One thing worth knowing up front:</b> Annote captures nothing until you start a
            session. It sits quietly until you open it and hit record — so it&apos;s not
            watching your browsing in the background.
          </Note>
        </DocSection>

        <DocSection id="install" num="02" kicker="Setup" title="Install the extension" icon={IcPuzzle}>
          <p className="lead">Annote lives in your browser as a Chrome extension.</p>
          <ol className="steps">
            <li>
              Open the Annote extension in the Chrome Web Store:{" "}
              <a className="link" href="https://chromewebstore.google.com/detail/annote/bbgkibjfpdpiooneibjmafgiaiilpfhn" target="_blank" rel="noopener noreferrer">Install Annote</a>
            </li>
            <li>
              Click <strong>&ldquo;Add to Chrome,&rdquo;</strong> then{" "}
              <strong>&ldquo;Add extension&rdquo;</strong> in the confirmation dialog.
            </li>
            <li>
              Once installed, the Annote icon appears in your browser toolbar. Click the
              puzzle-piece icon and <strong>pin Annote</strong> so it&apos;s always visible.
            </li>
          </ol>
          <p>
            That&apos;s the whole install. There&apos;s no setup wizard and no settings to
            configure — the next step is connecting your account.
          </p>
          <DocFigure caption="Annote icon pinned in the Chrome toolbar" />
        </DocSection>

        <DocSection id="connect" num="03" kicker="Account" title="Sign in & connect" icon={IcShield}>
          <p className="lead">
            Here&apos;s the part that surprises people: there&apos;s no login inside the
            extension. You don&apos;t enter a password into Annote in your browser toolbar.
          </p>
          <p>
            Instead, Annote connects automatically as long as you&apos;re signed in to the
            Annote website in the same browser. The first time you click the Annote toolbar
            icon while signed out, it opens the Annote login page in a new tab. Sign in there
            normally — with <strong>Google</strong> or your <strong>email and password</strong> —
            and the extension connects itself. No copying tokens, no separate
            &ldquo;connect&rdquo; step.
          </p>
          <p>
            You&apos;ll stay connected as long as you&apos;re logged into the Annote website in
            that browser. You&apos;ll only be asked to sign in again if you log out of the
            website or your session expires.
          </p>
          <Note>
            <b>Don&apos;t have an account yet?</b> Create one at the Annote website first,
            verify your email, and finish the short onboarding (it sets up your workspace). You
            need a workspace before you can capture anything.
          </Note>
          <DocFigure
            src="/docs/assets/gs-connect.webp"
            caption="The website login page that opens from the extension"
          />
        </DocSection>

        <DocSection id="capture" num="04" kicker="First capture" title="Capture your first bug" icon={IcTarget}>
          <p className="lead">
            With the extension installed and your account connected, here&apos;s the full path
            from broken thing to finished ticket.
          </p>
          <ol className="steps">
            <li>Click the Annote icon in your toolbar. The Annote tray opens on the page.</li>
            <li>
              Click <strong>&ldquo;Start Session,&rdquo;</strong> then choose how you want to
              give feedback — <strong>Voice</strong> (speak naturally) or <strong>Write</strong>{" "}
              (type it). Voice will ask for microphone permission the first time.
            </li>
            <li>
              Click the element that&apos;s wrong. Your cursor becomes a marker and elements
              highlight as you hover. Clicking takes a screenshot of that element and opens a
              small capture box right next to it.
            </li>
            <li>
              Say or type what&apos;s wrong, then hit <strong>Send</strong> (or Enter). A pin
              drops on the element and the box closes — so you can immediately click the next
              thing if you want.
            </li>
            <li>
              Annote&apos;s AI structures your feedback into a ticket in the background — with
              the screenshot, console logs, network activity, and your actions all attached and
              correlated. The pin updates to the real ticket title when it&apos;s done.
            </li>
          </ol>
          <p>
            Your session follows you across tabs and pages automatically, so you can reproduce a
            bug across a flow and keep capturing. When you&apos;re done, click{" "}
            <strong>End</strong> — or the session ends on its own after 30 minutes of inactivity.
          </p>
          <p>
            Then open the Annote dashboard: your session and its tickets are there, each one
            already AI-diagnosed with a likely cause and a suggested fix, ready for your team to
            resolve, assign, and comment on.
          </p>
          <DocFigure
            src="/docs/assets/gs-capture.webp"
            caption="A captured ticket in the dashboard with the AI diagnosis panel"
          />
        </DocSection>
      </DocLayout>
    </DocsScaffold>
  );
}
