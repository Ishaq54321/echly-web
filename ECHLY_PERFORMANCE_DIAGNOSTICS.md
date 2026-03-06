# Echly Performance Diagnostics

This document describes the performance instrumentation added to the Echly system for **measurement only**. No product behavior, AI prompts, DOM context limits, Firestore logic, React components, API responses, or pipeline logic were modified.

---

## 1. AI Pipeline Latency

**File:** `lib/ai/voiceToTicketPipeline.ts`

### extractStructuredFeedback
- **Log:** `[AI PIPELINE] extractStructuredFeedback duration: ${duration}ms`
- **Location:** After the OpenAI `chat.completions.create` call
- **Measures:** Time spent in the single GPT-4o-mini extraction call

### runVoiceToTicket
- **Log:** `[AI PIPELINE] runVoiceToTicket duration: ${pipelineDuration}ms`
- **Location:** End of pipeline (including early-return path for empty transcript)
- **Measures:** Total pipeline time from entry to return (DOM context build + extraction + optional review + title generation)

---

## 2. Prompt Token Usage

**File:** `lib/ai/voiceToTicketPipeline.ts`

- **Log:** `[AI TOKENS] prompt=${prompt_tokens} completion=${completion_tokens}`
- **Location:** After `extractStructuredFeedback` OpenAI call
- **Source:** `completion.usage.prompt_tokens` and `completion.usage.completion_tokens`

---

## 3. DOM Context Size

**File:** `lib/ai/voiceToTicketPipeline.ts` (inside `buildUserMessage`)

- **Log:** `[DOM CONTEXT] elementHTML chars=${elementHTMLChars} nearbyText chars=${nearbyTextChars} visibleText chars=${visibleTextChars}`
- **Measures:** Character counts for each DOM context field (after truncation to budget)
- **Purpose:** Determine whether the context budget (1000 tokens) is appropriate

---

## 4. Firestore Query Timing

**File:** `lib/repositories/feedbackRepository.ts`

- **Log:** `[FIRESTORE] query duration: ${duration}ms`
- **Instrumented functions:**
  - `getSessionFeedbackPageRepo` — getDocs
  - `getSessionFeedbackPageWithStringCursorRepo` — getDoc (cursor lookup) + getDocs
  - `getSessionFeedbackCountRepo` — getCountFromServer
  - `getSessionFeedbackCountsRepo` — Promise.all (3 count queries)
  - `getSessionFeedbackTotalCountRepo` — getCountFromServer
  - `deleteAllFeedbackForSessionRepo` — getDocs
  - `getSessionFeedbackByResolvedRepo` — getDocs
  - `getFeedbackByIdRepo` — getDoc
  - `getFeedbackByIdsRepo` — Promise.all (getDoc per id)

---

## 5. Capture Widget Render Count

**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`

- **Log:** `console.count("useCaptureWidget render")`
- **Condition:** `process.env.NODE_ENV === "development"` only
- **Purpose:** Detect React render frequency; high counts may indicate unnecessary re-renders

---

## 6. Screenshot Upload Duration

**File:** `app/api/upload-screenshot/route.ts`

- **Log:** `[UPLOAD] screenshot upload duration: ${uploadDuration}ms`
- **Measures:** Time from `uploadString` start through `getDownloadURL` completion

---

## How to Use

1. Run the app in development: `npm run dev`
2. Perform typical flows: voice capture, session feedback, dashboard load
3. Inspect server logs (Node/Next.js console) and browser DevTools console
4. Filter logs by prefix: `[AI PIPELINE]`, `[AI TOKENS]`, `[DOM CONTEXT]`, `[FIRESTORE]`, `[UPLOAD]`
5. Record metrics over multiple runs to establish baselines and identify bottlenecks

---

## Next Steps (After Measurement)

Once metrics are gathered, consider:

- **AI latency:** Model choice, prompt size, streaming
- **Token usage:** DOM context budget, truncation strategy
- **Firestore:** Index usage, query patterns, batching
- **Capture widget:** Memoization, state structure, effect dependencies
- **Upload:** Image size, compression, Storage region
