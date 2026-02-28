"use client";

import { Section } from "./Section";

interface SuggestionSectionProps {
  suggestion: string;
}

export function SuggestionSection({ suggestion }: SuggestionSectionProps) {
  return (
    <Section title="Suggestion">
      <p className="text-sm leading-relaxed text-[hsl(var(--text-primary))]">
        {suggestion}
      </p>
    </Section>
  );
}
