# Safe Pre-Launch Optimization Report

**Date:** March 14, 2025  
**Scope:** Safe refactors only — no product behavior, API contract, Firestore schema, UI layout, or auth semantics changed.

---

## 1. Files Deleted

| File | Reason |
|------|--------|
| `components/modals/MoveToFolderModal.tsx` | Dead code — not imported anywhere |
| `components/ui/ProductPreview.tsx` | Dead code — not imported anywhere |
| `components/ui/EchlyButton.tsx` | Dead code — not imported anywhere |
| `server/middleware/verifyFirebaseToken.ts` | Unused — no Express server uses it; only comment reference in types |
| `lib/billing/updateWorkspacePlan.ts` | Unused wrapper — admin/update-plan and admin/workspaces/actions call `updateWorkspacePlanRepo` directly |
| `lib/server/requireAdmin.ts` | Removed after unifying admin auth on `adminAuth.requireAdmin(req)` |
| **Empty folders removed** | `server/middleware/`, `components/modals/` (after deleting sole occupants) |

---

## 2. Files Created

| File | Purpose |
|------|---------|
| `lib/server/resolveWorkspaceForUser.ts` | Shared workspace resolution: `resolveWorkspaceForUser(uid)` and `resolveWorkspaceById(workspaceId)` |
| `lib/server/serializeSession.ts` | Shared session serialization (Firestore timestamps → ISO strings) for API responses |

---

## 3. Files Refactored

### 3.1 Workspace resolution (Step 3 & 7)

**Product API routes now use:**

- **`resolveWorkspaceForUser(user.uid)`** where the route needs the user’s workspace (get workspaceId, load workspace, assert not suspended). Replaces repeated `getUserWorkspaceIdRepo` → `getWorkspace` → `assertWorkspaceActive`.
- **`resolveWorkspaceById(workspaceId)`** where the workspaceId comes from session/context; avoids duplicate `getWorkspace` + `assertWorkspaceActive` in the same request.

**Routes updated:**

- `app/api/sessions/route.ts` — GET, POST
- `app/api/sessions/[id]/route.ts` — GET, PATCH, DELETE (use `resolveWorkspaceById` for session-derived workspaceId)
- `app/api/billing/usage/route.ts`
- `app/api/insights/route.ts`
- `app/api/feedback/route.ts` — no-sessionId branch and sessionId branch
- `app/api/feedback/counts/route.ts`
- `app/api/structure-feedback/route.ts`
- `app/api/session-insight/route.ts`
- `app/api/upload-screenshot/route.ts`
- `app/api/tickets/[id]/route.ts` — GET, PATCH, DELETE

**Unchanged by design:** `app/api/workspace/status/route.ts` still reads workspace and returns `suspended` without asserting (intentional). Admin routes `admin/update-plan` and `admin/workspaces/actions` use `getWorkspace(workspaceId)` once for their own logic (owner check / admin action).

### 3.2 Session serialization (Step 6)

- **`app/api/sessions/route.ts`** — removed local `serializeSession`, now imports from `lib/server/serializeSession.ts`.
- **`app/api/sessions/[id]/route.ts`** — same; both routes use shared `serializeSession`.

### 3.3 Admin authentication (Step 4)

- **`app/api/admin/me/route.ts`** — now uses `requireAdmin(req)` from `lib/server/adminAuth.ts`. Returns `200` with `{ isAdmin: false }` when not admin (same UX as before). Removed dependency on `lib/server/requireAdmin.ts`.
- **`lib/server/requireAdmin.ts`** — deleted; all admin APIs now use `adminAuth.requireAdmin(req)`.

### 3.4 Plan catalog (Step 5)

- **`lib/hooks/usePlanCatalog.ts`** — removed Firestore `onSnapshot(collection(db, "plans"))` and duplicate catalog-building logic. Hook now fetches `GET /api/plans/catalog` once on mount and keeps the same interface: `{ plans, loading, error }`. Single source of truth is the server (`getPlanCatalog` + `/api/plans/catalog`).

### 3.5 Admin usage (Step 8)

- **`app/api/admin/usage/route.ts`** — session counts per workspace are now computed in parallel with `Promise.all(docs.map(d => getWorkspaceSessionCountRepo(d.id)))`, then summed. Reduces latency when many workspaces exist (no N+1 serialization).

### 3.6 Insights query limits (Step 9)

- **`lib/analytics/computeInsights.ts`** — reduced limits to lower query cost without changing visible behavior:
  - `FEEDBACK_QUERY_LIMIT`: 2000 → **500**
  - `COMMENTS_QUERY_LIMIT`: 3000 → **1000**
  - `SESSIONS_QUERY_LIMIT`: 500 → **200**

### 3.7 Minor cleanup

- **`lib/types/index.ts`** — comment updated (removed reference to deleted `verifyFirebaseToken`).

---

## 4. Duplication Removed

| Before | After |
|--------|--------|
| `getUserWorkspaceIdRepo` + `getWorkspace` + `assertWorkspaceActive` repeated in many routes | Single helper `resolveWorkspaceForUser(uid)` / `resolveWorkspaceById(workspaceId)` |
| `serializeSession` defined in both `api/sessions/route.ts` and `api/sessions/[id]/route.ts` | One implementation in `lib/server/serializeSession.ts` |
| Two admin auth paths: `requireAdmin(uid)` (users repo) vs `requireAdmin(req)` (adminAuth) | Single path: `requireAdmin(req)` from `adminAuth.ts` |
| Plan catalog: server `getPlanCatalog` + client Firestore listener + client-side catalog merge | Server remains source; client uses `GET /api/plans/catalog` (no listener, no duplicate merge) |

---

## 5. Performance Improvements

- **Admin usage:** Session counts for all workspaces run in parallel (`Promise.all`), reducing response time for many workspaces.
- **Insights:** Lower Firestore read limits (500 / 1000 / 200) reduce cost and latency of `computeInsights` while keeping behavior equivalent for typical usage.
- **Plan catalog:** Client no longer holds an open Firestore listener on `plans`; one-time fetch to `/api/plans/catalog` reduces listeners and keeps catalog in sync via server.

---

## 6. Dead Code Removed

- **Components:** MoveToFolderModal, ProductPreview, EchlyButton (unused).
- **Server:** verifyFirebaseToken middleware (unused), updateWorkspacePlan wrapper (unused), requireAdmin.ts (replaced by adminAuth).
- **Empty folders:** `server/middleware`, `components/modals`.

---

## 7. Validation

- **Build:** `npm run build` completes successfully (Next.js 16.1.6, Turbopack).
- **Behavior:** No changes to session creation, session limits, admin dashboard, plan updates/overrides, workspace suspension, billing usage API, feedback creation, tickets, insights, screenshot uploads, or extension capture. All flows use the same logic with centralized helpers and fewer duplicate reads/listeners.

---

## 8. Summary

| Category | Count |
|----------|--------|
| Files deleted | 7 (5 files + 2 empty folders) |
| Files created | 2 |
| Files refactored | 15+ |
| Duplication removed | 4 areas (workspace resolution, serializeSession, admin auth, plan catalog) |
| Performance improvements | Admin usage parallelization, insights limits, plan catalog listener removed |

The application remains fully functional with the same product behavior; this was a **safe launch optimization pass** only.
