import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";
import {
  detectHighConfidencePatterns,
  type DetectedPattern,
} from "@/lib/server/patternDetection";
import { anchorProperNouns } from "@/lib/server/properNounAnchoring";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitMap = new Map<
  string,
  { count: number; windowStart: number }
>();

function extractScreenEntities(text: string | null | undefined): string[] {
  if (!text) return [];
  const cleaned = text.replace(/[.,]/g, "");
  const tokens = cleaned.split(/\s+/);

  const entities: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (/^[A-Z][a-z]+/.test(tokens[i])) {
      const phrase = [tokens[i]];
      let j = i + 1;
      while (j < tokens.length && /^[A-Z][a-z]+/.test(tokens[j])) {
        phrase.push(tokens[j]);
        j++;
      }
      entities.push(phrase.join(" "));
    }
  }

  return Array.from(new Set(entities));
}

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
You are Echly's Precision Structuring Engine. Extract EXACT modification instructions from user feedback. You are NOT summarizing, deciding what matters, simplifying away details, or inventing improvements.

------------------------------------------------------------
CONTEXT PRIORITY RULES
------------------------------------------------------------

1. The transcript is the primary source of truth.
2. Visible screenshot text is secondary reference only.
3. If the transcript mentions elements not present in visible text: still process normally. Do NOT reject or question.
4. Do NOT assume instructions are limited to visible content.
5. Do NOT override transcript meaning using screenshot text.
6. Use visible text only for resolving ambiguous references and correcting obvious speech-to-text errors. Transcript always takes priority.

------------------------------------------------------------
TRANSCRIPT CORRECTION
------------------------------------------------------------

If a word is clearly a speech-to-text error and the correction is highly probable in UI/design context, silently correct it. Do not reinterpret meaning.

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
CHANGE INSTRUCTION HANDLING
------------------------------------------------------------

When the transcript contains a clear "change X to Y" pattern:

1. Always preserve BOTH:
   - The original value (X)
   - The new value (Y)

2. Do NOT compress into only the new value.

3. Action step must be formatted as:
   "Change [element] from 'X' to 'Y'."

4. If original value exists in visible text, prefer that exact spelling.

5. Do not drop the original phrase unless it is completely unintelligible.

Examples:

Transcript:
"Change Schedule & Begin Treatment to Meet with our care team"

Correct action step:
"Change title text from 'Schedule & Begin Treatment' to 'Meet with our care team'."

Never output only:
"Meet with our care team."

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
CLARITY EVALUATION RULES
------------------------------------------------------------

Evaluate the feedback transcript for clarity. You must:

- Score clarity from 0–100 (100 = fully clear and actionable).
- Identify vague language (e.g. "something", "maybe", "better", "fix it").
- Detect non-actionable phrasing (e.g. pure opinion with no concrete change).
- Detect emotional or subjective statements that lack a clear UI change.
- Detect missing expected outcome (user intent unclear).
- If clarityScore < 75: suggest a short rewrite that preserves intent but is more specific and actionable. Otherwise set suggestedRewrite to null.
- Provide confidence 0–1 for your clarity assessment.

Rules:
- clarityScore: integer 0–100.
- clarityIssues: array of short strings (e.g. "Vague language", "Missing expected outcome"). Empty array [] if none.
- suggestedRewrite: string or null. Null if clarityScore >= 75.
- confidence: float 0–1.

------------------------------------------------------------
STRICT OUTPUT FORMAT
------------------------------------------------------------

Return ONLY valid JSON in this exact shape:

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
  ],
  "clarityScore": number,
  "clarityIssues": string[],
  "suggestedRewrite": string | null,
  "confidence": number
}

- clarityScore: 0–100.
- clarityIssues: empty array if none.
- suggestedRewrite: null if clarityScore >= 75.
- confidence: 0–1 float.

------------------------------------------------------------
EMPTY OR INVALID INPUT
------------------------------------------------------------

If transcript is empty or unintelligible:
Return:

{
  "tickets": [],
  "clarityScore": 0,
  "clarityIssues": ["Empty or unintelligible input"],
  "suggestedRewrite": null,
  "confidence": 0.5
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
  clarityScore?: number;
  clarityIssues?: string[];
  suggestedRewrite?: string | null;
  confidence?: number;
};

