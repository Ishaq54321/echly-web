# NBIB audit — backend enforcement (`/api/*`, server repos, Firestore rules)

---

## API patterns observed

| Pattern | Where | Mark |
|---------|-------|------|
| `requireAuth(req)` | Most authenticated routes (e.g. `app/api/sessions/route.ts`, `app/api/billing/usage/route.ts`, `app/api/users/route.ts`) | ✅ SAFE |
| `getUserWorkspaceIdRepo(user.uid)` then query `.where("workspaceId", "==", workspaceId)` | `GET/POST app/api/sessions/route.ts` | ✅ SAFE |
| `withAuthorization` + `resolveWorkspace` + equality check user workspace vs resource workspace | `app/api/tickets/[id]/route.ts` and `lib/server/auth/withAuthorization.ts` | ✅ SAFE |
| `GET /api/feedback/counts` | `requireAuth` optional; if authed, compares `getUserWorkspaceIdRepo` to `session.workspaceId`; else share `token` path | ✅ SAFE (dual mode) |
| `PATCH app/api/workspaces/route.ts` | Audited file imports `requireAuth`, `getUserWorkspaceIdRepo` — user-scoped updates | ✅ SAFE (pattern present) |
| Admin routes | `requireAuth` + admin checks (`app/api/admin/*`) | ✅ SAFE (separate role) |

---

## Firestore security rules (`firestore.rules`)

| Rule | Detail | Mark |
|------|--------|------|
| Reads | `sameWorkspace(workspaceId)` uses `request.auth.token.workspaceId` | ✅ SAFE for read isolation when token claim set |
| Writes | `allow write: if false` on `users`, `workspaces`, `sessions`, `feedback`, `comments` | ✅ SAFE — no client direct writes |
| Default | `match /{document=**}` deny | ✅ SAFE |

**Note:** Enforcement assumes **custom claim** `workspaceId` is present on tokens used for client SDK reads. `WorkspaceProvider` sets `claimsReady` after `getIdToken(true)` post `/api/users` sync to align with this.

---

## Gaps / inconsistencies

| Item | Detail | Mark |
|------|--------|------|
| Route coverage | Not every file under `app/api` was line-audited; sampled representative CRUD and billing | ⚠️ PARTIAL |
| Extension auth | `app/api/feedback/route.ts` supports extension/Bearer paths — separate auth surface | ⚠️ PARTIAL — requires its own threat model |
| `requireAuth` fallback | `withAuthorization.ts` logs `usedFallback` — indicates multiple auth paths | ⚠️ PARTIAL |

---

## Overall backend grade (this audit slice)

**✅ SAFE — strict enforcement** for core workspace-scoped session/ticket flows audited, plus rules denying client writes.
