# Echly Login Flow Simplification

**Date:** March 2025  
**Scope:** Web app routing, extension login UI, root redirect. No changes to authentication architecture.

---

## Summary

- Extension-specific login copy was removed; login page shows no special UI for extension users.
- Root route `/` now redirects correctly (authenticated → `/dashboard`, unauthenticated → `/login`).
- Login redirect flow is unchanged: `extension=true` + `returnUrl` still redirect to the tab after login; otherwise redirect to dashboard or onboarding.
- Extension flow is simplified: same login page for everyone; no extension-only UI.

---

## 1. Extension Login UI Removed

**Web app (`app/(auth)/login/page.tsx`):**  
The login page never displayed any "Sign in from extension" UI. It only shows:

- Google sign-in
- Email/password sign-in
- Standard "Sign in to Echly" and "Sign up" links

**Extension (`echly-extension/src/content.tsx`):**  
The unauthenticated widget previously showed a button and tooltip labeled "Sign in from extension". These were updated to generic copy:

- Button text: **"Sign in from extension"** → **"Sign in"**
- Button `title`: **"Sign in from extension"** → **"Sign in"**

The button still opens the login page with `extension=true` and `returnUrl` so the redirect-after-login flow is unchanged. Only the user-facing wording was made generic.

---

## 2. Root Route Redirect

**File:** `app/page.tsx`

**Before:** Static placeholder page ("Echly Web Core") with no redirect.

**After:** Client-side auth check and redirect:

- **Authenticated:** `router.replace("/dashboard")`
- **Not authenticated:** `router.replace("/login")`
- While auth is resolving, a short "Loading…" state is shown.

Implementation uses Firebase `onAuthStateChanged` in a client component, consistent with the rest of the app’s client-side auth. No server-side session or middleware changes.

---

## 3. Login Redirect Flow Preserved

**File:** `app/(auth)/login/page.tsx`

Behavior is unchanged:

- **Extension flow:** URL has `extension=true` and `returnUrl`. After successful login (Google or email/password), the app calls `window.location.href = returnUrl` (via `safeRedirectToReturnUrl`) so the user returns to the tab the extension opened from.
- **Normal flow:** No extension params. After login, `checkUserWorkspace(uid)` decides destination: `router.replace("/dashboard")` or `router.replace("/onboarding")`.

Query parsing for `extension` and `returnUrl` is still in place; only UI was simplified (no extension-specific copy on the login page).

---

## 4. Auth Guard Unchanged

**File:** `lib/hooks/useAuthGuard.ts`

- Still redirects logged-out users to `/login` when a `router` is provided.
- No changes; no conflict with the new root redirect (root handles `/` before any guarded layout).

---

## 5. Login Page Contents

The login page shows only:

- Google login
- Email/password login
- "Don't have an account? Sign up" link

No extension-specific messaging or widgets.

---

## 6. Extension Flow Verification

End-to-end flow:

1. Extension opens: `/login?extension=true&returnUrl=<encoded_tab_url>`.
2. User sees the same login page as everyone else (Google + email/password).
3. After successful login, the app redirects with `window.location.href = returnUrl`.
4. User lands back on the tab; extension can continue with authenticated context.

No special UI is shown for extension users on the login page; only the redirect logic differs when `extension=true` and `returnUrl` are present.

---

## 7. Files Touched

| File | Change |
|------|--------|
| `app/page.tsx` | Replaced placeholder with auth-based redirect to `/dashboard` or `/login`. |
| `echly-extension/src/content.tsx` | "Sign in from extension" → "Sign in" (button text and title); comment updated. |

No edits were made to authentication logic, Firebase config, or API behavior.
