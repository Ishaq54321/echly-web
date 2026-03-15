let extensionToken: string | null = null;

export function setExtensionToken(token: string | null) {
  extensionToken = token;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  if (!extensionToken) {
    throw new Error("Extension token missing");
  }

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${extensionToken}`,
      ...(options.headers || {}),
    },
  });
}
