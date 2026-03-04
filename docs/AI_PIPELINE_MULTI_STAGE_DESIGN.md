# Echly Multi-Stage AI Reasoning Pipeline — Design

**Goal:** 80–90% of generated tickets are immediately actionable by engineers, with minimal misinterpretation and no misleading tickets when intent is unclear.

**Principle:** Reliability over creativity. Prefer conservative interpretation; when uncertainty is high, return `needs_clarification: true` instead of a guessed ticket.

---

## 1. Architecture Overview

Replace the current **INPUT → AI → TICKET** flow with a **multi-stage reasoning pipeline**:

```
INPUT LAYER
  (transcript, screenshot, OCR text, context metadata, optional targetElement)
        ↓
  STAGE 1: INTENT UNDERSTANDING
        ↓
  STAGE 2: CHANGE CLASSIFICATION
        ↓
  STAGE 3: STRUCTURED TICKET GENERATION
        ↓
  STAGE 4: VERIFICATION PASS
        ↓
  OUTPUT: tickets[] | { needs_clarification: true }
```

Each stage has a single responsibility, constrained prompts, and structured output. Verification can reject the ticket and ask for clarification instead of returning a low-confidence result.

---

## 2. Input Layer

**Consumers:** Extension (content/background), Dashboard (SessionPageClient).

**Payload to pipeline:**

| Field | Type | Source | Purpose |
|-------|------|--------|---------|
| `transcript` | string | Voice STT | Primary source of truth |
| `screenshot` | base64 or URL | Capture | Optional; used for OCR and visual reference |
| `visibleText` | string | OCR on screenshot | Disambiguation, anchoring (existing) |
| `context.url` | string | Page | Scope and reference |
| `context.viewportWidth` / `viewportHeight` | number | Page | Layout context |
| `context.domPath` | string \| null | Element selection | **Target element** (see Element Targeting) |
| `context.nearbyText` | string \| null | Element selection | Label/heading near target |
| `context.boundingBox` | { x, y, w, h } \| null | Element selection | Optional visual reference |

**Existing code:** `app/api/structure-feedback/route.ts` already accepts `body.transcript` and `body.context` (url, viewportWidth, viewportHeight, domPath, nearbyText, visibleText). Extend `context` with optional `boundingBox` and standardize the name `targetElement` in prompts (logically: domPath + nearbyText = targetElement description).

---

## 3. Stage 1 — Intent Understanding

**Purpose:** Extract *what* the user wants changed, *what type* of change it is, and *which UI element* it refers to. No ticket text yet—only structured intent.

**Input:** Transcript (optionally anchored with visibleText), context (including targetElement: domPath, nearbyText).

**Output (structured JSON):**

```json
{
  "intent_type": "color_change",
  "target_element": "hero CTA button",
  "confidence": 0.82,
  "key_phrases": ["increase contrast", "hero button", "blends into background"]
}
```

**Intent types (closed set):**  
`color_change` | `text_change` | `layout_adjustment` | `remove_element` | `add_element` | `behavior_change` | `style_change` | `content_edit` | `other`

**Rules:**

- If the client sent `context.domPath` + `context.nearbyText`, treat that as the **prioritized target element**. Use it to resolve “this button”, “that link”, etc. Output `target_element` as a short, human-readable label (e.g. “hero CTA button”) derived from nearbyText/domPath/transcript.
- Confidence is 0–1. If transcript is vague or contradicts targetElement, set confidence lower.
- Do not invent intents not supported by the transcript. If unclear, use `intent_type: "other"` and lower confidence.

**Prompt (concise):**

```
You are Echly's Intent Extractor. Output ONLY valid JSON.

Input:
- Transcript: "{transcript}"
- Visible text (reference): {visibleText}
- Target element (user-selected, prioritize this): {domPath + nearbyText or "none"}

Tasks:
1. Determine what the user wants changed (one of: color_change, text_change, layout_adjustment, remove_element, add_element, behavior_change, style_change, content_edit, other).
2. Identify which UI element they mean. If target element is provided, use it as the primary referent.
3. Extract 1–5 key phrases that capture the request.
4. Set confidence 0–1 (low if vague or ambiguous).

Output format (JSON only, no markdown):
{
  "intent_type": "string",
  "target_element": "short label or null",
  "confidence": number,
  "key_phrases": ["string"]
}
```

