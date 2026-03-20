import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";
import { estimateCost } from "@/lib/ai/costEstimator";
import { getSessionByIdRepo, updateSessionAiInsightSummaryRepo } from "@/lib/repositories/sessionsRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { getSessionFeedbackPageWithStringCursorRepo } from "@/lib/repositories/feedbackRepository";
import { resolveSessionFeedbackCounts } from "@/lib/server/resolveSessionFeedbackCounts";

type SessionInsightBody = { sessionId?: unknown };

type SessionInsightResponse = {
  success: boolean;
  summary: string | null;
  generated: boolean;
  cached: boolean;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SESSION_INSIGHT_SYSTEM_PROMPT = `
You are Echly’s Session Intelligence Engine.

Your task:
Generate a concise executive-level summary strictly based on the provided feedback data.

Summarize patterns across ALL provided feedback items. Do not focus only on the most recent entries.

RULES:

1. Use ONLY the information explicitly present in:
   - Titles
   - Context summaries
   - Action steps
   - Tags

2. Do NOT:
   - Infer business impact unless explicitly stated.
   - Assume user intent.
   - Generalize beyond visible repetition.
   - Add strategic interpretation.
   - Add improvement suggestions.
   - Add recommendations.
   - Add urgency unless explicitly mentioned.
   - Use marketing tone.

3. If patterns are not clearly repeated, do NOT fabricate themes.

4. If feedback items are unrelated, summarize them neutrally without forcing a narrative.

5. Keep summary:
   - Maximum 3 sentences.
   - Maximum 90–120 words total.
   - Calm.
   - Factual.
   - Direct.
   - No filler phrases.
   - Even for sessions with many items, stay within this limit.

6. Do not use:
   - "This suggests"
   - "This indicates"
   - "Overall"
   - "In conclusion"
   - "It appears that"
   - "Users may be experiencing"

7. Do not mention AI.
8. Do not mention assumptions.
9. Do not format with markdown.
10. Return plain text only.

If there is insufficient meaningful pattern or volume, return null.
`.trim();

function normalizeSummary(text: string): string {
  const cleaned = text
    .replace(/```/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

const STOPWORDS = new Set(
  [
    "the","a","an","and","or","but","if","then","else","when","while","with","without","within",
    "to","of","in","on","for","from","by","as","at","into","over","under","about","across",
    "is","are","was","were","be","been","being","it","its","this","that","these","those",
    "i","we","you","they","he","she","them","us","our","your",
    "not","no","yes",
    "can","could","should","would","will","may","might","must",
    "do","does","did","done",
    "have","has","had",
    "more","most","less","least",
    "very","really","just","also",
  ]
);

function tokenizeKeywords(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/g)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function hasOverlappingTags(tags: string[][]): boolean {
  const counts = new Map<string, number>();
  for (const arr of tags) {
    const uniq = new Set(
      arr
        .filter((t) => typeof t === "string")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => t.toLowerCase())
    );
    for (const t of uniq) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
      if ((counts.get(t) ?? 0) >= 2) return true;
    }
  }
  return false;
}

function hasRepeatedKeywords(textBlocks: string[]): boolean {
  const counts = new Map<string, number>();
  for (const block of textBlocks) {
    for (const w of tokenizeKeywords(block)) {
      counts.set(w, (counts.get(w) ?? 0) + 1);
      // Conservative: require the same keyword to appear 3+ times
      if ((counts.get(w) ?? 0) >= 3) return true;
    }
  }
  return false;
}

export async function POST(req: Request): Promise<Response> {
  const stable = (data: SessionInsightResponse) =>
    NextResponse.json(data, { status: 200 });

  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: SessionInsightBody;
  try {
    body = (await req.json()) as SessionInsightBody;
  } catch {
    return stable({ success: false, summary: null, generated: false, cached: false });
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return stable({ success: false, summary: null, generated: false, cached: false });
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return stable({ success: false, summary: null, generated: false, cached: false });
  }
  if (session.userId !== user.uid) {
    return stable({ success: false, summary: null, generated: false, cached: false });
  }

  const workspaceId = session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await resolveWorkspaceById(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    throw err;
  }

  const { total: totalCount } = await resolveSessionFeedbackCounts(
    sessionId,
    session as unknown as Record<string, unknown>
  );
  const cachedSummary =
    typeof (session as unknown as { aiInsightSummary?: unknown }).aiInsightSummary === "string"
      ? ((session as unknown as { aiInsightSummary: string }).aiInsightSummary ?? "").trim()
      : "";
  const cachedCount =
    typeof (session as unknown as { aiInsightSummaryFeedbackCount?: unknown }).aiInsightSummaryFeedbackCount === "number"
      ? (session as unknown as { aiInsightSummaryFeedbackCount: number }).aiInsightSummaryFeedbackCount
      : null;

  if (cachedSummary && cachedCount === totalCount) {
    return stable({
      success: true,
      summary: cachedSummary,
      generated: false,
      cached: true,
    });
  }

  if (totalCount <= 0) {
    return stable({ success: true, summary: null, generated: false, cached: false });
  }

  const SESSION_INSIGHT_FEEDBACK_LIMIT = 200;
  const { feedback } = await getSessionFeedbackPageWithStringCursorRepo(
    sessionId,
    SESSION_INSIGHT_FEEDBACK_LIMIT,
    undefined
  );

  const tags = feedback.map((f) =>
    Array.isArray(f.suggestedTags) ? (f.suggestedTags as string[]) : []
  );
  const keywordTextBlocks = feedback.flatMap((f) => {
    const blocks: string[] = [];
    if (typeof f.title === "string") blocks.push(f.title);
    if (typeof f.contextSummary === "string") blocks.push(f.contextSummary);
    if (Array.isArray(f.actionSteps)) blocks.push(f.actionSteps.join(" "));
    return blocks;
  });

  const shouldTrigger =
    totalCount >= 5 ||
    hasOverlappingTags(tags) ||
    hasRepeatedKeywords(keywordTextBlocks);

  if (!shouldTrigger) {
    return stable({ success: true, summary: null, generated: false, cached: false });
  }

  if (!process.env.OPENAI_API_KEY) {
    return stable({ success: false, summary: null, generated: false, cached: false });
  }

  const ACTION_SUMMARY_MAX_CHARS = 120;
  const CONTEXT_MAX_CHARS = 300;
  function truncate(s: string, max: number): string {
    const t = (s ?? "").trim();
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + "…";
  }
  const condensedLines: string[] = [
    `Session feedback count: ${totalCount}`,
    `Feedback items (up to ${SESSION_INSIGHT_FEEDBACK_LIMIT} most recent):`,
    "",
  ];
  feedback.forEach((f, i) => {
    const title = (f.title ?? "").trim() || "—";
    const context = truncate((f.contextSummary ?? f.description ?? "").trim(), CONTEXT_MAX_CHARS);
    const tagList = Array.isArray(f.suggestedTags) ? (f.suggestedTags as string[]).join(", ") : "";
    const steps = Array.isArray(f.actionSteps) ? (f.actionSteps as string[]).join(" ") : "";
    const stepsShort = steps ? truncate(steps, ACTION_SUMMARY_MAX_CHARS) : "";
    condensedLines.push(`${i + 1}. Title: ${title}`);
    condensedLines.push(`   Context: ${context || "—"}`);
    condensedLines.push(`   Tags: ${tagList || "—"}`);
    if (stepsShort) condensedLines.push(`   Action: ${stepsShort}`);
    condensedLines.push("");
  });
  const userContent = condensedLines.join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 160,
      messages: [
        { role: "system", content: SESSION_INSIGHT_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const usage = completion.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const cost = estimateCost("gpt-4o-mini", promptTokens, completionTokens);
    console.log("[AI COST]", {
      stage: "session_insight",
      model: "gpt-4o-mini",
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const summary = normalizeSummary(raw);
    if (!summary) {
      return stable({ success: false, summary: null, generated: false, cached: false });
    }

    await updateSessionAiInsightSummaryRepo(sessionId, summary, totalCount);

    return stable({ success: true, summary, generated: true, cached: false });
  } catch {
    return stable({ success: false, summary: null, generated: false, cached: false });
  }
}

