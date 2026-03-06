/**
 * Run test transcripts against the structure-feedback interpreter prompt.
 * Usage: npx tsx scripts/test-structure-feedback.ts
 * Requires: OPENAI_API_KEY in env.
 */

import OpenAI from "openai";
import { runVoiceToTicket } from "@/lib/ai/voiceToTicketPipeline";

const tests: { transcript: string; expectedDescription: string }[] = [
  {
    transcript: "Update the section to include Why choose Barton",
    expectedDescription: "Update the section text to include 'Why choose Barton'.",
  },
  {
    transcript: "Make this section better",
    expectedDescription: "Improve the design or functionality of this section.",
  },
  {
    transcript: "Match the headline with the one from the other website",
    expectedDescription: "Update the headline to match the messaging used on the other website.",
  },
];

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Set OPENAI_API_KEY to run tests.");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });
  console.log("Running structure-feedback interpreter tests...\n");

  for (let i = 0; i < tests.length; i++) {
    const { transcript, expectedDescription } = tests[i];
    const result = await runVoiceToTicket(client, transcript, null, {
      runReviewBelowConfidence: 1,
    });
    const actual = result.ticket.actionSteps[0] ?? result.ticket.title ?? "(no action)";
    const match = actual.toLowerCase().includes(expectedDescription.toLowerCase().slice(0, 30));
    console.log(`Test ${i + 1}: "${transcript}"`);
    console.log(`  Expected (contains): "${expectedDescription}"`);
    console.log(`  Actual:             "${actual}"`);
    console.log(`  OK: ${match ? "yes" : "no"}\n`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
