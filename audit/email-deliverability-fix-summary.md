# Email Deliverability Fix — Summary

**Date:** 2026-05-26
**Companion to:** [`email-deliverability-audit.md`](email-deliverability-audit.md) (see "Resolution" section there for what closes which audit finding).
**PR:** single coherent change — `fix(email): replace noreply, omit broken unsubscribe footer, add List-Unsubscribe headers`.

This document captures the six code changes shipped to bring outbound mail up to current Gmail/Yahoo bulk-sender expectations and to eliminate the two issues that triggered the inbox warning (broken unsubscribe link in transactional mail, `noreply@` From). Infrastructure work (Workspace mailboxes, `links.annote.ai` click-tracking subdomain, DMARC, DKIM/SPF, suppression cleanup) was completed beforehand.

---

## The six fixes

### 1. Replaced `noreply@annote.ai` with real, replyable From addresses

[lib/email/resend.ts:50-54](../lib/email/resend.ts#L50-L54)

- `system` variant → `Annote <hello@annote.ai>` (transactional/security/invites/notifications)
- `founder` variant → `Ishaq from Annote <ishaq@annote.ai>` (welcome, billing, lifecycle, plan-limit, workspace-deleted-confirmation)

Both addresses are real Google Workspace mailboxes; `hello@annote.ai` and `dmarc@annote.ai` are aliases routing into `ishaq@annote.ai`'s inbox. Replies follow the From header naturally and land in a monitored mailbox — the founder-voice copy ("just reply to this email") is no longer contradicted by the sender.

### 2. Dropped the global `REPLY_TO` constant

[lib/email/resend.ts](../lib/email/resend.ts) — `REPLY_TO = "ishaq@annote.ai"` constant removed, default `replyTo` assignment in `sendEmailOrLog` removed.

The per-call `replyTo` override parameter is retained on `sendEmailOrLog` (and `sendEmailWithPreferences`) for future flexibility, but applies no default. Resend now falls back to the From header on every send, which is the natural behavior — system mail routes replies to `hello@`, founder mail to `ishaq@`, both into the same inbox.

### 3. Made `unsubscribeUrl` optional everywhere; omit footer block when absent

This is the primary fix — eliminating the literal `{{UNSUBSCRIBE_URL}}` token that was leaking into transactional emails as a non-resolving anchor href, which was the most likely cause of the "links don't match sending domain" inbox warning.

- **`emailShellV2`** ([lib/email/components.ts](../lib/email/components.ts)) — `unsubscribeUrl` is `string | undefined`, no default. When falsy/empty, the footer renders only the centered `annote.ai` link (matching Linear/Stripe/Notion transactional mail).
- **`plainTextShellV2`** — same treatment for the plain-text trailer. `Unsubscribe: <url>` line emitted only when a URL is provided.
- **`sendEmailOrLog`** ([lib/email/resend.ts](../lib/email/resend.ts)) — accepts an optional `unsubscribeUrl` param, forwards to Resend headers (see fix #4 below).
- **Preference-gated templates** (welcome, newComment, mention, ticketAssigned, planLimitApproaching, planLimitHit, sessionOpened, ticketResolved, inviteAccepted) — now declare `unsubscribeUrl?: string` and pass it to the shell + plain-text shell.
- **Dispatchers** ([notificationEmails.ts](../lib/email/notificationEmails.ts), [workspaceEmails.ts:577-583](../lib/email/workspaceEmails.ts#L577-L583)) — `htmlBuilder`/`textBuilder` closures now accept the URL from `sendEmailWithPreferences` and forward it into the template prop bag.
- **`sendEmailWithPreferences`** ([lib/email/sendEmailWithPreferences.ts](../lib/email/sendEmailWithPreferences.ts)) — builds the signed URL, passes it to the builders AND to `sendEmailOrLog`. The legacy `substituteUnsub` step is retained as an idempotent no-op safety net (it finds no placeholders to replace in the new flow).

Transactional callers via `sendEmailOrLog` (workspace invites, password reset, billing, ownership transfers, etc.) do not pass `unsubscribeUrl` → the footer block is omitted entirely. This is legally correct under CAN-SPAM's transactional exemption and matches industry practice.

### 4. Added `List-Unsubscribe` + `List-Unsubscribe-Post` headers

[lib/email/resend.ts:111-121](../lib/email/resend.ts#L111-L121)

```typescript
const headers: Record<string, string> = {};
if (params.unsubscribeUrl) {
  headers["List-Unsubscribe"] = `<${params.unsubscribeUrl}>`;
  headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
}
```

Headers are passed to Resend only when non-empty (i.e., only for preference-gated mail). Transactional mail intentionally ships without them — Gmail/Yahoo's Feb 2024 bulk-sender rules target commercial/lifecycle mail, not transactional. This satisfies the Gmail one-click unsubscribe button requirement on the categories that need it.

### 5. Production safety net for `UNSUBSCRIBE_SECRET`

[lib/email/unsubscribeToken.ts:17-32](../lib/email/unsubscribeToken.ts#L17-L32)

Behavior unchanged (the dev fallback secret still works locally). Added a `console.error` that fires at module load if `NODE_ENV === "production"` and the env var is missing or equals the dev fallback. This catches future regressions (env var rename, missing env in a preview deploy promoted to prod) before they let an attacker forge unsubscribe tokens. Confirmed `UNSUBSCRIBE_SECRET` is set in Vercel — this is purely a tripwire.

### 6. Explicit comment about Resend tracking flags

[lib/email/resend.ts:60-67](../lib/email/resend.ts#L60-L67)

The Resend SDK v6 `CreateEmailOptions` does NOT expose `tracking` / `open_tracking` / `click_tracking` on the per-send API (verified in `node_modules/resend/dist/index.d.cts`). Tracking is configured at the domain level in the Resend dashboard. Added a comment in the code explaining:

- click tracking is intentionally ON, routed through the verified `links.annote.ai` subdomain (link URLs match the sending domain),
- open tracking is intentionally OFF (pixel tracking is a spam signal + unreliable post-Apple-Mail-Privacy-Protection),
- do not enable open tracking in the dashboard.

The comment is the documentation; no API call to make.

### Bonus: TODO comment on the extension ID

[lib/email/urls.ts:28](../lib/email/urls.ts#L28) — `// TODO: replace with real Chrome Web Store extension ID once published.` Comment-only; the URL deliberately still contains the literal `PLACEHOLDER`. Welcome emails are guarded behind the extension launch, so this is intentional.

---

## Verification steps run

### Type-check
- `npx tsc --noEmit` → exit 0. No new errors introduced.

### Grep-based negative checks
- `grep -r "noreply" lib/email/` → 0 results (all references replaced).
- `grep -r "{{UNSUBSCRIBE_URL}}" lib/email/` → only matches are explanatory comments + the `UNSUB_PLACEHOLDER` constant in `sendEmailWithPreferences.ts` (used by the no-op safety net). No matches inside template render output.

### Dev preview route
- `/dev/email-preview/[template]` works with and without `unsubscribeUrl`:
  - **Transactional templates** (`password-reset`, `email-verification`, `email-change`, `workspace-invite`, `workspace-invite-reminder`, `session-invite`, `session-invite-account`, `access-request-notification`, `access-request-approved`, `access-request-rejected`, `subscription-confirmation`, `subscription-cancelled`, `payment-failed`, `workspace-deleted`, `workspace-deleted-restore`, `member-removed`, `email-change-notice`, `plan-changed-upgrade`, `plan-changed-downgrade`, `ownership-transferred-old`, `ownership-transferred-new`, `workspace-deleted-member`, `refund-issued`, `seat-added`, `seat-added-no-proration`) — render with footer showing only the centered `annote.ai` link. No "Unsubscribe ·" prefix. No `{{UNSUBSCRIBE_URL}}` literal anywhere in HTML or plain text.
  - **Preference-gated templates** (`welcome`, `new-comment`, `mention`, `ticket-assigned`, `plan-approaching`, `plan-hit`, `session-opened`, `ticket-resolved`, `invite-accepted`) — receive a `PREVIEW_UNSUBSCRIBE_URL` fixture and render the full "Unsubscribe · annote.ai" footer with the unsubscribe link resolving to `https://annote.ai/unsubscribe?token=PREVIEW_TOKEN`.

### Plain-text outputs
- Same checks against the `?text=1` variants of each template — `{{UNSUBSCRIBE_URL}}` literal does not appear; preference-gated mails emit a real `Unsubscribe: <url>` trailer line; transactional mails omit the trailer.

### Footer layout
- The shell footer remains visually balanced when the unsubscribe row is omitted — the centered `annote.ai` link sits alone with the same 16px top margin. No layout shift, no awkward whitespace.

---

## What's still pending

1. **Firebase auth action handler URL** — the action URLs (`passwordReset.resetUrl`, `emailVerification.verifyUrl`) are still passed in from Firebase Admin SDK calls. The Firebase Console action handler must be set to `https://annote.ai/auth/action` (not `*.firebaseapp.com`). Console-side change; not in this PR. See audit §9 fix #6.
2. **Real Chrome Web Store extension ID** — `lib/email/urls.ts:29` still contains the literal `PLACEHOLDER`. Will land when the extension listing is published; welcome emails are gated until then.
3. **Optional Resend per-send `tags`** — useful for breaking deliverability metrics out by template family (transactional vs. notification vs. billing vs. lifecycle). Not implemented; no deliverability impact. Audit §9 fix #8.

---

## Rollout plan (post-merge)

After this PR is reviewed and merged:

1. **Deploy** to production via the usual flow.
2. **Trigger one email of each category** against a real Gmail inbox you control:
   - Sign up with a fresh email → welcome (preference-gated, founder voice) + verification (transactional).
   - Trigger a password reset → transactional.
   - Create a workspace invite → transactional (invite) + later, on acceptance, preference-gated (invite-accepted, new-comment if you comment, etc).
3. **In Gmail, "Show original"** on each. Verify:
   - **From** matches expectation — `Annote <hello@annote.ai>` for system mail, `Ishaq from Annote <ishaq@annote.ai>` for founder mail.
   - **Reply-To** unset (Resend defaults to From).
   - **No `{{UNSUBSCRIBE_URL}}` anywhere** in HTML or plain text.
   - **`List-Unsubscribe` header present** on preference-gated mail (welcome, new-comment, mention, etc.), **absent** on transactional (password-reset, workspace-invite, billing).
   - **`List-Unsubscribe-Post: List-Unsubscribe=One-Click`** paired with the above where applicable.
   - **Click any link** — URL should route through `https://links.annote.ai/...` (already verified at infra level).
4. **Check Resend dashboard Logs** for any new `Bounced` / `Suppressed` statuses on test recipients.
5. **Within 24-48 hours**, check the `dmarc@annote.ai` mailbox — DMARC aggregate reports should arrive from Gmail/Yahoo with `pass` results across SPF and DKIM, both aligned to `annote.ai`.

If all five checks pass, the deliverability work is complete and the page can ship.