**Implementation:** Either a dedicated internal function/call (same route, sequential) or a single “reasoning” prompt that outputs intent + classification in one go (see Stage 2). Prefer **two separate calls** for clarity and to avoid one long prompt doing too much.

---

## 4. Stage 2 — Change Classification

**Purpose:** Map intent + transcript into a single **category** for routing and tagging. Feeds into suggestedTags and helps verification.

**Input:** Transcript, Stage 1 output (intent_type, target_element, confidence, key_phrases).

**Output (structured JSON):**

```json
{
  "category": "accessibility_improvement",
  "confidence": 0.88
}
```

**Categories (closed set):**  
`UI change` | `Content change` | `Layout adjustment` | `Bug report` | `UX improvement` | `Accessibility improvement` | `Other`

**Rules:**

- One category per feedback. Prefer the most specific match.
- Confidence 0–1. If intent was “other” or vague, category may be “Other” with lower confidence.

**Prompt (concise):**

```
You are Echly's Change Classifier. Output ONLY valid JSON.

Input:
- Transcript: "{transcript}"
- Intent type: {intent_type}
- Target element: {target_element}

Classify into exactly one category: "UI change" | "Content change" | "Layout adjustment" | "Bug report" | "UX improvement" | "Accessibility improvement" | "Other".

Output format (JSON only):
{
  "category": "string",
  "confidence": number
}
```

**Implementation:** Second small model call after Stage 1, or merged into Stage 1 as a second block in one JSON (e.g. intent + category in one response) to save latency. If merged, keep the two logical stages in the prompt (Intent block + Classification block).

---

## 5. Stage 3 — Structured Ticket Generation

**Purpose:** Produce the actual ticket fields: title, description, actionSteps, tags. Uses intent + category + transcript + targetElement.

**Input:** Transcript, visibleText (reference), Stage 1 (intent_type, target_element, key_phrases), Stage 2 (category), context (url, viewport, targetElement).

**Output:** Array of tickets (usually 1). Each ticket:

```json
{
  "title": "Increase contrast of hero CTA button",
  "description": "The hero CTA button blends into the background, reducing visibility.",
  "actionSteps": [
    "Increase contrast ratio to at least 4.5:1",
    "Adjust button color to improve visibility",
    "Verify contrast on mobile"
  ],
  "suggestedTags": ["UI", "accessibility"],
  "confidenceScore": 0.87
}
```

**Rules (preserve from current STRUCTURE_ENGINE_V2):**

- Transcript is primary; visible text is reference only.
- Preserve every explicit modification; do not merge or drop instructions.
- “Change X to Y” → action step must include both X and Y.
- Title 4–10 words; description one concise sentence; action steps atomic and implementation-ready.
- **target_element** from Stage 1 must be reflected in title/description/actionSteps when relevant (e.g. “hero CTA button”).
- **confidenceScore** per ticket: 0–1, derived from intent confidence, classification confidence, and clarity of transcript. Conservative: if any upstream stage was low confidence, cap ticket confidence.

**Prompt:** Extend current `STRUCTURE_ENGINE_V2` with:

1. A **structured context block** at the top:
   - Intent type, target element, key phrases (from Stage 1).
   - Category (from Stage 2).
   - Optional: “User selected this element before speaking: [domPath / nearbyText]. Prioritize it when interpreting ‘this’, ‘that’, ‘the button’.”
2. **Output shape** including `confidenceScore` per ticket:
   - `tickets[].title`, `description`, `actionSteps`, `suggestedTags`, `confidenceScore`.
3. Instruction: “Do not invent steps or details not stated or strongly implied. Prefer fewer, accurate steps over speculative ones.”

**Implementation:** Reuse existing structure-feedback logic; add inputs from Stage 1 and Stage 2 and require `confidenceScore` in the parsed JSON.

---

## 6. Stage 4 — Verification Pass

**Purpose:** Ensure the generated ticket actually reflects the user’s intent. If mismatch probability is high, return `needs_clarification: true` instead of a misleading ticket.

**Input:** Original transcript, Stage 1 intent (intent_type, target_element, key_phrases), Stage 3 ticket(s).

**Output (structured JSON):**

```json
{
  "matches": true,
  "mismatch_probability": 0.15,
  "needs_clarification": false,
  "issues": []
}
```

Or when verification fails:

```json
{
  "matches": false,
  "mismatch_probability": 0.45,
  "needs_clarification": true,
  "issues": ["Ticket mentions 'footer' but transcript and target element refer to hero section."]
}
```

**Decision rule:**

- If `mismatch_probability > 0.30` → set `needs_clarification: true`.
- When `needs_clarification: true`, the API returns **no tickets** and instead returns:
  - `success: true`, `needs_clarification: true`, `verificationIssues: string[]`, optional `suggestedRewrite`.
  - Clients show a “Need clarification” state and can suggest the user rephrase or select the element again.

**Prompt (verification):**

```
You are Echly's Ticket Verifier. Output ONLY valid JSON.

Compare the USER'S FEEDBACK to the GENERATED TICKET. Decide if the ticket accurately reflects what the user asked for.

Input:
- Original transcript: "{transcript}"
- Intent (from earlier stage): type={intent_type}, target={target_element}
- Generated ticket: title="{title}", description="{description}", actionSteps=[...]

Check:
1. Does the ticket describe the same change the user asked for?
2. Does the ticket target the same element (or area) the user referred to?
3. Are there any invented details, wrong targets, or misinterpreted phrases?

Output format (JSON only):
{
  "matches": boolean,
  "mismatch_probability": number (0-1),
  "needs_clarification": boolean (true if mismatch_probability > 0.30),
  "issues": ["short description of any mismatch"]
}
```

**Implementation:** After Stage 3, call a small, fast model (e.g. same gpt-4o-mini, low max_tokens) with this prompt. If `needs_clarification === true`, do not return tickets; return the verification payload so the client can show clarification UI.

---

## 7. How Verification Fits the Flow

1. **Normal path:** Intent → Classification → Ticket Gen → Verification → `matches: true`, `needs_clarification: false` → return `{ success: true, tickets: [...], confidenceScore per ticket }`.
2. **Clarification path:** Verification → `needs_clarification: true` → return `{ success: true, needs_clarification: true, verificationIssues, suggestedRewrite? }` and **no tickets**. Client does not create feedback; shows “We couldn’t be sure what you meant” + issues + optional rewrite suggestion.
3. **Existing clarity guard:** Keep existing clarity scoring (clarityScore, clarityIssues, suggestedRewrite) for *input* clarity. Verification is a separate check that the *output* ticket matches the *input* intent. Both can be used: low clarity → block or suggest rewrite; verification mismatch → no ticket, ask for clarification.

---

## 8. Reducing Hallucinations

- **Temperature 0** for all stages. No creative variation.
- **Structured output only:** Every stage returns JSON with a strict schema. Parse and validate; reject malformed output and retry or fall back (e.g. needs_clarification).
- **Closed sets:** intent_type and category are fixed enums. Model must pick one; “other” for edge cases.
- **Transcript as source of truth:** Prompts state “Do not add details not stated or strongly implied.” “Prefer fewer, accurate steps.”
- **Verification gate:** A second model pass checks ticket vs transcript; high mismatch → no ticket.
- **Conservative confidence:** If any stage has low confidence, downstream stages and final ticket confidence are capped. Expose confidenceScore so clients can show “Medium confidence” or similar.
- **Deterministic hints:** Keep using existing pattern detection (change/replace/remove/color) and proper-noun anchoring to inject hints into the prompt rather than letting the model guess.
- **No open-ended generation:** No “suggest improvements” or “list possible causes” unless the user explicitly asked. Stick to “what did the user ask to change?”

---

## 9. Maximizing Actionable Tickets

- **One feedback, one primary intent:** Prefer one ticket per voice feedback. Split only when the user clearly stated multiple separate instructions (existing rule).
- **Atomic action steps:** Each step is one concrete, implementation-ready action. No “and also fix the other thing.”
- **Tags from classification:** Use Stage 2 category to suggest tags (e.g. “Accessibility improvement” → suggestedTags include “accessibility”).
- **Target element in ticket text:** When targetElement is provided, mention it in title/description so engineers know exactly which component to change.
- **Verification prevents bad tickets:** Better to ask for clarification than to create a ticket that sends the engineer to the wrong place or wrong change.
- **Success metric:** Measure “tickets accepted without clarification” (e.g. no follow-up “what did you mean?”). Target 80–90% of generated tickets actionable on first use.

---

## 10. Desired Output Format (API Contract)