export type ParseStructureResult = {
  tickets: Array<Record<string, unknown>>;
  clarityScore: number;
  clarityIssues: string[];
  suggestedRewrite: string | null;
  confidence: number;
};

function parseStructureResponse(
  content: string | null | undefined
): ParseStructureResult {
  const empty: ParseStructureResult = {
    tickets: [],
    clarityScore: 100,
    clarityIssues: [],
    suggestedRewrite: null,
    confidence: 0.5,
  };
  if (!content || typeof content !== "string") return empty;

  const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
  if (!cleaned) return empty;

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object") return empty;

    const tickets = Array.isArray(parsed.tickets) ? parsed.tickets : [];
    const clarityScore =
      typeof parsed.clarityScore === "number" && parsed.clarityScore >= 0 && parsed.clarityScore <= 100
        ? parsed.clarityScore
        : 100;
    const clarityIssues = Array.isArray(parsed.clarityIssues)
      ? parsed.clarityIssues.filter((x: unknown) => typeof x === "string")
      : [];
    const suggestedRewrite =
      parsed.suggestedRewrite != null && typeof parsed.suggestedRewrite === "string"
        ? parsed.suggestedRewrite
        : null;
    const confidence =
      typeof parsed.confidence === "number" && parsed.confidence >= 0 && parsed.confidence <= 1
        ? parsed.confidence
        : 0.5;

    return {
      tickets,
      clarityScore,
      clarityIssues,
      suggestedRewrite,
      confidence,
    };
  } catch (e) {
    console.error("STRUCTURE PARSE ERROR:", e);
    return empty;
  }
}

function buildStructuralHintsBlock(patterns: DetectedPattern[]): string {
  if (patterns.length === 0) return "";
  const lines: string[] = [
    "------------------------------------------------------------",
    "DETECTED STRUCTURAL HINTS",
    "------------------------------------------------------------",
    "",
  ];
  for (const p of patterns) {
    if (p.type === "change") {
      lines.push("Detected explicit change:", `From: "${p.from}"`, `To: "${p.to}"`, "");
    } else if (p.type === "replace") {
      lines.push("Detected explicit replacement:", `From: "${p.from}"`, `To: "${p.to}"`, "");
    } else if (p.type === "remove") {
      lines.push("Detected explicit removal target:", `Target: "${p.target}"`, "");
    } else if (p.type === "colorChange") {
      lines.push("Detected explicit color change:", `From: "${p.from}"`, `To: "${p.to}"`, "");
    }
  }
  return lines.join("\n");
}

function actionStepsContainBoth(
  tickets: Array<Record<string, unknown>>,
  from: string,
  to: string
): boolean {
  const steps = tickets.flatMap((t) =>
    Array.isArray(t.actionSteps) ? (t.actionSteps as string[]) : []
  );
  return steps.some(
    (s) => typeof s === "string" && s.includes(from) && s.includes(to)
  );
}

