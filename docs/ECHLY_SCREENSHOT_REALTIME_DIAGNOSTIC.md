# Echly Screenshot Realtime Diagnostic Report

**Purpose:** Read-only audit to determine why screenshots do not update in the dashboard in realtime after upload (ticket and placeholder appear; screenshot appears only after page refresh).

**Audit date:** 2025-03-14  
**No code was modified.**

---

## 1. Screenshot Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ EXTENSION (content script)                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 1. User captures (voice/region/session) → CAPTURE_TAB → crop + context           │
│ 2. generateScreenshotId() → screenshotId (UUID / fb-{ts}-{random})                │
│ 3. uploadPromise = uploadScreenshot(screenshot, sessionId, screenshotId)         │
│    → sendMessage(ECHLY_UPLOAD_SCREENSHOT) → background                           │
│ 4. In parallel: apiFetch(/api/structure-feedback) then POST /api/feedback         │
│    → ticket created with screenshotUrl: null, screenshotId (first ticket only)    │
│ 5. On ticket create: uploadPromise.then(url => PATCH /api/tickets/:id             │
│    { screenshotUrl: url }).catch(()=>{})                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BACKGROUND (echly-extension/src/background.ts)                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ECHLY_UPLOAD_SCREENSHOT: POST /api/upload-screenshot (Bearer token)               │
│   body: { screenshotId, imageDataUrl, sessionId }                                 │
│   → response { url } → sendResponse({ url: data.url }) to content                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BACKEND POST /api/upload-screenshot (app/api/upload-screenshot/route.ts)          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Writes to Firestore: screenshots collection (TEMP record via                    │
│   createScreenshotRepoSync), NOT feedback collection                             │
│ • Uploads image to Firebase Storage: sessions/{sessionId}/screenshots/{id}.png   │
│ • Returns { url } (getDownloadURL)                                               │
│ • Does NOT write screenshotUrl to feedback collection                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ EXTENSION (after upload resolves): PATCH /api/tickets/:id                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ body: { screenshotUrl: url }                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BACKEND PATCH /api/tickets/[id] (app/api/tickets/[id]/route.ts)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • updateFeedbackRepo(id, { screenshotUrl })                                       │
│ • updateDoc(doc(db, "feedback", id), { screenshotUrl })  ← Firestore write        │
│ • Same document the dashboard listener subscribes to                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ DASHBOARD (SessionPageClient + useSessionFeedbackPaginated)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • onSnapshot(collection "feedback", where sessionId == sessionId)                  │
│ • docChanges(): "modified" → setItems(prev => next.map(t => t.id===id ? feedback  │
│   : t)) → feedback list state updated with screenshotUrl                         │
│ • selectedItem = detailTicket (from fetchDetailTicket(selectedId))                │
│   → Detail panel does NOT use feedback list; uses detailTicket only               │
│   → detailTicket is never updated when PATCH adds screenshotUrl                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Summary:** The realtime pipeline breaks at the **dashboard detail view**: the list state is updated by Firestore, but the **selected ticket view** is driven by **detailTicket**, which is fetched once and never refreshed when the same ticket is PATCHed with `screenshotUrl`.

---

## 2. Extension Screenshot Upload

### Files

| Role | File |
|------|------|
| ID generation & upload trigger | `echly-extension/src/contentScreenshot.ts` |
| Message handler & API call | `echly-extension/src/background.ts` |
| Pipeline (create ticket + PATCH after upload) | `echly-extension/src/content.tsx` |

### screenshotId generation

