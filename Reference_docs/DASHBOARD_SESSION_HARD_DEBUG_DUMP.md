# ECHLY — DASHBOARD SESSION HARD DEBUG (FULL CONTEXT DUMP)

---

## 1️⃣ PROJECT STRUCTURE

### app/
```
(app)
api
login
favicon.ico
globals.css
layout.tsx
page.tsx
```

### app/(app)/
```
(app)\dashboard
(app)\layout.tsx
```

### app/(app)/dashboard/
```
(app)\dashboard\hooks
(app)\dashboard\[sessionId]
(app)\dashboard\page.tsx
(app)\dashboard\hooks\useWorkspaceOverview.ts
(app)\dashboard\[sessionId]\hooks
(app)\dashboard\[sessionId]\overview
(app)\dashboard\[sessionId]\page.tsx
(app)\dashboard\[sessionId]\hooks\useFeedback.ts
(app)\dashboard\[sessionId]\hooks\useFeedbackDetailController.ts
(app)\dashboard\[sessionId]\hooks\useSessionFeedbackPaginated.ts
(app)\dashboard\[sessionId]\hooks\useSessionLoader.ts
(app)\dashboard\[sessionId]\overview\hooks
(app)\dashboard\[sessionId]\overview\page.tsx
(app)\dashboard\[sessionId]\overview\hooks\useSessionOverview.ts
```

### app/api/
```
api\feedback
api\sessions
api\structure-feedback
api\tickets
api\feedback\route.ts
api\sessions\[id]
api\sessions\route.ts
api\sessions\[id]\route.ts
api\structure-feedback\route.ts
api\tickets\[id]
api\tickets\[id]\route.ts
api\login\page.tsx  (if present — not in list; login is app/login)
```

### Layout / loading
- **app/layout.tsx** — exists (root layout)
- **app/(app)/layout.tsx** — exists (app layout with GlobalRail)
- **app/dashboard/layout.tsx** — does NOT exist (dashboard is under (app)/dashboard)
- **loading.tsx** — **NONE** in app/ or app/dashboard/ or app/(app)/dashboard/ or app/(app)/dashboard/[sessionId]/

### middleware
- **middleware.ts** — exists at project root

---

**Note:** The session page lives at **`app/(app)/dashboard/[sessionId]/page.tsx`**. The URL is **`/dashboard/:sessionId`** (route group `(app)` does not appear in the URL). There is **no** `dashboard/sessions/[id]` route in this codebase.

---

## 2️⃣ SESSION PAGE

### app/(app)/dashboard/[sessionId]/page.tsx (COMPLETE)