const RETRY_SYSTEM_APPEND = `

IMPORTANT:
The transcript contains an explicit change instruction.
The action step MUST preserve both original and new values exactly.
Do not compress. Do not omit the original phrase.`;

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
    const ctxDebug = body?.context as {
      url?: string;
      viewportWidth?: number;
      viewportHeight?: number;
      domPath?: string | null;
      nearbyText?: string | null;
      visibleText?: string | null;
    } | undefined;
    console.log("====== STRUCTURE API REQUEST ======");
    console.log("RAW BODY:", body);
    console.log("BODY.transcript:", body?.transcript);
    console.log("BODY.context:", ctxDebug);
    console.log("BODY.context.visibleText:", ctxDebug?.visibleText);
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

  console.log("[STRUCTURE] Received visibleText:", ctx?.visibleText);
  console.log("[STRUCTURE] Original transcript:", transcript);
  const originalTranscript = transcript;
  const correctedTranscript = anchorProperNouns(
    originalTranscript,
    ctx?.visibleText ?? null
  );
  console.log("ANCHOR INPUT transcript:", originalTranscript);
  console.log("ANCHOR INPUT visibleText:", ctx?.visibleText);
  console.log("ANCHOR OUTPUT correctedTranscript:", correctedTranscript);
  console.log("===================================");
  console.log("[STRUCTURE] Corrected transcript:", correctedTranscript);

  const patternData = detectHighConfidencePatterns(correctedTranscript);
  const hintsBlock =
    patternData.detectedPatterns.length > 0
      ? buildStructuralHintsBlock(patternData.detectedPatterns)
      : "";
  const entities = extractScreenEntities(ctx?.visibleText);
  const screenRefBlock =
    entities.length > 0
      ? [
          "------------------------------------------------------------",
          "SCREEN TEXT REFERENCE",
          "------------------------------------------------------------",
          "",
          "The following labels and proper nouns appear in the screenshot.",
          "Use them only to resolve ambiguous references or fix obvious transcription errors.",
          "",
          ...entities.map((e) => `- ${e}`),
          "",
          "Do not assume all instructions are limited to these.",
          "Do not override transcript meaning.",
        ].join("\n")
      : "";
  const rawFeedbackLine = `Raw feedback:\n"${correctedTranscript.trim()}"`;
  const userContent = [contextBlock, hintsBlock, screenRefBlock, rawFeedbackLine]
    .filter(Boolean)
    .join("\n\n");

  // Verification: confirm which transcript is sent to structure extraction
  const transcriptSentToExtraction = correctedTranscript.trim();
  console.log("[VERIFY] Original transcript:", originalTranscript);
  console.log("[VERIFY] Corrected transcript (anchor output):", correctedTranscript);
  console.log("[VERIFY] Transcript actually sent into structure extraction (in user message):", transcriptSentToExtraction);

  if (process.env.NODE_ENV !== "production") {
    console.log("Original transcript:", originalTranscript);
    console.log("Corrected transcript:", correctedTranscript);
    console.log("Detected patterns:", patternData);
    console.log("Screen entities:", entities);
  }

  try {
    const systemContent = STRUCTURE_ENGINE_V2;
    let parsedTickets: Array<Record<string, unknown>> = [];

    const runCompletion = async (system: string) => {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 600,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
      });
      return completion.choices[0]?.message?.content ?? null;
    };

    let content = await runCompletion(systemContent);
    let lastJsonContent: string | null = content;
    let parsed = parseStructureResponse(content);
    parsedTickets = parsed.tickets;

    const changeOrReplace = patternData.detectedPatterns.find(
      (p): p is DetectedPattern & { from: string; to: string } =>
        p.type === "change" || p.type === "replace"
    );

    if (
      changeOrReplace &&
      !actionStepsContainBoth(
        parsedTickets,
        changeOrReplace.from,
        changeOrReplace.to
      )
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[structure-feedback] retry triggered (change/replace validation failed)");
      }
      const retryContent = await runCompletion(
        systemContent + RETRY_SYSTEM_APPEND
      );
      lastJsonContent = retryContent;
      parsed = parseStructureResponse(retryContent);
      parsedTickets = parsed.tickets;

      if (
        !actionStepsContainBoth(
          parsedTickets,
          changeOrReplace.from,
          changeOrReplace.to
        )
      ) {
        const reconstructedStep = `Change [element] from '${changeOrReplace.from}' to '${changeOrReplace.to}'.`;
        const firstWithSteps = parsedTickets.find(
          (t) => Array.isArray(t.actionSteps) && (t.actionSteps as string[]).length > 0
        );
        const targetTicket = firstWithSteps ?? parsedTickets[0];
        if (targetTicket && typeof targetTicket === "object") {
          targetTicket.actionSteps = [reconstructedStep];
        } else {
          parsedTickets = [
            {
              title: "Update content",
              description: correctedTranscript.trim().slice(0, 80),
              actionSteps: [reconstructedStep],
              suggestedTags: ["Content"],
            },
          ];
        }
      }
    }

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

    const finalParsed = lastJsonContent ? parseStructureResponse(lastJsonContent) : parsed;
    const clarityScore = finalParsed.clarityScore;
    const clarityIssues = finalParsed.clarityIssues;
    const suggestedRewrite = finalParsed.suggestedRewrite;
    const confidence = finalParsed.confidence;

    console.log("CLARITY API OUTPUT", {
      clarityScore,
      clarityIssues,
      suggestedRewrite,
      confidence,
    });

    return NextResponse.json({
      success: true,
      tickets: valid,
      clarityScore,
      clarityIssues,
      suggestedRewrite,
      confidence,
    });
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return NextResponse.json(
      { success: false, tickets: [], error: "Structuring failed" },
      { status: 200 }
    );
  }
}
