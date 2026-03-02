# ECHLY — COMPLETE ARCHITECTURAL EXPORT

For external deep technical audit and Chrome extension runtime debugging.

Exclusions: node_modules, .git, .next, build artifacts only.

---

# ==========================================
# SECTION 1 — FULL PROJECT STRUCTURE
# ==========================================

Full folder tree (source only; node_modules, .git, .next, build excluded):

```
echly/
├── .env.local
├── .gitignore
├── next.config.ts
├── next-env.d.ts
├── package.json
├── tailwind.config.ts
├── middleware.ts
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWorkspaceOverview.ts
│   │   │   └── [sessionId]/
│   │   │       ├── page.tsx
│   │   │       ├── hooks/
│   │   │       │   ├── useSessionFeedbackPaginated.ts
│   │   │       │   ├── useSessionLoader.ts
│   │   │       │   ├── useFeedback.ts
│   │   │       │   └── useFeedbackDetailController.ts
│   │   │       └── overview/
│   │   │           ├── page.tsx
│   │   │           └── hooks/
│   │   │               └── useSessionOverview.ts
│   └── api/
│       ├── sessions/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── upload-screenshot/
│       │   └── route.ts
│       ├── feedback/
│       │   └── route.ts
│       ├── structure-feedback/
│       │   └── route.ts
│       └── tickets/
│           └── [id]/
│               └── route.ts
├── components/
│   ├── layout/
│   │   ├── GlobalNavBar.tsx
│   │   └── GlobalRail.tsx
│   ├── CaptureWidget/
│   │   ├── index.tsx
│   │   ├── CaptureWidget.tsx
│   │   ├── CaptureHeader.tsx
│   │   ├── FeedbackList.tsx
│   │   ├── FeedbackItem.tsx
│   │   ├── WidgetFooter.tsx
│   │   ├── types.ts
│   │   └── hooks/
│   │       └── useCaptureWidget.ts
│   ├── session/
│   │   ├── SessionHeader.tsx
│   │   ├── FeedbackSidebar.tsx
│   │   ├── constants.ts
│   │   └── feedbackDetail/
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── FeedbackDetail.tsx
│   │       ├── FeedbackHeader.tsx
│   │       ├── FeedbackContent.tsx
│   │       ├── ActivityPanel.tsx
│   │       ├── ActivityThread.tsx
│   │       ├── ActivityComposer.tsx
│   │       ├── ScreenshotBlock.tsx
│   │       ├── DescriptionSection.tsx
│   │       ├── ActionItemsSection.tsx
│   │       ├── SuggestionSection.tsx
│   │       └── Section.tsx
│   ├── dashboard/
│   │   ├── WorkspaceCard.tsx
│   │   ├── RenameSessionModal.tsx
│   │   ├── ShareSessionModal.tsx
│   │   └── DeleteSessionModal.tsx
│   ├── comments/
│   │   ├── CommentThread.tsx
│   │   ├── CommentItem.tsx
│   │   └── CommentInput.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Tag.tsx
│   │   ├── Avatar.tsx
│   │   ├── FeedbackTag.tsx
│   │   └── ResolvedToggle.tsx
│   ├── system/
│   │   └── CommandPalette.tsx
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   └── AudioWaveform.tsx
├── lib/
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── capture.ts
│   ├── screenshot.ts
│   ├── feedback.ts
│   ├── sessions.ts
│   ├── comments.ts
│   ├── viewerId.ts
│   ├── tagConfig.ts
│   ├── querySafety.ts
│   ├── domain/
│   │   ├── session.ts
│   │   ├── feedback.ts
│   │   └── comment.ts
│   ├── server/
│   │   ├── auth.ts
│   │   └── serializeFeedback.ts
│   ├── repositories/
│   │   ├── sessionsRepository.ts
│   │   ├── feedbackRepository.ts
│   │   ├── usersRepository.ts
│   │   └── commentsRepository.ts
│   └── utils/
│       ├── time.ts
│       └── date.ts
├── server/
│   └── middleware/
│       └── verifyFirebaseToken.ts
└── echly-extension/
    ├── manifest.json
    ├── popup.html
    ├── popup.js          # Bundled from popup.ts (npm run build:extension)
    ├── background.js
    └── src/
        ├── popup.ts
        ├── api.ts
        ├── auth.ts
        └── firebase.ts
```

---

# ==========================================
# SECTION 2 — CHROME EXTENSION (FULL)
# ==========================================

## 2.1 manifest.json

```json
{"manifest_version":3,"name":"Echly","version":"1.0","description":"Capture screenshots and submit feedback","permissions":["activeTab","storage","scripting","identity"],"oauth2":{"client_id":"609478020649-qqaun85ai4tg4t7du7f99ar11ihu4ekn.apps.googleusercontent.com","scopes":["openid","email","profile","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/userinfo.profile"]},"host_permissions":["http://localhost:3000/*","https://*.firebaseapp.com/*","https://www.gstatic.com/*","https://securetoken.googleapis.com/*","https://www.googleapis.com/*","https://apis.google.com/*"],"action":{"default_popup":"popup.html"},"background":{"service_worker":"background.js"}}
```

