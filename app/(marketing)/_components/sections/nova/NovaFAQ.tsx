"use client";

/**
 * NovaFAQ — questions & answers restyled to the reference system: section
 * title on the left, a hairline-divided accordion list on the right, plus
 * icon that rotates 45° into a close affordance, answers revealed with the
 * grid-template-rows 0fr→1fr technique. Q&A copy unchanged.
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "../../nova/Reveal";

const FAQ_ITEMS = [
  {
    id: "capture",
    question: "How do I actually capture feedback?",
    answer:
      "Install the Chrome extension, open it on any page, and click whatever you're reporting on — a button, a broken layout, anything. Then just speak or type what's wrong in your own words. The AI cleans up your language and formats it into a structured ticket, while Annote automatically captures the console logs, network requests, and what you were doing behind the scenes — then reads it all and flags the likely cause. You point at the problem; Annote handles the rest.",
  },
  {
    id: "saved",
    question: "Where do my tickets get saved?",
    answer:
      "Every ticket lands in an organized session — your shared workspace for a project. Everything stays in one place, in order, so nothing scatters across Slack threads. Share the session link with anyone, invite teammates to collaborate, or come back and add more tickets to the same session later. It's the running record of feedback for that project.",
  },
  {
    id: "install",
    question: "Do I need to install anything to view a session?",
    answer:
      "No. Anyone with the link opens it in their browser — no signup, no install. Comments, replies, and status updates are all live. The Chrome extension is only for the person doing the capturing.",
  },
  {
    id: "staging-auth",
    question: "Does this work on staging and password-protected sites?",
    answer:
      "Yes. If you can see it in your browser tab — production, staging, localhost, behind auth, behind feature flags — you can capture it. Annote captures what's on your screen.",
  },
  {
    id: "data-safety",
    question: "Is my data safe — where does it go?",
    answer:
      "Secrets and common PII patterns are redacted right in the page, before anything is stored or sent. Annote never reads what users type, runs on just four browser permissions, and uses no third-party analytics. Captured tickets are stored in our cloud; the AI features use OpenAI. Full details in our security overview.",
  },
  {
    id: "client-buy-in",
    question: "What if my client doesn't want to learn another tool?",
    answer:
      "They don't have to. Clients open a link, see the session, and leave comments — same as a Google Doc. No account, no app, no learning curve. If they'd rather just type in Slack, that works too; your team still captures the structured tickets on their end.",
  },
  {
    id: "integrations",
    question: "Can I export tickets to Linear, Jira, or Notion?",
    answer:
      "Not yet — direct integrations are on the roadmap for early 2026. For now, every ticket has everything devs need inside Annote (page, element, browser, status, priority, assignee), and the share link drops into any of those tools carrying the full report. Since tickets are already structured, copy-paste is fast too.",
  },
] as const;

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`nv-faq-item${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="nv-faq-q"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{question}</span>
        <span className="nv-faq-q-icon" aria-hidden="true">
          <Plus size={20} strokeWidth={1.75} />
        </span>
      </button>
      <div className="nv-faq-a-wrap" aria-hidden={!open}>
        <div className="nv-faq-a">
          <p className="nv-body">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function NovaFAQ() {
  return (
    <section id="faq" className="nv-faq">
      <div className="nv-container">
        <div className="nv-faq-grid">
          <Reveal>
            <p className="nv-eyebrow">FAQ</p>
            <h2 className="nv-h3">
              Questions &amp;
              <br />
              <span className="nv-dim">answers</span>
            </h2>
          </Reveal>
          <Reveal delay={120} threshold={0.05}>
            {FAQ_ITEMS.map((item) => (
              <FaqRow
                key={item.id}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