```tsx
"use client";

import { authFetch } from "@/lib/authFetch";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache } from "@/lib/authFetch";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addFeedback, deleteFeedback } from "@/lib/feedback";
import { recordSessionViewIfNew } from "@/lib/sessions";
import { getViewerId } from "@/lib/viewerId";
import { uploadScreenshot, generateFeedbackId } from "@/lib/screenshot";
import FeedbackSidebar from "@/components/session/FeedbackSidebar";
import FeedbackDetail from "@/components/session/feedbackDetail/FeedbackDetail";
import { ActivityPanel } from "@/components/session/feedbackDetail/ActivityPanel";
import { Pencil, Check } from "lucide-react";
import { useFeedbackDetailController } from "./hooks/useFeedbackDetailController";
import { useSessionFeedbackPaginated } from "./hooks/useSessionFeedbackPaginated";

/** Ticket shape returned by GET/PATCH /api/tickets/:id (DB source of truth). */
type TicketFromApi = {
  id: string;
  title: string;
  description: string;
  type: string;
  isResolved?: boolean;
  actionItems?: string[] | null;
  suggestedTags?: string[] | null;
  screenshotUrl?: string | null;
  [key: string]: unknown;
};

const sessionDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});
const sessionTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function formatSessionCreatedMeta(
  createdAt:
    | { toDate?: () => Date; seconds?: number }
    | string
    | null
    | undefined
): { dateStr: string; timeStr: string } {
  if (!createdAt) return { dateStr: "—", timeStr: "" };
  try {
    const date =
      typeof createdAt === "string"
        ? new Date(createdAt)
        : typeof (createdAt as { toDate?: () => Date }).toDate === "function"
          ? (createdAt as { toDate: () => Date }).toDate()
          : (createdAt as { seconds?: number }).seconds != null
            ? new Date((createdAt as { seconds: number }).seconds * 1000)
            : null;
    if (!date) return { dateStr: "—", timeStr: "" };
    return {
      dateStr: sessionDateFormatter.format(date),
      timeStr: sessionTimeFormatter.format(date),
    };
  } catch {
    return { dateStr: "—", timeStr: "" };
  }
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  /** Detail panel: always from DB (GET /api/tickets/:id). Do not use memory state. */
  const [detailTicket, setDetailTicket] = useState<TicketFromApi | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const {
    feedback,
    setFeedback,
    total: feedbackTotal,
    activeCount: feedbackActiveCount,
    resolvedCount: feedbackResolvedCount,
    setTotal: setFeedbackTotal,
    setActiveCount: setFeedbackActiveCount,
    setResolvedCount: setFeedbackResolvedCount,
    loading: feedbackLoading,
    hasMore: hasMoreFeedback,
    hasReachedLimit: feedbackReachedLimit,
    loadingMore: feedbackLoadingMore,
    refetchFirstPage: refetchFeedbackFirstPage,
    loadMoreRef: feedbackLoadMoreRef,
  } = useSessionFeedbackPaginated(sessionId as string | undefined);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [saveDescriptionSuccess, setSaveDescriptionSuccess] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState("");
  const [isSavingSessionTitle, setIsSavingSessionTitle] = useState(false);
  const [saveSessionTitleSuccess, setSaveSessionTitleSuccess] = useState(false);

  /* Sync active session to extension when user opens this session page. */
  useEffect(() => {
    if (!sessionId) return;
    if (typeof window === "undefined") return;
    if (!("chrome" in window)) return;
    try {
      (window as Window & { chrome?: { runtime?: { sendMessage?: (msg: unknown) => void } } }).chrome?.runtime?.sendMessage?.({
        type: "ECHLY_SET_ACTIVE_SESSION",
        sessionId,
      });
    } catch (err) {
      console.warn("Extension not available");
    }
  }, [sessionId]);

  /* Local-first: insert ticket immediately when extension creates feedback (no refetch). */
  useEffect(() => {
    if (!sessionId || !session) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ ticket: { id: string; title: string; description: string; type?: string }; sessionId: string }>;
      const { ticket, sessionId: evSessionId } = ev.detail ?? {};
      if (evSessionId !== sessionId || !ticket) return;
      const newItem = {
        id: ticket.id,
        sessionId: evSessionId,
        userId: session.userId,
        title: ticket.title,
        description: ticket.description,
        type: ticket.type ?? "Feedback",
        isResolved: false,
        priority: "medium" as const,
        createdAt: null,
        clientTimestamp: Date.now(),
      };
      setFeedback((prev) => [newItem, ...prev]);
      setSelectedId(ticket.id);
      setFeedbackTotal((c) => c + 1);
      setFeedbackActiveCount((c) => c + 1);
    };
    window.addEventListener("ECHLY_FEEDBACK_CREATED", handler);
    return () => window.removeEventListener("ECHLY_FEEDBACK_CREATED", handler);
  }, [sessionId, session, setFeedback, setFeedbackTotal, setFeedbackActiveCount]);

  /* ================= LOAD SESSION ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        clearAuthTokenCache();
        router.push("/login");
        return;
      }

      const sessionRef = doc(db, "sessions", sessionId as string);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        router.push("/dashboard");
        return;
      }

      const data = sessionSnap.data();

      if (data.userId !== currentUser.uid) {
        router.push("/dashboard");
        return;
      }

      setSession({ id: sessionSnap.id, ...data });
      setUserName(
        currentUser.displayName || currentUser.email || "You"
      );
      setUserPhotoURL(currentUser.photoURL ?? null);
      setSessionLoading(false);

      const viewerId = getViewerId(currentUser.uid);
      if (viewerId) {
        recordSessionViewIfNew(sessionSnap.id, viewerId).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [sessionId, router]);

  // Select first feedback when first page loads and none selected.
  useEffect(() => {
    if (feedback.length > 0 && selectedId === null) {
      setSelectedId(feedback[0].id);
    }
  }, [feedback, selectedId]);

  /* ================= FETCH DETAIL FROM DB (single source of truth) ================= */

  const fetchDetailTicket = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await authFetch(`/api/tickets/${id}`);
      const data = (await res.json()) as { success?: boolean; ticket?: TicketFromApi };
      if (data.success && data.ticket) {
        setDetailTicket(data.ticket);
      } else {
        setDetailTicket(null);
      }
    } catch {
      setDetailTicket(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetailTicket(null);
      return;
    }
    fetchDetailTicket(selectedId);
  }, [selectedId, fetchDetailTicket]);

  /* ================= SELECTED ITEM WITH INDEX (from DB) ================= */

  const selectedIndex = feedback.findIndex(
    (f) => f.id === selectedId
  );

  const selectedItem =
    detailTicket != null
      ? {
          ...detailTicket,
          index: selectedIndex !== -1 ? selectedIndex + 1 : 1,
          total: feedbackTotal > 0 ? feedbackTotal : feedback.length || 1,
        }
      : null;

  const {
    comments,
    loadingComments,
    sendComment,
  } = useFeedbackDetailController({
    sessionId: sessionId as string,
    feedbackId: selectedId,
  });

  /* ================= SYNC DESCRIPTION (from DB-backed detail) ================= */

  useEffect(() => {
    if (detailTicket) {
      setDescriptionDraft(detailTicket.description);
      setIsEditingDescription(false);
    }
  }, [selectedId, detailTicket]);

  /* ================= SAVE TITLE (optimistic update, then PATCH) ================= */
  /* ... saveTitle, saveDescription, saveActionItems, saveTags, saveResolved, handleMarkAllResolved, handleTranscript, handleDeleteFeedback ... */

  if (sessionLoading) return null;

  return (
    <>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="surface-sidebar ...">
          <FeedbackSidebar ... />
        </aside>
        <main className="surface-main ...">
          ...
          {detailLoading && selectedId ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-[13px] text-neutral-500">Loading…</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center mt-24">
              <div className="text-[16px] font-medium text-neutral-800">
                No feedback yet
              </div>
              <div className="mt-2 text-[14px] text-neutral-500">
                Capture feedback to start organizing insights.
              </div>
            </div>
          ) : (
            <FeedbackDetail ... />
          )}
          ...
        </main>
        ...
      </div>
      ...
    </>
  );
}
```