## 2.2 popup.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Echly</title>
</head>
<body>
  <div id="authSection">
    <p>Sign in to capture and submit feedback.</p>
    <button type="button" id="signInBtn">Sign in with Google</button>
  </div>
  <div id="formSection" style="display: none;">
    <p>Signed in as <span id="userEmail"></span> <button type="button" id="signOutBtn">Sign out</button></p>
    <form id="form">
      <div id="sessionSelectWrap">
        <label for="sessionSelect">Session</label>
        <div id="sessionSelectState"></div>
        <select id="sessionSelect" name="sessionId" style="display: none;"></select>
      </div>
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" name="title" required>
      </div>
      <div>
        <label for="description">Description</label>
        <textarea id="description" name="description" rows="3" required></textarea>
      </div>
      <button type="submit" id="captureBtn">Capture</button>
    </form>
  </div>
  <p id="status"></p>
  <script src="popup.js"></script>
</body>
</html>
```

## 2.3 background.js

```javascript
// Manifest V3 service worker — minimal; capture/API logic lives in popup.
chrome.runtime.onInstalled.addListener(() => {});
```

## 2.4 popup.ts (source; popup.js is bundled from this via npm run build:extension)

```typescript
/**
 * Extension popup: Google Sign-In, auth state, session dropdown, and Capture submit using apiFetch.
 */
import { apiFetch } from "./api";
import {
  signInWithGoogle,
  signOut,
  subscribeToAuthState,
} from "./auth";
import "./firebase"; // ensure Firebase is initialized

/** Session shape returned by GET /api/sessions */
export interface SessionOption {
  id: string;
  title: string;
  userId: string;
  createdAt?: string;
  [key: string]: unknown;
}

// --- DOM refs (set once DOM is ready)
let statusEl: HTMLParagraphElement;
let formEl: HTMLFormElement;
let captureBtn: HTMLButtonElement;
let signInBtn: HTMLButtonElement;
let signOutBtn: HTMLButtonElement;
let authSection: HTMLElement;
let formSection: HTMLElement;
let sessionSelect: HTMLSelectElement;
let sessionSelectState: HTMLElement;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

function setStatus(msg: string, isError?: boolean): void {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#c00" : "#000";
}

type SessionListState = "loading" | "empty" | "error" | "ready";

function setSessionListState(state: SessionListState, message?: string): void {
  sessionSelect.style.display = "none";
  sessionSelectState.style.display = "block";
  sessionSelectState.textContent = message ?? "";
  sessionSelectState.style.color = state === "error" ? "#c00" : "#666";
  if (state === "ready") {
    sessionSelectState.style.display = "none";
    sessionSelect.style.display = "block";
  }
}

function updateCaptureButtonState(): void {
  const hasSelection =
    sessionSelect.style.display === "block" &&
    sessionSelect.value !== "" &&
    sessionSelect.value !== "__none";
  captureBtn.disabled = !hasSelection;
}

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function loadSessions(): Promise<void> {
  setSessionListState("loading", "Loading sessions…");
  captureBtn.disabled = true;
  try {
    const res = await apiFetch("/api/sessions");
    const json = (await res.json()) as {
      success?: boolean;
      error?: string;
      sessions?: SessionOption[];
    };
    if (!res.ok || !json.success) {
      setSessionListState("error", json.error || "Failed to load sessions");
      return;
    }
    const sessions = json.sessions ?? [];
    if (sessions.length === 0) {
      setSessionListState("empty", "No sessions found");
      return;
    }
    sessionSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "__none";
    placeholder.textContent = "— Select a session —";
    sessionSelect.appendChild(placeholder);
    for (const s of sessions) {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.title?.trim() || s.id;
      sessionSelect.appendChild(opt);
    }
    setSessionListState("ready");
    updateCaptureButtonState();
  } catch (err) {
    setSessionListState(
      "error",
      err instanceof Error ? err.message : "Failed to load sessions"
    );
  }
}

function updateUIForUser(user: { email: string | null } | null): void {
  if (user) {
    authSection.style.display = "none";
    formSection.style.display = "block";
    const emailSpan = document.getElementById("userEmail");
    if (emailSpan) emailSpan.textContent = user.email || "Signed in";
    setStatus("");
    loadSessions();
  } else {
    authSection.style.display = "block";
    formSection.style.display = "none";
    setStatus(`Sign in with Google to use Capture.`, true);
  }
}

function bindSignIn(): void {
  signInBtn.addEventListener("click", async () => {
    setStatus("Signing in…");
    try {
      await signInWithGoogle();
      setStatus("Signed in.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sign-in failed", true);
    }
  });
}

function bindSignOut(): void {
  signOutBtn.addEventListener("click", async () => {
    try {
      await signOut();
      setStatus("Signed out.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sign-out failed", true);
    }
  });
}

