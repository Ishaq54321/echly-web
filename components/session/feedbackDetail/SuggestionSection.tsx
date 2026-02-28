"use client";

import { Section } from "./Section";

interface SuggestionSectionProps {
  suggestion: string;
}

export function SuggestionSection({ suggestion }: SuggestionSectionProps) {
  return (
    <Section title="Suggestion">
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
        <p className="text-[15px] text-rose-900 leading-8">{suggestion}</p>
      </div>
    </Section>
  );
}
