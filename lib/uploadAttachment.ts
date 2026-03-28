import { getFirebaseBearerToken } from "@/lib/authFetch";

export interface UploadAttachmentResult {
  url: string;
  name: string;
  size: number;
}

/** In extension context, set window.__ECHLY_API_BASE__ so requests use the API origin. */
function getUploadUrl(): string {
  const base =
    typeof window !== "undefined" &&
    (window as unknown as { __ECHLY_API_BASE__?: string }).__ECHLY_API_BASE__;
  const path = "/api/upload-attachment";
  return base ? base + path : path;
}

/**
 * Upload a file to /api/upload-attachment with progress.
 * Uses XMLHttpRequest to report upload progress.
 */
export async function uploadAttachmentWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadAttachmentResult> {
  const token = await getFirebaseBearerToken();
  if (!token) throw new Error("User not authenticated");
  const url = getUploadUrl();

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
          const body = JSON.parse(xhr.responseText) as UploadAttachmentResult;
          resolve(body);
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