function bindFormSubmit(): void {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sessionId =
      sessionSelect.style.display === "block"
        ? (sessionSelect.value === "__none" ? "" : sessionSelect.value)
        : "";
    const title = (getEl<HTMLInputElement>("title").value || "").trim();
    const description = (
      getEl<HTMLTextAreaElement>("description").value || ""
    ).trim();

    if (!sessionId || !title || !description) {
      setStatus("Select a session, then fill Title and Description.", true);
      return;
    }

    captureBtn.disabled = true;
    setStatus("Capturing…");

    try {
      const tabs = await new Promise<chrome.tabs.Tab[]>(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });
      const tab = tabs[0];
      if (!tab) {
        setStatus("No active tab.", true);
        captureBtn.disabled = false;
        return;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        chrome.tabs.captureVisibleTab(tab.windowId!, { format: "png" }, result => {
          if (chrome.runtime.lastError)
            reject(new Error(chrome.runtime.lastError!.message));
          else resolve(result);
        });
      });

      const feedbackId = randomId();

      const uploadRes = await apiFetch("/api/upload-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          feedbackId,
          imageBase64: dataUrl,
        }),
      });
      const uploadJson = (await uploadRes.json()) as {
        success?: boolean;
        error?: string;
        url?: string;
      };
      if (!uploadJson.success) {
        setStatus(uploadJson.error || "Upload failed", true);
        captureBtn.disabled = false;
        return;
      }

      const feedbackRes = await apiFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          title,
          description,
          screenshotUrl: uploadJson.url,
        }),
      });
      const feedbackJson = (await feedbackRes.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!feedbackJson.success) {
        setStatus(feedbackJson.error || "Feedback create failed", true);
        captureBtn.disabled = false;
        return;
      }

      setStatus("Success.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error", true);
    }
    captureBtn.disabled = false;
  });
}

function init(): void {
  statusEl = getEl<HTMLParagraphElement>("status");
  formEl = getEl<HTMLFormElement>("form");
  captureBtn = getEl<HTMLButtonElement>("captureBtn");
  signInBtn = getEl<HTMLButtonElement>("signInBtn");
  signOutBtn = getEl<HTMLButtonElement>("signOutBtn");
  authSection = getEl<HTMLElement>("authSection");
  formSection = getEl<HTMLElement>("formSection");
  sessionSelect = getEl<HTMLSelectElement>("sessionSelect");
  sessionSelectState = getEl<HTMLElement>("sessionSelectState");

  captureBtn.disabled = true;
  sessionSelect.addEventListener("change", updateCaptureButtonState);

  bindSignIn();
  bindSignOut();
  bindFormSubmit();

  subscribeToAuthState(user => updateUIForUser(user));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
```

## 2.5 api.ts (API client; getIdToken used here)

```typescript
/**
 * API client for production backend.
 * Automatically attaches Authorization: Bearer <firebase-id-token> to every request.
 */

import { auth } from "./firebase";

const API_BASE = "https://echly-web.vercel.app";

export { API_BASE };

export type ApiFetchOptions = RequestInit & {
  /** If true, do not attach Authorization header (e.g. public endpoints). Default false. */
  skipAuth?: boolean;
};

/**
 * Fetch helper that:
 * - Calls API_BASE (e.g. http://localhost:3000 for debugging)
 * - Attaches Authorization: Bearer <firebase-id-token> from auth.currentUser.getIdToken()
 * - Throws if not logged in (unless skipAuth: true)
 */
export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const headersRecord: Record<string, string> =
    headers instanceof Headers
      ? Object.fromEntries(headers)
      : Array.isArray(headers)
        ? Object.fromEntries(headers)
        : { ...headers };

  if (!skipAuth) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Not signed in. Sign in with Google to use this feature.");
    }
    const token = await user.getIdToken();
    headersRecord["Authorization"] = `Bearer ${token}`;
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  return fetch(url, {
    ...rest,
    headers: headersRecord,
  });
}
```

## 2.6 auth.ts (extension auth: launchWebAuthFlow + Firebase credential)

```typescript
/**
 * Auth helpers for Chrome extension.
 * - Google Sign-In via chrome.identity.launchWebAuthFlow (response_type=id_token) + GoogleAuthProvider.credential(idToken).
 * - Auth state persisted by Firebase (IndexedDB in extension context).
 * - For API tokens use auth.currentUser.getIdToken() after login.
 */
import {
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
} from "firebase/auth/web-extension";
import { auth } from "./firebase";

/**
 * Sign in with Google using chrome.identity.launchWebAuthFlow (OAuth2 implicit flow, response_type=id_token).
 * Requires manifest "identity" permission. Uses Web client ID for id_token.
 */
