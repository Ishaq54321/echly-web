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
import { uploadScreenshot } from "./screenshotUpload";

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

      const screenshotUrl = await uploadScreenshot(
        dataUrl,
        sessionId,
        feedbackId
      );

      const feedbackRes = await apiFetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          title,
          description,
          screenshotUrl,
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