- **Location:** `echly-extension/src/contentScreenshot.ts`
- **Function:** `generateScreenshotId()` → calls `generateFeedbackId()`:
  - `crypto.randomUUID()` if available, else `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

### API endpoint

- **Endpoint:** `POST ${API_BASE}/api/upload-screenshot`
- **Handler:** `echly-extension/src/background.ts` (lines 659–696): reads `imageDataUrl`, `sessionId`, `screenshotId` from request, uses Bearer token, sends JSON body, returns `{ url }` or `{ error }`.

### screenshotUrl returned

- Backend returns `{ url }`. Background forwards it: `sendResponse({ url: data.url })`. Content’s `uploadScreenshot()` resolves with that URL.

### Ticket PATCH after upload

- **Location:** `echly-extension/src/content.tsx` (multiple code paths, same pattern):
  - e.g. lines 483–493, 547–557, 678–685.
- **Pattern:** After first ticket is created, `uploadPromise.then((url) => { if (url) apiFetch(\`/api/tickets/${ticketId}\`, { method: "PATCH", body: JSON.stringify({ screenshotUrl: url }) }).catch(()=>{}); })`.
- PATCH is fire-and-forget (`.catch(() => {})`); no refetch or local state update for the ticket’s `screenshotUrl` on the dashboard.

---

## 3. Backend Screenshot Upload Route

### Route

- **File:** `app/api/upload-screenshot/route.ts`
- **Method:** POST only.

### Firestore / Storage

- **Collection written:** `screenshots` (doc id = `screenshotId`), via `createScreenshotRepoSync(ssId, storagePath)` in `lib/repositories/screenshotsRepository.ts`. Fields: `status: "TEMP"`, `createdAt`, `storagePath`.
- **screenshotUrl in Firestore:** Not written by this route. It does not touch the `feedback` collection.
- **Ticket document:** Not updated by this route.
- **PATCH /api/tickets/:id:** Not called from this route; the extension calls it after receiving `{ url }`.

### Flow

1. Validate body (`screenshotId`, `imageDataUrl`, `sessionId`).
2. Load session, check ownership and workspace.
3. Ensure screenshot record exists (create TEMP if not ATTACHED).
4. Upload to Storage at `sessions/{sessionId}/screenshots/{screenshotId}.png`.
5. Return `{ url: getDownloadURL(...) }`.

---

## 4. Ticket Update Logic (PATCH /api/tickets/[id])

### File

- `app/api/tickets/[id]/route.ts` (PATCH handler, lines 83–216).

### screenshotUrl handling

- **Line 169:** `if (body.screenshotUrl !== undefined) updates.screenshotUrl = body.screenshotUrl === null ? null : (typeof body.screenshotUrl === "string" ? body.screenshotUrl : undefined);`
- **Path when only screenshotUrl changes:** `statusChange` is false → `updateFeedbackRepo(id, updates)` (line 187).

### Firestore write

- **Repository:** `lib/repositories/feedbackRepository.ts`, `updateFeedbackRepo` (lines 130–159).
- **Call:** `updateDoc(doc(db, "feedback", feedbackId), updates)` (line 158).
- **Collection:** `feedback`. Same collection the dashboard listener uses (`collection(db, "feedback")` with `where("sessionId", "==", sessionId)`).

So the update is on the same document the dashboard is listening to; Firestore will emit a "modified" event for that doc.

---

## 5. Dashboard Realtime Listener

### Files

- **Hook:** `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts`
- **Consumer:** `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` (uses `feedback`, `setFeedback`, etc. from this hook).

### onSnapshot usage

- **Lines 275–334:** `useEffect` with `onSnapshot(feedbackQuery, callback)`.
- **Query:**  
  `query(collection(db, "feedback"), where("sessionId", "==", sessionId), limit(FEEDBACK_LOAD_CAP))`  
  (no `orderBy`; client sorts by `createdAt`/`clientTimestamp`).
- **Collection:** `feedback`.
- **Filters:** `sessionId == sessionId`.
- **State update:** In the snapshot callback:
  - Counts from full snapshot.
  - `snapshot.docChanges()` iterated; for each change, `mapDocToFeedback(change.doc)` builds a `Feedback` (includes `screenshotUrl`).
  - **"added":** merge into list (update in place if already present, else push).
  - **"modified":** `next = next.map((t) => (t.id === feedback.id ? feedback : t))`.
  - **"removed":** filter out by id.
  - Result sorted by time and passed to `setItems(...)`.

So the **feedback list** state is correctly updated when a document is modified (e.g. `screenshotUrl` added).

---

## 6. State Update and Detail View (Root Cause)

### List state

- Realtime updates are applied correctly: `docChanges()` with `"modified"` updates the corresponding item in the `feedback` array, including `screenshotUrl` from `mapDocToFeedback(change.doc)`.

### Detail view state (selected ticket)

- **Definition of selectedItem:**  
  `SessionPageClient.tsx` lines 449–468:  
  `selectedItem = detailTicket != null ? { ...detailTicket, index, total } : null`.
- **Source of detailTicket:**  
  - Set only by `fetchDetailTicket(selectedId)` (GET `/api/tickets/:id`) when `selectedId` changes.
  - Effect (lines 396–403): `if (!selectedId) setDetailTicket(null); else if (detailTicket?.id === selectedId) return; else fetchDetailTicket(selectedId);`
- So when the same ticket is already selected, we do **not** refetch. When the extension PATCHes that ticket with `screenshotUrl`, the **feedback** list is updated by the listener, but **detailTicket** is never updated. The detail panel (and any `selectedItem.screenshotUrl` usage) therefore keeps the old snapshot without `screenshotUrl`.

### Conclusion

- List: updated by Firestore → shows new tickets and, in principle, updated fields (e.g. screenshot) if the list UI reads from `feedback`.
- Detail: driven only by **detailTicket**; no sync from the updated `feedback` item and no refetch when PATCH adds `screenshotUrl` → **screenshot does not update in realtime in the detail view**.

---

## 7. Query Filtering

- Listener query: `where("sessionId", "==", sessionId)`, `limit(FEEDBACK_LOAD_CAP)`. No `where("status", ...)`.
- PATCH only adds/updates `screenshotUrl` (and optionally session `updatedAt`); it does not change `status` in the screenshot-only path. So the document remains in the query result and "modified" is delivered. No query filtering issue identified.

---

## 8. React Rendering and Memoization

- **Screenshot rendering:** e.g. `SessionPageClient.tsx` 1274–1286, 1566–1576: `selectedItem?.screenshotUrl` and `<Image src={selectedItem.screenshotUrl} />`. `ExecutionModeLayout.tsx` uses `item.screenshotUrl` (the same `selectedItem` / detail source).
- **Re-render:** Component re-renders when state changes. The blocker is not memoization but **state**: `selectedItem` is from `detailTicket`, which does not change when the ticket is PATCHed with `screenshotUrl`. No `React.memo` or similar was identified as preventing update; the data for the selected ticket simply never receives the new `screenshotUrl`.

---

## 9. Next.js / Image Caching

- Dashboard uses `next/image` with `selectedItem.screenshotUrl`. If `detailTicket.screenshotUrl` were updated, the image would update (and cache would be by URL). Since `detailTicket` is not updated, caching is not the cause of the missing realtime screenshot.

---

## 10. Firestore Listener Scope

- Listener uses `onSnapshot(feedbackQuery, callback)` with no `includeMetadataChanges` (default). For data changes (e.g. `screenshotUrl`), "modified" is emitted. Listener handles "added", "modified", "removed". Scope is correct for document updates.

---

## 11. Top 5 Most Likely Causes (Ranked)

1. **Detail view uses detailTicket, which is never updated when PATCH adds screenshotUrl (root cause)**  
   - **Probability: Highest.**  
   - **Location:** `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx`: `selectedItem` is derived from `detailTicket` (lines 449–468). `detailTicket` is set only by `fetchDetailTicket(selectedId)` when `selectedId` changes; when the same ticket is already selected, the effect returns without refetching (lines 396–403). So after the extension PATCHes the ticket with `screenshotUrl`, the list may update via Firestore, but the detail panel does not because it never gets the new `screenshotUrl` into `detailTicket`.

2. **Local-first ECHLY_FEEDBACK_CREATED insert does not include screenshotUrl**  
   - **Probability: High (contributing).**  
   - **Location:** `SessionPageClient.tsx` lines 278–306: on `ECHLY_FEEDBACK_CREATED`, a `newItem` is pushed with no `screenshotUrl`. That shapes the initial view; even when the listener later updates the list item, the detail view is still from `detailTicket`, so this reinforces cause 1 rather than being a separate break.

3. **No refetch or merge of detailTicket when feedback list updates**  
   - **Probability: High (same root as #1).**  
   - There is no effect that, when the `feedback` array (from the Firestore listener) has an updated item for `selectedId` (e.g. with `screenshotUrl`), either refetches the ticket or merges that list item into `detailTicket`. So the detail view never sees the new screenshot.

4. **Extension PATCH is fire-and-forget; no push to dashboard**  
   - **Probability: Low for “no update until refresh”.**  
   - The extension does not tell the dashboard to refetch or update; the intended mechanism is Firestore. The list does get the update via the listener; the failure is that the detail view does not use that list for the selected ticket.

5. **Racing initial load vs realtime (list overwritten or order)**  
   - **Probability: Low.**  
   - List merge logic uses `docChanges()` and updates/inserts by id; "modified" replaces the existing item. Initial REST load and first snapshot can reorder or duplicate if not careful, but the main issue observed is the detail view, not the list contents.

---

## Exact File Locations

| Area | File path |
|------|-----------|
| Extension screenshot ID & upload | `echly-extension/src/contentScreenshot.ts` |
| Extension background upload handler | `echly-extension/src/background.ts` (ECHLY_UPLOAD_SCREENSHOT block) |
| Extension create ticket + PATCH | `echly-extension/src/content.tsx` (uploadPromise.then(PATCH) in multiple flows) |
| Backend upload route | `app/api/upload-screenshot/route.ts` |
| Screenshots repo (TEMP) | `lib/repositories/screenshotsRepository.ts` |
| Tickets PATCH route | `app/api/tickets/[id]/route.ts` |
| Feedback repo updateDoc | `lib/repositories/feedbackRepository.ts` (`updateFeedbackRepo`) |
| Dashboard realtime list | `app/(app)/dashboard/[sessionId]/hooks/useSessionFeedbackPaginated.ts` |
| Dashboard session page & detail | `app/(app)/dashboard/[sessionId]/SessionPageClient.tsx` |
| Detail view screenshot render | `SessionPageClient.tsx` (selectedItem), `components/layout/operating-system/ExecutionModeLayout.tsx` |

---

## Summary

- **Extension:** Capture → upload → POST feedback (screenshotUrl null) → PATCH ticket with screenshotUrl when upload resolves. Flow is correct.
- **Backend:** Upload route writes only to `screenshots` + Storage and returns URL. PATCH route writes `screenshotUrl` to the same `feedback` document the dashboard listens to. Firestore write and listener scope are correct.
- **Dashboard list:** Realtime listener correctly applies "modified" and updates the `feedback` list state including `screenshotUrl`.
- **Dashboard detail:** The selected ticket UI uses **detailTicket**, which is loaded once per selection and **never updated** when that same ticket is PATCHed with `screenshotUrl`. So the realtime pipeline “breaks” in the sense that the **detail view** never receives the new screenshot until a refetch (e.g. page refresh or reselecting the ticket) updates **detailTicket**.

**Recommended fix (for later):** When the Firestore listener updates an item in the `feedback` array that corresponds to `selectedId`, either (a) merge that item’s `screenshotUrl` (and optionally other fields) into `detailTicket`, or (b) refetch `detailTicket` for `selectedId` when that list item’s `screenshotUrl` changes from null to a string. No code was changed in this audit.
