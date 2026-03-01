chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    // Try sending toggle message first
    await chrome.tabs.sendMessage(tab.id, { type: "ECHLY_TOGGLE" });
  } catch (err) {
    // If content script not injected yet, inject it
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    // After injection, send toggle message
    await chrome.tabs.sendMessage(tab.id, { type: "ECHLY_TOGGLE" });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CAPTURE_TAB") {
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false });
          return;
        }
        sendResponse({ success: true, image: dataUrl });
      }
    );
    return true;
  }

  if (request.type === "LOGIN") {
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }
      sendResponse({ success: true, token });
    });
    return true;
  }

  if (request.type === "echly-api") {
    const { url, method, headers, body, token } = request;
    const h = { ...headers };
    if (token) h["Authorization"] = `Bearer ${token}`;
    fetch(url, {
      method: method || "GET",
      headers: h,
      body: body ?? undefined,
    })
      .then(async (res) => {
        const text = await res.text();
        const out = {};
        res.headers.forEach((v, k) => { out[k] = v; });
        sendResponse({ ok: res.ok, status: res.status, headers: out, body: text });
      })
      .catch((err) => {
        sendResponse({ ok: false, status: 0, headers: {}, body: String(err?.message || err) });
      });
    return true;
  }
});