export async function signInWithGoogle(): Promise<User> {
  const redirectUri = chrome.identity.getRedirectURL();
  const clientId = "609478020649-0k5ec22m3lvgmcs2icsc6pmabndu85td.apps.googleusercontent.com";

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${clientId}` +
    `&response_type=id_token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=openid%20email%20profile` +
    `&nonce=${crypto.randomUUID()}`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      async (responseUrl?: string) => {
        if (chrome.runtime.lastError || !responseUrl) {
          reject(chrome.runtime.lastError);
          return;
        }

        const url = new URL(responseUrl);
        const idToken = url.hash
          .substring(1)
          .split("&")
          .find((param) => param.startsWith("id_token="))
          ?.split("=")[1];

        if (!idToken) {
          reject(new Error("No ID token found"));
          return;
        }

        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        resolve(result.user);
      }
    );
  });
}

/**
 * Sign out from Firebase. Persisted state is cleared by Firebase Auth.
 */
export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes (e.g. to update UI).
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export { auth };
```

## 2.7 firebase.ts (extension Firebase client init)

```typescript
/**
 * Firebase initialization for Chrome extension.
 * Uses same config as web app. Modular Firebase v9+ syntax.
 * Import from firebase/auth/web-extension for extension compatibility.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";

const firebaseConfig = {
  apiKey: "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",
  authDomain: "echly-b74cc.firebaseapp.com",
  projectId: "echly-b74cc",
  storageBucket: "echly-b74cc.firebasestorage.app",
  messagingSenderId: "609478020649",
  appId: "1:609478020649:web:54cd1ab0dc2b8277131638",
  measurementId: "G-Q0C7DP8QVR",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

**Extension notes:**
- **Screenshot logic:** In popup.ts form submit: `chrome.tabs.captureVisibleTab(tab.windowId!, { format: "png" })` → data URL → POST `/api/upload-screenshot` with `imageBase64`, then POST `/api/feedback` with `screenshotUrl` from upload response.
- **Message passing:** None between background and popup; all logic in popup. No content scripts.
- **Storage:** Extension uses `storage` permission; Firebase Auth persists in IndexedDB (extension context). No explicit chrome.storage usage in provided code.
- **popup.js:** Built from popup.ts with `npm run build:extension` (esbuild). Full bundle not included; source above is the single source of truth.

---

# ==========================================
# SECTION 3 — WEB APP (NEXT.JS APP ROUTER)
# ==========================================

## 3.1 app/layout.tsx

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { GlobalNavBar } from "@/components/layout/GlobalNavBar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Echly",
  description: "Structured AI-powered feedback workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} antialiased h-full overflow-hidden`} suppressHydrationWarning>
        <div className="h-screen flex flex-col">
          <GlobalNavBar />
          <div className="flex flex-1 min-h-0 pt-[56px] overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
```

## 3.2 app/page.tsx

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-semibold text-primary">
        Echly Web Core
      </h1>
    </main>
  );
}
```

## 3.3 app/(app)/layout.tsx

```tsx
import GlobalRail from "@/components/layout/GlobalRail";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <GlobalRail />
      <main className="flex flex-1 min-h-0 overflow-auto">
        {children}
      </main>
      <div className="fixed bottom-4 right-6 text-[11px] text-neutral-400 pointer-events-none">
        All changes saved • Secure session
      </div>
    </div>
  );
}
```

## 3.4 app/login/page.tsx

```tsx
"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { saveUserToFirestore } from "@/lib/firestore";

export default function Login() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        type="button"
        onClick={handleLogin}
        className="px-6 py-3 bg-black text-white rounded-lg cursor-pointer transition-colors duration-150 hover:opacity-90 active:scale-[0.98]"
      >
        Sign in with Google
      </button>
    </main>
  );
}
```

## 3.5 app/api/sessions/route.ts

```typescript
import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { requireAuth } from "@/lib/server/auth";
import { getUserSessionsRepo } from "@/lib/repositories/sessionsRepository";

/** GET /api/sessions — list sessions for the authenticated user. */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const sessions = await getUserSessionsRepo(user.uid, 100);
    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => serializeSession(s)),
    });
  } catch (err) {
    console.error("GET /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

function serializeSession(session: Session): Record<string, unknown> {
  const out = { ...session } as Record<string, unknown>;
  const createdAt = session.createdAt as { toDate?: () => Date } | null | undefined;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  const updatedAt = session.updatedAt as { toDate?: () => Date } | null | undefined;
  if (updatedAt != null && typeof updatedAt.toDate === "function") {
    out.updatedAt = updatedAt.toDate().toISOString();
  }
  return out;
}
```

## 3.6 app/api/sessions/[id]/route.ts

```typescript
import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { requireAuth } from "@/lib/server/auth";
import {
  deleteSessionRepo,
  getSessionByIdRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
} from "@/lib/repositories/sessionsRepository";

type PatchBody = { title?: string; archived?: boolean };

/** PATCH /api/sessions/:id — update session; body: { title?: string, archived?: boolean }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing session id" },
      { status: 400 }
    );
  }
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const existing = await getSessionByIdRepo(id);
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }
  if (existing.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const hasTitle = typeof body.title === "string" && body.title.trim() !== "";
  const hasArchived = typeof body.archived === "boolean";

  if (!hasTitle && !hasArchived) {
    return NextResponse.json({
      success: true,
      session: serializeSession(existing),
    });
  }

  try {
    if (hasTitle) {
      await updateSessionTitleRepo(id, body.title!.trim());
    }
    if (hasArchived) {
      await updateSessionArchivedRepo(id, body.archived!);
    }
    const updated = await getSessionByIdRepo(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found after update" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      session: serializeSession(updated),
    });
  } catch (err) {
    console.error("PATCH /api/sessions/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** DELETE /api/sessions/:id — permanently delete session and all tickets/comments. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing session id" },
      { status: 400 }
    );
  }
  const existing = await getSessionByIdRepo(id);
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }
  if (existing.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }
  try {
    await deleteSessionRepo(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/sessions/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

function serializeSession(session: Session): Record<string, unknown> {
  const out = { ...session } as Record<string, unknown>;
  const createdAt = session.createdAt as { toDate?: () => Date } | null | undefined;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  const updatedAt = session.updatedAt as { toDate?: () => Date } | null | undefined;
  if (updatedAt != null && typeof updatedAt.toDate === "function") {
    out.updatedAt = updatedAt.toDate().toISOString();
  }
  return out;
}
```

