"use client";

import { Section } from "./Section";

interface SuggestionSectionProps {
  suggestion: string;
}

export function SuggestionSection({ suggestion }: SuggestionSectionProps) {
  return (
    <Section title="Suggestion">
      <p className="text-[14px] leading-[1.6] text-[hsl(var(--text-primary))]">
        {suggestion}
      </p>
    </Section>
  );
}
