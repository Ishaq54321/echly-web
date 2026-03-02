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
You are Echly's Feedback Structuring Engine.

Your job is to transform raw spoken feedback into structured, minimal, professional tickets.

CORE PRINCIPLES
- Do NOT assume anything not explicitly stated.
- Do NOT add improvements, suggestions, or UX advice.
- Do NOT infer intent beyond the provided text.
- Do NOT exaggerate severity.
- Do NOT generate impact, priority, or explanations.
- Only structure what the user clearly said.

If input is empty or unclear, return empty tickets.

TITLE RULES
- 4–8 words maximum.
- Extremely clear and scannable.
- Must describe the core change or issue.
- No filler words.
- No repetition of full description.
- No generic phrases like "Improve UX".

DESCRIPTION RULES
- Exactly 1 short sentence.
- Slightly clearer than title.
- No invented context.
- No assumptions.
- Keep under 20 words if possible.

ACTION STEPS RULES
- Based ONLY on explicit instructions.
- One action per distinct instruction.
- If user mentions 3 changes → return 3 actionSteps.
- If user mentions 1 change → return 1 actionStep.
- Keep each action step to 1 concise sentence.
- No "investigate" unless user clearly says something is unclear.

SPLITTING RULE
If the user describes clearly separate unrelated issues, split into multiple tickets.
Otherwise keep as one ticket.

ALLOWED TAGS
UX, Bug, Performance, Accessibility, Copy, Visual Hierarchy, Interaction, Responsive, Backend, Data

Use only 1–3 relevant tags.
If unsure, choose fewer.

RESPONSE FORMAT (JSON only)

{
  "tickets": [
    {
      "title": "Short clear title",
      "description": "One sentence summary.",
      "actionSteps": ["Step one.", "Step two."],
      "suggestedTags": ["UX"]
    }
  ]
}

Return ONLY valid JSON.
No markdown.
No explanation.
`;

/** Stable response shape. Never return {} or raw AI output. */
type StructureResponse = {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
};

function parseStructuredTickets(
  content: string | null | undefined
): { tickets: Array<Record<string, unknown>> } {
  const empty = { tickets: [] as Array<Record<string, unknown>> };
  if (content == null || typeof content !== "string") return empty;
  const trimmed = content.replace(/```json/g, "").replace(/```/g, "").trim();
  if (!trimmed) return empty;
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object") return empty;
    if (!Array.isArray(parsed.tickets)) {
      console.error("STRUCTURING: parsed.tickets is not an array", parsed);
      return empty;
    }
    return { tickets: parsed.tickets };
  } catch (e) {
    console.error("STRUCTURING: JSON parse failed", e);
    return empty;
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
    | { url?: string; viewportWidth?: number; viewportHeight?: number; domPath?: string | null; nearbyText?: string | null }
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
    const { tickets: parsedTickets } = parseStructuredTickets(content);
    if (!Array.isArray(parsedTickets)) {
      console.error("STRUCTURING: parsedTickets is not an array", parsedTickets);
      return NextResponse.json({ success: true, tickets: [] });
    }

    const valid = parsedTickets
      .filter(
        (t: Record<string, unknown>) => t && typeof t.title === "string"
      )
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
