# Final System Lock Audit

Date: 2026-03-27
Repo: `C:/Users/user/Desktop/echly`

## Step 1 - Manual flow test (required gate)

Status: **NOT EXECUTED IN THIS RUN CONTEXT**

Reason:

- Authenticated browser interaction is required.
- This environment cannot execute your signed-in browser session end-to-end.

Required manual checklist (must be completed before production deploy):

1. Create feedback
2. Add comment
3. Edit comment
4. Delete comment
5. Resolve/reopen ticket
6. Create workspace (new user)
7. Refresh -> no duplicate workspace
8. Update settings
9. Session view tracking works

Rule:

- If any step fails, stop and fix before deploy.

## Step 2 - Firestore rules (production shape)

Current repository state:

- `firestore.rules` is already set to production server-authoritative policy:
  - workspace-scoped reads
  - client writes denied (`create/update/delete: false` for protected collections)
  - `plans` public read
  - `adminLogs` blocked

Note:

- Treat deployment as pending until Step 1 passes.

## Step 3 - Storage rules

Current repository state:

- `storage.rules` is set to:
  - `allow read, write: if false;`
- `firebase.json` includes:
  - `"storage": { "rules": "storage.rules" }`

## Step 4 - Reload app checks (post-deploy)

Pending (must run after successful deploy):

- dashboard loads
- sessions load
- feedback loads
- comments realtime works

## Step 5 - Permission error verification (post-deploy)

Pending (must run in browser console after deploy):

- no `Missing or insufficient permissions`
- no silent failures

## Step 6 - Share page test (post-deploy)

Pending:

- open public share link
- verify data loads via API
- verify screenshots load via signed URLs

## Step 7 - Final confirmation

Pending final sign-off criteria:

- identical UX
- improved security
- no data leakage

## Technical verification already completed

### A) No critical client writes

Searched for:

- `addDoc(`, `setDoc(`, `updateDoc(`, `runTransaction(`, `increment(`

Critical directories checked:

- `components/*`
- `hooks/*`
- `lib/client/*`
- `extension/*`

Result:

- No matches in these critical client surfaces.

### B) API coverage for writes

Confirmed API write paths in active client helpers:

- `/api/feedback`
- `/api/comments`
- `/api/users`
- `/api/workspaces`
- `/api/sessions` (and session subroutes)

Additional write APIs in use:

- `/api/tickets/[id]`
- `/api/upload-screenshot`
- `/api/upload-attachment`

## Deployment blocker currently observed

`firebase deploy --only firestore:rules,storage` currently fails until re-auth:

- `Authentication Error: Your credentials are no longer valid. Please run firebase login --reauth`

## Operator commands to complete activation

```bash
firebase login --reauth
firebase deploy --only firestore:rules,storage
```

After that, execute Steps 4-6 and mark all items PASS before final sign-off.
