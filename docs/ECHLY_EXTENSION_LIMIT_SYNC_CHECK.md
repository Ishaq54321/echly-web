# Echly Extension vs Dashboard Plan Limits — Sync Check (Read-Only Audit)

**Scope:** Verify that the Chrome extension respects the same plan limits as the dashboard. Diagnostic only; no code changes.

---

## 1. Does the extension rely on the backend to enforce limits?

**Yes for sessions.** The extension never creates sessions locally. All new sessions are created via `POST /api/sessions`, which is the only place that enforces the session limit (see below).

**Feedback:** The backend does not enforce a plan-based feedback limit. Plan config and `checkPlanLimit` only define `maxSessions` and `maxMembers`. There is no `maxFeedback` or per-session feedback cap in the billing/limit logic. So both dashboard and extension rely on the same backend behavior for feedback—and that behavior is “no limit enforced at creation.”

---

## 2. Can the extension bypass session limits?

**No.** Session creation in the extension goes only through the backend:

- **Content script:** `createSession()` in `echly-extension/src/content.tsx` (lines 850–863) calls `apiFetch("/api/sessions", { method: "POST", ... })` and uses the returned `session.id` only when `res.ok && json.success && json.session?.id`. There is no local session creation or local session ID generation.
- **ECHLY_SET_ACTIVE_SESSION** (background) only sets the active session ID and loads pointers/sessions; it does not create sessions. New sessions are created before this message is sent (after a successful `createSession()` or when choosing an existing session from the list).

So the extension cannot bypass session limits; it is fully constrained by `POST /api/sessions`.

---

## 3. Can the extension bypass feedback limits?

**N/A for a “feedback limit.”** The backend does not enforce a plan-based or per-session feedback limit at creation. `POST /api/feedback` (app/api/feedback/route.ts) does not call `checkPlanLimit` or any feedback-count check; it validates session existence, auth, and workspace not suspended, then creates feedback. The domain has `maxFeedbackPerSession` in workspace types, but entitlements and `checkPlanLimit` use only `maxSessions` and `maxMembers`. So there is no feedback limit to bypass—dashboard and extension behave the same.

**All feedback goes through the API.** The extension creates feedback only via:

- Content: `apiFetch("/api/feedback", { method: "POST", ... })` in multiple flows (structure-feedback then POST feedback, submit edited, use suggestion).
- Background: `ECHLY_PROCESS_FEEDBACK` uses `apiFetch(\`${API_BASE}/api/feedback\`, { method: "POST", ... })`.

There is no local-only or offline feedback storage that could bypass server validation.

---

## 4. Which backend endpoint enforces the limits?

- **Session limit:** **`POST /api/sessions`** (app/api/sessions/route.ts). It calls `checkPlanLimit({ workspace, metric: "maxSessions", currentUsage: currentSessionCount })` before creating a session. On limit exceeded it returns **403** with body `planLimitReachedBody(planErr)` → `{ error: "PLAN_LIMIT_REACHED", message, upgradePlan }`.
- **Feedback limit:** None. No endpoint enforces a plan-based or per-session feedback limit. Plan limits in use are `maxSessions` and `maxMembers` (lib/billing/checkPlanLimit.ts, lib/billing/plans.ts, getWorkspaceEntitlements).

---

## 5. If a limit is hit, what does the extension currently do?

- **Session limit (403 from POST /api/sessions):**  
  `createSession()` treats any `!res.ok` as failure and returns `null`. The “Start new session” handler only calls `onActiveSessionChange(session.id)` when `session?.id` is present, so when the limit is hit no new session is set. The extension does **not** read `res.status` or the body (`error: "PLAN_LIMIT_REACHED"`, `message`, `upgradePlan`). So the user effectively sees a silent failure: no new session and no specific “plan limit reached” or upgrade message. (The dashboard, by contrast, explicitly checks `res.status === 403` and `data.error === "PLAN_LIMIT_REACHED"` and surfaces a plan-limit message via `onPlanLimitReached`.)

- **Feedback:** Because the backend does not enforce a feedback limit, “limit hit” does not apply. For other API failures (e.g. 403/500), the extension surfaces a generic error: in the background, `!feedbackRes.ok` leads to `sendResponse({ success: false, error: "Feedback API failed" })`; in content, the callback uses `onError()` when `!response?.success`, so the user sees failure but not a specific limit message.

---

## Summary Table

| Limit / behavior        | Enforced by backend?      | Extension bypass possible? | Extension behavior when limit/error |
|-------------------------|---------------------------|----------------------------|--------------------------------------|
| Session count           | Yes (POST /api/sessions)  | No                         | Create fails; no new session; no plan-limit message |
| Feedback count          | No                        | N/A                        | N/A (no limit)                        |
| Plan / subscription     | Yes (sessions only)       | No                         | Same as session limit (403 → silent fail for create) |
