/**
 * Extension popup: Google Sign-In, auth state, and Capture submit using apiFetch.
 */
import { apiFetch } from "./api";
import {
  signInWithGoogle,
  signOut,
  subscribeToAuthState,
} from "./auth";
import "./firebase"; // ensure Firebase is initialized

// --- DOM refs (set once DOM is ready)
let statusEl: HTMLParagraphElement;
let formEl: HTMLFormElement;
let captureBtn: HTMLButtonElement;
let signInBtn: HTMLButtonElement;
let signOutBtn: HTMLButtonElement;
let authSection: HTMLElement;
let formSection: HTMLElement;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

function setStatus(msg: string, isError?: boolean): void {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#c00" : "#000";
}

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function updateUIForUser(user: { email: string | null } | null): void {
  if (user) {
    authSection.style.display = "none";
    formSection.style.display = "block";
    const emailSpan = document.getElementById("userEmail");
    if (emailSpan) emailSpan.textContent = user.email || "Signed in";
    setStatus("");
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
    const sessionId = (getEl<HTMLInputElement>("sessionId").value || "").trim();
    const title = (getEl<HTMLInputElement>("title").value || "").trim();
    const description = (
      getEl<HTMLTextAreaElement>("description").value || ""
    ).trim();

    if (!sessionId || !title || !description) {
      setStatus("Fill Session ID, Title, and Description.", true);
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