### Critical render block (exact lines 458–478)

```tsx
{detailLoading && selectedId ? (
  <div className="flex items-center justify-center py-16">
    <p className="text-[13px] text-neutral-500">Loading…</p>
  </div>
) : feedback.length === 0 ? (
  <div className="text-center mt-24">
    <div className="text-[16px] font-medium text-neutral-800">
      No feedback yet
    </div>
    <div className="mt-2 text-[14px] text-neutral-500">
      Capture feedback to start organizing insights.
    </div>
  </div>
) : (
  <FeedbackDetail ... />
)}
```

### FeedbackSidebar (components/session/FeedbackSidebar.tsx)

Full file already read — 283 lines. Renders list from `feedback` prop; no loading/empty branch for initial load; shows "Loading…" only for `loadingMore` (infinite scroll).

### FeedbackDetail (components/session/feedbackDetail/FeedbackDetail.tsx)

```tsx
"use client";

import { FeedbackHeader } from "./FeedbackHeader";
import { FeedbackContent } from "./FeedbackContent";
import type { FeedbackItemShape } from "./types";

export interface FeedbackDetailProps {
  sessionId: string;
  selectedItem: (FeedbackItemShape & { index: number; total: number }) | null;
  isEditingDescription: boolean;
  descriptionDraft: string;
  setIsEditingDescription: (v: boolean) => void;
  setDescriptionDraft: (v: string) => void;
  saveDescription: () => void | Promise<void>;
  isSavingDescription?: boolean;
  saveDescriptionSuccess?: boolean;
  onSaveTitle?: (newTitle: string) => Promise<void>;
  onRequestDelete?: () => void;
  onSaveActionItems?: (actionItems: string[]) => Promise<void>;
  onSaveTags?: (suggestedTags: string[]) => Promise<void>;
  onResolvedChange?: (isResolved: boolean) => void;
  setIsImageExpanded: (v: boolean) => void;
  isCommentsOpen: boolean;
  onToggleActivity: () => void;
}

export default function FeedbackDetail({ ... }: FeedbackDetailProps) {
  if (!selectedItem) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center py-16">
        <p className="text-[15px] text-neutral-500">
          Select a feedback item
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      <FeedbackHeader ... />
      <FeedbackContent ... />
    </div>
  );
}
```

---

## 3️⃣ DATA FETCHING

### Session

