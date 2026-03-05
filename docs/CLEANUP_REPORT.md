# Echly Safe Cleanup Report

**Date:** 2025-03-05  
**Reference:** SYSTEM_INTELLIGENCE_REPORT.md  
**Scope:** Remove dead code, unused modules, and legacy systems without changing runtime behavior, AI pipeline logic, or extension message contracts.

---

## Summary

- **Files removed:** 2  
- **Files replaced (slimmed):** 1  
- **Functions/code removed:** Ontology pipeline and legacy batch intent/ticket logic; unused popup entry.  
- **Imports cleaned:** pipelineStages now only exports `PipelineTicket`; no broken imports.  
- **TypeScript:** `tsc --noEmit` passes.  
- **Extension build:** `npm run build:extension` succeeds.

---

## 1. Files Removed

| File | Reason |
|------|--------|
| `lib/server/instructionOntology.ts` | Unused by runtime pipeline. Only referenced by pipelineStages; ontology path not used by runFeedbackPipeline. |
| `echly-extension/src/popup.ts` | Unused popup entry. Build uses `popup.tsx` (esbuild-extension.mjs entryPoints). popup.ts was legacy/alternate popup with session dropdown and form submit. |

---

## 2. Files Not Present (No Action)

| File | Note |
|------|------|
| `lib/server/intentExtraction.ts` | Not found in repo (already removed or never committed). |
| `lib/server/instructionSegmentation.ts` | Not found in repo (already removed or never committed). |

---

## 3. Deprecated Function Removed

| Item | Status |
|------|--------|
| `refineInstructions()` in instructionRefinement.ts | Not present in current file. Only `refineStructuredInstructions()` exists; no change made. |

---

## 4. Legacy Ontology Pipeline Removed

| Change | Detail |
|--------|--------|
| **Deleted** | `lib/server/instructionOntology.ts` (mapInstructionsToOntology, OntologyAction types, etc.). |
| **Slimmed** | `lib/server/pipelineStages.ts`: removed `batchIntentAndTicketsFromOntology`, `batchIntentAndTickets`, and all ontology/intent-and-ticket logic. File now only exports the `PipelineTicket` interface required by `runFeedbackPipeline`, `instructionGraph`, and `ticketVerification`. |

---

## 5. Capture Utilities

| Check | Result |
|-------|--------|
| `lib/capture.ts` | **Kept.** Dynamically imported by `components/CaptureWidget/hooks/useCaptureWidget.ts` for web (non-extension) capture. Deleting it would break the web capture path. |

---

## 6. Popup Duplication Resolved

| File | Action |
|------|--------|
| `echly-extension/src/popup.tsx` | **Kept.** Referenced in esbuild-extension.mjs as popup entry. |
| `echly-extension/src/popup.ts` | **Deleted.** Not used by build; legacy/alternate popup. |

---

## 7. Imports and Build

- **Broken imports:** None. No remaining references to `instructionOntology`, `OntologyAction`, `batchIntentAndTickets`, or `PIPELINE_INTENT_TYPES` in `.ts`/`.tsx`.  
- **Unused imports:** No new unused imports introduced; pipelineStages no longer imports instructionOntology or pipelineContext for the removed code.  
- **TypeScript:** `npx tsc --noEmit` completes successfully.  
- **Extension:** `npm run build:extension` completes successfully.

---

## 8. Runtime Paths Verified

The following flows were **not modified**; only dead/legacy code was removed:

- Extension load → widget injection → session start → element click → voice recording → structure-feedback API → ticket creation → marker creation.

Removed code was not on these paths:

- `instructionOntology.ts` and ontology/batch functions in pipelineStages were never called by `runFeedbackPipeline.ts`.  
- `popup.ts` was not the build entry; popup UI is served by `popup.tsx` → `popup.js`.

---

## 9. Unused Exports Scan (Step 6 Scope)

- **Scope:** Cleanup focused on identified dead/legacy modules. A full repo-wide scan for every unused export was not performed to avoid accidental removal of used symbols.  
- **Done:** Removed only code that was provably unused (ontology, unused popup file, slimming pipelineStages to the single used type).

---

## 10. Approximate Bundle Size Impact

| Area | Change |
|------|--------|
| **Backend (Node)** | Smaller: instructionOntology.ts removed (~8 KB), pipelineStages.ts reduced from ~500 lines to ~15 (type-only). Fewer LLM prompt constants and helpers in pipelineStages. |
| **Extension** | popup.ts removed (~7.5 KB source); popup bundle is built from popup.tsx only, so no change to popup.js size. |

No measurement of exact bundle size delta was run; the above are conservative estimates from file sizes and line counts.

---

## Checklist

- [x] Remove unused AI modules (intentExtraction, instructionSegmentation) — files not present  
- [x] Remove deprecated refinement function — not present; only refineStructuredInstructions kept  
- [x] Remove unused ontology pipeline — instructionOntology deleted; pipelineStages slimmed to PipelineTicket  
- [x] Resolve popup duplication — popup.ts deleted; popup.tsx kept as build entry  
- [x] Verify capture utilities — lib/capture.ts kept (used by useCaptureWidget)  
- [x] Clean imports and fix breakage — no broken references; tsc and extension build pass  
- [x] Validate runtime paths — no behavior change; only dead/legacy code removed  

---

*End of cleanup report. Architecture and message contracts unchanged.*
