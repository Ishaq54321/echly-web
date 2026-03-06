# Echly Codebase Audit Report

**Date:** March 6, 2025  
**Scope:** Non-functional audit — code hygiene and structural improvements only  
**Excluded:** Behavior, architecture, pipeline logic, AI prompts, schema, database logic, API behavior, new dependencies, performance optimization

---

## 1. Oversized Files (>400 lines)

### FILE: `components/CaptureWidget/hooks/useCaptureWidget.ts`
**LINES:** 1,048

**Responsibilities detected:**
- Sentiment analysis from transcript (`getSentimentFromTranscript`)
- Speech recognition setup and lifecycle
- Recording state management (recordings, activeRecordingId, pointers)
- Widget UI state (isOpen, position, isDragging, expandedId, editingId, etc.)
- Drag handling
- Capture root creation/removal and marker layer
- Session feedback sync/load
- Live structured title debouncing
- Audio level visualization loop
- Region capture flow
- Extension mode vs web mode branching
- Session mode (start/pause/resume/end)
- Global session state sync
- Element click handling for session feedback
- Pointer CRUD (delete, edit, save)
- Chrome extension tab capture
- Handler object assembly and return

**Suggestion — safe structural separation:**
```
components/CaptureWidget/hooks/
  useCaptureWidget.ts          (orchestrator, ~300 lines)
  useCaptureWidgetState.ts    (state + refs)
  useCaptureWidgetSpeech.ts   (Speech API, recognition, audio level)
  useCaptureWidgetSession.ts  (session mode, global sync, element click)
  useCaptureWidgetDrag.ts     (drag, position, capture root)
  captureWidgetSentiment.ts   (getSentimentFromTranscript)
```

---

### FILE: `components/layout/operating-system/CommentPanel.tsx`
**LINES:** 551

**Responsibilities detected:**
- Comment date formatting (`formatDate`)
- Comment row rendering (edit, delete, resolve)
- Thread block rendering (root + replies)
- Comment thread list with filter tabs (all/unresolved/resolved)
- Resolved section collapse
- Panel layout (sidebar vs overlay variant)
- ESC key handling
- Thread highlight/scroll-into-view

**Suggestion — safe structural separation:**
```
components/layout/operating-system/
  CommentPanel.tsx            (orchestrator, panel shell)
  CommentRow.tsx              (extract CommentRow)
  CommentThreadBlock.tsx      (extract ThreadBlock)
  CommentThreadList.tsx       (extract CommentThreadList)
lib/utils/commentDate.ts      (shared formatCommentDate)
```

---

### FILE: `lib/repositories/feedbackRepository.ts`
**LINES:** 473

**Responsibilities detected:**
- Feedback payload construction
- addFeedbackRepo / addFeedbackWithSessionCountersRepo
- updateFeedbackRepo / updateFeedbackResolveAndSessionCountersRepo
- statusFromResolveAndSkip helper
- docToFeedback mapping
- Pagination (getSessionFeedbackPageRepo, getSessionFeedbackPageWithStringCursorRepo)
- Count queries (getSessionFeedbackCountRepo, getSessionFeedbackCountsRepo, getSessionFeedbackTotalCountRepo)
- deleteFeedbackRepo / deleteFeedbackWithSessionCountersRepo
- resolveFeedbackRepo
- deleteAllFeedbackForSessionRepo
- getSessionFeedbackByResolvedRepo
- getFeedbackByIdRepo / getFeedbackByIdsRepo

**Suggestion — safe structural separation:**
```
lib/repositories/
  feedbackRepository.ts           (orchestrator, re-exports)
  feedbackRepositoryMutations.ts  (add, update, delete, resolve)
  feedbackRepositoryQueries.ts   (get page, counts, by id/ids)
  feedbackRepositoryHelpers.ts   (feedbackPayload, docToFeedback, statusFromResolveAndSkip)
```

---

### FILE: `components/session/feedbackDetail/ScreenshotWithPins.tsx`
**LINES:** 451

**Responsibilities detected:**
- Comment date formatting (`formatCommentDate`)
- Pin marker component (drag, tooltip, click)
- Draft pin placement and popover
- Active pin inline popover (thread view)
- Placement computation (scroll/resize)
- Image click handler (add pin vs close popover)
- Click-outside to close popover

