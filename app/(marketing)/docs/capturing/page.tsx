import type { Metadata } from "next";
import Link from "next/link";
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
  title: "Capturing Feedback — Annote",
  description:
    "Start a session, choose how you capture, and see exactly what Annote attaches to every piece of feedback.",
};

const IcPower = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5 V11" />
    <path d="M7.4 6.6 a7.2 7.2 0 1 0 9.2 0" />
  </svg>
);
const IcMic = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11 a6.5 6.5 0 0 0 13 0" />
    <path d="M12 17.5 V21 M9 21 H15" />
  </svg>
);
const IcLayers = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5 L20.5 8 L12 12.5 L3.5 8 Z" />
    <path d="M3.5 12 L12 16.5 L20.5 12" />
    <path d="M3.5 16 L12 20.5 L20.5 16" />
  </svg>
);
const IcEdit = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 5.5 L18.5 9.5 L9 19 L4.5 19.5 L5 15 Z" />
    <path d="M13 7 L17 11" />
  </svg>
);

const SECTIONS: DocNavItem[] = [
  { id: "starting-a-session", label: "Starting & ending", icon: IcPower },
  { id: "voice-vs-write", label: "Voice vs. Write", icon: IcMic },
  { id: "what-gets-captured", label: "What gets captured", icon: IcLayers },
  { id: "editing-mid-session", label: "Editing mid-session", icon: IcEdit },
];

