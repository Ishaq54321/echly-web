# Ticket Title Generation — Audit Report

**Date:** 2025-03-06  
**Scope:** How Echly generates the ticket title; no code changes.

---

## 1. Files Responsible for Title Generation

| File | Role |
|------|------|
| `lib/tickets/generateTicketTitle.ts` | **Title logic:** builds title from `actionSteps` (noun + change type heuristic). |
| `lib/ai/voiceToTicketPipeline.ts` | Interpreter: AI → `actions` → `actionSteps`; calls `generateTicketTitle(actionSteps)` and sets `ticket.title`. |
| `lib/ai/runFeedbackPipeline.ts` | Pass-through: forwards `result.ticket.title` and `result.ticket.actionSteps` from voice pipeline. |
| `app/api/structure-feedback/route.ts` | POST handler: calls `runFeedbackPipeline`, returns `result` (includes `ticket.title`, `ticket.actionSteps`). |
| `app/api/feedback/route.ts` | POST handler: if body has `actionSteps`, sets `title = generateTicketTitle(actionSteps)`; else uses `body.title`. Builds payload and saves via repo. |
| `lib/repositories/feedbackRepository.ts` | Persistence: `feedbackPayload()` / `addFeedbackWithSessionCountersRepo()` write `title` and `actionSteps` to Firestore. |
| `lib/ai/ticketTitle.ts` | **Optional batch path:** LLM batch titles; fallback `actionSteps[0].slice(0, 60)`. Not used by structure-feedback flow. |
| `lib/server/instructionGraph.ts` | Instruction-graph path: uses `generateTicketTitle(actionSteps)` for placeholder titles. |

---

## 2. Exact Code That Assigns the Ticket Title

### 2a. Structure-feedback flow (main path)

**`lib/ai/voiceToTicketPipeline.ts`** (lines 359–370):

```ts
const actionSteps = finalJson.actions
  .sort((a, b) => a.step - b.step)
  .map((a) => a.description.trim())
  .filter(Boolean);
const title = generateTicketTitle(actionSteps);

const ticket: VoiceTicket = {
  title,
  actionSteps,
  confidence: finalJson.confidence,
  notes: finalJson.notes || undefined,
};
```

So **title is set by `generateTicketTitle(actionSteps)`**, not by the AI and not by `actionSteps[0]` literally.

### 2b. Rule used when creating feedback from structure-feedback response

**`lib/ai/runFeedbackPipeline.ts`** (lines 86–101):

```ts
const ticketPayload = {
  title: result.ticket.title,
  description: result.ticket.notes || result.ticket.title || "",
  actionSteps: result.ticket.actionSteps,
  ...
};
return {
  ...
  ticket: {
    title: result.ticket.title,
    actionSteps: result.ticket.actionSteps,
    confidence: result.ticket.confidence,
  },
  ...
};
```

So the API response `ticket.title` is whatever the voice pipeline set (i.e. from `generateTicketTitle(actionSteps)`).

### 2c. POST /api/feedback (when client sends actionSteps)

**`app/api/feedback/route.ts`** (lines 175–184):

```ts
const actionSteps =
  Array.isArray(body.actionSteps)
    ? body.actionSteps.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim())
    : [];
const title =
  actionSteps.length > 0
    ? generateTicketTitle(actionSteps)
    : (typeof body.title === "string" ? body.title.trim() : "");
```

So when the client sends `actionSteps`, the server **recomputes** title with `generateTicketTitle(actionSteps)`; it does not use a client-supplied title in that case.

### 2d. Title heuristic (what “derived from action steps” means)

**`lib/tickets/generateTicketTitle.ts`** (lines 146–166):

```ts
export function generateTicketTitle(actionSteps: string[]): string {
  const safeSteps = Array.isArray(actionSteps) ? actionSteps.filter((s): s is string => typeof s === "string") : [];
  const combined = safeSteps.join(" ");
  const normalizedText = combined.toLowerCase()...
  const tokens = normalizeToTokens(safeSteps);
  const noun = pickNoun(tokens, normalizedText);       // e.g. "Button", "Card Layout"
  const changeType = detectChangeType(normalizedText);  // "Update" | "Adjustment" | "Addition" | "Fix"
  const title = `${limitedNoun} ${changeType}`.trim();
  // ... word limit trimming
  return title;
}
```

So the title is a **short label** (noun + change type) derived from **all** action steps combined, not the first step as a string.

---

## 3. Interpreter Response Structure

### 3a. Raw AI response (LLM output)

The interpreter does **not** return a `title` field. It returns a JSON object shaped by `FEEDBACK_JSON_SCHEMA`:

**`lib/ai/voiceToTicketPipeline.ts`** — `StructuredFeedbackJSON`:

```ts
interface StructuredFeedbackJSON {
  actions: ExtractedAction[];  // { step, description, entity, confidence }
  confidence: number;
  notes: string;
}
```

So: **actions**, **confidence**, **notes** only.

### 3b. Parsing

- **`extractStructuredFeedback()`** (same file): one GPT-4o-mini call with `response_format` json_schema; reads `completion.choices[0]?.message?.content` and passes it to `parseStructuredResponse(raw)`.
- **`parseStructuredResponse(text)`** (lines 226–255): strips optional markdown code block, `JSON.parse`, validates `o.actions` array; for each item uses `step`, `description`, `entity`, `confidence`; returns `{ actions, confidence, notes }`. No `title` in or out.

