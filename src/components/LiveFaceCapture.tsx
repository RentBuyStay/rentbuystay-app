"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, ShieldAlert } from "lucide-react";

type Status = "starting" | "live" | "error";

/**
 * Live-only face capture for KYC. Streams the front camera into a circular
 * frame and snaps a still — there is deliberately NO photo upload, so the face
 * has to be present live (basic anti-spoofing). Emits a JPEG data URL.
 */
export default function LiveFaceCapture({
  captured,
  onCapture,
  onRetake,
}: {
  captured: string | null;
  onCapture: (dataUrl: string) => void;
  onRetake: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [flash, setFlash] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setStatus("live");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setStatus("error");
    }
  }, []);

  // Start on mount (unless a shot already exists); always release on unmount.
  useEffect(() => {
    if (!captured) void start();
    return stop;
  }, [captured, start, stop]);

  const snap = () => {
    const v = videoRef.current;
    if (!v || status !== "live") return;
    const size = Math.min(v.videoWidth, v.videoHeight) || 480;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    // Mirror so the saved photo matches the (mirrored) preview.
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, size, size, 0, 0, size, size);
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    onCapture(canvas.toDataURL("image/jpeg", 0.9));
    stop();
  };

  const retake = () => {
    onRetake();
    void start();
  };

  // Cap to the viewport on small screens so the circle never overflows.
  const RING = "min(248px, 72vw)";

  return (
    <div className="flex flex-col items-center" style={{ gap: "20px" }}>
      {/* Circular frame with gradient ring */}
      <div
        className="relative rounded-full flex items-center justify-center shrink-0"
        style={{
          width: RING,
          height: RING,
          padding: 4,
          background: captured
            ? "linear-gradient(175deg, #14AE5C 0%, #039855 100%)"
            : "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        }}
      >
        <div className="relative rounded-full overflow-hidden bg-[#0d1b26] w-full h-full">
          {captured ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={captured} alt="Your captured selfie" className="w-full h-full object-cover" />
          ) : status === "error" ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center" style={{ gap: 8, padding: 20 }}>
              <ShieldAlert size={30} color="#FFFFFF" strokeWidth={1.6} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: "18px" }}>
                Camera access is needed for a live photo
              </span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {status === "starting" && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(13,27,38,0.6)" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Starting camera…</span>
                </div>
              )}
            </>
          )}

          {/* Capture flash */}
          {flash && <div className="absolute inset-0 bg-white" style={{ animation: "none", opacity: 0.85 }} />}
        </div>
      </div>

      {/* Controls */}
      {captured ? (
        <button
          type="button"
          onClick={retake}
          className="flex items-center hover:opacity-80"
          style={{ gap: 8, background: "none", border: "none", cursor: "pointer", color: "#305E82", fontSize: 14, fontWeight: 500 }}
        >
          <RotateCcw size={18} /> Retake photo
        </button>
      ) : status === "error" ? (
        <button
          type="button"
          onClick={start}
          className="flex items-center justify-center text-white hover:opacity-90"
          style={{ height: 44, padding: "0 22px", gap: 8, borderRadius: 12, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          <Camera size={18} /> Enable camera
        </button>
      ) : (
        <button
          type="button"
          onClick={snap}
          disabled={status !== "live"}
          aria-label="Capture photo"
          className="flex items-center justify-center rounded-full shrink-0 hover:opacity-90 disabled:opacity-50"
          style={{ width: 64, height: 64, background: "#FFFFFF", border: "4px solid #305E82", cursor: status === "live" ? "pointer" : "not-allowed" }}
        >
          <span className="rounded-full" style={{ width: 44, height: 44, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" }} />
        </button>
      )}
    </div>
  );
}
