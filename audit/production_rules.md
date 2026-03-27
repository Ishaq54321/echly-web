# Production Firestore & Storage security rules

This document describes the **Firestore schema and access patterns** inferred from `lib/repositories/*`, `lib/repositories/*.server.ts`, API routes under `app/api/`, and client realtime hooks. It then provides **copy-paste-ready** rules aligned with a **server-authoritative** model: **authenticated reads** where the user owns the data or is a **workspace member** on the same workspace, and **no direct client writes**.

---

## Step 1 — Firestore schema (from codebase)

### Collections and paths

| Collection / path | Purpose (from code) |
|-------------------|---------------------|
| `users/{uid}` | Profile, `workspaceId` link, optional `isAdmin`, etc. |
| `workspaces/{workspaceId}` | `ownerId`, `members[]`, billing, `stats`, session counts, entitlements, etc. |
| `sessions/{sessionId}` | `workspaceId`, `userId` (creator), counters (`openCount`, `feedbackCount`, …), `title`, `archived` / `isArchived`, `viewCount`, etc. |
| `feedback/{feedbackId}` | `workspaceId`, `userId`, `sessionId`, `status`, `isDeleted`, screenshot fields, etc. |
| `comments/{commentId}` | `workspaceId`, `userId`, `sessionId`, positions, etc. |
| `screenshots/{screenshotId}` | Metadata (`status` e.g. `TEMP` / `ATTACHED`), linkage to feedback; **writes via Admin SDK** in `screenshotsRepository` |
| `sessionViews/{sessionId}/views/{viewerId}` | Per-viewer view tracking; `viewedAt` |
| `session_shares/{shareId}` | Email shares: `sessionId`, `email`, `permission` (`view` / `comment` / `resolve`) |
| `share_links/{linkId}` | Share links; **Admin / server** (`shareLinksRepository` uses Admin) |
| `plans/{planId}` | Plan catalog (prices, limits); read by `getPlanCatalog()` (client SDK + defaults) |
| `adminLogs/{id}` | Admin audit entries (`lib/admin/adminLogs.ts`) |
| `workspaces/{workspaceId}/insights/{docId}` | Aggregated insights (e.g. doc id `main`); path `workspaceInsightsRef` → `insights/main` |

### Ownership and scoping fields

- **`userId`**: Present on `sessions`, `feedback`, `comments` — typically the **creator** or **author** (legacy “solo” semantics).
- **`workspaceId`**: Present on workspace-scoped `sessions`, `feedback`, `comments`; ties rows to `workspaces/{workspaceId}`.
- **`users/{uid}.workspaceId`**: User’s **primary** workspace; used with `workspaceIdForUser()`-style checks in existing `firestore.rules`.

### Relationships

- **User → workspace**: `users/{uid}.workspaceId` → `workspaces/{workspaceId}`; workspace has `members` and `ownerId`.
- **Session → workspace**: `sessions.workspaceId` + `sessions.userId` (creator).
- **Feedback / comments → session**: `sessionId` + `workspaceId` for workspace-scoped data.
- **Insights**: Nested under `workspaces/{workspaceId}/insights/main`, updated in transactions with feedback/comments (client `insightsRepository` today).
- **Screenshots**: Firestore doc + Storage object at `sessions/{sessionId}/screenshots/{id}.png` (from `upload-screenshot` route).

---

## Step 2 — Access patterns (who reads / writes)

### Reads (client)

- **Authenticated**: Dashboard `onSnapshot` on `sessions` where `userId == auth.uid` (`useWorkspaceOverview`); realtime `feedback` by `sessionId` (`feedbackStore`); `workspaces/{id}` (`workspaceStore`); `users/{uid}` for `workspaceId` (`SessionPageClient`); `comments` by session; `feedback` for discussion feed (`userId` + `commentCount`); `workspaces/{uid}/insights/main` for insights UI (uses **auth uid** as workspace id in path — consistent with default “workspace id = user id” bootstrap in `ensureUserWorkspaceLinkRepo`).
- **Unauthenticated**: `usePublicSessionRealtime` subscribes to `feedback` for a **sessionId** **without** requiring Firebase Auth — **public share** viewers.

### Writes

- **API / Admin SDK** (bypass security rules): `app/api/feedback/post.ts` uses `feedbackRepository.server`; sessions creation and many mutations go through API or server repos; screenshot upload uses **Admin** Storage.
- **Client SDK today** (would be **denied** by the rules below until migrated): `sessionsRepository` (e.g. `updateDoc` on sessions, `recordSessionViewIfNewRepo` transaction on `sessionViews` + `sessions`), `feedbackRepository`, `commentsRepository`, `usersRepository`, `insightsRepository` transactions, `deleteSessionRepo`, etc.

### Storage

- Uploads use **firebase-admin** `bucket.file(...).save` and **signed URLs** (`getSignedUrl`) for reads — **not** client Storage SDK rules for those flows.