- **Where:** Session page `useEffect` (lines 156–194).
- **How:** `onAuthStateChanged(auth, async (currentUser) => { ... })` → `getDoc(doc(db, "sessions", sessionId))`.
- **Server vs client:** **Client only** (Firebase SDK in browser).
- **Caching/revalidate:** None (Firestore getDoc).
- **useParams:** `const { sessionId } = useParams();` — used as dependency and for `getDoc`, `authFetch(/api/feedback?sessionId=...)`, redirects.

### Feedback

- **Where:** `useSessionFeedbackPaginated(sessionId)` in same page.
- **How:** Initial load in hook: `authFetch(\`/api/feedback?sessionId=${sessionId}&cursor=&limit=20\`)` in a `useEffect` when `sessionId` is set. Pagination via same API with `cursor` and intersection observer.
- **Server vs client:** **Client only** (authFetch from browser).
- **Caching/revalidate:** No Next.js fetch cache; no revalidate.
- **Suspense:** No Suspense boundaries around session or feedback.

### useSessionFeedbackPaginated (hooks/useSessionFeedbackPaginated.ts)

- `useEffect` dependency: `[sessionId]`.
- When `sessionId` is set: `setInitialLoading(true)`, then `authFetch(...).then(...).finally(() => setInitialLoading(false))`.
- Returns: `feedback` (items), `loading` (initialLoading), `hasMore`, `loadingMore`, `loadMoreRef`, etc.

### useParams / router

- **useParams():** Used for `sessionId` only.
- **router:** `useRouter()` used for `router.push("/login")`, `router.push("/dashboard")`, `router.push(\`/dashboard/${sessionId}\`)` (after delete when no selection). **No router.refresh()** anywhere.

### Summary

| Data        | Fetched by              | Where     | Server/Client | Cached | Revalidate |
|------------|--------------------------|-----------|---------------|--------|------------|
| Session    | getDoc(sessions/:id)     | useEffect | Client        | No     | No         |
| Feedback   | GET /api/feedback        | hook      | Client        | No     | No         |
| Ticket     | GET /api/tickets/:id     | useEffect | Client        | No     | No         |

---

## 4️⃣ STATE MANAGEMENT

- **No Zustand / Redux / global store** for session or feedback.
- **activeSessionId:** Only sent to extension via `chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId })` when the session page mounts; not read back for rendering.
- **chrome.storage:** Not used in the session page or these hooks.
- **Extension background:** Listens for `ECHLY_SET_ACTIVE_SESSION`; no messaging from extension back into this page for initial load.
- **Client-only dependency:** Session and feedback both load in client effects after mount; no server preload. Refreshing the page remounts the client component; `sessionId` comes from `useParams()` (from URL). No dependency on “having navigated from dashboard”; the only dependency is that auth and URL are correct.

---

## 5️⃣ API ROUTES

### GET/POST /api/sessions (app/api/sessions/route.ts)

```ts
import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { requireAuth } from "@/lib/server/auth";
import {
  getUserSessionsRepo,
  createSessionRepo,
} from "@/lib/repositories/sessionsRepository";

/** GET /api/sessions — list sessions for the authenticated user. */
export async function GET(req: Request) {
  const start = Date.now();
  console.log("[API] GET /api/sessions start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const sessions = await getUserSessionsRepo(user.uid, 100);
    console.log("[API] GET /api/sessions duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => serializeSession(s)),
    });
  } catch (err) {
    console.error("GET /api/sessions:", err);
    console.log("[API] GET /api/sessions duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

/** POST /api/sessions — create a new session. Returns { success: true, session: { id } }. */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  try {
    const id = await createSessionRepo(user.uid, null);
    return NextResponse.json({ success: true, session: { id } });
  } catch (err) {
    console.error("POST /api/sessions:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
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

### PATCH/DELETE /api/sessions/[id] (app/api/sessions/[id]/route.ts)

```ts
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

