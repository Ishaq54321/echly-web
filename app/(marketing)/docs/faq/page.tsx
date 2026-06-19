import type { Metadata } from "next";
import Link from "next/link";
import {
  DocsScaffold,
  DocHero,
  DocLayout,
} from "../../_components/docs/DocsScaffold";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Annote",
  description:
    "Short, straight answers to the things people ask most before they get started.",
};

const ITEMS: FaqItem[] = [
  {
    question: "Does Annote record my browsing in the background?",
    answer: (
      <p>
        <b>No.</b> Annote captures nothing until you start a session, and stops
        the moment you end it.
      </p>
    ),
  },
  {
    question: "Is my data redacted before it's sent anywhere?",
    answer: (
      <p>
        <b>Yes.</b> Sensitive patterns — tokens, emails, card numbers, API keys,
        auth and cookie headers — are replaced in your browser before any data
        leaves it. Passwords and card fields are never captured. See{" "}
        <Link className="link" href="/docs/privacy">
          Privacy &amp; data protection
        </Link>{" "}
        for details.
      </p>
    ),
  },
  {
    question: "Does Annote integrate with Jira, Linear, or Slack?",
    answer: (
      <p>
        <b>Not yet.</b> Integrations are on the roadmap. Today, feedback lives in
        the Annote dashboard where your team triages, assigns, and resolves it.
      </p>
    ),
  },
  {
    question: "Do I log in through the extension?",
    answer: (
      <p>
        <b>No</b> — you sign in on the Annote website, and the extension connects
        automatically as long as you&apos;re logged in there in the same browser.
        See{" "}
        <Link className="link" href="/docs/getting-started#connect">
          Sign in &amp; connect
        </Link>
        .
      </p>
    ),
  },
  {
    question: "What does the screenshot include?",
    answer: (
      <p>
        Only the <b>visible part of the current browser tab</b> at the moment you
        capture — not the full page, not other tabs, and not your desktop.
      </p>
    ),
  },
  {
    question: "How long can a voice note be?",
    answer: (
      <p>
        Up to <b>three minutes</b>, with a warning as you approach the limit.
      </p>
    ),
  },
  {
    question: "Can I control what gets captured on my own pages?",
    answer: (
      <p>
        <b>Yes</b> — add privacy markers to your HTML to mask or exclude specific
        elements. See the{" "}
        <Link className="link" href="/docs/privacy-markers">
          Privacy markers reference
        </Link>
        .
      </p>
    ),
  },
];

const ArrIcon = (
  <svg className="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

export default function FaqPage() {
  return (
    <DocsScaffold>
      <DocHero
        eyebrow="Documentation"
        title="Frequently asked questions"
        sub="Short, straight answers to the things people ask most before they get started."
        meta={["7 QUESTIONS", "PRIVACY · CAPTURE · ACCOUNT"]}
      />

      <DocLayout solo sections={[]}>
        <FaqAccordion items={ITEMS} />

        <div className="rail-foot" style={{ marginTop: 40 }}>
          <p>Didn&apos;t find your answer here? We&apos;re quick to respond.</p>
          <a href="#">Contact support {ArrIcon}</a>
        </div>
      </DocLayout>
    </DocsScaffold>
  );
}
