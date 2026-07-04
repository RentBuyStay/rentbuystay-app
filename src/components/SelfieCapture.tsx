"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Selfie capture for Dojah face verification. Uses the front camera via
 * getUserMedia with a live preview + capture, and falls back to a photo upload
 * when the camera is unavailable or permission is denied. Emits a JPEG data URL.
 */
export default function SelfieCapture({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  };

  // Always release the camera when unmounting.
  useEffect(() => stopStream, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setStreaming(true);
      // Attach after the <video> renders.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setError("Couldn't access the camera. Upload a photo instead.");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const size = Math.min(video.videoWidth, video.videoHeight) || 480;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Center-crop to a square and mirror to match the preview.
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    onChange(canvas.toDataURL("image/jpeg", 0.85));
    stopStream();
  };

  const onFile = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => {
      // Normalise to JPEG so the backend's "/9" check passes even for PNG uploads.
      const img = new window.Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { onChange(r.result as string); return; }
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        onChange(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  };

  const frame = "relative overflow-hidden rounded-[16px] bg-[#F6F6F6] flex items-center justify-center";
  const frameStyle = { width: "100%", aspectRatio: "1 / 1", maxWidth: "260px" } as const;

  // Captured — show preview + retake.
  if (value) {
    return (
      <div className="flex flex-col items-center" style={{ gap: "12px" }}>
        <div className={frame} style={frameStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Your selfie" className="w-full h-full object-cover" />
        </div>
        <button
          type="button"
          onClick={() => { onChange(null); setError(null); }}
          className="hover:opacity-80"
          style={{ fontSize: "14px", fontWeight: 500, color: "#305E82", background: "none", border: "none", cursor: "pointer" }}
        >
          Retake photo
        </button>
      </div>
    );
  }

  // Live camera.
  if (streaming) {
    return (
      <div className="flex flex-col items-center" style={{ gap: "12px" }}>
        <div className={frame} style={frameStyle}>
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
        </div>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={capture}
            className="flex items-center justify-center text-white hover:opacity-90"
            style={{ height: "40px", padding: "0 20px", borderRadius: "10px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
          >
            Capture
          </button>
          <button
            type="button"
            onClick={stopStream}
            className="hover:opacity-80"
            style={{ fontSize: "14px", fontWeight: 500, color: "#807E7E", background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Idle — prompt to take a selfie, with an upload fallback.
  return (
    <div className="flex flex-col items-center" style={{ gap: "12px" }}>
      <div className={frame} style={frameStyle}>
        <div className="flex flex-col items-center" style={{ gap: "8px", padding: "16px", textAlign: "center" }}>
          <Image src="/icons/dash/camera.svg" alt="" width={40} height={40} onError={() => {}} />
          <span style={{ fontSize: "12px", color: "#807E7E" }}>Center your face in the frame</span>
        </div>
      </div>
      {error && <p style={{ fontSize: "13px", color: "#D92D20", fontWeight: 500, margin: 0, textAlign: "center" }}>{error}</p>}
      <div className="flex items-center flex-wrap justify-center" style={{ gap: "16px" }}>
        <button
          type="button"
          onClick={startCamera}
          className="flex items-center justify-center text-white hover:opacity-90"
          style={{ height: "40px", padding: "0 20px", borderRadius: "10px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          Take a selfie
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="hover:opacity-80"
          style={{ fontSize: "14px", fontWeight: 500, color: "#305E82", background: "none", border: "none", cursor: "pointer" }}
        >
          Upload a photo
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
