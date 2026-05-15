import { API_BASE } from "../config";

export interface UploadAttachmentResult {
  url: string;
  name: string;
  size: number;
}

/**
 * Extension build stub for uploadAttachmentWithProgress.
 * Uses chrome.runtime.sendMessage to fetch the extension's auth token
 * (same pattern as contentAuthFetch.ts) and posts via XHR to preserve
 * progress events. Response parsing mirrors lib/uploadAttachment.ts so
 * both wrapped ({data: ...}) and unwrapped shapes are accepted.
 */
export async function uploadAttachmentWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadAttachmentResult> {
  const token = await new Promise<string | null>((resolve) => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_EXTENSION_TOKEN" },
      (res: { token?: string | null } | undefined) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(res?.token ?? null);
      }
    );
  });

  if (!token) throw new Error("User not authenticated");

  const url = `${API_BASE}/api/upload-attachment`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      } else {
        onProgress(50);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText) as {
            data?: { storagePath?: string; url?: string; name?: string; size?: number };
            storagePath?: string;
            url?: string;
            name?: string;
            size?: number;
          };
          const data = body.data ?? body;
          resolve({
            url: data.url ?? data.storagePath ?? "",
            name: data.name ?? "",
            size: data.size ?? 0,
          });
        } catch {
          reject(new Error("Invalid response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(err.error || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}
