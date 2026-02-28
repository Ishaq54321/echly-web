import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OpenAI API key" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const transcript = body?.transcript;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "No valid transcript provided" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2, // lower = less creative
      messages: [
        {
          role: "system",
          content: `
You are Echly's structured feedback engine.

Your job is to convert raw spoken feedback into a clean, professional issue report.

STRICT RULES:
- Do NOT invent facts.
- Do NOT assume causes.
- Do NOT add features or solutions.
- Do NOT speculate.
- Only refine what is explicitly stated.
- If information is unclear, keep wording neutral.
- Do not add extra context beyond the transcript.
- Do not include explanations outside JSON.

Classify the issue into ONE of:
Bug
UX Issue
UI Issue
Copy Issue
Performance

Return ONLY valid JSON with this exact structure:

{
  "title": "Concise professional issue title (max 12 words)",
  "description": "Clear, neutral, professional description of the issue",
  "type": "Bug | UX Issue | UI Issue | Copy Issue | Performance"
}
`
        },
        {
          role: "user",
          content: `Raw feedback:\n"${transcript}"`
        }
      ]
    });

    let content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Remove markdown wrapping if present
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(content);

    // Extra safety validation
    if (!parsed.title || !parsed.description || !parsed.type) {
      throw new Error("Invalid AI response structure");
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("AI STRUCTURE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to structure feedback" },
      { status: 500 }
    );
  }
}