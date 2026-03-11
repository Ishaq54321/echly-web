# Echly: Onboarding & Demo Animation — Analysis Report

**Audience:** Non-technical founder  
**Purpose:** Explain exactly how the onboarding experience and in-product demo work, without touching code.  
**Date:** March 2025

---

## 1. Onboarding Architecture

### What Exists

Onboarding is a **two-step flow** inside the app:

| Step | URL | What the user sees |
|------|-----|--------------------|
| **1 — Workspace** | `/onboarding` | “Welcome to Echly” + form: workspace name, role, company size. One “Continue” button. |
| **2 — Setup / Activate** | `/onboarding/activate` | “You’re ready to capture feedback” + a **browser-style demo** (fake Chrome, extension popup, website, feedback panels) and a “Go to dashboard” button. |

**Folder structure (simplified):**

- **Routes (screens):**
  - `app/onboarding/page.tsx` — Step 1 (workspace form).
  - `app/onboarding/activate/page.tsx` — Step 2 (demo + “Go to dashboard”).
  - `app/onboarding/layout.tsx` — Shared wrapper (background, padding) for both.
- **Shared onboarding UI:**
  - `components/onboarding/StepIndicator.tsx` — “Workspace” vs “Setup” dots.
  - `components/onboarding/WorkspaceForm.tsx` — Name, role, company size form.
  - The activate page includes an inline **“How Echly Works”** section (three minimal steps: Install extension → Capture feedback → Share session); no separate ActivationSteps component.

So: **two screens**, **one layout**, and **three small components** that only support step 1. The **interactive demo** lives entirely inside the activate page and the `components/demo/*` pieces it uses.

### How the app decides “onboarding vs dashboard”

- When a user **logs in or signs up**, the app asks: *“Does this user already have a workspace?”*
- That is answered by reading the **Firestore database**: the user’s document has a field `workspaceId`.
  - If `workspaceId` **exists and is not empty** → user is sent to **dashboard** (`/dashboard`).
  - If it’s **missing or empty** → user is sent to **onboarding** (`/onboarding`).
- So: **onboarding is triggered by “no workspace in the database,”** not by a “first run” flag in the browser.

### Where onboarding state is stored

- **Completion of step 1** is stored **only in the database**:
  - A new workspace is created (Firestore `workspaces` collection).
  - The user document is updated with `workspaceId` (and optionally `role`, `companySize`) in Firestore `users` collection.
- There is **no** use of `localStorage`, cookies, or a separate “onboarding completed” flag for this.  
  **“Onboarding is done” from the app’s perspective = “this user has a `workspaceId`.”**

### Exact flow (step-by-step)

1. User opens the product and goes to **Login** or **Signup**.
2. User signs in (Google or email/password).
3. App calls **checkUserWorkspace(userId)**:
   - Reads Firestore: does this user have a `workspaceId`?
4. **If no workspace:**
   - User is redirected to **`/onboarding`** (first screen).
5. **First screen (`/onboarding`):**
   - User sees “Welcome to Echly”, step indicator “Workspace”, and the form.
   - User fills workspace name, role, company size and clicks **Continue**.
   - App creates a workspace and sets the user’s `workspaceId` in the database, then redirects to **`/onboarding/activate`**.
6. **Second screen (`/onboarding/activate`):**
   - User sees “You’re ready to capture feedback”, the step indicator “Setup”, the **interactive demo** (see Section 2), and a **“Go to dashboard”** button.
   - **Important:** In the current code, the “Go to dashboard” button **does not navigate** anywhere; it has no click handler. So after the demo, the only way to reach the real dashboard is to type `/dashboard` or use the Replay button (which only restarts the demo).
7. **If the user already had a workspace** (e.g. returns later):
   - After login, **checkUserWorkspace** returns “dashboard” and the user goes straight to **`/dashboard`**; they do not see onboarding again.

So: **Trigger = no workspace in DB → first screen = workspace form → second screen = activate page with demo. Completion is “user has workspaceId”; the second screen does not currently mark “onboarding done” in any extra way, and “Go to dashboard” does not work.**

---

## 2. Demo Animation Architecture

### What the “demo” is

The **demo** is a **code-driven, in-page simulation** that looks like a guided product tour inside a fake browser. It is **not** a pre-recorded video. It:

- Renders a fake browser chrome and “example-website.com.”
- Shows a fake extension icon and popup (mode choice, “Start Session”).
- Lets the user **click** to advance (e.g. click extension → click mode → Start Session → click on “page” to add feedback).
- Shows voice/write feedback panels, “processing,” and generated tickets, then a “Loading feedback…” state and a simple feedback dashboard.
- Uses **arrows, highlights, and tooltips** that point at the next action.

So: **same page, same app; the “video” is really a state machine + timers + UI updates.**

### Where the demo lives (files and roles)

| File / area | Role |
|------------|------|
| **`app/onboarding/activate/page.tsx`** | **Root of the demo:** holds the “script” (list of steps), all timing logic, and the main demo UI (browser, extension, website, panels). Very large single file (~1,600 lines). |
| **`components/demo/DemoExtensionController.ts`** | **Simulated extension logic:** in-memory state (mode, session on/off, selection, feedback, processing, tickets). No server, no persistence. Used so the demo UI behaves like the real product. |
| **`components/demo/DemoGuide.tsx`** | **Guidance UI:** tooltip bubble, arrow component, cursor-following annotation, and highlight ring. Positions by targeting elements (e.g. `data-demo-target="…"`). |
| **`components/demo/DemoArrow.tsx`** | **Big arrow** that points at buttons/elements (e.g. extension icon, Start Session, Submit, End). |
| **`components/demo/ExtensionPopup.tsx`** | **Fake extension popup:** mode selector (Voice/Write) and “Start Session” / “Previous Sessions.” |
| **`components/demo/ModeSelector.tsx`** | Voice vs Write mode buttons inside the popup. |
| **`components/demo/SessionControlBar.tsx`** | “Recording Session” bar with Pause, Resume, **End** (used in demo to finish and show “Loading…” then dashboard). |
| **`components/demo/DemoFeedbackDashboard.tsx`** | **End state:** mock ticket list and details shown after “Loading feedback…” (replaces the browser demo area). |
| **`components/demo/ReplayDemoButton.tsx`** | Small “Replay” control (e.g. top-right) to run the demo again. |

So: **Activate page = controller + script + layout; DemoExtensionController = fake backend; Demo* components = guidance and fake extension/dashboard UI.**

---

## 3. How the Demo Works Internally

### How the demo “script” is defined

The sequence is encoded as a **fixed list of steps** (a “guided step” state) in the activate page, for example:

1. **install_extension** — “Click the extension icon.”
2. **open_extension** — “Choose a feedback mode.”
3. **choose_mode** — “Click Start Session.”
4. **click_page** — “Click anywhere on the page to add feedback.”
5. **selection_created** — “Screenshot captured — now add your feedback.”
6. **voice_feedback** or **write_feedback** — “Click Finish” or “Submit your feedback.”
7. **processing** — (no message; processing UI is shown.)
8. **end_session** — “Click End to generate tickets.”
9. **demo_completed** — “Demo completed — click Replay to try again.”

For each step (except “processing” and “demo_completed”), the app has a **config**: which UI element to highlight, where to show the arrow, and the message. Elements are found by **data attributes** (e.g. `data-demo-target="extension-icon"`). So the “script” is: **current step → config → highlight + arrow + tooltip.**

### How the demo starts

- When the user lands on **`/onboarding/activate`**, the page initializes with **guidedStep = "install_extension"**.
- The demo layer is shown (arrows, highlights, cursor annotation) and the first instruction (“Click the extension icon”) appears. So **the demo starts as soon as the activate screen loads.**

### How the demo progresses (step-by-step)

Progress is **user-driven plus timers**:

- **User clicks** drive most transitions:
  - Click extension icon → **open_extension**.
  - Choosing Voice/Write → **choose_mode** (and “Start Session” is highlighted).
  - Click “Start Session” → **click_page** (cursor becomes “comment” style; user must click on the fake page).
  - Click on page → **selection_created** (selection rectangle, then screenshot and comment bubble).
- **Timers** then run **after** “selection_created”:
  - 1.2 s → show overlay.
  - +1 s → show comment state.
  - +0.6 s → clear selection and move to **voice_feedback** or **write_feedback** (depending on mode).
- User clicks **Finish** (voice) or **Submit** (write) → **processing**.
- After **processing** starts:
  - 1.2 s later → “generate” tickets (in-memory).
  - 1.8 s after that → **end_session** (“Click End to generate tickets”).
- User clicks **End** → **dashboardPhase = "loading"** (spinner “Loading feedback…”).
- 0.8 s later → **dashboardPhase = "ready"** (ticket list/dashboard appears).
- 0.8 s after that → **demo_completed** (Replay button; message “Demo completed — click Replay to try again”).

