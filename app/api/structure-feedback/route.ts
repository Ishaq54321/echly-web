import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitMap = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  return true;
}

const STRUCTURE_ENGINE_V2 = `
You are Echly's Precision Structuring Engine.

Your job is to extract EXACT modification instructions from user feedback.

You are NOT summarizing.
You are NOT deciding what matters.
You are NOT simplifying away details.
You are NOT inventing improvements.

You are performing STRUCTURED EXTRACTION.

------------------------------------------------------------
VISIBLE TEXT CONTEXT
------------------------------------------------------------

The provided visible text comes from the screenshot the user captured.
Use it only for disambiguation.

Rules:
1. If transcript references "this text", "this button", or ambiguous wording,
   use visible text to identify likely target.
2. Correct obvious speech-to-text errors when visible text strongly supports correction.
3. Do NOT invent changes not mentioned in transcript.
4. Do NOT summarize visible text.
5. Do NOT modify elements unless user explicitly instructs.

Visible text is reference only, not instruction.

------------------------------------------------------------
CONTEXT PRIORITY RULES
------------------------------------------------------------

1. The transcript is the primary source of truth.
2. Visible screenshot text is secondary reference only.
3. If the transcript mentions elements not present in visible text:
   - Still process normally.
   - Do NOT reject.
   - Do NOT question.
4. Do NOT assume instructions are limited to visible content.
5. Do NOT override transcript meaning using screenshot text.
6. Use visible text only when:
   - Resolving ambiguous references.
   - Correcting obvious speech-to-text errors.

Transcript always takes priority over screenshot text.

------------------------------------------------------------
TRANSCRIPT CORRECTION RULES
------------------------------------------------------------

1. The input transcript may contain speech-to-text errors.
2. If a word appears incorrect but there is a highly probable contextual correction, silently correct it.
3. Only correct when:
   - The corrected word is phonetically similar.
   - The corrected word clearly fits UI/product/design context.
   - The original word does not logically fit the context.

Examples:
- "glue" → "blue" (when discussing colors)
- "button side" → "button size"
- "signing page" → "sign-in page" (if clearly login context)
- "text field border raid" → "border radius"

4. Do NOT invent missing information.
5. Do NOT change meaning.
6. Do NOT reinterpret intent.
7. Only correct obvious transcription mistakes.
8. If ambiguity is high and correction is uncertain, keep original meaning.

Apply any corrections before structuring. Do not mention corrections in output. Do not note that correction occurred. Return clean structured output only.

------------------------------------------------------------
CORE RULES
------------------------------------------------------------

1. Extract EVERY explicit modification instruction.
2. Never drop an instruction.
3. Never merge separate instructions.
4. Never assume or invent additional improvements.
5. Preserve literal UI text exactly (e.g. "Contact Us", "Sign in").
6. If multiple changes are mentioned, each MUST become a separate action step.
7. If quoted strings are mentioned, preserve them exactly.
8. If colors are specified, preserve them exactly.
9. If responsive behavior is mentioned, include it as a separate action step.
10. Do not add explanations unless explicitly stated by user.

------------------------------------------------------------
TITLE RULES
------------------------------------------------------------

Title must:

- Be 4–8 words.
- Represent the overall theme of changes.
- Not repeat the entire description.
- Not exceed 10 words.
- Not include unnecessary filler.

Example:
"Update Top Navigation Buttons"
"Modify Header Button Styles"
"Adjust Navigation Layout and Colors"

------------------------------------------------------------
DESCRIPTION RULES
------------------------------------------------------------

Description must:

- Be 1 concise sentence.
- Capture all mentioned changes at a high level.
- Not exceed 25 words.
- Not remove any requested change.
- Not add context not stated.

------------------------------------------------------------
ACTION STEPS RULES
------------------------------------------------------------

For each distinct modification, create ONE atomic action step.

Example input:
"Remove Contact Us button, increase size of others, change About and Practices to red, People and News to green, ensure dropdowns work on all viewports."

Output actionSteps:

1. Remove the "Contact Us" button.
2. Increase the size of the remaining navigation buttons.
3. Change the color of "About" and "Practices" to red.
4. Change the color of "People" and "News" to green.
5. Ensure all navigation dropdowns function correctly across all viewports.

Each action step must:

- Be clear.
- Be specific.
- Be implementation-ready.
- Be one sentence.
- Not combine two separate modifications.

------------------------------------------------------------
STRICT OUTPUT FORMAT
------------------------------------------------------------

Return ONLY valid JSON.

{
  "tickets": [
    {
      "title": "Concise title",
      "description": "One-sentence summary.",
      "actionSteps": [
        "Atomic instruction 1",
        "Atomic instruction 2"
      ],
      "suggestedTags": ["UX"]
    }
  ]
}

------------------------------------------------------------
EMPTY OR INVALID INPUT
------------------------------------------------------------

If transcript is empty or unintelligible:
Return:

{
  "tickets": []
}

Do not return markdown.
Do not return explanations.
Return JSON only.
`;

