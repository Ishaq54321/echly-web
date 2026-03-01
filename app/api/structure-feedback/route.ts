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

const ADAPTIVE_STRUCTURE_SYSTEM = `You are Echly's Adaptive Structuring Engine. Your job is to intelligently adjust output depth based on feedback complexity.

MODE SELECTION (choose one for the entire response)

LIGHT MODE (default): Use for short, simple, single-issue feedback.
FULL MODE: Use when ANY of the following apply:
- Mentions errors, crashes, failures, blocking issues.
- Includes words like "not working", "can't", "broken", "error", "fails", "blocking".
- Contains multiple distinct issues.
- Is longer than ~25 words.
- Mentions checkout, login, onboarding, payment, conversion.
- Mentions performance problems.
- Expresses urgency.

RULES
- Split multiple issues into separate tickets. Never merge unrelated problems.
- No filler. No conversational tone. Output structured content only.
- Do not mention which mode you used in the output.

LIGHT MODE output (per ticket):
- Title: Clear professional rewrite.
- Actions: Concise bullet points (actionItems array).
- Tag: 1–2 relevant tags (suggestedTags). No impact. No priority.

FULL MODE output (per ticket):
- Title: Clear and scoped.
- Context Summary: 1–2 sentences.
- Action Items: Specific bullets.
- Impact: Why this matters.
- Suggested Priority: Exactly one of: Low, Medium, High, Critical.
- Suggested Tags: 2–5 relevant tags.

PRIORITY (FULL MODE ONLY)
- CRITICAL: Core functionality broken; users cannot proceed; errors; data loss or security risk; blocking.
- HIGH: Major feature impaired; strong negative UX; conversion-impacting; affects many users.
- MEDIUM: Noticeable UX flaw; design inconsistency; performance degradation but not blocking.
- LOW: Minor cosmetic; microcopy; non-urgent enhancement.
Do not default to Medium. Do not inflate severity. If ambiguous, choose the lower reasonable severity.

Allowed suggestedTags: UX, Bug, Performance, Accessibility, Copy, Visual Hierarchy, Interaction, Responsive, Backend, Data, Blocking.

Return ONLY valid JSON. No markdown, no code fence.

LIGHT MODE response shape:
{
  "mode": "light",
  "tickets": [
    {
      "title": "Clear professional title",
      "actionItems": ["Action one", "Action two"],
      "suggestedTags": ["Tag1", "Tag2"]
    }
  ]
}

FULL MODE response shape:
{
  "mode": "full",
  "tickets": [
    {
      "title": "Clear, scoped title",
      "contextSummary": "1-2 sentences.",
      "actionItems": ["Specific action"],
      "impact": "Why this matters.",
      "suggestedPriority": "Low|Medium|High|Critical",
      "suggestedTags": ["Tag1", "Tag2"]
    }
  ]
}

If the input is empty or unintelligible, return: { "mode": "light", "tickets": [] }`;

/** Stable response shape. Never return {} or raw AI output. */
type StructureResponse = {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
};

function parseStructuredTickets(
  content: string | null | undefined
): { mode: "light" | "full"; tickets: Array<Record<string, unknown>> } {
  const empty = { mode: "light" as const, tickets: [] as Array<Record<string, unknown>> };
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
    const mode = parsed.mode === "full" ? "full" : "light";
    return { mode, tickets: parsed.tickets };
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

  let body: { transcript?: unknown };
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

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: ADAPTIVE_STRUCTURE_SYSTEM },
        {
          role: "user",
          content: `Raw feedback:\n"${transcript.trim()}"`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const { mode, tickets: parsedTickets } = parseStructuredTickets(content);
    if (!Array.isArray(parsedTickets)) {
      console.error("STRUCTURING: parsedTickets is not an array", parsedTickets);
      return NextResponse.json({ success: true, tickets: [] });
    }

    const valid = parsedTickets
      .filter(
        (t: Record<string, unknown>) => t && typeof t.title === "string"
      )
      .map((t: Record<string, unknown>) => {
        const title = t.title as string;
        const actionItems = Array.isArray(t.actionItems)
          ? (t.actionItems as string[])
          : [];
        const suggestedTags = Array.isArray(t.suggestedTags)
          ? (t.suggestedTags as string[])
          : [];

        if (mode === "light") {
          return {
            title,
            contextSummary: title,
            actionItems,
            impact: null as string | null,
            suggestedPriority: "medium" as const,
            suggestedTags,
          };
        }

        return {
          title,
          contextSummary:
            typeof t.contextSummary === "string" ? t.contextSummary : title,
          actionItems,
          impact:
            typeof t.impact === "string" ? (t.impact as string) : (null as string | null),
          suggestedPriority:
            typeof t.suggestedPriority === "string" &&
            ["low", "medium", "high", "critical"].includes(
              (t.suggestedPriority as string).toLowerCase()
            )
              ? (t.suggestedPriority as string).toLowerCase()
              : "medium",
          suggestedTags,
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
