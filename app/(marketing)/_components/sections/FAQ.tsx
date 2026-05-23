"use client";

import { useState } from "react";

type FaqEntry = {
  q: string;
  a: React.ReactNode;
};

const FAQS: ReadonlyArray<FaqEntry> = [
  {
    q: "Do I need to install anything to view a session?",
    a: "No. Anyone with the link can view the session in their browser. Comments, replies, status updates — all without an account or install. The Chrome extension is only for the person doing the capturing.",
  },
  {
    q: "What happens if my voice notes aren't perfect?",
    a: "That's the point. Speak however you'd normally talk through feedback — half-formed, casual, with filler words. Annote's AI structures the rough notes into clean tickets with title, description, severity, and tags. You can edit, rewrite, or send as-is.",
  },
  {
    q: "Does this work on staging environments and password-protected sites?",
    a: "Yes. Annote captures whatever you're looking at in your browser — production, staging, localhost, behind auth, behind feature flags. If you can see it in a tab, you can capture it.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="faq">
      <div className="faq-inner">
        <div className="faq-left">
          <div className="section-eyebrow">
            <span className="section-eyebrow-dash">—</span>
            <span className="section-eyebrow-text">Questions</span>
          </div>
          <h2 className="faq-h">Quick answers.</h2>
          <p className="faq-p">
            Three things people ask before they sign up.
          </p>
        </div>
        <div className="faq-list">
          {FAQS.map((entry, i) => {
            const isOpen = openIndex === i;
            return (
              <div className={`faq-item${isOpen ? " is-open" : ""}`} key={i}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {entry.q}
                  <span className="faq-ic" />
                </button>
                <div className="faq-a">
                  <div className="faq-a-in">{entry.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