**Suggestion — safe structural separation:**
```
components/session/feedbackDetail/
  ScreenshotWithPins.tsx       (orchestrator)
  PinMarker.tsx               (extract PinMarker)
  PinDraftPopover.tsx          (draft placement popover)
  PinThreadPopover.tsx         (active pin popover)
lib/utils/commentDate.ts      (shared formatCommentDate)
```

---

### FILE: `components/dashboard/WorkspaceCard.tsx`
**LINES:** 431

**Responsibilities detected:**
- Card click/keyboard handling
- Dropdown menu (position, portal, click-outside, keyboard nav)
- Copy link / copy session ID
- Share / Rename / Archive / Delete actions
- Modal state (ShareSessionModal, RenameSessionModal, DeleteSessionModal)
- Tooltip (hover delay, "More actions…", "Link copied")
- Metrics display (feedback count, open count, view count, comment count)

**Suggestion — safe structural separation:**
```
components/dashboard/
  WorkspaceCard.tsx            (orchestrator, card shell)
  WorkspaceCardDropdown.tsx    (extract dropdown + menu items)
  WorkspaceCardMetrics.tsx     (extract metrics row)
```

---

### FILE: `lib/ai/voiceToTicketPipeline.ts`
**LINES:** 422

**Responsibilities detected:**
- DOM context types and construction
- Raw context normalization
- DOM context truncation (token budget)
- User message building
- System prompt (interpreter rules)
- JSON schema definition
- Structured response parsing
- Fallback structured feedback
- Title sanitization
- extractStructuredFeedback (OpenAI call)
- reviewStructuredFeedback (review pass)
- runVoiceToTicket (orchestrator)

**Suggestion — safe structural separation:**
```
lib/ai/
  voiceToTicketPipeline.ts       (orchestrator, runVoiceToTicket)
  interpreterPrompt.ts           (SYSTEM_PROMPT, REVIEW_PROMPT)
  domContextBuilder.ts           (buildDomContextFromPipelineContext, truncateDomContextToBudget, normalizeRawContext)
  structuredExtraction.ts        (extractStructuredFeedback, parseStructuredResponse, fallbackStructuredFeedback)
  titleSanitizer.ts             (sanitizeTitle)
```

---

## 2. Unused Code

### FILE: `lib/repositories/feedbackRepository.ts`
**Unused items detected:**
- `writeBatch` — imported from firebase/firestore but never used in this file (used in `resolveAllOpenFeedbackInSession.ts` only)

---

### FILE: `lib/ai/pipelineMetrics.ts`
**Unused items detected:**
- `createPipelineMetrics()` — never referenced
- `logPipelineMetrics()` — never referenced
- `PipelineMetrics` interface — only used internally in the same file

---

### FILE: `lib/server/patternDetection.ts`
**Unused items detected:**
- Entire module — never imported anywhere
- `detectChangePattern()` — only used internally
- `detectReplacePattern()` — only used internally
- `detectRemovePattern()` — only used internally
- `detectColorChangePattern()` — only used internally
- `detectHighConfidencePatterns()` — never called from outside

---

### FILE: `lib/server/clauseSplitter.ts`
**Unused items detected:**
- `splitTranscriptIntoClauses()` — never imported or called anywhere

---

### FILE: `lib/types/index.ts`
**Unused items detected:**
- `Request` from "express" — used only for `RequestWithUser`; verify if Express is the actual runtime (Next.js uses different request types)

---

## 3. Duplicate Logic

### Duplicate: Comment/Firestore date formatting
**Found in:**
- `components/layout/operating-system/CommentPanel.tsx` — `formatDate(value: Comment["createdAt"])`
- `components/session/feedbackDetail/ScreenshotWithPins.tsx` — `formatCommentDate(value: Comment["createdAt"])`
- `components/layout/operating-system/TicketMetadata.tsx` — `formatDate(value: string | { seconds: number } | null)`

**Logic:** All handle Firestore `{ seconds: number }` or similar, return "Just now" or formatted date string.

