const API_BASE = "https://YOUR_DOMAIN.com";

const firebaseConfig = {
  apiKey: "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",
  authDomain: "echly-b74cc.firebaseapp.com",
  projectId: "echly-b74cc",
  storageBucket: "echly-b74cc.firebasestorage.app",
  messagingSenderId: "609478020649",
  appId: "1:609478020649:web:54cd1ab0dc2b8277131638",
  measurementId: "G-Q0C7DP8QVR"
};

function getAuth() {
  return window.firebase.auth();
}

function initFirebase() {
  if (window.firebase.apps && window.firebase.apps.length) return;
  window.firebase.initializeApp(firebaseConfig);
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function setStatus(msg, isError) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.color = isError ? "#c00" : "#000";
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const sessionId = document.getElementById("sessionId").value.trim();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const btn = document.getElementById("captureBtn");

  if (!sessionId || !title || !description) {
    setStatus("Fill Session ID, Title, and Description.", true);
    return;
  }

  initFirebase();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    setStatus("Not signed in. Sign in at " + API_BASE, true);
    return;
  }

  btn.disabled = true;
  setStatus("Capturing…");

  try {
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
    const tab = tabs[0];
    if (!tab) {
      setStatus("No active tab.", true);
      btn.disabled = false;
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (result) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(result);
      });
    });

    const idToken = await user.getIdToken();
    const feedbackId = randomId();

    const uploadRes = await fetch(API_BASE + "/api/upload-screenshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + idToken
      },
      body: JSON.stringify({
        sessionId,
        feedbackId,
        imageBase64: dataUrl
      })
    });
    const uploadJson = await uploadRes.json();
    if (!uploadJson.success) {
      setStatus(uploadJson.error || "Upload failed", true);
      btn.disabled = false;
      return;
    }

    const feedbackRes = await fetch(API_BASE + "/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + idToken
      },
      body: JSON.stringify({
        sessionId,
        title,
        description,
        screenshotUrl: uploadJson.url
      })
    });
    const feedbackJson = await feedbackRes.json();
    if (!feedbackJson.success) {
      setStatus(feedbackJson.error || "Feedback create failed", true);
      btn.disabled = false;
      return;
    }

    setStatus("Success.");
  } catch (err) {
    setStatus(err.message || "Error", true);
  }
  btn.disabled = false;
});

initFirebase();
const auth = getAuth();
auth.onAuthStateChanged((user) => {
  if (!user) setStatus("Sign in at " + API_BASE + " to use Capture.", true);
});
