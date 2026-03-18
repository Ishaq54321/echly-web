import { NextResponse } from "next/server";
import OpenAI from "openai";
import { estimateCost } from "@/lib/ai/costEstimator";
import {
  getSessionByIdRepo,
  updateSessionAiInsightSummaryRepo,
  updateSessionRepo,
} from "@/lib/repositories/sessionsRepository";
import {
  getSessionFeedbackPageWithStringCursorRepo,
  getSessionFeedbackTotalCountRepo,
} from "@/lib/repositories/feedbackRepository";

type SessionInsightBody = { sessionId?: unknown };

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

export async function POST(req: Request) {
  const requestStart = Date.now();
  console.log("[REQUEST START]", "session-insight", requestStart);

  try {
    const { sessionId } = (await req.json()) as { sessionId?: unknown };

    if (typeof sessionId !== "string" || !sessionId.trim()) {
      console.log("[REQUEST END]", "session-insight", Date.now() - requestStart);
      return NextResponse.json({ success: false }, { status: 200 });
    }

    const cleanSessionId = sessionId.trim();

    // ✅ BEFORE RESPONSE: ONLY parse body, validate sessionId, update status
    // Fire-and-forget so the API response is never blocked on Firestore latency.
    void updateSessionRepo(cleanSessionId, {
      aiInsightStatus: "processing",
      aiInsightRequestedAt: Date.now(),
    }).catch((e) => {
      console.error("[STATUS UPDATE FAILED]", cleanSessionId, e);
    });

    // 🚀 BACKGROUND JOB (NO AWAIT)
    // Use setTimeout to ensure it starts after the response is returned.
    setTimeout(() => {
      void (async () => {
        try {
          console.log("[INSIGHT JOB START]", cleanSessionId);

          // ✅ FETCH SESSION HERE INSTEAD (NO FIRESTORE READ ON REQUEST PATH)
          const session = await getSessionByIdRepo(cleanSessionId);
          if (!session) return;

          // 🔥 MOVE ALL HEAVY WORK HERE
          const SESSION_INSIGHT_FEEDBACK_LIMIT = 200;
          const [totalCount, { feedback }] = await Promise.all([
            getSessionFeedbackTotalCountRepo(cleanSessionId),
            getSessionFeedbackPageWithStringCursorRepo(
              cleanSessionId,
              SESSION_INSIGHT_FEEDBACK_LIMIT,
              undefined
            ),
          ]);

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
          const context = truncate(
            (f.contextSummary ?? f.description ?? "").trim(),
            CONTEXT_MAX_CHARS
          );
          const tagList = Array.isArray(f.suggestedTags)
            ? (f.suggestedTags as string[]).join(", ")
            : "";
          const steps = Array.isArray(f.actionSteps)
            ? (f.actionSteps as string[]).join(" ")
            : "";
          const stepsShort = steps ? truncate(steps, ACTION_SUMMARY_MAX_CHARS) : "";
          condensedLines.push(`${i + 1}. Title: ${title}`);
          condensedLines.push(`   Context: ${context || "—"}`);
          condensedLines.push(`   Tags: ${tagList || "—"}`);
          if (stepsShort) condensedLines.push(`   Action: ${stepsShort}`);
          condensedLines.push("");
        });

        const userContent = condensedLines.join("\n");

        // build prompt
        // call OpenAI
        // process result
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
            await updateSessionRepo(cleanSessionId, {
              aiInsightStatus: "failed",
              aiInsightError: "Empty summary from model",
            });
            console.log("[INSIGHT JOB DONE]", cleanSessionId, "(no summary)");
            return;
          }

          await updateSessionAiInsightSummaryRepo(
            cleanSessionId,
            summary,
            totalCount
          );

          await updateSessionRepo(cleanSessionId, {
            aiInsightStatus: "completed",
            aiInsightCompletedAt: Date.now(),
          });

          console.log("[INSIGHT JOB DONE]", cleanSessionId);
        } catch (e) {
          await updateSessionRepo(cleanSessionId, {
            aiInsightStatus: "failed",
            aiInsightError: String(e),
          });

          console.error("[INSIGHT JOB FAILED]", cleanSessionId, e);
        }
      })();
    }, 0);

    return NextResponse.json(
      {
        success: true,
        status: "processing",
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("[REQUEST END]", "session-insight", Date.now() - requestStart);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

