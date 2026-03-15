export type ExtensionTokenResult = { token: string; uid?: string };

export function requestExtensionTokenFromPage(): Promise<ExtensionTokenResult> {
  return new Promise((resolve, reject) => {
    const id = "echly_token_request_" + Date.now();

    function handler(event: MessageEvent) {
      if (event.data?.type === "ECHLY_EXTENSION_TOKEN_RESPONSE" && event.data.id === id) {
        window.removeEventListener("message", handler);

        if (event.data.token) {
          resolve({ token: event.data.token, uid: event.data.uid });
        } else {
          reject(new Error("NO_TOKEN"));
        }
      }
    }

    window.addEventListener("message", handler);

    window.postMessage(
      {
        type: "ECHLY_EXTENSION_TOKEN_REQUEST",
        id,
      },
      "*"
    );
  });
}