## 3.7 app/api/upload-screenshot/route.ts

```typescript
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";

const MAX_BASE64_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const DATA_IMAGE_PREFIX = "data:image/";

type UploadBody = {
  sessionId?: string;
  feedbackId?: string;
  imageBase64?: string;
};

/**
 * POST /api/upload-screenshot
 * Body: { sessionId, feedbackId, imageBase64 }
 * Returns: { success: true, url } or { success: false, error }
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: UploadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { sessionId, feedbackId, imageBase64 } = body;

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    return NextResponse.json(
      { success: false, error: "Missing or invalid sessionId" },
      { status: 400 }
    );
  }
  if (typeof feedbackId !== "string" || feedbackId.trim() === "") {
    return NextResponse.json(
      { success: false, error: "Missing or invalid feedbackId" },
      { status: 400 }
    );
  }
  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid imageBase64" },
      { status: 400 }
    );
  }

  if (!imageBase64.startsWith(DATA_IMAGE_PREFIX)) {
    return NextResponse.json(
      { success: false, error: "imageBase64 must start with data:image/" },
      { status: 400 }
    );
  }

  const sizeBytes = Math.ceil((imageBase64.length * 3) / 4);
  if (sizeBytes > MAX_BASE64_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, error: "imageBase64 size must be <= 10MB" },
      { status: 400 }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }
  if (session.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  let buffer: Buffer;
  try {
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64.slice(DATA_IMAGE_PREFIX.length);
    buffer = Buffer.from(base64Data ?? "", "base64");
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid base64 image data" },
      { status: 400 }
    );
  }

  if (buffer.length === 0) {
    return NextResponse.json(
      { success: false, error: "Empty image data" },
      { status: 400 }
    );
  }

  // Firebase Storage (adminStorage) removed; uploads require an alternative storage backend.
  return NextResponse.json(
    { success: false, error: "Upload not configured (storage backend removed)" },
    { status: 501 }
  );
}
```

## 3.8 app/api/feedback/route.ts

```typescript
import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import type { FeedbackPriority } from "@/lib/domain/feedback";
import { requireAuth } from "@/lib/server/auth";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  addFeedbackRepo,
  getFeedbackByIdRepo,
  getSessionFeedbackPageWithStringCursorRepo,
  getSessionFeedbackCountRepo,
  getSessionFeedbackCountsRepo,
} from "@/lib/repositories/feedbackRepository";
import {
  getSessionByIdRepo,
  updateSessionUpdatedAtRepo,
} from "@/lib/repositories/sessionsRepository";

function serializeFeedback(item: Feedback): Record<string, unknown> {
  const out = { ...item } as Record<string, unknown>;
  const createdAt = item.createdAt as { toDate?: () => Date; seconds?: number } | null;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = { seconds: Math.floor(createdAt.toDate().getTime() / 1000) };
  } else if (createdAt != null && typeof (createdAt as { seconds?: number }).seconds === "number") {
    out.createdAt = { seconds: (createdAt as { seconds: number }).seconds };
  }
  return out;
}

export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const cursor = searchParams.get("cursor") ?? "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 50) : 20;

  if (!sessionId || sessionId.trim() === "") {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }
  if (session.userId !== user.uid) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const isFirstPage = !cursor || cursor.trim() === "";
    const pageResult = await getSessionFeedbackPageWithStringCursorRepo(
      sessionId,
      limit,
      isFirstPage ? undefined : cursor
    );
    let total: number | undefined;
    let activeCount: number | undefined;
    let resolvedCount: number | undefined;
    if (isFirstPage) {
      total = await getSessionFeedbackCountRepo(sessionId);
      const counts = await getSessionFeedbackCountsRepo(sessionId);
      activeCount = counts.open;
      resolvedCount = counts.resolved;
    }
    const { feedback, nextCursor, hasMore } = pageResult;

    return NextResponse.json({
      feedback: feedback.map(serializeFeedback),
      nextCursor,
      hasMore,
      ...(typeof total === "number" && { total }),
      ...(typeof activeCount === "number" && { activeCount }),
      ...(typeof resolvedCount === "number" && { resolvedCount }),
    });
  } catch (err) {
    console.error("GET /api/feedback:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

const POST_BODY_PRIORITY: FeedbackPriority[] = ["low", "medium", "high", "critical"];

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: {
    sessionId?: string;
    title?: string;
    description?: string;
    suggestion?: string;
    screenshotUrl?: string;
    contextSummary?: string;
    actionItems?: string[];
    impact?: string;
    suggestedTags?: string[];
    priority?: string;
    metadata?: {
      url?: string;
      viewportWidth?: number;
      viewportHeight?: number;
      userAgent?: string;
      clientTimestamp?: number;
    };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "sessionId is required" },
      { status: 400 }
    );
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!title || !description) {
    return NextResponse.json(
      { success: false, error: "title and description are required" },
      { status: 400 }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }
  if (session.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const meta = body.metadata;
  const priority =
    typeof body.priority === "string" &&
    POST_BODY_PRIORITY.includes(body.priority as FeedbackPriority)
      ? (body.priority as FeedbackPriority)
      : "medium";

  const structuredData = {
    title,
    description,
    suggestion: typeof body.suggestion === "string" ? body.suggestion : undefined,
    type: "general" as const,
    contextSummary:
      typeof body.contextSummary === "string" ? body.contextSummary : undefined,
    actionItems: Array.isArray(body.actionItems) ? body.actionItems : undefined,
    impact: typeof body.impact === "string" ? body.impact : undefined,
    suggestedTags: Array.isArray(body.suggestedTags)
      ? body.suggestedTags
      : undefined,
    priority,
    screenshotUrl:
      typeof body.screenshotUrl === "string" ? body.screenshotUrl : undefined,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
  };

  try {
    const docRef = await addFeedbackRepo(sessionId, user.uid, structuredData);
    const created = await getFeedbackByIdRepo(docRef.id);
    if (!created) {
      return NextResponse.json(
        { success: false, error: "Feedback created but could not be read" },
        { status: 500 }
      );
    }
    await updateSessionUpdatedAtRepo(sessionId);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(created),
    });
  } catch (err) {
    console.error("POST /api/feedback:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
```

