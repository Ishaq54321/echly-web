import type { NextRequest } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { checkAiImproveRateLimit } from "@/lib/ai/rateLimit";
import { checkAiQuota, incrementAiQuotaAsync } from "@/lib/ai/quotaCheck";
import { isImproveAction, buildSystemPrompt } from "@/lib/ai/prompts/improveDescription";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_INPUT_CHARS = 16_000;

export async function POST(req: NextRequest): Promise<Response> {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  const rateLimit = checkAiImproveRateLimit(user.uid);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
        },
      },
    );
  }

  try {
    const quotaResult = await checkAiQuota(user.uid);
    if (!quotaResult.allowed) {
      return Response.json(
        {
          error: "Monthly quota exceeded",
          quotaType: quotaResult.quotaType,
          used: quotaResult.used,
          limit: quotaResult.limit,
          resetDate: quotaResult.resetDate,
        },
        { status: 429 },
      );
    }
    incrementAiQuotaAsync(user.uid);
  } catch (err) {
    console.error("Quota check failed:", err);
  }

  let body: { action?: unknown; text?: unknown };
  try {
    body = (await req.json()) as { action?: unknown; text?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, text } = body;

  if (!isImproveAction(action)) {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  if (typeof text !== "string" || text.length === 0) {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }

  if (text.length > MAX_INPUT_CHARS) {
    return Response.json(
      {
        error: "Text too long",
        errorCode: "TEXT_TOO_LONG",
        currentLength: text.length,
        maxLength: MAX_INPUT_CHARS,
      },
      { status: 400 },
    );
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildSystemPrompt(action),
    prompt: text,
    temperature: 0.3,
  });

  const encoder = new TextEncoder();
  const sseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`),
      );

      try {
        for await (const chunk of result.textStream) {
          if (chunk) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`,
              ),
            );
          }
        }

        const fullText = await result.text;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "end", fullText })}\n\n`,
          ),
        );
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
