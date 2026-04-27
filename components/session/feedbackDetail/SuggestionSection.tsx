"use client";

import { Section } from "./Section";

interface SuggestionSectionProps {
  suggestion: string;
}

export function SuggestionSection({ suggestion }: SuggestionSectionProps) {
  return (
    <Section title="Suggestion">
      <p className="text-[15px] leading-[1.7] text-[var(--text-heading)]">
        {suggestion}
      </p>
    </Section>
  );
}