## 3.9 app/api/structure-feedback/route.ts

```typescript
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitMap = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  return true;
}

const ADAPTIVE_STRUCTURE_SYSTEM = `You are Echly's Adaptive Structuring Engine. ...`;

export async function POST(req: Request): Promise<Response> {
  const stableFailure = (error: string): NextResponse<StructureResponse> =>
    NextResponse.json({ success: false, tickets: [], error }, { status: 200 });

  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  if (!checkRateLimit(user.uid)) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Missing OpenAI API key" },
      { status: 200 }
    );
  }

  let body: { transcript?: unknown };
  try {
    body = await req.json();
  } catch {
    return stableFailure("Invalid request body");
  }
  const transcript = body?.transcript;
  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { success: false, tickets: [], error: "No valid transcript provided" },
      { status: 200 }
    );
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: ADAPTIVE_STRUCTURE_SYSTEM },
        {
          role: "user",
          content: `Raw feedback:\n"${transcript.trim()}"`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const { mode, tickets: parsedTickets } = parseStructuredTickets(content);
    // ... map to valid tickets, return { success: true, tickets: valid }
    return NextResponse.json({ success: true, tickets: valid });
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return NextResponse.json(
      { success: false, tickets: [], error: "Structuring failed" },
      { status: 200 }
    );
  }
}
```
(Full prompt and parseStructuredTickets in repo app/api/structure-feedback/route.ts.)

## 3.10 app/api/tickets/[id]/route.ts

```typescript
import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { requireAuth } from "@/lib/server/auth";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  getFeedbackByIdRepo,
  updateFeedbackRepo,
} from "@/lib/repositories/feedbackRepository";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository";

