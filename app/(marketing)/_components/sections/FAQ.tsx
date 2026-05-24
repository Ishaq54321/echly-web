"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: ReadonlyArray<FaqEntry> = [
  {
    id: "install",
    question: "Do I need to install anything to view a session?",
    answer:
      "No. Anyone with the link opens it in their browser — no signup, no install. Comments, replies, status updates, all live. The Chrome extension is only for the person doing the capturing.",
  },
  {
    id: "voice-quality",
    question: "What happens if my voice notes aren't perfect?",
    answer:
      "That's the whole point. Talk through feedback the way you'd talk to a teammate — half-formed, casual, with filler words. The AI turns it into a clean ticket with a title, description, severity, and tags. You can edit before sending, or send as-is.",
  },
  {
    id: "staging-auth",
    question:
      "Does this work on staging environments and password-protected sites?",
    answer:
      "Yes. If you can see it in your browser tab — production, staging, localhost, behind auth, behind feature flags — you can capture it. Annote captures what's on your screen.",
  },
  {
    id: "client-buy-in",
    question: "What if my client doesn't want to learn another tool?",
    answer:
      "They don't have to. Clients open a link, see the session, leave comments. Same as opening a Google Doc. No account, no app, no learning curve. If they prefer just typing in Slack, that works too — your team still captures the structured tickets on their end.",
  },
  {
    id: "integrations",
    question: "Can I export tickets to Linear, Jira, or Notion?",
    answer:
      "Not yet — integrations are on the roadmap for early 2026. For now, every ticket has everything devs need (page, element, browser, status, priority, assignee) inside Annote. If you need to push to your stack, copy-paste works fast since the tickets are already structured.",
  },
];

type FAQItemProps = {
  question: string;
  answer: string;
  isLast: boolean;
};

function FAQItem({ question, answer, isLast }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`faq-item${isOpen ? " is-open" : ""}${isLast ? " is-last" : ""}`}
    >
      <button
        type="button"
        className="faq-question"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="faq-question-text">{question}</span>
        <span className="faq-question-icon" aria-hidden="true">
          {isOpen ? <Minus /> : <Plus />}
        </span>
      </button>

      <div className="faq-answer-wrapper" aria-hidden={!isOpen}>
        <div className="faq-answer">{answer}</div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <h2 className="faq-headline">Questions &amp; answers</h2>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isLast={index === FAQ_ITEMS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
