let extensionToken: string | null = null;

export function setExtensionToken(token: string | null) {
  extensionToken = token;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  if (!extensionToken) {
    throw new Error("Extension token missing");
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${extensionToken}`,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    extensionToken = null;
    setExtensionToken(null);
    chrome.runtime.sendMessage({ type: "ECHLY_AUTH_INVALID" });
    console.log("[ECHLY] Auth expired or user logged out");
    throw new Error("NOT_AUTHENTICATED");
  }

  return response;
}