/** GET /api/tickets/:id — return single ticket (feedback) from DB. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing ticket id" },
      { status: 400 }
    );
  }
  try {
    const ticket = await getFeedbackByIdRepo(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    if (ticket.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(ticket),
    });
  } catch (err) {
    console.error("GET /api/tickets/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** PATCH /api/tickets/:id — update ticket; body: { title?, description?, actionItems?, suggestedTags?, isResolved? }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing ticket id" },
      { status: 400 }
    );
  }
  let body: { title?: string; description?: string; actionItems?: string[]; suggestedTags?: string[]; isResolved?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const existingForOwnership = await getFeedbackByIdRepo(id);
  if (!existingForOwnership) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }
  if (existingForOwnership.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }
  const updates: Parameters<typeof updateFeedbackRepo>[1] = {};
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.description === "string") updates.description = body.description;
  if (Array.isArray(body.actionItems)) updates.actionItems = body.actionItems;
  if (Array.isArray(body.suggestedTags)) updates.suggestedTags = body.suggestedTags;
  if (typeof body.isResolved === "boolean") updates.isResolved = body.isResolved;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(existingForOwnership),
    });
  }
  try {
    await updateFeedbackRepo(id, updates);
    const updated = await getFeedbackByIdRepo(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found after update" },
        { status: 404 }
      );
    }
    await updateSessionUpdatedAtRepo(updated.sessionId);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(updated),
    });
  } catch (err) {
    console.error("PATCH /api/tickets/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
```

## 3.11 Session creation UI (dashboard)

- **app/(app)/dashboard/page.tsx:** useWorkspaceOverview() → handleCreateSession() calls createSession(user.uid, createdBy) from lib/sessions then router.push(`/dashboard/${sessionId}`). New Session button and WorkspaceCard grid.
- **app/(app)/dashboard/hooks/useWorkspaceOverview.ts:** onAuthStateChanged → loadSessionsAndCounts (getUserSessions + getSessionFeedbackCounts). createSession from lib/sessions (createSessionRepo).

## 3.12 Feedback creation UI (session page + CaptureWidget)

- **app/(app)/dashboard/[sessionId]/page.tsx:** CaptureWidget with onComplete={handleTranscript}. handleTranscript: POST /api/structure-feedback with transcript → then uploadScreenshot(screenshot, sessionId, firstFeedbackId) from lib/screenshot (Firebase Storage client), then addFeedback() for each ticket with screenshotUrl on first. Detail from GET /api/tickets/:id; updates via PATCH /api/tickets/:id.
- **components/CaptureWidget:** useCaptureWidget → handleAddFeedback: captureScreenshot (lib/capture), then startListening (Speech Recognition), finishListening → onComplete(transcript, screenshot). Web app uploads via lib/screenshot (uploadString to Firebase Storage); extension would use POST /api/upload-screenshot (currently 501).

## 3.13 middleware.ts (CORS for /api)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

---

# ==========================================
# SECTION 4 — AUTHENTICATION FLOW
# ==========================================

## 4.1 Firebase client config (web app) — lib/firebase.ts

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",
  authDomain: "echly-b74cc.firebaseapp.com",
  projectId: "echly-b74cc",
  storageBucket: "echly-b74cc.firebasestorage.app",
  messagingSenderId: "609478020649",
  appId: "1:609478020649:web:54cd1ab0dc2b8277131638",
  measurementId: "G-Q0C7DP8QVR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 4.2 Firebase Admin / server-side auth — lib/server/auth.ts

No Firebase Admin SDK in repo. Token verification uses **jose** (JWKS from Firebase):

```typescript
import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = "echly-b74cc";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });
  return {
    uid: (payload.sub ?? payload.user_id) as string,
    ...payload,
  };
}

export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Missing token" }),
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Invalid token" }),
      { status: 401 }
    );
  }
}
```

## 4.3 requireAuth usage

Used in every API route that needs auth:

- app/api/sessions/route.ts (GET)
- app/api/sessions/[id]/route.ts (PATCH, DELETE)
- app/api/upload-screenshot/route.ts (POST)
- app/api/feedback/route.ts (GET, POST)
- app/api/structure-feedback/route.ts (POST)
- app/api/tickets/[id]/route.ts (GET, PATCH)

Pattern: `let user; try { user = await requireAuth(req); } catch (res) { return res as Response; }`

## 4.4 getIdToken() usage

- **Extension:** echly-extension/src/api.ts — `apiFetch()` calls `auth.currentUser.getIdToken()` and sets `Authorization: Bearer ${token}` for every request (unless skipAuth).

- **Web app:** No explicit getIdToken() in app code; web app uses same-origin fetch to /api/* and relies on Firebase Auth session cookie / client state for pages; API routes expect Bearer token from extension. (If web app called /api from client with fetch, it would need to attach id token; current dashboard/session pages use client-side Firestore/getDoc and fetch to /api/tickets without shown token attachment — may use cookie or same-origin; audit should confirm how web dashboard sends auth to API.)

## 4.5 Middleware related to auth

- **middleware.ts:** Only CORS for /api/*; no auth checks. Auth is per-route via requireAuth().

## 4.6 Express middleware (optional server) — server/middleware/verifyFirebaseToken.ts

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyIdToken } from "../../lib/server/auth";

export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - Missing token" });
  }

  const idToken = header.split("Bearer ")[1];

  try {
    const decoded = await verifyIdToken(idToken);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
}
```

## 4.7 Cookies / session handling

No custom cookies. Firebase Auth persists in client (web: persistence; extension: IndexedDB via firebase/auth/web-extension). No server-side session store in Next.js app.

## 4.8 saveUserToFirestore (lib/firestore.ts)

```typescript
import type { User } from "firebase/auth";
import { ensureUserRepo } from "@/lib/repositories/usersRepository";

export async function saveUserToFirestore(user: User | null) {
  if (!user) return;
  await ensureUserRepo(user);
}
```

Imported in app/login/page.tsx but **not called** after signInWithPopup (page redirects immediately). So user docs in Firestore may be created elsewhere or not at all on web login unless added.

---

# ==========================================
# SECTION 5 — FIRESTORE DATA WRITES
# ==========================================

## 5.1 sessions collection

- **createSessionRepo** (lib/repositories/sessionsRepository.ts): `addDoc(collection(db, "sessions"), { userId, title: "Untitled Session", createdAt, updatedAt, createdBy, viewCount: 0, commentCount: 0 })`.
- **updateSessionTitleRepo:** updateDoc session doc with title, updatedAt.
- **updateSessionArchivedRepo:** updateDoc with archived, updatedAt.
- **updateSessionUpdatedAtRepo:** updateDoc with updatedAt (serverTimestamp).
- **incrementSessionCommentCountRepo:** updateDoc with commentCount: increment(1).
- **recordSessionViewIfNewRepo:** runTransaction: set sessionViews/{sessionId}/views/{viewerId} with viewedAt; update session viewCount increment(1).
- **deleteSessionRepo:** deleteAllFeedbackForSessionRepo, deleteAllCommentsForSessionRepo, delete view docs under sessionViews/{sessionId}/views, deleteDoc(sessions, sessionId).

## 5.2 feedback collection

- **addFeedbackRepo** (lib/repositories/feedbackRepository.ts): addDoc(collection(db, "feedback"), payload) or setDoc(doc(db, "feedback", feedbackId), payload). Payload: sessionId, userId, title, description, suggestion, type, status: "open", priority, createdAt, contextSummary, actionItems, impact, suggestedTags, url, viewportWidth, viewportHeight, userAgent, clientTimestamp, screenshotUrl.
- **updateFeedbackRepo:** updateDoc(doc(db, "feedback", feedbackId), updates) for title, description, type, status (from isResolved), priority, screenshotUrl, actionItems, suggestedTags.
- **resolveFeedbackRepo:** updateDoc with status: "resolved".
- **deleteFeedbackRepo:** deleteDoc(doc(db, "feedback", feedbackId)).
- **deleteAllFeedbackForSessionRepo:** query feedback by sessionId limit 500, delete each.

## 5.3 comments collection

- **addCommentRepo** (lib/repositories/commentsRepository.ts): addDoc(collection(db, "comments"), { sessionId, feedbackId, userId, userName, userAvatar, message, createdAt: serverTimestamp() }); then incrementSessionCommentCountRepo(sessionId).
- **deleteAllCommentsForSessionRepo:** query comments by sessionId limit 500, delete each.

## 5.4 users collection

- **ensureUserRepo** (lib/repositories/usersRepository.ts): getDoc(users, uid); if !exists setDoc with uid, name, email, photoURL, createdAt. Called from saveUserToFirestore (see 4.8; login page does not call it).

## 5.5 sessionViews subcollection

- **recordSessionViewIfNewRepo:** writes to sessionViews/{sessionId}/views/{viewerId} with viewedAt (see 5.1).

---

# ==========================================
# SECTION 6 — FIREBASE STORAGE
# ==========================================

## 6.1 Upload screenshots (client-side only — web app)

**lib/screenshot.ts:**

```typescript
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export function generateFeedbackId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Upload a screenshot to Firebase Storage.
 * Path format: sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png
 */
