# Email Deliverability & Sending Hygiene — Read-Only Audit

**Date:** 2026-05-24
**Scope:** entire `echly` repo (Next.js app + extension; no separate backend exists). All email originates from `lib/email/*`.
**Provider:** Resend only — no second provider found, no raw SMTP, no Postmark/SendGrid/Mailgun. Single `Resend` client at [lib/email/resend.ts:14-16](lib/email/resend.ts#L14-L16), single `resend.emails.send` call at [lib/email/resend.ts:87-94](lib/email/resend.ts#L87-L94).
**Sending domain:** `annote.ai` (envelope) — `NEXT_PUBLIC_APP_URL` defaults to `https://annote.ai` in [lib/email/urls.ts:11](lib/email/urls.ts#L11), [lib/email/sendEmailWithPreferences.ts:12](lib/email/sendEmailWithPreferences.ts#L12), [lib/email/workspaceEmails.ts:58](lib/email/workspaceEmails.ts#L58), [lib/email/billingEmails.ts:48](lib/email/billingEmails.ts#L48), [lib/email/components.ts:53](lib/email/components.ts#L53), [lib/email/planLimitDispatch.server.ts:14](lib/email/planLimitDispatch.server.ts#L14).

---

## 1. Summary

- **CRITICAL — `noreply@annote.ai` is the only From address.** Hardcoded at [lib/email/resend.ts:49](lib/email/resend.ts#L49). Every email — transactional, lifecycle, billing, notifications — ships from this no-reply mailbox. Inbox providers (Gmail/Outlook) actively penalise `noreply@`, and the founder-voice copy (`— Ishaq, Founder, Annote`, `just reply to this email`) is contradicted by the sender, which hurts both deliverability and the personal-touch product positioning. `Reply-To: ishaq@annote.ai` is set globally, but the visible From wins for trust signals.
- **CRITICAL — Transactional emails leak the literal `{{UNSUBSCRIBE_URL}}` token.** Templates like `passwordReset`, `emailVerification`, `workspaceInvite`, `sessionInvite`, `accessRequestNotification`, `workspaceDeletedConfirmation`, etc. go through `sendEmailOrLog` directly (which does NOT substitute the placeholder), but they still embed `plainTextShellV2` and `emailShellV2`, both of which default to writing `{{UNSUBSCRIBE_URL}}` into the footer/plain-text trailer. Result: shipped emails contain a literal `Unsubscribe` link with `href="{{UNSUBSCRIBE_URL}}"` (broken link, mismatched domain heuristic) and a plain-text `Unsubscribe: {{UNSUBSCRIBE_URL}}`. This single bug almost certainly explains the inbox-provider "link URL doesn't match sending domain" warning. See §3/§5.
- **HIGH — No `List-Unsubscribe` / `List-Unsubscribe-Post` headers.** Required by Gmail/Yahoo bulk-sender guidelines, recommended for all senders. Resend supports them via the `headers` field; we set none. See [lib/email/resend.ts:87-94](lib/email/resend.ts#L87-L94).
- **HEALTHY — Link domains are clean.** Every CTA URL is built from `NEXT_PUBLIC_APP_URL` (= `annote.ai`) or is a hard-coded `annote.ai` literal. The only third-party domains inside email bodies are Chrome Web Store (welcome) and Stripe (invoice PDF, refund receipt) — all expected, well-known, low-risk for spam scoring. No SendGrid/Mailgun/Resend-tracking redirects, no localhost leaks.
- **HEALTHY — Architecture is centralised.** One Resend client, one `resend.emails.send` call, all sends funnel through `sendEmailOrLog` (transactional) or `sendEmailWithPreferences` (preference-gated). All templates compose from one shell + one card primitive. Every send already has both `html` AND `text` (Resend `text` field). HTML escapes are correct ([components.ts:325-331](lib/email/components.ts#L325-L331)) and templates use them.
- **MEDIUM — Subject lines are clean.** No ALL-CAPS spam triggers, no "FREE / URGENT / WINNER / ACT NOW", no excessive punctuation. Two subjects use em-dashes (Outlook-safe).

---

## 2. Email-sending code paths

All sends funnel through one of three layers. There is **no** direct `resend.emails.send` call outside [lib/email/resend.ts:87](lib/email/resend.ts#L87).

### 2a. Wrapper layer

| Wrapper | File | Used by | Substitutes `{{UNSUBSCRIBE_URL}}`? |
|---|---|---|---|
| `sendEmailOrLog` | [lib/email/resend.ts:55-99](lib/email/resend.ts#L55-L99) | Transactional + workspace/billing dispatchers | **NO** |
| `sendEmailWithPreferences` | [lib/email/sendEmailWithPreferences.ts:55-99](lib/email/sendEmailWithPreferences.ts#L55-L99) | Lifecycle / notification emails | YES |
| `sendEmailWithPreferencesByUid` | [lib/email/sendEmailWithPreferences.ts:106-120](lib/email/sendEmailWithPreferences.ts#L106-L120) | Lifecycle / notification emails when only uid is in hand | YES |

### 2b. Dispatcher layer (file → exported sender)

**[lib/email/workspaceEmails.ts](lib/email/workspaceEmails.ts)** — 14 senders, all through `sendEmailOrLog` except `sendInviteAcceptedEmail` which uses `sendEmailWithPreferencesByUid`:

| Sender | Line | Trigger | Template |
|---|---|---|---|
| `sendWorkspaceInviteEmail` | [L64-91](lib/email/workspaceEmails.ts#L64-L91) | New workspace invite created — [app/api/workspace/members/invite/route.ts](app/api/workspace/members/invite/route.ts), [app/api/workspace/members/invite-batch/route.ts](app/api/workspace/members/invite-batch/route.ts), [app/api/workspace/members/invitations/[token]/resend/route.ts](app/api/workspace/members/invitations/[token]/resend/route.ts) | `workspaceInvite` |
| `sendWorkspaceInviteReminderEmail` | [L93-118](lib/email/workspaceEmails.ts#L93-L118) | Cron — [app/api/cron/workspace-invite-reminders/route.ts](app/api/cron/workspace-invite-reminders/route.ts) | `workspaceInviteReminder` |
| `sendSessionInviteEmail` | [L120-157](lib/email/workspaceEmails.ts#L120-L157) | Session share invite — [app/api/sessions/[sessionId]/invite/route.ts](app/api/sessions/[sessionId]/invite/route.ts) | `sessionInvite` |
| `sendAccessRequestNotificationEmail` | [L159-195](lib/email/workspaceEmails.ts#L159-L195) | Viewer requests access — [app/api/sessions/[sessionId]/request-access/route.ts](app/api/sessions/[sessionId]/request-access/route.ts) | `accessRequestNotification` |
| `sendAccessRequestResultEmail` | [L197-225](lib/email/workspaceEmails.ts#L197-L225) | Owner approves/denies — [app/api/sessions/[sessionId]/access-requests/route.ts](app/api/sessions/[sessionId]/access-requests/route.ts) | `accessRequestResult` |
| `sendEmailChangeConfirmation` | [L227-251](lib/email/workspaceEmails.ts#L227-L251) | Email-change request — [app/api/users/change-email/route.ts](app/api/users/change-email/route.ts) | `emailChange` |
| `sendPasswordResetEmail` | [L253-275](lib/email/workspaceEmails.ts#L253-L275) | Forgot password — [app/api/auth/forgot-password/route.ts](app/api/auth/forgot-password/route.ts), [app/api/users/send-password-reset/route.ts](app/api/users/send-password-reset/route.ts) | `passwordReset` |
| `sendEmailVerification` | [L277-299](lib/email/workspaceEmails.ts#L277-L299) | Signup / verification resend — [app/api/auth/send-verification/route.ts](app/api/auth/send-verification/route.ts) | `emailVerification` |
| `sendWorkspaceDeletionConfirmationEmail` | [L301-329](lib/email/workspaceEmails.ts#L301-L329) | Owner deletes workspace — [app/api/workspace/route.ts](app/api/workspace/route.ts) | `workspaceDeletedConfirmation` |
| `sendMemberRemovedEmail` | [L336-369](lib/email/workspaceEmails.ts#L336-L369) | Member removed — [app/api/workspace/members/[uid]/route.ts](app/api/workspace/members/[uid]/route.ts) | `memberRemoved` |
| `sendEmailChangeNoticeEmail` | [L377-402](lib/email/workspaceEmails.ts#L377-L402) | Email change requested — [app/api/users/change-email/route.ts](app/api/users/change-email/route.ts) | `emailChangeNotice` |
| `sendOwnershipTransferredOldEmail` | [L408-441](lib/email/workspaceEmails.ts#L408-L441) | Ownership transfer — [app/api/workspace/ownership/route.ts](app/api/workspace/ownership/route.ts) | `ownershipTransferredOld` |
| `sendOwnershipTransferredNewEmail` | [L447-501](lib/email/workspaceEmails.ts#L447-L501) | Ownership transfer — [app/api/workspace/ownership/route.ts](app/api/workspace/ownership/route.ts) | `ownershipTransferredNew` |
| `sendWorkspaceDeletedMemberEmail` | [L510-548](lib/email/workspaceEmails.ts#L510-L548) | Workspace deletion fan-out — [app/api/workspace/route.ts](app/api/workspace/route.ts) | `workspaceDeletedMember` |
| `sendInviteAcceptedEmail` | [L550-588](lib/email/workspaceEmails.ts#L550-L588) | Invite accepted — [app/api/workspace/invitations/accept/[token]/route.ts](app/api/workspace/invitations/accept/[token]/route.ts) | `inviteAccepted` (via prefs) |

**[lib/email/billingEmails.ts](lib/email/billingEmails.ts)** — 10 senders, **all** through `sendEmailOrLog` (i.e., none preference-gated):

| Sender | Line | Trigger | Template |
|---|---|---|---|
| `sendSubscriptionConfirmationEmail` | [L54-96](lib/email/billingEmails.ts#L54-L96) | Stripe `checkout.session.completed` — [app/api/billing/webhook/route.ts](app/api/billing/webhook/route.ts) | `subscriptionConfirmation` |
| `sendSubscriptionCancelledEmail` | [L98-135](lib/email/billingEmails.ts#L98-L135) | Stripe `customer.subscription.deleted` — webhook | `subscriptionCancelled` |
| `sendPaymentFailedEmail` | [L137-160](lib/email/billingEmails.ts#L137-L160) | Stripe `invoice.payment_failed` — webhook | `paymentFailed` |
| `sendRenewalReceiptEmail` | [L162-197](lib/email/billingEmails.ts#L162-L197) | Stripe `invoice.payment_succeeded` (renewal) — webhook | `renewalReceipt` |
| `sendUpcomingRenewalReminderEmail` | [L199-232](lib/email/billingEmails.ts#L199-L232) | Stripe `invoice.upcoming` — webhook | `upcomingRenewalReminder` |
| `sendCardExpiringEmail` | [L234-263](lib/email/billingEmails.ts#L234-L263) | Stripe `customer.source.expiring` / similar — webhook | `cardExpiring` |
| `sendPaymentMethodUpdatedEmail` | [L265-289](lib/email/billingEmails.ts#L265-L289) | Stripe `payment_method.attached` — webhook | `paymentMethodUpdated` |
| `sendPlanChangedEmail` | [L291-360](lib/email/billingEmails.ts#L291-L360) | Stripe subscription updated — webhook | `planChanged` |
| `sendRefundIssuedEmail` | [L362-400](lib/email/billingEmails.ts#L362-L400) | Stripe `charge.refunded` — webhook | `refundIssued` |
| `sendSeatAddedEmail` | [L402-453](lib/email/billingEmails.ts#L402-L453) | Invite acceptance increases seat count — [app/api/workspace/invitations/accept/[token]/route.ts](app/api/workspace/invitations/accept/[token]/route.ts) | `seatAdded` |

**[lib/email/notificationEmails.ts](lib/email/notificationEmails.ts)** — 8 senders, all preference-gated (`sendEmailWithPreferences` / `…ByUid`):

| Sender | Line | Trigger | Template | Category |
|---|---|---|---|---|
| `sendWelcomeEmail` | [L76-101](lib/email/notificationEmails.ts#L76-L101) | First signup — `ensureUserRepo` idempotency guard | `welcome` | lifecycle |
| `sendSessionOpenedEmail` | [L108-134](lib/email/notificationEmails.ts#L108-L134) | First non-creator view of a session | `sessionOpened` | notifications |
| `sendNewCommentEmail` | [L141-181](lib/email/notificationEmails.ts#L141-L181) | New comment on ticket — [lib/repositories/commentsRepository.server.ts](lib/repositories/commentsRepository.server.ts) | `newComment` | notifications |
| `sendMentionEmail` | [L187-227](lib/email/notificationEmails.ts#L187-L227) | Mention in a comment — `commentsRepository.server.ts` | `mention` | notifications |
| `sendTicketAssignedEmail` | [L234-270](lib/email/notificationEmails.ts#L234-L270) | Ticket assignment change | `ticketAssigned` | notifications |
| `sendPlanLimitApproachingEmail` | [L277-314](lib/email/notificationEmails.ts#L277-L314) | Usage crosses 80% — [lib/email/planLimitDispatch.server.ts:112](lib/email/planLimitDispatch.server.ts#L112) | `planLimitApproaching` | lifecycle |
| `sendPlanLimitHitEmail` | [L321-352](lib/email/notificationEmails.ts#L321-L352) | Feedback create blocked at 100% — [lib/email/planLimitDispatch.server.ts:156](lib/email/planLimitDispatch.server.ts#L156) | `planLimitHit` | lifecycle |
| `sendTicketResolvedEmail` | [L359-406](lib/email/notificationEmails.ts#L359-L406) | Ticket status → "resolved" | `ticketResolved` | notifications |

### 2c. Dev preview route

[app/dev/email-preview/[template]/route.ts](app/dev/email-preview/[template]/route.ts) renders templates HTML for inspection. Does NOT send. Not a deliverability concern, but useful for confirming template URL substitution.

---

## 3. From / Reply-To addresses

| Address | Location | Used in | Verdict |
|---|---|---|---|
| `noreply@annote.ai` (`Annote <noreply@annote.ai>`) | [resend.ts:49-53](lib/email/resend.ts#L49-L53), `system` variant | Every transactional + notification email (passwordReset, verification, workspaceInvite, sessionInvite, accessRequest*, memberRemoved, emailChangeNotice, ownershipTransferredOld, workspaceDeletedMember, inviteAccepted, sessionOpened, newComment, mention, ticketAssigned, ticketResolved) | **REPLACE** — primary deliverability hit |
| `noreply@annote.ai` (`Ishaq from Annote <noreply@annote.ai>`) | [resend.ts:49-53](lib/email/resend.ts#L49-L53), `founder` variant | Welcome, plan-limit*, workspaceDeletedConfirmation, ownershipTransferredNew, all 10 billing emails | **REPLACE** — the visible name says "Ishaq from Annote" but the address says no-reply. Worse than purely impersonal — it actively damages the founder-voice "just reply to this email" copy in welcome/workspaceDeleted/paymentFailed |
| `ishaq@annote.ai` | [resend.ts:36](lib/email/resend.ts#L36), `REPLY_TO` constant | Default `Reply-To` on every send. Per-call `replyTo` override exists in `sendEmailOrLog` params but no caller uses it. | **KEEP** for now; replaces or supplements From in the fix |

**No bare addresses, no inconsistency** — exactly two From identities exist (system vs. founder), both rooted on the same `noreply@annote.ai` mailbox. No other From email appears anywhere in the repo (verified via `grep -i 'from:' lib/email`).

**Recommended sender naming** (for the fix pass — not implemented here): swap `noreply@annote.ai` for `hello@annote.ai` (system) and `ishaq@annote.ai` (founder), and drop the global `REPLY_TO` override so replies follow the From naturally. Both addresses just need to forward into the same inbox.

---

## 4. Links inside emails

### 4a. Shell-level links (every email)

| Element | Source | Resolved URL | Domain | Verdict |
|---|---|---|---|---|
| Brand header anchor wrapping logo + wordmark | [components.ts:54](lib/email/components.ts#L54) | `https://annote.ai` | annote.ai | matches sender |
| Logomark image `src` | [components.ts:53](lib/email/components.ts#L53) | `${APP_URL}/email/annote-logomark-black.png` | annote.ai (or localhost in dev) | matches sender |
| Footer "Unsubscribe" anchor | [components.ts:180](lib/email/components.ts#L180) | `unsubscribeUrl` prop, defaults to literal `{{UNSUBSCRIBE_URL}}` | **literal token in transactional emails (broken)**, `annote.ai/unsubscribe?token=…` elsewhere | **MISMATCH for transactional** |
| Footer "annote.ai" anchor | [components.ts:182](lib/email/components.ts#L182) | `https://annote.ai` | annote.ai | matches sender |
| Plain-text unsubscribe trailer | [components.ts:348](lib/email/components.ts#L348) | same as above | same | same — broken in transactional |

### 4b. Per-template CTAs

| Template | Button label / link | URL source | Domain |
|---|---|---|---|
| `accessRequestNotification` | "Review request" | `sessionUrl` prop → `${APP_URL}/s/{id}` | annote.ai |
| `accessRequestResult` | "Open the session" | `sessionUrl` prop | annote.ai |
| `cardExpiring` | "Update payment method" | `portalUrl` = `${APP_URL}/settings?tab=billing` ([billingEmails.ts:249](lib/email/billingEmails.ts#L249)) | annote.ai |
| `emailChange` | "Confirm new email" | `confirmUrl` = `${APP_URL}/api/users/confirm-email-change?...` ([app/api/users/change-email/route.ts:82](app/api/users/change-email/route.ts#L82)) | annote.ai |
| `emailChangeNotice` | "Reset my password" | `passwordResetUrl` = `${APP_URL}/forgot-password` ([app/api/users/change-email/route.ts:95](app/api/users/change-email/route.ts#L95)) | annote.ai |
| `emailVerification` | "Verify email" | `verifyUrl` prop (Firebase action URL — should originate on annote.ai) | annote.ai expected — **needs review** that Firebase action URL is configured to `https://annote.ai/auth/action` and not the default `*.firebaseapp.com` |
| `inviteAccepted` | "View members" | `workspaceMembersUrl` = `${APP_URL}/settings?tab=workspace` | annote.ai |
| `memberRemoved` | inline "open dashboard" link | `dashboardUrl` = `${APP_URL}/dashboard` ([app/api/workspace/members/[uid]/route.ts:116](app/api/workspace/members/[uid]/route.ts#L116)) | annote.ai |
| `mention` | "View the comment" | `commentUrl` = `ticketUrl(sessionId, feedbackId)` → `${APP_URL}/s/{id}#feedback-{id}` | annote.ai |
| `newComment` | "View the comment" | same | annote.ai |
| `ownershipTransferredNew` | "Manage workspace" | `settingsUrl` = `${APP_URL}/settings?tab=workspace` ([app/api/workspace/ownership/route.ts:202](app/api/workspace/ownership/route.ts#L202)) | annote.ai |
| `passwordReset` | "Reset password" | `resetUrl` prop (Firebase action URL) | annote.ai expected — **needs review** (same caveat as `emailVerification`) |
| `paymentFailed` | "Update payment method" | `portalUrl` = `BILLING_PORTAL_URL` = `${APP_URL}/settings?tab=billing` ([app/api/billing/webhook/route.ts:25](app/api/billing/webhook/route.ts#L25), L640) | annote.ai |
| `planChanged` | "View billing" | `billingUrl` | annote.ai |
| `planLimitApproaching` | "See plan options" | `upgradeUrl` = `${APP_URL}/settings?tab=billing` ([planLimitDispatch.server.ts:15](lib/email/planLimitDispatch.server.ts#L15)) | annote.ai |
| `planLimitHit` | "Upgrade to Pro" | same | annote.ai |
| `refundIssued` | "View receipt" (optional) | `receiptUrl` = Stripe `charge.receipt_url` ([app/api/billing/webhook/route.ts:897](app/api/billing/webhook/route.ts#L897)) | **`pay.stripe.com`** — third-party, but industry-standard for receipts |
| `renewalReceipt` | "Download invoice PDF" (optional) | `invoicePdfUrl` = Stripe `invoice.invoice_pdf` ([app/api/billing/webhook/route.ts:760](app/api/billing/webhook/route.ts#L760)) | **`*.stripe.com`** — same caveat |
| `renewalReceipt` | inline "Billing settings" link | `settingsUrl` | annote.ai |
| `seatAdded` | "View billing" | `billingUrl` | annote.ai |
| `sessionInvite` | "Open the session" | `sessionUrl` | annote.ai (caller-built) |
| `sessionOpened` | "Open the session" | `sessionUrl(sessionId)` | annote.ai |
| `subscriptionCancelled` | (no button, body only) | — | — |
| `subscriptionConfirmation` | "Open billing settings" + inline "Billing settings" | `settingsUrl` | annote.ai |
| `ticketAssigned` | "Open the ticket" | `ticketUrl` | annote.ai |
| `ticketResolved` | "View ticket" | `ticketUrl` prop | annote.ai |
| `upcomingRenewalReminder` | "Open billing settings" + inline | `settingsUrl` | annote.ai |
| `welcome` | "Install the extension" | `installUrl` defaults to `https://chromewebstore.google.com/detail/echly/PLACEHOLDER` ([lib/email/urls.ts:28-29](lib/email/urls.ts#L28-L29)) | **`chromewebstore.google.com`** — third-party but expected & trusted. **The literal "PLACEHOLDER" extension ID will ship until Phase 5 placeholder is replaced.** |
| `welcome` | inline "our docs" link | `DOCS_LINK = ${APP_URL}/docs` | annote.ai |
| `workspaceDeletedConfirmation` | "Restore workspace" (conditional) | `restoreUrl` prop | annote.ai expected (no caller passes a real one yet — `workspaceEmails.ts:317` omits it) |
| `workspaceDeletedMember` | (no button) | — | — |
| `workspaceInvite` | "Join {workspace}" | `acceptUrl` = `${APP_URL}/invite/{token}` ([workspaceEmails.ts:78](lib/email/workspaceEmails.ts#L78)) | annote.ai |
| `workspaceInviteReminder` | "Join {workspace}" | same | annote.ai |

**Summary:** every CTA and content link inside emails resolves to one of three domains: `annote.ai` (≈ 95% of links), `chromewebstore.google.com` (welcome email install button), or `pay.stripe.com` / `*.stripe.com` (refund receipt, renewal invoice PDF). **No SendGrid / Mailgun / Resend tracking-redirect domains.** No shortened links. No localhost/staging leaks in production (everything reads `NEXT_PUBLIC_APP_URL` with `https://annote.ai` fallback).

### 4c. The "links don't match sending domain" finding — verdict

The inbox-provider warning is almost certainly the **`{{UNSUBSCRIBE_URL}}` literal in the footer of transactional emails** (§1, §3, §5). `{{UNSUBSCRIBE_URL}}` is not a URL — it's an unsubstituted template token rendered as an anchor `href`. Mail clients treat that as a malformed/non-resolving link in a domain other than the sender, which is exactly what the warning describes.

A secondary contributor is the Resend-side automatic click-tracking redirect: if click-tracking is enabled in the Resend dashboard (it isn't disabled in our code — see [lib/email/resend.ts:87-94](lib/email/resend.ts#L87-L94), no `tracking: false`), Resend may rewrite every link through `*.resend-links.com`. **This is a Resend dashboard setting, not visible from the code** — needs to be verified out-of-band.

---

## 5. Headers and metadata

| Header / field | Set? | Where | Notes |
|---|---|---|---|
| `from` | yes | [resend.ts:88](lib/email/resend.ts#L88) | `noreply@annote.ai` — see §3 |
| `to` | yes | [resend.ts:89](lib/email/resend.ts#L89) | per-recipient |
| `subject` | yes | [resend.ts:90](lib/email/resend.ts#L90) | see §7 |
| `html` | yes | [resend.ts:91](lib/email/resend.ts#L91) | bulletproof V2 shell, ≤560px, inline CSS |
| `text` | yes | [resend.ts:92](lib/email/resend.ts#L92) | every template provides one via `plainTextShellV2` — **healthy** |
| `replyTo` | yes | [resend.ts:93](lib/email/resend.ts#L93) | defaults to `ishaq@annote.ai` |
| `List-Unsubscribe` | **NO** | — | **MISSING** — required by Gmail/Yahoo bulk-sender rules (Feb 2024) |
| `List-Unsubscribe-Post: List-Unsubscribe=One-Click` | **NO** | — | **MISSING** — paired with above for one-click in Gmail UI |
| `Message-ID` | (Resend-default) | — | Resend assigns; not overridden |
| `Return-Path` | (Resend-default) | — | Resend-managed bounce domain — fine as long as DMARC alignment is set up on `annote.ai` (DNS, out of scope) |
| Custom tags / categories | **NO** | — | Could be useful for Resend dashboards but doesn't affect deliverability |
| Click/open tracking | (Resend dashboard setting — not toggled in code) | — | **NEEDS REVIEW in Resend dashboard.** If tracking is on, every link is rewritten through `*.resend-links.com` and produces the same "domain mismatch" warning |

**Plain-text trailer audit:** `plainTextShellV2` ([components.ts:339-349](lib/email/components.ts#L339-L349)) writes `Unsubscribe: {{UNSUBSCRIBE_URL}}` into every email. When the template goes through `sendEmailWithPreferences`, this is substituted with a real signed URL. When it goes through `sendEmailOrLog` (every transactional + every billing email — see §2b), it is **NOT substituted** and ships as the literal string `{{UNSUBSCRIBE_URL}}`. Same for the HTML footer.

**Hidden preheader text:** every shell uses a hidden preview span ([components.ts:151](lib/email/components.ts#L151)) — good for inbox preview.

**Image-to-text ratio:** healthy. Only image is a 32×32 logomark PNG; rest is real HTML text. Wordmark is rendered as HTML text, not a graphic.

---

## 6. Domain config references

| Env var / constant | Default | Used by |
|---|---|---|
| `RESEND_API_KEY` | unset → log-only ([resend.ts:7-16](lib/email/resend.ts#L7-L16)) | Resend client init |
| `EMAIL_DEV_LOG` | unset → off ([resend.ts:71-83](lib/email/resend.ts#L71-L83)) | Log-instead-of-send toggle (dev only — ignored in production) |
| `NEXT_PUBLIC_APP_URL` | `https://annote.ai` | URL builders, logo src, unsubscribe URL, every dispatcher's link construction (5 files) |
| `UNSUBSCRIBE_SECRET` | `"dev-only-secret-change-in-production"` ([unsubscribeToken.ts:16-17](lib/email/unsubscribeToken.ts#L16-L17)) | HMAC for one-click unsubscribe tokens — **production must override** or anyone can forge unsubscribes |
| `REPLY_TO` (code constant) | `ishaq@annote.ai` ([resend.ts:36](lib/email/resend.ts#L36)) | global Reply-To |

**No `EMAIL_FROM_DOMAIN`, no `RESEND_DOMAIN` config.** The sending domain is implicit in the hardcoded `noreply@annote.ai` From — to send from a different mailbox/domain, the code (not config) must change.

**Domain that must be verified in Resend:** `annote.ai`. From any subdomain like `mail.annote.ai` is NOT used anywhere in the code, so only the apex `annote.ai` SPF/DKIM/DMARC needs to be aligned. **Verify out-of-band** that DNS records exist; the code makes no assumption beyond "the From address works".

---

## 7. Subject lines

Full inventory (29 distinct subjects across 30 templates — `subscriptionCancelled` and a couple others share the dispatcher-side string):

| Template | Subject (literal or template) | Spam-trigger scan |
|---|---|---|
| `workspaceInvite` | `You've been invited to join ${workspaceName}` | clean |
| `workspaceInviteReminder` | `Your invitation to ${workspaceName} expires in ${expiresInDays} days` | clean |
| `sessionInvite` | `You've been invited to view ${sessionName}` | clean |
| `accessRequestNotification` | `${requesterEmail} requested access to ${sessionName}` | clean |
| `accessRequestResult` (approved) | `You now have access to ${sessionName}` | clean |
| `accessRequestResult` (denied) | `Access request for ${sessionName}` | clean |
| `emailChange` | `Confirm your new email address` | clean |
| `passwordReset` | `Reset your Annote password` | clean |
| `emailVerification` | `Verify your email — Annote` | clean (em-dash OK) |
| `workspaceDeletedConfirmation` | `Your workspace "${workspaceName}" has been scheduled for deletion` | clean |
| `memberRemoved` | `You've been removed from ${workspaceName}` | clean |
| `emailChangeNotice` | `Email change requested on your Annote account` | clean |
| `ownershipTransferredOld` | `You're no longer the owner of ${workspaceName}` | clean |
| `ownershipTransferredNew` | `You're now the owner of ${workspaceName}` | clean |
| `workspaceDeletedMember` | `Workspace ${workspaceName} scheduled for deletion` | clean |
| `inviteAccepted` | `${acceptedByName} joined your workspace` | clean |
| `subscriptionConfirmation` | `You're on Annote Business — here's what's next` | clean (em-dash) |
| `subscriptionCancelled` | `Your Annote subscription is canceled` | clean |
| `paymentFailed` | `We couldn't process your payment` | clean — and intentionally non-alarmist |
| `renewalReceipt` | `Your Annote receipt — ${amount}` | clean |
| `upcomingRenewalReminder` | `Heads up — your Annote subscription renews soon` | clean |
| `cardExpiring` | `Your card is expiring soon` | clean |
| `paymentMethodUpdated` | `Payment method updated` | clean |
| `planChanged` (upgrade) | `Welcome to ${newPlanName}` | clean |
| `planChanged` (downgrade) | `Your plan changed to ${newPlanName}` | clean |
| `planChanged` (other) | `Subscription update for ${workspaceName}` | clean |
| `refundIssued` | `Refund issued: ${amountFormatted}` | clean |
| `seatAdded` | `A new seat was added to ${params.workspaceName}` | clean |
| `welcome` | `Welcome to Annote — one thing to do first` | clean |
| `sessionOpened` | `${recipientName} just opened your session` | clean |
| `newComment` | `${commenterName} commented on "${ticketTitle}"` | clean |
| `mention` | `${mentionerName} mentioned you in "${ticketTitle}"` | clean |
| `ticketAssigned` | `${assignerName} assigned you a ticket` | clean |
| `planLimitApproaching` | `You're close to the ${planName} plan limit` | clean |
| `planLimitHit` | `You've hit this month's capture limit` | clean |
| `ticketResolved` | `Your ticket was resolved: ${ticketTitle}` | clean |

**No ALL-CAPS words, no `!!!` / `???`, no spam-trigger vocab (FREE, URGENT, WINNER, ACT NOW, GUARANTEED, etc.).** Subjects are factual and category-appropriate. **Healthy.**

One minor note (informational, not a spam signal): `subscriptionCancelled` uses US spelling "canceled" while `workspaceDeletedConfirmation` writes "scheduled for deletion" — consistent voice across the set. No issue.

---

## 8. Email inventory by category

| Category | Count | Templates | Dispatcher |
|---|---|---|---|
| **Account lifecycle / security** | 7 | `passwordReset`, `emailVerification`, `emailChange`, `emailChangeNotice`, `workspaceDeletedConfirmation`, `workspaceDeletedMember`, `memberRemoved` | `workspaceEmails.ts` (transactional, bypasses preferences) |
| **Workspace / session collaboration** | 7 | `workspaceInvite`, `workspaceInviteReminder`, `sessionInvite`, `accessRequestNotification`, `accessRequestResult`, `inviteAccepted`, `ownershipTransferredOld`, `ownershipTransferredNew` | `workspaceEmails.ts` (mostly transactional; `inviteAccepted` is preference-gated) |
| **Notifications (per-event, opt-out: `notifications`)** | 5 | `sessionOpened`, `newComment`, `mention`, `ticketAssigned`, `ticketResolved` | `notificationEmails.ts` |
| **Lifecycle (founder-voice, opt-out: `lifecycle`)** | 3 | `welcome`, `planLimitApproaching`, `planLimitHit` | `notificationEmails.ts` |
| **Billing** | 10 | `subscriptionConfirmation`, `subscriptionCancelled`, `paymentFailed`, `renewalReceipt`, `upcomingRenewalReminder`, `cardExpiring`, `paymentMethodUpdated`, `planChanged`, `refundIssued`, `seatAdded` | `billingEmails.ts` (all transactional — bypass preferences) |
| **Marketing / digest / drip** | 0 | none | — (per `memory/email_phase5_postlaunch_todos.md`, digest + drip are deferred post-launch) |

**Total: 32 distinct templates across 30 template files** (`planChanged` has 3 subject variants from one template; `accessRequestResult` and `workspaceDeletedConfirmation` have approve/deny and CTA/no-CTA variants from one template each).

---

## 9. Prioritized fix list

### Critical (do first — these are the deliverability bug)

1. **Replace `noreply@annote.ai` with a real, replyable From address.** Use `hello@annote.ai` for the `system` variant and `ishaq@annote.ai` for the `founder` variant. Edit: [lib/email/resend.ts:48-53](lib/email/resend.ts#L48-L53). Drop or rethink the global `REPLY_TO` constant ([resend.ts:36](lib/email/resend.ts#L36)) so replies just go back to the From naturally. Verify the new mailboxes accept inbound mail (forward into your inbox) before deploying.
2. **Fix the literal `{{UNSUBSCRIBE_URL}}` token in transactional emails.** Three options, in increasing order of work:
   - **Quick:** in `sendEmailOrLog` ([lib/email/resend.ts:87-94](lib/email/resend.ts#L87-L94)), strip the placeholder + the entire footer "Unsubscribe · annote.ai" row before sending if no real unsubscribe URL was substituted. (Transactional email has no unsubscribe — CAN-SPAM exemption applies.)
   - **Better:** add an `unsubscribeUrl` param to `sendEmailOrLog`, default `undefined`, and have `emailShellV2` / `plainTextShellV2` omit the entire unsubscribe block when `unsubscribeUrl` is null/undefined rather than defaulting to the placeholder. Edit: [lib/email/components.ts:96-103](lib/email/components.ts#L96-L103), [components.ts:174-184](lib/email/components.ts#L174-L184), [components.ts:339-349](lib/email/components.ts#L339-L349).
   - **Best:** make `sendEmailOrLog` accept an optional `uid` + `category` and mint a real unsubscribe URL for every transactional email too (the unsubscribe page already handles category="all"). This is closer to the Gmail/Yahoo bulk-sender expectation that *every* commercial email carry a List-Unsubscribe header.

### High

3. **Add `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers** to every send. Pass via Resend's `headers: { ... }` field. Edit: [lib/email/resend.ts:87-94](lib/email/resend.ts#L87-L94). Requires fix #2 to land first (need a real URL to point at).
4. **Verify Resend dashboard click-tracking is off** (or that the rewritten domain is `links.annote.ai` via Resend's custom-domain link tracking, not the default `*.resend-links.com`). Code change is optional: pass `tracking: { click: false, open: false }` or whatever Resend's current API supports if you want it enforced from code. Without verification, even fixing #1 and #2 may leave a "domain mismatch" warning on every link.
5. **Verify `UNSUBSCRIBE_SECRET` is set in production.** If unset, the code falls back to a known dev string ([unsubscribeToken.ts:16-17](lib/email/unsubscribeToken.ts#L16-L17)) and unsubscribes are forgeable. Out-of-band check on Vercel envs.
6. **Confirm Firebase auth-action URLs route through `annote.ai`.** `passwordReset.resetUrl` and `emailVerification.verifyUrl` come from Firebase. Default Firebase action URLs are `*.firebaseapp.com`, which would be a domain mismatch in the email. Check `lib/firebase/config.ts` and the Firebase console action-handler setting. (Out of scope for this audit — flagging for follow-up.)

### Medium

7. **Replace the literal `PLACEHOLDER` extension ID in the welcome email's install button** before any production welcome ships. Edit: [lib/email/urls.ts:28-29](lib/email/urls.ts#L28-L29). The button currently links to `https://chromewebstore.google.com/detail/echly/PLACEHOLDER` (404).
8. **Consider tag/category headers** in `resend.emails.send` so the Resend dashboard breaks deliverability metrics out by template family (transactional vs. notification vs. billing vs. lifecycle). Edit: [lib/email/resend.ts:87-94](lib/email/resend.ts#L87-L94), pass `tags: [{ name: "category", value: ... }]`. No deliverability impact, but useful diagnostics.

### Low / informational

9. The two intentional cross-domain links — `chromewebstore.google.com` (welcome) and `pay.stripe.com` / `*.stripe.com` (billing) — are industry-standard and shouldn't trip spam filters. No action needed, but worth being aware of if inbox-provider warnings persist after fixes 1-4.
10. **No `Sender` header** is set anywhere — Resend handles envelope sender via its own bounce domain. If DMARC alignment ever fails (out-of-band DNS issue), adding an explicit `Sender:` header may help. Don't touch unless DNS reveals a problem.

---

## "Needs review" / open questions

- **Resend dashboard tracking settings** — not visible from code. Confirm click/open tracking is either disabled or routed through a verified `annote.ai` subdomain.
- **DNS state of `annote.ai`** — SPF, DKIM, and DMARC records must align with what Resend expects for `noreply@annote.ai` (and any replacement From address). The audit cannot inspect DNS; flag for the fix pass.
- **Firebase auth action handler URL** — confirm `passwordReset.resetUrl` and `emailVerification.verifyUrl` resolve to `https://annote.ai/auth/action`, not `*.firebaseapp.com`. Code shows the URLs are passed in as props from API routes ([app/api/auth/forgot-password/route.ts](app/api/auth/forgot-password/route.ts), [app/api/auth/send-verification/route.ts](app/api/auth/send-verification/route.ts)) — those routes call Firebase Admin SDK, which uses the project's configured action-handler URL.
- **No second email provider found** — only `resend` in `package.json` and only `lib/email/resend.ts` initialises a client. Safe to treat Resend as the canonical (and only) sender.

---

## Resolution (2026-05-26)

The code-side fixes laid out in §9 (Critical + High + Medium) shipped together in one PR. Infrastructure work (Google Workspace mailboxes, `links.annote.ai` click-tracking subdomain, DMARC monitoring at `p=none`, DKIM/SPF verification, suppression list cleanup) was completed out-of-band beforehand.

### What changed in code

1. **From addresses replaced** — [lib/email/resend.ts:50-54](lib/email/resend.ts#L50-L54). `system` → `Annote <hello@annote.ai>`, `founder` → `Ishaq from Annote <ishaq@annote.ai>`. Both are real Google Workspace mailboxes (aliases routing into `ishaq@annote.ai`'s inbox). Closes §1 CRITICAL #1 + §3 + §9 fix #1.
2. **Global `REPLY_TO` constant removed** — Reply-To is no longer overridden; Resend falls back to the From header naturally so replies land in the same mailbox the email came from. The per-call `replyTo` override parameter on `sendEmailOrLog` is retained for future flexibility but has no default. Closes §3 + §9 fix #1.
3. **`{{UNSUBSCRIBE_URL}}` literal eliminated** — [lib/email/components.ts](lib/email/components.ts): `emailShellV2` and `plainTextShellV2` no longer default `unsubscribeUrl` to the placeholder. When `undefined`/empty, the footer renders only the centered `annote.ai` link (no broken "Unsubscribe ·" prefix). Preference-gated templates (welcome, newComment, mention, ticketAssigned, planLimitApproaching, planLimitHit, sessionOpened, ticketResolved, inviteAccepted) now accept `unsubscribeUrl?: string` and forward it to the shell. Dispatchers ([notificationEmails.ts](lib/email/notificationEmails.ts), [workspaceEmails.ts:577-583](lib/email/workspaceEmails.ts#L577-L583)) thread the real signed URL through `htmlBuilder`/`textBuilder` closures. The `substituteUnsub` step in [sendEmailWithPreferences.ts](lib/email/sendEmailWithPreferences.ts) is retained as a no-op safety net. Closes §1 CRITICAL #2 + §4c + §5 + §9 fix #2.
4. **`List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers added** — [lib/email/resend.ts:111-121](lib/email/resend.ts#L111-L121). Set only when `unsubscribeUrl` is present (preference-gated mail). Transactional mail intentionally ships without these headers per Gmail/Yahoo guidance. Closes §1 HIGH + §5 + §9 fix #3.
5. **`UNSUBSCRIBE_SECRET` prod safety net** — [lib/email/unsubscribeToken.ts:17-32](lib/email/unsubscribeToken.ts#L17-L32) now `console.error`s at module load if `NODE_ENV === "production"` and the env var is missing/equals the dev fallback. Behavior unchanged (fallback still works for local dev). Addresses §6 + §9 fix #5.
6. **Resend tracking flags — documented inline** — the Resend SDK v6 `CreateEmailOptions` surface does NOT expose `tracking` / `open_tracking` / `click_tracking` on the `send` call (verified against `node_modules/resend/dist/index.d.cts:515-583`); tracking is configured at the domain level in the Resend dashboard. Comment added in [lib/email/resend.ts:60-67](lib/email/resend.ts#L60-L67) noting the constraint, the current state (click on via `links.annote.ai`, open off), and the rule not to enable open tracking. Closes §4c (Resend rewrite concern) + §5 + §9 fix #4.
7. **`PLACEHOLDER` extension ID flagged with TODO** — [lib/email/urls.ts:28](lib/email/urls.ts#L28). Comment-only; URL deliberately unchanged until the Chrome Web Store listing publishes. Closes §9 fix #7.

### What's still outstanding

- **Firebase auth action handler URL** — `passwordReset.resetUrl` and `emailVerification.verifyUrl` are still passed in from Firebase Admin SDK calls. The action handler URL in the Firebase Console must be set to `https://annote.ai/auth/action` (not the default `*.firebaseapp.com`). This is a console-side config change, not a code change. Owner: out-of-band Firebase Console review. Tracked in §9 fix #6.
- **Real Chrome Web Store extension ID** — `lib/email/urls.ts:29` still contains the literal `PLACEHOLDER`. Will be replaced once the extension listing is published. Tracked in §9 fix #7.
- **Optional Resend per-send `tags`** — §9 fix #8 (diagnostics nice-to-have). Not implemented; no deliverability impact. Deferred.

### Rollout state

Code merged + deploys to follow. Post-deploy verification (one email of each category against a real Gmail inbox, "Show original" header inspection, DMARC aggregate report check 24-48h later) is captured in [audit/email-deliverability-fix-summary.md](email-deliverability-fix-summary.md).