export default function CapturingPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Capturing Feedback"
        sub="Start a session, choose how you capture, and see exactly what Annote attaches to every piece of feedback."
        meta={["4 SECTIONS", "VOICE & WRITE", "CAPTURE BASICS"]}
      />

      <DocLayout
        sections={SECTIONS}
        railFoot={
          <RailFoot
            text="Want to know what's redacted before anything is sent?"
            href="/docs/privacy"
            label="Privacy & data protection"
          />
        }
      >
        <DocSection
          id="starting-a-session"
          num="01"
          kicker="Sessions"
          title="Starting & ending a session"
          icon={IcPower}
        >
          <p className="lead">
            Annote captures nothing until you start a session. The extension loads
            quietly on the pages you visit, but it sits inactive until you open it — so
            it isn&apos;t recording your browsing in the background.
          </p>
          <p>
            To start, click the Annote icon in your browser toolbar. The Annote tray
            opens on the page, and if you&apos;re signed in, capture is armed. Click{" "}
            <strong>Start Session</strong>, choose <strong>Voice</strong> or{" "}
            <strong>Write</strong>, and you&apos;re recording.
          </p>
          <p>
            Once a session is running, it follows you automatically. Switch tabs, click
            through a multi-step flow, navigate to another page — the tray and capture
            stay with you, so you can reproduce a bug across a whole journey without
            restarting anything.
          </p>
          <Note>
            <b>To stop, click End</b> (or simply close the tray) and capture stops
            immediately. A session also ends on its own after 30 minutes of inactivity —
            so if you wander off mid-review, it won&apos;t keep running. Closing the tray
            clears the in-memory buffer; nothing you didn&apos;t file is kept.
          </Note>
          <DocFigure caption="The Annote tray open on a page, with Start Session visible" />
        </DocSection>

        <DocSection
          id="voice-vs-write"
          num="02"
          kicker="Input modes"
          title="Voice vs. Write"
          icon={IcMic}
        >
          <p className="lead">
            Annote gives you two ways to describe what&apos;s wrong. You pick per session,
            and you can switch between them anytime — from the tray header, the mode
            cards, or inside a capture.
          </p>
          <p>
            <strong>Voice</strong> is the faster one. Click an element, and recording
            starts automatically; you just talk. Speak naturally — &ldquo;the trial
            button overlaps the footer on tablet&rdquo; — and Annote transcribes it and
            turns your rough words into a structured ticket. The first time you use Voice,
            your browser asks for microphone permission; you&apos;ll need to allow it
            once. Voice notes can run up to three minutes, with a warning as you approach
            the limit.
          </p>
          <p>
            <strong>Write</strong> is the quieter one — useful in an open office, on a
            call, or anywhere a mic isn&apos;t practical. Click an element and type into
            the capture box. <code>Enter</code> sends, <code>Shift+Enter</code> adds a
            line break, <code>Esc</code> cancels.
          </p>
          <Note>
            <b>If a site blocks microphone access</b> through its own security policy,
            Voice won&apos;t be available there — that&apos;s the site&apos;s restriction,
            not something Annote can change. Switch to Write for those pages.
          </Note>
          <DocFigure caption="The Voice / Write mode-selection cards" />
        </DocSection>

        <DocSection
          id="what-gets-captured"
          num="03"
          kicker="The evidence"
          title="What gets captured"
          icon={IcLayers}
        >
          <p className="lead">
            When you file a piece of feedback, Annote attaches the technical evidence
            behind it — so a developer gets context, not guesswork. Here&apos;s what each
            part means.
          </p>
          <ul className="facts">
            <li>
              <strong>Console logs and errors.</strong> The messages and errors your
              site&apos;s code prints — what a developer reads in the browser console —
              plus broken image or script load failures.
            </li>
            <li>
              <strong>Network requests.</strong> A record of the page&apos;s API calls:
              URL, method, status, timing, headers, and bodies — so you can see which call
              failed and what came back. Third-party traffic (analytics, CDNs, fonts) is
              excluded to keep the signal clean, and streaming or binary responses are
              summarized rather than stored in full.
            </li>
            <li>
              <strong>User actions.</strong> A timeline of what you did leading up to the
              bug — clicks, navigation, &ldquo;edited a field,&rdquo; submits, resizes.
              Each element gets a short description (its tag, id, classes, or label) so a
              developer knows exactly which control. Annote records which field you
              interacted with, never what you typed.
            </li>
            <li>
              <strong>Screenshot.</strong> A single image of the currently visible part of
              the browser tab at the moment you capture — not the full page, not your
              other tabs, and not your desktop. It&apos;s a screenshot, not
              screen-sharing.
            </li>
            <li>
              <strong>Voice.</strong> If you choose Voice, your microphone audio is
              recorded only while you&apos;re recording, and sent to a transcription
              service to turn your speech into text.
            </li>
          </ul>
          <p>
            There are no per-stream on/off switches — starting and ending a session is the
            main control, alongside the privacy markers you can add to your own pages (see{" "}
            <Link className="link" href="/docs/privacy-markers">
              Privacy markers reference
            </Link>
            ). Anything you do inside the Annote tray itself is never recorded.
          </p>
          <DocFigure
            src="/docs/assets/cap-3.webp"
            caption="A ticket's Dev Tools panel showing the Console / Network / Actions tabs"
          />
        </DocSection>

        <DocSection
          id="editing-mid-session"
          num="04"
          kicker="Refining"
          title="Editing captures mid-session"
          icon={IcEdit}
        >
          <p className="lead">
            You don&apos;t have to get a ticket perfect at capture time. Every ticket in a
            session can be edited before you send it on.
          </p>
          <p>
            After you file a capture, a pin drops on the element and the box closes — so
            you can immediately click the next thing. The AI structures your note into a
            ticket in the background, and the pin updates to the real title when it&apos;s
            ready.
          </p>
          <p>
            To refine one, click its card to open the editor. You can change the title,
            edit the description in a rich-text editor, add or remove tags, and expand the
            screenshot. When you open a ticket to edit it, the session auto-pauses so
            nothing new is captured while you&apos;re focused — and auto-resumes when you
            close the editor. You&apos;ll see a brief &ldquo;Session paused /
            resumed&rdquo; note so you always know which state you&apos;re in.
          </p>
          <DocFigure caption="The ticket editor overlay with title, screenshot, tags, and description" />
        </DocSection>
      </DocLayout>
    </DocsScaffold>
  );
}