**Success with tickets:**

```json
{
  "success": true,
  "tickets": [
    {
      "title": "string",
      "description": "string",
      "actionSteps": ["string"],
      "suggestedTags": ["string"],
      "confidenceScore": 0.87
    }
  ],
  "clarityScore": 85,
  "clarityIssues": [],
  "suggestedRewrite": null,
  "confidence": 0.9,
  "needs_clarification": false
}
```

**Success but needs clarification (no tickets):**

```json
{
  "success": true,
  "tickets": [],
  "needs_clarification": true,
  "verificationIssues": ["Ticket referred to footer; user referred to hero section."],
  "suggestedRewrite": "Make the hero CTA button higher contrast against the background.",
  "clarityScore": 70,
  "clarityIssues": [],
  "confidence": 0.5
}
```

**Failure (e.g. invalid input, rate limit):**

```json
{
  "success": false,
  "tickets": [],
  "error": "No valid transcript provided"
}
```

All tickets must include `title`, `description`, `actionSteps`, `suggestedTags`, and `confidenceScore`. Existing consumers that ignore `confidenceScore` continue to work; new clients can use it for UI (e.g. “High confidence” vs “Check this”).

---

## 11. Element Targeting (Product Interaction)

**Goal:** Let users visually select a UI element before speaking so the AI prioritizes that element when interpreting feedback.

**Flow:**

1. User clicks “Select element” (or equivalent) in the extension.
2. User clicks an element on the page.
3. Extension captures:
   - **Bounding box:** `getBoundingClientRect()` (and optionally scroll/viewport for crop).
   - **DOM selector/path:** Use existing `getDomPath(selectedElement)` from `lib/captureContext.ts`.
   - **Nearby text:** Use existing `getNearbyText(selectedElement)`.
4. This context is stored as **targetElement** (or equivalent) and sent with the next voice feedback.
5. When the user speaks and submits, the pipeline receives `context.domPath`, `context.nearbyText`, and optionally `context.boundingBox`. Stage 1 (Intent) and Stage 3 (Ticket) prompts state: “User selected this element before speaking; prioritize it when resolving references like ‘this button’, ‘that link’.”

**Extension changes:**

- Add a mode or button: “Click an element on the page to attach feedback to it.”
- On click (with possible overlay to confirm): call `buildCaptureContext(window, selectedElement)` (already exists) and store it as the “target context” for the next capture.
- When building the structure-feedback request body, include `context: { url, viewportWidth, viewportHeight, domPath, nearbyText, visibleText, boundingBox? }` from that stored context.
- No change to API contract if `domPath` and `nearbyText` are already sent; only ensure they are populated from the **selected element** when the user used “select element” flow.

**Dashboard:** When capture includes context (e.g. from a future “select element” flow on web), pass the same context to structure-feedback so pipeline behavior is consistent.

---

## 12. Implementation Order

1. **Output format:** Add `confidenceScore` to each ticket and `needs_clarification` + `verificationIssues` to the API response; extend parser and types. Keep backward compatibility.
2. **Stage 1 + 2:** Add intent extraction and change classification (two calls or one combined call). Pass result into Stage 3.
3. **Stage 3:** Extend structure-feedback prompt with intent + category and per-ticket `confidenceScore`. Use existing anchoring and pattern hints.
4. **Stage 4:** Add verification call after ticket generation; implement “return no tickets + needs_clarification” when mismatch > 0.30.
5. **Element targeting:** In extension, add “select element” flow and pass `buildCaptureContext(window, element)` into the next capture; ensure structure-feedback receives and uses it in prompts.
6. **Clients:** Handle `needs_clarification` (show clarification UI); optionally show `confidenceScore` on tickets.

---

## 13. Summary

| Stage | Purpose | Output |
|-------|---------|--------|
| 1. Intent | What change, which element, confidence | intent_type, target_element, confidence, key_phrases |
| 2. Classification | Category for tagging | category, confidence |
| 3. Ticket Gen | Title, description, actionSteps, tags | tickets[] with confidenceScore |
| 4. Verification | Does ticket match intent? | matches, mismatch_probability, needs_clarification, issues |

**Success metric:** 80–90% of tickets actionable without clarification. Achieved by: multi-stage reasoning, strict prompts, verification gate, conservative confidence, and element targeting to reduce ambiguity.