So: **the demo is a state machine:** one variable (e.g. `guidedStep` / `dashboardPhase`) drives what is shown; **timers** are used only in a few places (after selection, after processing, and for the loading/ready/demo_completed transitions). There is **no** single “timeline” array that runs from 0 to N seconds; each step sets the next step or schedules a timeout.

### How UI changes during the demo

- **Step config** (from the list above) decides:
  - Which element gets a **highlight** (and optionally a different element for the **arrow**).
  - **Arrow** position and direction (top, bottom, left, right, topRight).
  - **Message** in the tooltip/cursor annotation.
- The same **cursor** is drawn on the fake browser; in some steps it shows a “comment” icon, in others a normal pointer.
- **Browser content** changes by step: e.g. “Install” step shows a skeleton; “Open” step shows the fake website and selection/overlay/comment; “Capture” step shows voice or write panel, then processing panel, then tickets.
- All of this is **React state**: when `guidedStep` (and related state) changes, the right components re-render (highlights, arrows, panels, fake extension, SessionControlBar, etc.).

### How the demo triggers UI actions

- **Clicks** on specific elements (extension icon, mode, Start Session, page, Finish, Submit, End) are wired to **handlers** that:
  - Update **guidedStep** (and sometimes **dashboardPhase**).
  - Call **DemoExtensionController** (e.g. `startSession()`, `captureSelection()`, `submitVoice()`, `generateTickets()`, `reset()`).
- The **controller** only updates in-memory state (mode, session, selection, feedback, processing, tickets). That state is passed into the same page’s UI, so the panels and “generated tasks” reflect the current step. So: **user actions and timers change state → state drives both “script” (which step we’re on) and “product-like” UI (extension, panels, tickets).**

### Does the demo use timers or a state machine?

- **State machine:** Yes. One main “phase” (e.g. `guidedStep` + `dashboardPhase`) determines what is shown and what the next allowed actions are.
- **Timers:** Used in a few places (all **setTimeout**), with fixed delays (e.g. 1200 ms, 1000 ms, 600 ms, 1800 ms, 800 ms). There is **no** `setInterval` or frame loop; no animation library drives the script. So: **state machine + a small number of setTimeouts**, not a single timeline engine.

---

## 4. Demo Timing (Where and How)

- **Selection → overlay → comment → voice/write step:**  
  In one `useEffect` when `guidedStep === "selection_created"`:  
  - 1200 ms → set demo stage to overlay.  
  - 2200 ms → set demo stage to comment.  
  - 2800 ms → clear selection, set guided step to voice_feedback or write_feedback (and clear selection in controller).

- **Processing → tickets:**  
  When `guidedStep === "processing"`:  
  - 1200 ms → call `generateTickets()` and set `tasksStarted = true`.

- **After tickets → end_session:**  
  When `guidedStep === "processing"` and `tasksStarted`:  
  - 1800 ms → set guided step to **end_session**.

- **After user clicks End:**  
  - Set **dashboardPhase = "loading"**.  
  - 800 ms → **dashboardPhase = "ready"**.  
  - When **dashboardPhase === "ready"** and a “pending demo complete” flag is set, 800 ms later → set **demo_completed** and clear the flag.

So: **all duration control is in the activate page**, inside a few `useEffect` hooks that depend on `guidedStep` / `dashboardPhase` / `tasksStarted`. Step timings are **hard-coded** in those effects (e.g. 1200, 1000, 600, 1800, 800). There is a **DEMO_SEQUENCE** constant (step + duration) in the file, but it is **not used** anywhere; the actual behavior is entirely from the state machine and the timeouts above.

---

## 5. Demo Structure (Layers)

Conceptually:

- **Demo controller (activate page)**  
  Holds: current step, demo stage, capture phase, dashboard phase, and refs to timeouts. Decides when to advance steps and when to show loading/dashboard. Wires user clicks and DemoExtensionController to the UI.

- **“Timeline” / script**  
  The fixed list of guided steps and their config (target, message, arrow direction). Not a time-based timeline; it’s a **graph**: from each step, the next step is either a user action or a timeout. Implemented as state transitions and a **DEMO_STEPS** (and related) config in the activate page.

- **Step engine**  
  The logic that: (1) maps **guidedStep** to highlights/arrows/messages, and (2) runs the **setTimeout**s for selection, processing, and loading. So “step engine” = the combination of step config + the useEffect timeouts in the activate page.