export async function uploadScreenshot(
  imageDataUrl: string,
  sessionId: string,
  feedbackId: string
): Promise<string> {
  const timestamp = Date.now();
  const path = `sessions/${sessionId}/feedback/${feedbackId}/${timestamp}.png`;

  const screenshotRef = ref(storage, path);

  await uploadString(
    screenshotRef,
    imageDataUrl,
    "data_url",
    {
      contentType: "image/png",
    }
  );

  return await getDownloadURL(screenshotRef);
}
```

Used from **app/(app)/dashboard/[sessionId]/page.tsx** in handleTranscript after structure-feedback (web app capture flow). Extension does **not** use this; it POSTs base64 to **app/api/upload-screenshot**, which currently returns **501** (storage backend removed).

## 6.2 Storage path format

`sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png`

## 6.3 Reads / signed URLs

- Web app displays screenshot via **screenshotUrl** stored on feedback doc (download URL from getDownloadURL at upload). No signed URL generation in repo; Firebase Storage download URLs are used as-is.

---

# ==========================================
# SECTION 7 — SESSION MODEL
# ==========================================

## 7.1 sessions collection — full document example

```json
{
  "userId": "firebase-uid-here",
  "title": "Untitled Session",
  "createdAt": "<Firestore Timestamp>",
  "updatedAt": "<Firestore Timestamp>",
  "createdBy": {
    "id": "uid",
    "firstName": "Jane",
    "lastName": "Doe",
    "avatarUrl": "https://..."
  },
  "viewCount": 0,
  "commentCount": 0
}
```

Optional: `archived`: true. Document ID = sessionId.

## 7.2 feedback collection — full document example

```json
{
  "sessionId": "session-doc-id",
  "userId": "firebase-uid",
  "title": "Button not visible on mobile",
  "description": "User reported that the CTA is cut off.",
  "suggestion": "",
  "type": "general",
  "status": "open",
  "priority": "medium",
  "createdAt": "<Firestore Timestamp>",
  "contextSummary": null,
  "actionItems": ["Check viewport breakpoint", "Add min-height"],
  "impact": null,
  "suggestedTags": ["UX", "Responsive"],
  "url": null,
  "viewportWidth": null,
  "viewportHeight": null,
  "userAgent": null,
  "clientTimestamp": null,
  "screenshotUrl": "https://firebasestorage.googleapis.com/..."
}
```

status may be "resolved". Document ID = feedback/ticket id.

---

# ==========================================
# SECTION 8 — ENVIRONMENT VARIABLES
# ==========================================

| Variable | Where used | Purpose |
|----------|------------|--------|
| OPENAI_API_KEY | app/api/structure-feedback/route.ts | OpenAI client and guard for adaptive structuring |
| NODE_ENV | lib/querySafety.ts | Dev-only query limit assertions |
| (Optional) FIREBASE_SERVICE_ACCOUNT_JSON | Not in app source; .next chunks reference it | If Firebase Admin were used |
| (Optional) GOOGLE_APPLICATION_CREDENTIALS | Same | Alternative credentials path |

No secret values listed. .gitignore includes `.env*`.

---

# ==========================================
# SECTION 9 — DEPLOYMENT DETAILS
# ==========================================

## 9.1 vercel.json

**Not present** in repo.

## 9.2 next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

No custom config. No edge/runtime overrides in export.

## 9.3 CORS config

- **middleware.ts:** For `/api/:path*`, sets Access-Control-Allow-Origin: *, Allow-Headers: Authorization, Content-Type, Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS. OPTIONS returns 200 with Max-Age 86400.

## 9.4 API_BASE in extension

**echly-extension/src/api.ts:**

```typescript
const API_BASE = "https://echly-web.vercel.app";
```

Extension calls production backend. For local debugging, change to `http://localhost:3000` (or use build flag).

---

# END OF EXPORT

