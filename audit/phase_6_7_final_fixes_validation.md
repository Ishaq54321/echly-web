# Phase 6.7 — Final fixes validation

Validation of status lock, batch resolve counter alignment, and write-layer integrity after the Phase 6.7 final fixes pass.

---

## 1. Status model

**Only `"open"` / `"resolved"` written: YES**

| Location | Behavior |
|----------|----------|
| `lib/repositories/feedbackRepository.server.ts` — `feedbackPayload` / create | `status` is always `"open"`; client `StructuredFeedback.status` is not copied onto the document. |
| `app/api/tickets/[id]/route.ts` — `PATCH` | If `body.status` is present and not `"open"` or `"resolved"`, responds **400**. `isResolved` is mapped to status only at the HTTP boundary (not written as the counter driver). |
| `updateFeedbackResolveAndSessionCountersRepo` | Requires `data.status`; `assertValidFeedbackWriteStatus` throws if not `"open"` \| `"resolved"`. |
| `updateFeedbackRepo` | If `status` is provided, same assertion; **`isResolved` removed** from this API so resolve/reopen cannot skip session counters. |

Domain/read types may still mention legacy values elsewhere; **server write paths above do not emit** `processing`, `done`, or other ticket statuses.

---

## 2. Batch resolve

**`totalCount` synced: YES**  
**`feedbackCount` synced: YES**

`lib/server/resolveAllOpenFeedbackInSession.ts` now sets, in the same batch as feedback updates:

- `openCount`, `resolvedCount` (clamped with `Math.max(0, …)`)
- `totalCount = newOpenCount + newResolvedCount`
- `feedbackCount = newTotal`
- `skippedCount: FieldValue.delete()` (aligned with other session counter writes)

---

## 3. Write layer integrity

**All mutations enforce counts: YES**

| Mutation | Session fields |
|----------|----------------|
| Create — `addFeedbackWithSessionCountersRepo` | `totalCount = open + resolved`, `feedbackCount = totalCount` |
| Resolve/reopen — `updateFeedbackResolveAndSessionCountersRepo` | Same, after clamping open/resolved |
| Delete — `deleteFeedbackWithSessionCountersRepo` | Same |
| Batch resolve — `resolveAllOpenFeedbackInSession` | Same (this fix) |

---

## 4. Any legacy write paths?

**NO** (for ticket `status` on feedback/session counter writers scoped here)

- No mapping from `processing` / `done` into writes in `feedbackRepository.server.ts` or the tickets PATCH handler.
- `updateFeedbackRepo` no longer accepts `isResolved`, so there is no path that flips resolution without the transactional counter repo.

---

## 5. Final verdict

| Check | Result |
|-------|--------|
| Status model locked | **YES** |
| Counts fully deterministic (given correct prior session state before batch resolve) | **YES** |
| Ready for Phase 6.8 | **YES** |

---

## Notes (out of scope per instructions)

- **Read paths** and **extension** were not modified.
- **Client** `lib/repositories/feedbackRepository.ts` / UI may still derive display state from `isResolved` for reads; **writes** for tickets go through server routes + `feedbackRepository.server.ts` as validated above.