/** PATCH /api/sessions/:id — update session; body: { title?, archived?, ... }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  console.log("[API] PATCH /api/sessions/[id] start");
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
    console.log("[API] PATCH /api/sessions/[id] duration:", Date.now() - start);
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

/** DELETE /api/sessions/:id */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
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
  if (existing.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }
  try {
    await deleteSessionRepo(id);
    console.log("[API] DELETE /api/sessions/[id] duration:", Date.now() - start);
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

### GET/POST /api/feedback (app/api/feedback/route.ts)

```ts
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

/** GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20 */
export async function GET(req: Request) {
  const start = Date.now();
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

/** POST /api/feedback — create feedback. */
export async function POST(req: Request) {
  /* requireAuth, parse body (sessionId, title, description, ...), getSessionByIdRepo, ownership check,
     addFeedbackRepo, getFeedbackByIdRepo, updateSessionUpdatedAtRepo, return serializeTicket(created) */
  /* Full implementation as in repo — 106–227 */
}
```

### GET/PATCH /api/tickets/[id] (app/api/tickets/[id]/route.ts)

```ts
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
  const start = Date.now();
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
  /* requireAuth, params.id, getFeedbackByIdRepo, ownership, parse body, updateFeedbackRepo, getFeedbackByIdRepo, updateSessionUpdatedAtRepo, return serializeTicket(updated) */
  /* Full implementation as in repo — 59–136 */
}
```

---

## 6️⃣ RENDER LOGIC

### Loading state

- **Session:** `sessionLoading` starts `true`. Set to `false` only inside `onAuthStateChanged` after successful `getDoc` and ownership check. If `sessionLoading` is true, page returns `null` (line 416).
- **Detail panel:** `detailLoading && selectedId` → show centered “Loading…” in main area.
- **Feedback list (sidebar):** No “initial loading” UI; `feedbackLoading` from hook is **not** used in the main content branch.

### Empty state

- **Main content:**  
  `feedback.length === 0` → show “No feedback yet” + “Capture feedback to start organizing insights.”  
  This is shown **whenever** `feedback.length === 0`, including **while** `feedbackLoading === true` (initial load). So on open/refresh you briefly see “No feedback yet” until the first page loads.

### Conditional tree (exact logic)

```tsx
if (sessionLoading) return null;

// In JSX:
{detailLoading && selectedId ? (
  <div>Loading…</div>
) : feedback.length === 0 ? (
  <div>No feedback yet / Capture feedback...</div>
) : (
  <FeedbackDetail ... />
)}
```

- **feedback.length:** Used directly; no “null” or “undefined” list; hook initializes `items` to `[]`.
- **loading:** `sessionLoading` gates entire page; `detailLoading` only for detail panel; `feedbackLoading` is **not** used in this conditional, so the empty state is not gated on “still loading feedback”.

---

## 7️⃣ LAYOUT WRAPPERS

### app/layout.tsx

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

### app/(app)/layout.tsx

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

- **app/dashboard/layout.tsx:** Does not exist.
- **Suspense:** No Suspense in these layouts or around the session page.
- **loading.tsx:** None under app/, app/(app)/, app/(app)/dashboard/, or app/(app)/dashboard/[sessionId]/.

---

## 8️⃣ ANSWERS

- **Is session page server component or client component?**  
  **Client component.** File starts with `"use client";`.

- **Is async page() used?**  
  **No.** Default export is a synchronous function; all data is loaded in client effects.

- **Is useParams() used?**  
  **Yes.** `const { sessionId } = useParams();` — sessionId comes from the dynamic segment.

- **Is data derived from URL param or global state?**  
  **From URL param.** Session and feedback both use `sessionId` from `useParams()`. No global state for session/feedback.

- **Is fetch cached?**  
  **No.** Session: Firestore getDoc. Feedback: authFetch GET /api/feedback. No Next.js fetch cache or revalidate.

- **Is there any dependency on navigation from previous page?**  
  **No.** On refresh, the page remounts, `useParams()` still provides `sessionId` from the URL, and both session and feedback load in useEffect/hook. No reliance on having come from the dashboard; only auth and URL matter.

---

## ROOT CAUSE SUMMARY FOR YOUR TWO BUGS

### 1) Refresh on /dashboard/[sessionId] — page doesn’t “properly” load session

- Session and feedback are loaded only on the client (useEffect + hook). There is no loading.tsx and no server data, so on refresh you see `sessionLoading === true` → `return null` until Firestore getDoc and auth settle. If something fails (e.g. auth token, Firestore permission, or redirect to /dashboard because session not found / wrong user), the page can appear to “not load” or send you back. So the “improper” load is likely: (a) full-page null until client load finishes, or (b) a redirect from inside the effects. No dependency on “reopening from dashboard.”

### 2) “No feedback yet” before data loads

- The main content branch does **not** check `feedbackLoading`. It only checks `feedback.length === 0`. So while the first page of feedback is still loading, `feedback` is `[]`, and the UI shows “No feedback yet” until the request completes. Fix: treat “initial load” as loading and show a small premium loading animation when `feedbackLoading === true` (and optionally `feedback.length === 0`) instead of the empty state.

---

End of dump.
