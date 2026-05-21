"use client";

import { useState } from "react";
import { ArrowIcon } from "../icons";

type FaqEntry = {
  q: string;
  a: React.ReactNode;
};

const FAQS: ReadonlyArray<FaqEntry> = [
  {
    q: "How is Annote different from Loom or a screenshot tool?",
    a: "Loom records video. Screenshot tools take pictures. Annote captures the page — voice, context, AI — and produces structured tickets your team can ship.",
  },
  {
    q: "Do my clients or teammates need to install anything?",
    a: "No. Only people capturing feedback install the extension. Viewing a session is just opening a link.",
  },
  {
    q: "Is the AI optional?",
    a: "Always. Edit, rewrite, or ignore the draft.",
  },
  {
    q: "Will this work on my Webflow / Framer / staging site?",
    a: "Yes. Annote works on any website — live, staging, or local. Custom integrations available for Webflow and Framer on Business and Enterprise plans.",
  },
  {
    q: "Can I white-label sessions for client work?",
    a: "Yes, on the Business plan. Custom logo, colors, and domain on every shared session.",
  },
  {
    q: "Where does my data live?",
    a: (
      <>
        Encrypted in transit and at rest. SSO and SAML on Enterprise.{" "}
        <a href="#security">Read about security →</a>
      </>
    ),
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="faq">
      <div className="faq-inner">
        <div className="faq-left">
          <span className="section-eyebrow">FAQ</span>
          <h2 className="faq-h">Quick answers.</h2>
          <p className="faq-p">
            Most things you&apos;d want to know in under a minute.
          </p>
          <a className="faq-all" href="#all-faq">
            Read all FAQs <ArrowIcon size={11} />
          </a>
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
