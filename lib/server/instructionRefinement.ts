/**
 * Stage: Instruction Refinement (after segmentation).
 * Detects instructions that still contain multiple actions and splits them
 * so each instruction represents exactly one developer action.
 */

import type OpenAI from "openai";

const REFINEMENT_SYSTEM = `You are Echly's Instruction Refiner. Your job is to ensure each instruction represents exactly ONE developer action.

RULES:
1. One instruction = exactly one developer action. Split compound instructions.
2. Remove redundancy. Preserve intent.
3. If an instruction already describes a single action, leave it unchanged (or lightly rephrase for clarity).
4. Output only the refined instructions array. No explanation. No markdown.

EXAMPLE:
Input instructions:
["Change first name and last name to fullname and merge their fields"]

Output:
{
  "instructions": [
    "Rename the First Name and Last Name fields to Full Name",
    "Merge the First Name and Last Name fields into one field"
  ]
}

OUTPUT FORMAT (strict JSON only):
{
  "instructions": ["refined instruction 1", "refined instruction 2", ...]
}

The number of output instructions may be greater than input if you split compound items. Never merge two separate instructions into one.`;

function cleanJson(content: string): string {
  return content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

export interface RefineInstructionsResult {
  instructions: string[];
}

/**
 * Refines a list of instructions so each is exactly one developer action.
 * Uses gpt-4o-mini. Returns same list if parsing fails (defensive).
 */
export async function refineInstructions(
  client: OpenAI,
  instructions: string[]
): Promise<RefineInstructionsResult> {
  if (instructions.length === 0) {
    return { instructions: [] };
  }

  const userContent = [
    "Instructions to refine (one per line):",
    ...instructions.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      top_p: 1,
      max_tokens: 1500,
      messages: [
        { role: "system", content: REFINEMENT_SYSTEM },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return { instructions };

    const parsed = JSON.parse(cleanJson(content)) as { instructions?: unknown };
    const out = Array.isArray(parsed.instructions)
      ? (parsed.instructions as string[]).filter((s) => typeof s === "string" && s.trim() !== "")
      : instructions;
    return { instructions: out.length > 0 ? out : instructions };
  } catch (err) {
    console.error("[instructionRefinement] Failed:", err);
    return { instructions };
  }
}