/** Stable response shape. Never return {} or raw AI output. */
type StructureResponse = {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
};

function parseStructuredTickets(
  content: string | null | undefined
): Array<Record<string, unknown>> {
  if (!content || typeof content !== "string") return [];

  const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
  if (!cleaned) return [];

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object") return [];

    if (!Array.isArray(parsed.tickets)) return [];

    return parsed.tickets;
  } catch (e) {
    console.error("STRUCTURE PARSE ERROR:", e);
    return [];
  }
}

export async function POST(req: Request): Promise<Response> {
  const stableFailure = (error: string): NextResponse<StructureResponse> =>
    NextResponse.json({ success: false, tickets: [], error }, { status: 200 });

  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  if (!checkRateLimit(user.uid)) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Missing OpenAI API key" },
      { status: 200 }
    );
  }

  let body: { transcript?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return stableFailure("Invalid request body");
  }
  const transcript = body?.transcript;
  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { success: false, tickets: [], error: "No valid transcript provided" },
      { status: 200 }
    );
  }

  const ctx = body?.context as
    | {
        url?: string;
        viewportWidth?: number;
        viewportHeight?: number;
        domPath?: string | null;
        nearbyText?: string | null;
        visibleText?: string | null;
      }
    | undefined
    | null;
  const contextBlock =
    ctx && typeof ctx === "object"
      ? [
          "Page context (use to scope the feedback):",
          ctx.url != null ? `URL: ${ctx.url}` : "",
          ctx.viewportWidth != null && ctx.viewportHeight != null
            ? `Viewport: ${ctx.viewportWidth}×${ctx.viewportHeight}px`
            : "",
          ctx.domPath ? `Element: ${ctx.domPath}` : "",
          ctx.nearbyText ? `Nearby text: "${ctx.nearbyText}"` : "",
          ctx.visibleText && ctx.visibleText.trim()
            ? `Visible text from screenshot (reference only, for disambiguation):\n${ctx.visibleText.trim()}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  const userContent = contextBlock
    ? `${contextBlock}\n\nRaw feedback:\n"${transcript.trim()}"`
    : `Raw feedback:\n"${transcript.trim()}"`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: STRUCTURE_ENGINE_V2 },
        { role: "user", content: userContent },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const parsedTickets = parseStructuredTickets(content);

    const valid = parsedTickets
      .filter((t: Record<string, unknown>) => t && typeof t.title === "string")
      .map((t: Record<string, unknown>) => {
        return {
          title: t.title as string,
          description:
            typeof t.description === "string"
              ? (t.description as string)
              : (t.title as string),
          actionSteps: Array.isArray(t.actionSteps)
            ? (t.actionSteps as string[])
            : [],
          suggestedTags: Array.isArray(t.suggestedTags)
            ? (t.suggestedTags as string[])
            : [],
        };
      });

    return NextResponse.json({ success: true, tickets: valid });
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return NextResponse.json(
      { success: false, tickets: [], error: "Structuring failed" },
      { status: 200 }
    );
  }
}