### 3c. Where title is introduced

After parsing, **`runVoiceToTicket()`** builds:

- `actionSteps = finalJson.actions.sort(...).map(a => a.description.trim()).filter(Boolean)`
- `title = generateTicketTitle(actionSteps)`

So the **title value is generated in code from `actionSteps`**, not extracted from the AI response.

---

## 4. Where actionSteps Are Stored

| Location | How actionSteps are set / stored |
|----------|-----------------------------------|
| **Voice pipeline** | `actionSteps` = `finalJson.actions` (sorted by step) → `.map(a => a.description.trim())` → `ticket.actionSteps`. |
| **runFeedbackPipeline** | `result.ticket.actionSteps` passed through to response. |
| **POST /api/feedback body** | Client may send `body.actionSteps`; server normalizes and uses for `title` and for `structuredData.actionSteps`. |
| **structuredData (route)** | `actionSteps: actionSteps.length > 0 ? actionSteps : undefined` (app/api/feedback/route.ts). |
| **feedbackRepository** | `feedbackPayload()` sets `actionSteps: data.actionSteps ?? null`; `addFeedbackWithSessionCountersRepo()` writes payload to Firestore. |
| **Firestore** | Stored on the feedback document as `actionSteps` (and legacy `actionItems` supported when reading). |

---

## 5. Where the Ticket Is Inserted into the Database

- **Entry point:** `POST /api/feedback` in **`app/api/feedback/route.ts`**.
- **Repository:** `addFeedbackWithSessionCountersRepo(sessionId, user.uid, structuredData)` in **`lib/repositories/feedbackRepository.ts`** (lines 84–106).
- **Mechanism:** Firestore transaction: `set` on a new `feedback` doc with `feedbackPayload(...)`, and `update` on the session doc (increment `openCount`, `feedbackCount`, `updatedAt`).

### Payload structure used when saving (feedback document)

From **`lib/repositories/feedbackRepository.ts`** `feedbackPayload()` (lines 28–61), the document includes:

- `sessionId`, `userId`
- `title`, `description`, `suggestion`, `type`, `status: "open"`
- `createdAt: serverTimestamp()`
- `contextSummary`, **`actionSteps`**, `suggestedTags`
- `url`, `viewportWidth`, `viewportHeight`, `userAgent`, `clientTimestamp`
- `screenshotUrl`
- Clarity fields: `clarityScore`, `clarityStatus`, `clarityIssues`, `clarityConfidence`, `clarityCheckedAt`

So the payload used when saving has **title**, **actionSteps**, **sessionId**, plus description, type, metadata, screenshot, and clarity fields — consistent with the expected shape (title, actionSteps, sessionId, context, etc.).

---

## 6. Confirmation: Does Title Come from Step 1 or Another Field?

**Conclusion:**

- **Title is not** `actionSteps[0]` as a literal string.
- **Title is not** from the AI (the interpreter does not return a `title` field).
- **Title is not** from a transcript summary field; it is computed from the **parsed action steps**.

**Exact behavior:**

- **Title** = `generateTicketTitle(actionSteps)` where `actionSteps` is the array of **all** action descriptions from the interpreter (`finalJson.actions` → descriptions, sorted by step).
- **`generateTicketTitle`** uses the **combined** text of all steps to pick a noun (e.g. “Button”, “Card Layout”) and a change type (“Update”, “Fix”, “Adjustment”, “Addition”), then returns a short phrase like `"Button Update"` or `"Card Layout Adjustment"`.

So the title is **derived from all action steps** via a heuristic in `lib/tickets/generateTicketTitle.ts`. Changing the interpreter (e.g. response shape or how actions are parsed) will only affect the title indirectly by changing the `actionSteps` array passed into `generateTicketTitle`. The single place that “assigns” the ticket title in the structure-feedback flow is **`lib/ai/voiceToTicketPipeline.ts`** line 364: `const title = generateTicketTitle(actionSteps);`.

---

## Summary Chain (AI → Parsed output → Ticket → DB)

1. **POST /api/structure-feedback** → `runFeedbackPipeline()` → `runVoiceToTicket()` in `lib/ai/voiceToTicketPipeline.ts`.
2. **AI:** One GPT call → raw JSON `{ actions, confidence, notes }` (no title).
3. **Parsing:** `parseStructuredResponse(raw)` → `StructuredFeedbackJSON`; optional review pass if confidence < 0.85.
4. **actionSteps:** `finalJson.actions` sorted by step → `.map(a => a.description.trim())` → `actionSteps[]`.
5. **Title:** `title = generateTicketTitle(actionSteps)` in `voiceToTicketPipeline.ts` (line 364).
6. **Ticket object:** `{ title, actionSteps, confidence, notes }` returned from `runVoiceToTicket`; passed through `runFeedbackPipeline` and returned in API response.
7. **Client** (e.g. dashboard/extension) sends that ticket’s `title` and `actionSteps` to **POST /api/feedback** (or server recomputes title from `actionSteps` in that route).
8. **DB:** `app/api/feedback/route.ts` builds `structuredData` (including `title`, `actionSteps`) → `addFeedbackWithSessionCountersRepo()` → Firestore feedback document.

No code was modified; this is an audit only.