---

## Step 3 — Firestore rules (copy-paste)

**Intent:** `request.auth.uid != null` for all **allowed** reads; resource visible only if **legacy owner** (`userId`) or **workspace member** whose `users/{uid}.workspaceId` equals the document’s `workspaceId`. **All client writes denied.**

> **Deploy note:** Firestore evaluates **every** document in a query against these rules. Composite indexes in `firestore.indexes.json` (if any) must still match your queries.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null && request.auth.uid != null;
    }

    function userDoc(uid) {
      return get(/databases/$(database)/documents/users/$(uid));
    }

    function workspaceIdForUser() {
      return signedIn() && userDoc(request.auth.uid).exists()
        ? userDoc(request.auth.uid).data.workspaceId
        : null;
    }

    function isWorkspaceMember(workspaceId) {
      return signedIn()
        && exists(/databases/$(database)/documents/workspaces/$(workspaceId))
        && request.auth.uid in get(/databases/$(database)/documents/workspaces/$(workspaceId)).data.members;
    }

    function canReadWorkspaceScoped(workspaceId) {
      return workspaceId is string
        && isWorkspaceMember(workspaceId)
        && workspaceIdForUser() == workspaceId;
    }

    function canReadLegacyUserScoped(userId) {
      return userId == request.auth.uid;
    }

    function canReadSessionDoc() {
      return signedIn() && (
        (resource.data.workspaceId is string && canReadWorkspaceScoped(resource.data.workspaceId))
        || (resource.data.workspaceId == null && canReadLegacyUserScoped(resource.data.userId))
      );
    }

    function canReadFeedbackCommentDoc() {
      return signedIn() && (
        (resource.data.workspaceId is string && canReadWorkspaceScoped(resource.data.workspaceId))
        || (resource.data.workspaceId == null && canReadLegacyUserScoped(resource.data.userId))
      );
    }

    match /users/{uid} {
      allow read: if signedIn() && request.auth.uid == uid;
      allow create, update, delete: if false;
    }

    match /workspaces/{workspaceId} {
      allow read: if isWorkspaceMember(workspaceId);
      allow create, update, delete: if false;
    }

    match /workspaces/{workspaceId}/insights/{docId} {
      allow read: if canReadWorkspaceScoped(workspaceId);
      allow create, update, delete: if false;
    }

    match /sessions/{sessionId} {
      allow read: if canReadSessionDoc();
      allow create, update, delete: if false;
    }

    match /feedback/{feedbackId} {
      allow read: if canReadFeedbackCommentDoc();
      allow create, update, delete: if false;
    }

    match /comments/{commentId} {
      allow read: if canReadFeedbackCommentDoc();
      allow create, update, delete: if false;
    }

    match /sessionViews/{sessionId}/views/{viewerId} {
      allow read: if signedIn() && request.auth.uid == viewerId;
      allow create, update, delete: if false;
    }

    match /session_shares/{shareId} {
      function ownsSharedSession(sessionId) {
        return signedIn()
          && exists(/databases/$(database)/documents/sessions/$(sessionId))
          && get(/databases/$(database)/documents/sessions/$(sessionId)).data.userId == request.auth.uid;
      }

      allow read: if resource.data.sessionId is string
        && ownsSharedSession(resource.data.sessionId);
      allow create, update, delete: if false;
    }

    // Non-sensitive catalog; also read by unauthenticated server paths using client SDK (fallback to code defaults on failure).
    match /plans/{planId} {
      allow read: if true;
      allow create, update, delete: if false;
    }

    match /screenshots/{screenshotId} {
      allow read, write: if false;
    }

    match /share_links/{linkId} {
      allow read, write: if false;
    }

    match /adminLogs/{logId} {
      allow read, write: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Rule-by-rule explanation

| Rule block | Behavior |
|------------|----------|
| **Helpers** | `workspaceIdForUser()` mirrors the app’s “primary workspace” on `users/{uid}`; `canReadWorkspaceScoped` enforces membership **and** that the user’s linked workspace matches the document (same pattern as the repo’s historical rules). |
| **users** | Users may **read only** their own profile; **no** client profile/workspace linking. |
| **workspaces** | Members may **read** workspace docs; **no** client mutations (billing/members should go through Admin/API). |
| **workspaces/.../insights** | Same workspace gate as other workspace-scoped data; **no** client writes (insights updates should move to Admin/API if rules are deployed). |
| **sessions / feedback / comments** | **Read** if workspace-scoped and member + primary workspace match, **or** legacy `workspaceId == null` and `userId` is the caller. **No** client writes. |
| **sessionViews** | **Read** only the viewer’s own leaf doc (`viewerId == auth.uid`); **no** writes (replaces old client transaction for view counts). |
| **session_shares** | **Read** only for **session owner** (`sessions.userId`); **no** client writes (aligns with server-managed shares). |
| **plans** | **World-readable** catalog so optional pricing docs work even without auth; **no** client writes. Tighten to `signedIn()` if you require auth for catalog reads only. |
| **screenshots / share_links / adminLogs** | **Deny** all client access; server uses Admin SDK. |
| **Catch-all** | Denies anything not listed (e.g. new collections until you add explicit matches). |

---

## Step 4 — Storage rules (copy-paste)

All application uploads and downloads observed in-repo use **Admin SDK** (`getStorage().bucket()`, signed URLs). **Client** Storage SDK access can be fully denied.

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Optional later tightening / exceptions

- If you ever need **direct** client uploads (not recommended for this app), scope a path like `sessions/{sessionId}/screenshots/{fileName}` with `request.auth != null` **and** custom metadata checks — still prefer signed URLs + Admin.
- **Signed URLs** generated by the server **do not** evaluate these rules; they remain valid for the token lifetime.

---

## Step 5 — Risks and assumptions

1. **Public share realtime (`usePublicSessionRealtime`)**  
   Subscribes to `feedback` **without** Firebase Auth. Rules above require **`signedIn()`** for `feedback` reads → **public pages will fail** unless you add **anonymous auth**, move public reads to **Cloud Functions + limited queries**, or serve sanitized data **only via your API**.

2. **Client writes today**  
   Many repositories still use the **client** Firestore SDK for writes (sessions, feedback, comments, users, insights transactions, view tracking). Deploying **deny-all client writes** **breaks** those paths until they are **moved to API routes / Admin SDK** (no runtime code changes were requested here — this is a **deployment prerequisite**).

3. **`workspaceIdForUser()` single-workspace assumption**  
   Rules allow workspace-scoped reads only when the user’s **`users/{uid}.workspaceId`** equals the document’s `workspaceId`. Users in **multiple workspaces** (if introduced later) need a different model (e.g. custom claims or a `workspace_members/{uid}_{ws}` collection read by rules).

4. **`session_shares` read = session `userId` only**  
   Matches current `firestore.rules` owner check. Workspace **admins** who are not `sessions.userId` cannot read `session_shares` via client; server/Admin already can.

5. **`plans` public read**  
   If plan documents ever include **secrets**, replace `allow read: if true` with stricter rules and migrate `getPlanCatalog` callers to **Admin SDK** on the server.

6. **List queries**  
   Every document in the result must satisfy the **read** rule. Mixed legacy + workspace data in one query can be **impossible** if the query doesn’t filter consistently — validate each client query shape after deploy.

7. **Indexes**  
   Denying reads does not remove the need for **composite indexes** for allowed queries.

---

## Step 6 — Verification checklist

Use this after deploying rules (and after any required **code** migration for writes / public share).

| Check | How to verify |
|-------|----------------|
| **User can read own sessions** | Sign in; run the same `sessions` queries the dashboard uses; expect **permission-denied** only if legacy/workspace fields don’t match `users/{uid}.workspaceId`. |
| **User cannot read others’ data** | Sign in as user A; attempt `getDoc` / query on user B’s `feedback`, `sessions`, or `workspaces` where B’s workspace is not yours → **denied**. |
| **API still works** | Exercise `POST /api/feedback`, session APIs, admin paths using **Admin SDK** → **unchanged** (rules do not apply to Admin). |
| **Signed URLs still work** | Upload via `/api/upload-screenshot`; open returned **signed URL** in a browser → **200** (Storage rules do not block Admin-signed URLs). |
| **Workspace member read** | User in workspace W can read `sessions` / `feedback` with `workspaceId == W` and `users/{uid}.workspaceId == W`. |
| **Legacy docs** | `workspaceId == null` and `userId == auth.uid` still readable by that user. |
| **Public share (if product requires it)** | Without auth, public viewer loads shared session → if you need this, confirm **anonymous sign-in** or **rule exception** is implemented; otherwise expect failure. |
| **Insights page** | Authenticated user reads `workspaces/{workspaceId}/insights/main` for their workspace → **allowed** when `workspaceId` matches `workspaceIdForUser()` and user is in `members`. |
| **Plan catalog / billing fallbacks** | `getPlanCatalog` may run **unauthenticated** from API — **plans** read allowed; if you restrict `plans`, confirm API still returns defaults. |

---

## Summary

- **Firestore:** Authenticated reads for **own legacy rows** or **same primary workspace** as in `users/{uid}.workspaceId`; explicit matches for `users`, `workspaces`, nested **insights**, `session_shares` (owner), and public **`plans`**; **no** direct client writes anywhere in the matrix above.
- **Storage:** Deny all client access; rely on **Admin** uploads and **signed URLs** for reads.
- **Before production:** Resolve **public unauthenticated feedback listeners** and **all remaining client Firestore writes** against these rules.