**Suggestion:**
```
lib/utils/commentDate.ts  or  lib/utils/formatCommentDate.ts
  export function formatCommentDate(value: Comment["createdAt"] | { seconds: number } | null | undefined): string
```
Use in CommentPanel, ScreenshotWithPins, and TicketMetadata. TicketMetadata has slightly different input (string | { seconds }) — consider a shared helper that accepts `TimestampLike` from `lib/utils/date.ts`.

---

### Duplicate: String array normalization (trim + filter)
**Found in:**
- `lib/ai/voiceToTicketPipeline.ts` — `(o.nearbyText as unknown[]).filter((x): x is string => typeof x === "string").join("\n")`
- `lib/server/clauseSplitter.ts` — `raw.map((s) => s.trim()).filter((s) => s.length > 0)`
- `lib/server/groundTranscriptClauses.ts` — `domPhrases.filter((p): p is string => typeof p === "string")`
- `lib/tickets/generateTicketTitle.ts` — `map((t) => t.trim()).filter(Boolean)`
- `lib/ai/element-resolver.ts` — `map((t) => t.trim()).filter(Boolean)`
- `lib/ai/contextFilter.ts` — `lines.map((l) => l.trim()).filter(Boolean)`

**Suggestion:**
```
lib/utils/stringArrayUtils.ts
  export function trimFilterStrings(arr: unknown[]): string[]
  export function normalizeWhitespaceLines(text: string): string[]
```

---

### Duplicate: Title sanitization (words + length cap)
**Found in:**
- `lib/ai/voiceToTicketPipeline.ts` — `sanitizeTitle()`: `words.slice(0, 5)`, `cleaned.slice(0, 60)`
- `lib/tickets/generateTicketTitle.ts` — similar truncation logic in `pickNoun` and final title assembly

**Suggestion:**
```
lib/utils/titleSanitizer.ts
  export function sanitizeTicketTitle(title: string, maxWords?: number, maxChars?: number): string
```

---

## 4. Complex Functions

### Function: `useCaptureWidget` (hook body)
**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Lines:** ~960 (entire hook body)

**Responsibilities mixed:**
- 30+ state variables
- 15+ refs
- 20+ useEffects
- 25+ useCallbacks
- Speech, drag, session mode, capture flow, pointer CRUD, extension vs web branching

**Suggestion:** Extract sub-hooks (`useCaptureWidgetSpeech`, `useCaptureWidgetSession`, etc.) and keep `useCaptureWidget` as a thin orchestrator. No logic change.

---

### Function: `finishListening`
**File:** `components/CaptureWidget/hooks/useCaptureWidget.ts`  
**Lines:** ~115 (lines 366–480)

**Responsibilities mixed:**
- Haptic feedback
- Stop recognition
- Extension session mode branch (marker creation, onComplete callback)
- Extension non-session branch (onComplete, state updates)
- Web branch (await onComplete, state updates)
- Shared success/error handling

**Suggestion:** Split into `finishListeningExtensionSession`, `finishListeningExtension`, `finishListeningWeb` and a small dispatcher. Keep orchestration unchanged.

---

### Function: `runVoiceToTicket`
**File:** `lib/ai/voiceToTicketPipeline.ts`  
**Lines:** ~65 (lines 421–489)

**Responsibilities mixed:**
- Empty transcript guard
- DOM context build
- extractStructuredFeedback call
- Optional review pass
- Action steps sort/map/filter
- Title generation (AI vs fallback)
- Clarity score / needsClarification

**Suggestion:** Extract `buildTicketFromJson(json, transcript)` and `computeClarityOutput(confidence)`. Keep `runVoiceToTicket` as orchestrator.

---

### Function: `updateFeedbackResolveAndSessionCountersRepo`
**File:** `lib/repositories/feedbackRepository.ts`  
**Lines:** ~55 (lines 161–226)

**Responsibilities mixed:**
- Status derivation
- Updates object construction
- Transaction: read feedback, read session, apply updates, update counters

**Suggestion:** Extract `computeSessionCounterDeltas(wasStatus, toStatus)` and keep transaction logic in place.

---

## 5. Formatting Improvements

