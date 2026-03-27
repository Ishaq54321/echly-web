let extensionToken: string | null = null;

export function setExtensionToken(token: string | null) {
  extensionToken = token;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  if (!extensionToken) {
    throw new Error("Extension token missing");
  }

  const existingHeaders = options.headers || {};
  const mergedHeaders =
    existingHeaders instanceof Headers
      ? Object.fromEntries(existingHeaders)
      : Array.isArray(existingHeaders)
        ? Object.fromEntries(existingHeaders)
        : { ...existingHeaders };

  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "x-extension-token": extensionToken,
      ...mergedHeaders,
    },
  });

  if (response.status === 401) {
    console.log("[ECHLY] Auth invalid — clearing extension state");
    extensionToken = null;
    setExtensionToken(null);
    chrome.runtime.sendMessage({ type: "ECHLY_AUTH_INVALID" });
    throw new Error("NOT_AUTHENTICATED");
  }

  if (!response.ok) {
    throw new Error("API_ERROR_" + response.status);
  }

  return response;
}