- **UI simulation**  
  - **DemoExtensionController:** simulates extension state (mode, session, selection, feedback, processing, tickets).  
  - **Fake UI:** browser chrome, extension icon and popup, fake website, selection/overlay/comment, voice/write panels, processing panel, SessionControlBar, then DemoFeedbackDashboard.  
  - **Guidance:** DemoArrow, DemoHighlight, CursorAnnotation (from DemoGuide), keyed by **guidedStep** and **DEMO_STEPS**.

So: **Controller (page) → Step list + timeouts (script/engine) → Demo extension state + fake UI + guidance (simulation).**

---

## 6. How Onboarding and Demo Connect

- The **demo is part of onboarding.** It is the main content of the **second** onboarding screen (`/onboarding/activate`).
- **Onboarding does not “trigger” the demo as a separate flow:** when the user reaches `/onboarding/activate`, the page loads and the demo starts immediately (first step = “Click the extension icon”).
- There is **no** separate “skip onboarding” or “run demo later” path in the code: if the user has no workspace, they get step 1 then step 2 (with the demo). The only way to see the demo again after that is **Replay** on the activate page (or revisiting `/onboarding/activate` manually).
- So: **one flow** — workspace (step 1) → activate (step 2) with the demo inside it. Same routing, same layout; the demo is not a separate “feature” from onboarding.

---

## 7. UX and Technical Observations

### Onboarding

- **Clear:** Two steps are visible (Workspace → Setup), and the workspace form is simple (name, role, size).
- **Gap:** The **“Go to dashboard”** button on the activate page **does nothing** (no navigation). So after the demo, the user is not clearly guided to the real product. This is likely a bug or missing implementation.
- **Completion:** The app considers onboarding “done” once the user has a `workspaceId`. There is no explicit “I’ve finished onboarding” action on the activate screen; the missing “Go to dashboard” link makes the transition to the product unclear.

### Demo

- **Logic:** The demo is **user-driven plus a few timers**. The “script” is clear in code (list of steps + config), but it’s all in one very large file (~1,600 lines), which makes it **brittle**: changing one step or adding a new one requires editing the same file and can affect many useEffects and branches.
- **Scalability:** Adding steps or variants (e.g. different paths for voice vs write) would mean more state and more conditions in that file. A separate “demo script” format (e.g. a data structure or config file) and a small “step runner” would be more scalable.
- **Timing:** All delays are magic numbers (1200, 1000, 600, 1800, 800). **DEMO_SEQUENCE** exists but is unused, so there is no single place that defines “how long each step lasts” for future use.
- **Where bugs can appear:**  
  - Timeouts not cleared if the user navigates away or replays mid-flow.  
  - Order of useEffects and state updates (e.g. `guidedStep` vs `dashboardPhase` vs `tasksStarted`) is subtle; race conditions could occur.  
  - If a `data-demo-target` is renamed or removed, the highlight/arrow logic can break (wrong or missing element).  
  - “Go to dashboard” not wired can confuse users and analytics (“did they complete onboarding?”).

---

## 8. Suggestions for Improvement (Non-Technical Summary)

1. **Wire “Go to dashboard”**  
   Make the button on the activate page actually navigate to `/dashboard` so users have a clear path into the product after the demo.

2. **Clarify “onboarding complete”**  
   If you want to track or show “user completed onboarding,” consider an explicit action on the activate screen (e.g. “Go to dashboard” or “I’m ready”) and optionally store a simple “onboardingCompletedAt” (or similar) when that happens, so it’s clear in product/analytics.

3. **Demo maintainability**  
   The demo would be easier to change if the “script” (steps, messages, targets, and maybe timings) lived in one clear place (e.g. a config object or file) and a small “engine” just advanced steps and ran timers. Right now the script is mixed with all the UI and state in one big file.

4. **Reuse or remove DEMO_SEQUENCE**  
   Either use **DEMO_SEQUENCE** (or a similar list) to drive step durations in one place, or remove it so the codebase doesn’t suggest a timeline that isn’t used.

5. **Timeout cleanup**  
   Ensure that when the user leaves the activate page or clicks Replay, any pending timeouts are cancelled so the demo doesn’t “fire” steps after the user has left or restarted.

6. **Skip or replay later**  
   If you want “skip demo” or “watch demo later from dashboard,” that would require a small amount of product and routing logic (e.g. a link to `/onboarding/activate?replay=1` or a “Skip” on activate that still sets workspace and then goes to dashboard).

---

**End of report.** This document describes the system as implemented; no code was modified.