### Long prompt strings inline
**Files:**
- `lib/ai/voiceToTicketPipeline.ts` — `SYSTEM_PROMPT` (~130 lines), `REVIEW_PROMPT` (1 line)
- `lib/server/instructionExtraction.ts` — `EXTRACTION_SYSTEM_PROMPT` (large block)
- `lib/server/instructionRefinement.ts` — refinement prompt
- `lib/server/ticketVerification.ts` — verification prompt

**Suggestion:** Move to separate files:
```
lib/ai/prompts/
  interpreterPrompt.ts
  reviewPrompt.ts
lib/server/prompts/
  extractionPrompt.ts
  refinementPrompt.ts
  verificationPrompt.ts
```

---

### Inconsistent path separators
**Observation:** Some imports reference `lib\server\instructionGraph.ts` (backslash) vs `lib/server/instructionGraph.ts` (forward slash). On Windows these resolve to the same file; standardize on forward slashes for cross-platform consistency.

---

### Inconsistent comment style
**Observation:** Mix of `/* ===== SECTION ===== */`, `// -----`, and inline `//` comments. Consider a single convention (e.g. `/* ===== SECTION ===== */` for major sections).

---

## 6. Structural Refactor Opportunities

### Files mixing business logic and prompt content
- `lib/ai/voiceToTicketPipeline.ts` — prompt strings + pipeline logic
- `lib/server/instructionExtraction.ts` — prompt + extraction logic
- `lib/server/instructionRefinement.ts` — prompt + refinement logic

**Suggestion:** Extract prompts to `lib/ai/prompts/` and `lib/server/prompts/` as noted above.

---

### Lack of shared date/comment formatting
- `lib/utils/date.ts` has `formatFullDateTime`, `formatOverviewDate`, `formatSessionCreatedMeta`, `formatActivityTime`
- Components implement their own `formatDate` / `formatCommentDate` for Comment timestamps

**Suggestion:** Add `formatCommentTimestamp(ts: TimestampLike): string` to `lib/utils/date.ts` and use it in CommentPanel, ScreenshotWithPins, TicketMetadata.

---

### Repeated normalization patterns
- `trim().toLowerCase()` — used in many files
- `split(/\s+/).filter(Boolean)` — used in multiple places
- `replace(/\s+/g, " ").trim()` — used in spatial-context-builder, captureContext, etc.

**Suggestion:** Add `lib/utils/textNormalization.ts` with `normalizeWhitespace`, `tokenize`, `normalizeForCompare` (or reuse from properNounAnchoring if appropriate).

---

## 7. Technical Debt Risks

### Dead code accumulation
- `lib/server/patternDetection.ts` — entire module unused
- `lib/server/clauseSplitter.ts` — `splitTranscriptIntoClauses` never called
- `lib/ai/pipelineMetrics.ts` — `createPipelineMetrics`, `logPipelineMetrics` never used

**Risk:** Confusion during debugging, unnecessary bundle size, maintenance burden.

---

### Pipeline logic mixed with prompt content
- AI prompts live inside pipeline files. Changes to prompts require touching pipeline code and vice versa.

**Risk:** Higher chance of accidental behavior changes when editing prompts.

---

### useCaptureWidget monolithic design
- Single 1,048-line hook with many responsibilities. Adding features (e.g. new capture mode) requires editing a large, dense file.

**Risk:** Merge conflicts, regression risk, harder onboarding.

---

### Duplicate date formatting
- Three separate implementations for Comment/timestamp display. `lib/utils/date.ts` exists but is not used for comments.

**Risk:** Inconsistent display, repeated bug fixes in multiple places.

---

### feedbackRepository size and responsibility
- 473 lines covering mutations, queries, helpers, and mapping. Adding new feedback operations increases file size further.

**Risk:** Harder to navigate, higher cognitive load for new contributors.

---

## Summary Table

| Category              | Count |
|-----------------------|-------|
| Oversized files (>400) | 6     |
| Unused imports        | 1     |
| Unused modules        | 2 (patternDetection, pipelineMetrics) |
| Unused exports        | 1 (splitTranscriptIntoClauses) |
| Duplicate logic areas | 3 (date format, string arrays, title sanitization) |
| Complex functions     | 4     |
| Formatting improvements | 3   |
| Structural refactors  | 3     |
| Technical debt risks  | 5     |

---

*End of audit. No refactors were applied. This report is for review and planning only.*
