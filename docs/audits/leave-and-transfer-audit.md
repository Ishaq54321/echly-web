# Self-Leave & Ownership Transfer — Read-Only Audit

**Date:** 2026-05-20
**Scope:** Confirm whether members can voluntarily leave a workspace, and scope what already exists / is missing for "transfer ownership".

---

## TL;DR

- **Self-leave: DOES NOT EXIST.** No `/leave` route. The single member-deletion route at [app/api/workspace/members/[uid]/route.ts](../../app/api/workspace/members/[uid]/route.ts) explicitly blocks `targetUid === user.uid` with `CANNOT_REMOVE_SELF` and additionally requires `callerMember.role === "OWNER"`, so a non-owner has no path out and an owner cannot remove themselves either.
- **Transfer ownership: FULLY IMPLEMENTED** (server + UI). [app/api/workspace/ownership/route.ts](../../app/api/workspace/ownership/route.ts) PATCH handler, [transferWorkspaceOwnershipRepo](../../lib/repositories/workspaceMembersRepository.server.ts#L224) repo function, and Danger-Zone modal at [app/(app)/settings/page.tsx:2900-3010](../../app/(app)/settings/page.tsx#L2900) all wired. Calls `setWorkspaceClaims` for both users.
- **Gap 1 (transfer):** No gate on billing state — transferring while `suspended`, `past_due`, or `cancelAt` is set is currently allowed. Decision needed: block or allow.
- **Gap 2 (transfer):** Stripe Customer `email` is **not** updated post-transfer. Workspace-side billing emails *do* auto-route to the new owner (webhook reads `workspace.ownerId → users.email` each time), but Stripe Dashboard/receipts and Customer Portal show the **old owner's email** until manually updated.
- **Gap 3 (transfer):** Single-step, immediate. New owner does not accept — could be intentional, but worth confirming.

---

## SECTION 1 — Self-Leave: does it exist?

### 1.1 Route search
No file exists at `app/api/workspace/leave/route.ts` or any path containing `leave`.

Grep for `leave` (case-insensitive) under `app/api/workspace/` returned only:
- [app/api/workspace/invitations/accept/[token]/route.ts](../../app/api/workspace/invitations/accept/[token]/route.ts) — `leave` appears in comments only.
- [app/api/workspace/members/[uid]/route.ts](../../app/api/workspace/members/[uid]/route.ts) — same, comments only.

### 1.2 Frontend — "leave workspace" UI
Grep for `Leave workspace` / `Leave this workspace` / `leave workspace` in `components/` and `app/(app)/`: **zero matches**.

`leave` matches in `components/` were all unrelated:
- `onMouseLeave` event handlers (~20 hits)
- [components/dashboard/LeaveSessionModal.tsx](../../components/dashboard/LeaveSessionModal.tsx) — leaves a **shared session**, not a workspace
- [components/dashboard/SessionsWorkspace.tsx:424](../../components/dashboard/SessionsWorkspace.tsx#L424) — "Leave session" tooltip (also session-scoped)

No workspace-leave button or modal exists anywhere in the codebase.

### 1.3 Self-leave route — N/A
Not found.

### 1.4 All DELETE routes under `app/api/workspace/`
| File | Subject | Could a member self-remove via it? |
|---|---|---|
| [members/[uid]/route.ts](../../app/api/workspace/members/[uid]/route.ts) | Remove a workspace member | **No** — line 31-33 hard-blocks `targetUid === user.uid` with `CANNOT_REMOVE_SELF`; line 41-43 also requires `OWNER` role on caller. |
| [route.ts](../../app/api/workspace/route.ts) | Soft-delete the entire workspace | No — owner only, deletes whole workspace |
| [members/invitations/[token]/route.ts](../../app/api/workspace/members/invitations/[token]/route.ts) | Revoke a pending invite | No — invite revocation, not member leave |
| [logo/route.ts](../../app/api/workspace/logo/route.ts), [brand-logo/route.ts](../../app/api/workspace/brand-logo/route.ts) | Remove uploaded logos | N/A |

**Conclusion: there is no path for a member to voluntarily leave a workspace.** They can be removed only by the owner, and the owner cannot remove themselves.

---

## SECTION 2 — Current Ownership Model

### 2.1 `ownerId` field
- **Schema:** [lib/domain/workspace.ts:25](../../lib/domain/workspace.ts#L25) — `ownerId: string` on `Workspace` interface.
- **Default value:** [lib/domain/workspace.ts:172](../../lib/domain/workspace.ts#L172) — set to `params.ownerId` in `defaultWorkspaceDoc`.
- **Read sites** (selected; grep for `ownerId` returned 25 files):
  - [app/api/billing/portal/route.ts:28](../../app/api/billing/portal/route.ts#L28) — owner-only portal gate
  - [app/api/billing/checkout/route.ts:28](../../app/api/billing/checkout/route.ts#L28) — owner-only checkout
  - [app/api/billing/history/route.ts:32](../../app/api/billing/history/route.ts#L32) — owner-only invoice history
  - [app/api/billing/invoice/[id]/route.ts:39](../../app/api/billing/invoice/[id]/route.ts#L39) — owner-only invoice download
  - [app/api/billing/webhook/route.ts:33-39](../../app/api/billing/webhook/route.ts#L33-L39) — derives `ownerEmail` from `workspace.ownerId → users/{ownerId}.email` for every billing email
  - [app/api/workspace/memberships/route.ts:76](../../app/api/workspace/memberships/route.ts#L76) — `isOwner: data.ownerId === user.uid` flag
  - [app/api/workspace/members/invite/route.ts:72](../../app/api/workspace/members/invite/route.ts#L72), [invite-batch/route.ts:121](../../app/api/workspace/members/invite-batch/route.ts#L121) — `isOwnerByField` check
  - [app/api/onboarding/route.ts](../../app/api/onboarding/route.ts), [app/api/workspaces/route.ts](../../app/api/workspaces/route.ts), [app/api/admin/workspaces/route.ts](../../app/api/admin/workspaces/route.ts), [app/admin/customers/page.tsx](../../app/admin/customers/page.tsx)
  - [lib/email/planLimitDispatch.server.ts:102](../../lib/email/planLimitDispatch.server.ts#L102) — sends plan-limit emails to owner
  - [lib/client/workspaceContext.tsx](../../lib/client/workspaceContext.tsx) — exposes `isWorkspaceOwner` to the client
- **Write sites:**
  - [lib/repositories/workspacesRepository.server.ts:45](../../lib/repositories/workspacesRepository.server.ts#L45) — initial creation via `defaultWorkspaceDoc`
  - [lib/repositories/workspaceMembersRepository.server.ts:232](../../lib/repositories/workspaceMembersRepository.server.ts#L232) — `transferWorkspaceOwnershipRepo` updates `ownerId`
  - **No other writes.** No admin override route, no migration script.
- **Multiple admins / co-owners:** **No.** Member role type is `"OWNER" | "MEMBER"` only (see [getAccessContext.ts:456](../../lib/access/getAccessContext.ts#L456)). The `usersRepository.workspaceMemberships` array allows multiple workspace memberships per user, but each workspace has exactly one OWNER role member at a time.

### 2.2 Behaviors gated on "is owner"
**Two parallel checks coexist in the codebase:**
- `workspace.ownerId === user.uid` (direct doc-field check)
- `callerMember.role === "OWNER"` (subcollection role check)

Invite routes ([invite/route.ts:72-74](../../app/api/workspace/members/invite/route.ts#L72), [invite-batch/route.ts:121-123](../../app/api/workspace/members/invite-batch/route.ts#L121)) defensively check **both** — likely tolerating temporary drift.

**Owner-gated actions (all server-side):**
| Action | File:line | Check style |
|---|---|---|
| Update workspace settings (name, logo, appearance, etc.) | [app/api/workspace/route.ts:42](../../app/api/workspace/route.ts#L42) (DELETE handler) — plus PATCH handlers across the same file group | role-based |
| Workspace soft-delete | [app/api/workspace/route.ts:42](../../app/api/workspace/route.ts#L42) | role-based |
| Transfer ownership | [app/api/workspace/ownership/route.ts:50](../../app/api/workspace/ownership/route.ts#L50) | role-based |
| Remove a member | [app/api/workspace/members/[uid]/route.ts:41](../../app/api/workspace/members/[uid]/route.ts#L41) | role-based |
| Invite members (single & batch) | [members/invite/route.ts:74](../../app/api/workspace/members/invite/route.ts#L74), [invite-batch/route.ts:123](../../app/api/workspace/members/invite-batch/route.ts#L123) | role + ownerId belt-and-suspenders |
| Revoke invitations | [members/invitations/route.ts:29](../../app/api/workspace/members/invitations/route.ts#L29), [[token]/route.ts:35](../../app/api/workspace/members/invitations/[token]/route.ts#L35) | role-based |
| Resend invitation | [members/invitations/[token]/resend/route.ts:40](../../app/api/workspace/members/invitations/[token]/resend/route.ts#L40) | role-based |
| Upload/replace workspace logo | [workspace/logo/route.ts:105, 191](../../app/api/workspace/logo/route.ts#L105) | role-based |
| Upload/replace brand logo (whitelabel) | [workspace/brand-logo/route.ts:109, 215](../../app/api/workspace/brand-logo/route.ts#L109) | role-based |
| Stripe Checkout | [app/api/billing/checkout/route.ts:28](../../app/api/billing/checkout/route.ts#L28) | ownerId-based |
| Stripe Billing Portal access | [app/api/billing/portal/route.ts:28](../../app/api/billing/portal/route.ts#L28) | ownerId-based |
| Read billing history | [app/api/billing/history/route.ts:32](../../app/api/billing/history/route.ts#L32) | ownerId-based |
| Download invoice | [app/api/billing/invoice/[id]/route.ts:39](../../app/api/billing/invoice/[id]/route.ts#L39) | ownerId-based |
| Receive billing-related emails | [app/api/billing/webhook/route.ts:33-39](../../app/api/billing/webhook/route.ts#L33-L39) | derives recipient from ownerId |
| Notification fan-out target | [lib/server/notificationFanOut.server.ts:47](../../lib/server/notificationFanOut.server.ts#L47) | role-based |
| Session access-request grant | [app/api/sessions/[sessionId]/request-access/route.ts:139](../../app/api/sessions/[sessionId]/request-access/route.ts#L139) | role-based |

**UI gates** (`useWorkspace().isWorkspaceOwner`): brand-logo upload, transfer button, delete button, Danger Zone visibility, plan/billing controls — see [settings/page.tsx:448, 803, 2900, 2915, 2930, 3205, 3388, 3423](../../app/(app)/settings/page.tsx#L448).

### 2.3 Existing transfer-ownership code
**Server (complete):**
- `PATCH /api/workspace/ownership` — [app/api/workspace/ownership/route.ts](../../app/api/workspace/ownership/route.ts) (95 lines)
  - Auth via `requireAuth`
  - Validates `newOwnerUid` is a string
  - Rejects self-transfer with `ALREADY_OWNER` (line 37-39)
  - Calls `assertWorkspaceActive(workspace)` — **note: does NOT pass `allowSuspended`, so suspended workspaces are blocked** (this is the only billing-state gate, and it's incidental)
  - Requires `callerMember.role === "OWNER"`
  - Requires `body.confirmName === workspace.name` (typed-confirmation)
  - Verifies new owner is a workspace member with `NOT_A_MEMBER`
  - Atomic transfer via `transferWorkspaceOwnershipRepo`
  - Re-issues `setWorkspaceClaims` for both old and new owner (preserves their `workspaceMemberships` arrays; appends active workspace if missing)
- `transferWorkspaceOwnershipRepo` — [lib/repositories/workspaceMembersRepository.server.ts:224-237](../../lib/repositories/workspaceMembersRepository.server.ts#L224-L237)
  - Single batched write: old owner → `MEMBER`, new owner → `OWNER`, `workspaces/{id}.ownerId` updated, `updatedAt` set.

**Client (complete):**
- Transfer button: [app/(app)/settings/page.tsx:2900-2913](../../app/(app)/settings/page.tsx#L2900) (Danger Zone, owner-only)
- State management: [app/(app)/settings/page.tsx:2708-2716](../../app/(app)/settings/page.tsx#L2708)
- Submit handler: [app/(app)/settings/page.tsx:2744-2772](../../app/(app)/settings/page.tsx#L2744)
- Modal UI: [app/(app)/settings/page.tsx:2937-3010+](../../app/(app)/settings/page.tsx#L2937) — member dropdown (excludes current OWNER) + typed workspace-name confirmation

**Nothing is stubbed.** This feature already shipped.

---

## SECTION 3 — Dependencies on Ownership

### 3.1 Owner-only actions
Mapped in 2.2 above. Summary: workspace settings mutations, member management, all billing operations, workspace deletion, transfer itself.

### 3.2 Lifecycle scenarios
- **Owner deletes their own account:** No dedicated user-deletion flow was found in `app/api/`. (Grep for routes containing "account", "user/delete", "delete-account" turns up nothing relevant.) If a user doc is deleted out of band, `workspace.ownerId` becomes a dangling reference; billing emails would silently no-op (`users/{ownerId}.get()` returns `!exists` → `ownerEmail: null` → `getWorkspaceContext` returns null email).
- **Owner is removed from the workspace:** Blocked. [members/[uid]/route.ts:49-58](../../app/api/workspace/members/[uid]/route.ts#L49-L58) — if `targetMember.role === "OWNER"` and `ownerCount <= 1`, returns `LAST_OWNER`. With only one OWNER per workspace currently, this is always blocked. (Self-removal of owner is also blocked separately by `CANNOT_REMOVE_SELF`.)
- **Owner's auth account is deactivated:** No code path observed. `ownerId` would persist; member doc and claims would persist until manual cleanup.

### 3.3 Firestore custom claims tied to ownership
[lib/server/setWorkspaceClaim.ts](../../lib/server/setWorkspaceClaim.ts) writes only two claims:
- `workspaceId` — active workspace
- `workspaceIds` — array of all workspace memberships

**No `workspaceOwner` claim, no role claim.** Owner status is determined by the workspace doc + member subcollection role, not by JWT. This is good for transfer — claims structure is identical for owner and member, so the existing transfer route's claim re-issue is sufficient.

---

## SECTION 4 — Billing Implications of Transfer

### 4.1 `billing.customerId` ownership
[lib/domain/workspace.ts:72](../../lib/domain/workspace.ts#L72) — `customerId` lives on `workspace.billing`. **Per-workspace, not per-user.** ✅ Correct shape for transfer; the Stripe customer survives owner changes.

### 4.2 Stripe customer email at checkout
[lib/billing/payments/stripe.ts:69-74](../../lib/billing/payments/stripe.ts#L69-L74):
```ts
const customerParam =
  params.existingCustomerId
    ? { customer: params.existingCustomerId }
    : { customer_email: params.ownerEmail };
```
- `ownerEmail` is passed as Stripe's `customer_email` only on the **first** checkout (when no Stripe customer exists yet).
- Source of `ownerEmail`: [app/api/billing/checkout/route.ts:74](../../app/api/billing/checkout/route.ts#L74) — `user.email ?? ""` (the authenticated caller, who is the owner at the time of upgrade).
- Stripe creates a Customer object with that email. **It is NOT re-synced** on subsequent checkouts or anywhere else.

**Consequence:** After ownership transfer, Stripe's Customer object retains the **original owner's email**. This shows up in:
- Stripe Dashboard's customer record
- Stripe-generated receipts (if `receipt_email` is left to Stripe defaults)
- The Customer Portal's account page (the new owner sees the old owner's email)

### 4.3 Workspace-side billing email recipient
[app/api/billing/webhook/route.ts:27-43](../../app/api/billing/webhook/route.ts#L27-L43) `getWorkspaceContext`:
```ts
const ws = wsSnap.data() as { ownerId?: string; name?: string };
...
const userSnap = await adminDb.doc(`users/${ws.ownerId}`).get();
const u = userSnap.data() as { email?: string };
return { ownerEmail: u?.email ?? null, workspaceName };
```
Called by every billing email send path (subscription confirmation, cancellation, payment failed, renewal receipt, upcoming renewal reminder, card expiring, payment method updated — lines 302, 459, 523, 616, 683, 736).

**✅ Self-correcting after transfer.** The webhook reads `ownerId` fresh on each event, then looks up that user's current email. Echly-side billing emails automatically route to the new owner. No code change needed for this path.

### 4.4 Customer Portal access
[app/api/billing/portal/route.ts:28-34](../../app/api/billing/portal/route.ts#L28-L34) — restricted to `workspace.ownerId === user.uid`. After transfer, the new owner gains portal access; old owner loses it. ✅ Correct.

---

## SECTION 5 — Edge Cases for Ownership Transfer

Each scenario evaluated against the **current** code at [app/api/workspace/ownership/route.ts](../../app/api/workspace/ownership/route.ts):

| # | Scenario | Current behavior | Recommendation |
|---|---|---|---|
| A | Transfer to a non-member | Rejected with `NOT_A_MEMBER` (line 60-61). ✅ | Keep as-is, or auto-invite — see UNKNOWN #4. |
| B | Transfer to user with pending invitation (not accepted) | Rejected — they aren't in the members subcollection yet, so `getWorkspaceMemberRepo` returns null → `NOT_A_MEMBER`. ✅ Likely correct. | Keep. |
| C | Transfer while `past_due` / `suspended` | **Partially blocked.** `assertWorkspaceActive(workspace)` without `allowSuspended: true` blocks suspended workspaces. `past_due` is *not* a workspace-level flag (it's a Stripe subscription status), so past_due transfers go through. | Decide whether `past_due` should block. See UNKNOWN #2. |
| D | Transfer with `cancelAt` set (mid-cancellation grace) | **Allowed.** No check. The subscription is still active. | Probably correct — the new owner inherits a workspace that will downgrade on `cancelAt`. Surface in UI? UNKNOWN #3. |
| E | Old owner is the only owner | Always true today (single-owner model). The "ALREADY_OWNER" check prevents the noop. ✅ | N/A. |
| F | Transfer initiated but new owner refuses | **N/A — single-step, immediate.** No accept step. | Decide: two-step accept flow or keep immediate. UNKNOWN #5. |
| G | Transfer of a comp workspace (`manualOverride=true`) | **Allowed.** No billing implications — no Stripe customer, no portal. ✅ | Keep. |
| H | Transfer of active Business workspace — Stripe customer email | **Not updated.** Stripe Customer keeps the old owner's email. Workspace-side emails auto-update via `getWorkspaceContext`. | Add a Stripe `customers.update({ email })` call inside the transfer route after `transferWorkspaceOwnershipRepo` succeeds. See UNKNOWN #6. |

---

## SECTION 6 — UI / UX Touchpoints

### 6.1 Where transfer-ownership lives today
[app/(app)/settings/page.tsx](../../app/(app)/settings/page.tsx) — `Workspace` tab → "Danger Zone" collapsible card → "Transfer Workspace Ownership" row ([line 2900-2913](../../app/(app)/settings/page.tsx#L2900)).

- Tab structure: tabs are `"profile" | "workspace" | "security" | "billing"` ([settings/page.tsx:103](../../app/(app)/settings/page.tsx#L103)).
- Danger Zone: visible only to `isWorkspaceOwner`, contains Transfer + Delete Workspace ([line 2882-2935](../../app/(app)/settings/page.tsx#L2882-L2935)).
- Non-owners see: *"Only the workspace owner can perform these actions."* ([line 2930-2932](../../app/(app)/settings/page.tsx#L2930)).

### 6.2 Where a "Leave workspace" button would go
Currently no such UI. Natural placement: same Danger Zone card, but visible to **non-owners only** (owners can't leave without transferring first). Alternative: a member-row self-action (small "Leave" button next to your own row in the members list) — but Danger Zone is more discoverable and consistent with existing destructive actions.

### 6.3 Members page — current actions
- Lives in the same Workspace tab, rendered by `MembersTableRow` ([line 2044-2295+](../../app/(app)/settings/page.tsx#L2044)).
- Visible actions per row (owner-only, never on owner row, only on hover):
  - **Active member:** Remove (with inline confirm, [line 2153-2165](../../app/(app)/settings/page.tsx#L2153))
  - **Pending invitation:** Revoke, Resend ([line 2166](../../app/(app)/settings/page.tsx#L2166))
- No role-change action (role is binary OWNER/MEMBER; OWNER changes only via transfer).
- No self-leave action.

---

## SECTION 7 — Recommended Implementation Scope

### 7.1 Self-Leave — **NEW FEATURE**

**Routes needed:**
- `POST /api/workspace/leave` (preferred over DELETE — clearer that this is a user-initiated action on themselves, not a resource deletion).
  - `requireAuth` → derive `workspaceId` from `getUserWorkspaceIdRepo`
  - Look up `callerMember` in members subcollection
  - **Hard-block if `callerMember.role === "OWNER"`** with `OWNER_MUST_TRANSFER_FIRST` — owners can't leave; they must transfer or delete the workspace.
  - Reuse `removeWorkspaceMemberRepo` (already cascades sessionAccess + per-session member mirror docs — see [workspaceMembersRepository.server.ts:115-157](../../lib/repositories/workspaceMembersRepository.server.ts#L115))
  - Reuse the claim-repointing logic from [members/[uid]/route.ts:79-112](../../app/api/workspace/members/[uid]/route.ts#L79-L112) (deterministic pick of next active workspace, clear claims, etc.) — **extract this into a helper** so both routes share it instead of duplicating.
  - Notion-style seats: do NOT decrement `billing.seats` or Stripe quantity (consistent with admin-removal behavior — see comment at [members/[uid]/route.ts:63-71](../../app/api/workspace/members/[uid]/route.ts#L63)).
- Backend changes only — no domain/repo changes needed; existing primitives are reusable.

**Frontend changes:**
- Add "Leave workspace" button to the Danger Zone in [app/(app)/settings/page.tsx](../../app/(app)/settings/page.tsx) — visible when `!isWorkspaceOwner`. Reuse the existing "Type workspace name to confirm" pattern from transfer/delete modals (3 modals share the structure).
- Optionally: also show "Leave" next to user's own row in the members list (smaller affordance).
- Post-leave: redirect to `/onboarding` or the user's next workspace (if any). Frontend should clearAuthTokenCache after the response — see [authfetch_token_in_lock.md](../../C:/Users/user/.claude/projects/c--Users-user-Desktop-echly/memory/authfetch_token_in_lock.md) memory: any time custom claims change, the token cache must be cleared so the client picks up the new claims on next request.

**Edge cases:**
- User is sole owner — block with clear message: *"Transfer ownership or delete the workspace first."*
- User has only one workspace membership — after leaving, their `workspaceId` claim goes to null; landing-page logic must handle "user with no workspace" (probably onboarding redirect).
- Concurrent leave-while-being-removed — last write wins, both end with member doc deleted. Idempotent. No race issue.
- User is the assignee on open tickets / has open comments — no cleanup currently happens on admin-removal either; leave as parity.

**Complexity: S** (~ small route + small UI; mostly reuses existing logic).

### 7.2 Transfer Ownership — **ALREADY EXISTS, MINOR GAPS**

**Already shipped:** server route + client UI + claim re-issue. No new route needed.

**Possible follow-ups (all optional, scope per product decision):**

1. **Stripe customer email update.** After `transferWorkspaceOwnershipRepo` succeeds, look up the new owner's email and call `stripe.customers.update(customerId, { email: newOwnerEmail })`. Skip if no `customerId` (comp/starter workspaces). Add inside [app/api/workspace/ownership/route.ts](../../app/api/workspace/ownership/route.ts) between line 64 and the claim re-issue at line 68. Small.

2. **Billing-state gating.** Decide whether to block transfer when `subscription.status === 'past_due'` or `cancelAt` is set. Currently only `suspended` is blocked (incidentally via `assertWorkspaceActive`). If we add explicit gates, mirror the suspended-block style. Small.

3. **Two-step accept flow.** Currently immediate. If product wants the new owner to accept (Notion does this), would need:
   - A new `workspaceOwnershipTransfers` collection (pending/accepted/declined/expired)
   - Email to new owner with accept link
   - New routes: `POST /api/workspace/ownership/initiate`, `POST /api/workspace/ownership/accept`, `POST /api/workspace/ownership/decline`
   - UI states for old owner ("pending transfer") and new owner ("accept ownership")
   - Medium-Large. Significant scope increase. **Recommend deferring** unless product specifically wants it.

4. **Notification email.** Send an email to both old + new owner on completed transfer. The codebase has [workspaceEmails](../../lib/email/workspaceEmails.ts) — adding two new email templates is small.

5. **Custom claims:** Already handled correctly. No change needed (see Section 3.3).

**Complexity (existing → with all gap-fixes 1+2+4): S.** Two-step accept (#3) would push to M-L.

---

## SECTION 8 — Unknowns (need product/architect decision)

1. **Self-leave: should owners be able to "leave" by triggering transfer + leave in one step?** Or should the UX strictly be "transfer first, then leave"? Recommend the latter — keeps the actions atomic and reversible at the user's choice.

2. **Transfer while past_due:** Block? Or allow (new owner can fix payment via portal)? Recommend allow — locking out transfer when billing is broken creates a chicken-and-egg if the only one who could fix it just left the company.

3. **Transfer with `cancelAt` set:** Show a warning in the confirm modal ("This workspace is scheduled to cancel on X. The new owner will need to reactivate.")? Probably yes — cheap to add.

4. **Transfer to a non-member:** Reject (current behavior) or auto-invite? Current behavior is safer and clearer — the new owner needs to already be in the workspace. Recommend keeping.

5. **Single-step vs two-step transfer:** Current is single-step. Two-step is more polite but more complex. Recommend keeping single-step for v1 — the typed-confirmation already provides sufficient friction.

6. **Stripe customer email update on transfer:** Should we sync `customers.update({ email })` to Stripe? Recommend yes — receipts and portal page show the wrong email otherwise. Low cost, high value.

7. **Self-leave: do we want to also clear the user's avatar from sessions they had access to?** Currently `removeWorkspaceMemberRepo` cascades `sessionAccess` + `sessions/{sid}/members/{uid}` — same behavior applies to self-leave. Probably correct.

8. **Should `usage.members` decrement on leave** (it does on `removeWorkspaceMemberRepo`) **but `billing.seats` does NOT** (Notion model)? Confirm this asymmetry is desired for self-leave too. Recommend yes — consistency with admin-removal.

---

## Appendix — Files Touched (Read-Only Audit)

Only one file was created: this report at [docs/audits/leave-and-transfer-audit.md](leave-and-transfer-audit.md).

No source files were modified.
