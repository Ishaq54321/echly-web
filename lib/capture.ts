export const captureScreenshot = async (): Promise<string | null> => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    const track = stream.getVideoTracks()[0];

    const video = document.createElement("video");
    video.srcObject = stream;

    // Wait until metadata is ready (important for correct dimensions)
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(true);
    });

    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    // Improve sharpness
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    track.stop();

    // Use WebP without resizing
    return canvas.toDataURL("image/webp", 0.9);
  } catch (err) {
    console.error("Capture failed:", err);
    return null;
  }
};