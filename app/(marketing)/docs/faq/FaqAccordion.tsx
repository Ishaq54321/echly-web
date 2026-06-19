"use client";

import { useState } from "react";

export type FaqItem = { question: React.ReactNode; answer: React.ReactNode };

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5 V19 M5 12 H19" />
  </svg>
);

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i} className={"faq-item" + (open ? " open" : "")}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? -1 : i)}
            >
              <span className="qn">{String(i + 1).padStart(2, "0")}</span>
              <span className="qt">{item.question}</span>
              <span className="qx">{PlusIcon}</span>
            </button>
            <div className="faq-a">
              <div className="inner">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
