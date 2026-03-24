# Final data consistency fix — realtime vs `serializeFeedbackMinimal`

## Summary

`lib/realtime/feedbackStore.ts` maps Firestore documents to `Feedback` via `mapDocToFeedback()`. That path now aligns with `serializeFeedbackMinimal()` in `app/api/feedback/route.ts` for screenshot pipeline fields and for **`status`**, which the API exposes but the mapper previously omitted from the returned object (it was only used to derive `isResolved` / `isSkipped`).

## Code change

**File:** `lib/realtime/feedbackStore.ts`

- **`screenshotStatus`:** `screenshotStatus: data.screenshotStatus ?? null` — matches `item.screenshotStatus ?? null` in `serializeFeedbackMinimal`.
- **`status`:** `status` is included when `data.status` is a string, matching the API’s `status: (item as { status?: string }).status` for list rows whose documents carry a string status. Omitted when missing or non-string (same effective shape as `undefined` on the serialized object).

`screenshotUrl` was already mapped with `?? null`, consistent with the API.

## Field parity check: `serializeFeedbackMinimal` vs `mapDocToFeedback`

| Key | API (`serializeFeedbackMinimal`) | Realtime (`mapDocToFeedback`) |
|-----|----------------------------------|-------------------------------|
| `id` | ✓ | ✓ (`docSnap.id`) |
| `sessionId` | ✓ | ✓ |
| `createdAt` | ISO string via `toDate()` | `Timestamp` (client path; unchanged) |
| `title` | ✓ | ✓ |
| `instruction` | `instruction ?? description` | Same coalesce; empty string fallback |
| `description` | ✓ | ✓ |
| `type` | ✓ | ✓ |
| `actionSteps` | ✓ (`?? undefined`) | ✓ (`actionSteps ?? actionItems`) |
| `commentCount` | number, default 0 | same |
| `lastCommentPreview` | ✓ | ✓ |
| `lastCommentAt` | seconds object / omitted | `Timestamp \| null` (client path; unchanged) |
| `status` | ✓ | ✓ (added) |
| `isResolved` | ✓ | ✓ (derived + `data.isResolved`) |
| `isSkipped` | ✓ | ✓ |
| `screenshotUrl` | `?? null` | `?? null` |
| `screenshotStatus` | `?? null` | `?? null` (added) |

Realtime objects remain a **superset** of the minimal API row (e.g. `workspaceId`, `url`, `contextSummary`, …). The consistency goal is that every **minimal** field the API returns is present and coherent on realtime `Feedback` items, especially **`screenshotUrl` / `screenshotStatus`** so merged lists do not lose screenshot state when paging or refetching.

## References

- `serializeFeedbackMinimal`: `app/api/feedback/route.ts` (approx. lines 112–148)
- `Feedback` type (incl. `screenshotStatus`, `status`): `lib/domain/feedback.ts`
