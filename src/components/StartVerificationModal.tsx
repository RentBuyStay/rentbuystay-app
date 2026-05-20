"use client";

import Image from "next/image";
import { useEffect } from "react";

// Figma 465:24320 (success modal frame, but actually the Start-Verification prompt)
// Sits inside Desktop-15 (332:12083) as an overlay triggered by the "Start Verification" CTA.
// 503x414 white r:24, centered. Content: illustration (120x120) + title + body + button.

export default function StartVerificationModal({
  open,
  onClose,
  onProceed,
}: {
  open: boolean;
  onClose: () => void;
  /** Called when the user clicks Start Verification — typically navigates to /dashboard/verification */
  onProceed?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Backdrop — Figma Frame 2147237212 (465:24296): full screen rgba(18,18,18,0.25)
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center p-4"
      style={{ background: "rgba(18,18,18,0.25)", zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white"
        style={{ width: "503px", maxWidth: "100%", height: "414px", borderRadius: "24px" }}
      >
        {/* Content — Figma 465:24323: x:40 y:40 w:423 column align-center gap 32 */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: "40px", top: "40px", width: "423px", gap: "32px" }}
        >
          {/* Illustration — Figma 465:24353: 120x120 verification graphic */}
          <Image
            src="/icons/dash/verify-illu.svg"
            alt=""
            width={120}
            height={120}
            style={{ width: "120px", height: "120px" }}
          />

          {/* Title block — Figma 465:24325: column justify-center gap 16, text CENTER */}
          <div className="flex flex-col" style={{ gap: "16px", width: "100%" }}>
            <h2
              style={{
                fontSize: "20px",
                lineHeight: "30px",
                fontWeight: 600,
                color: "#121212",
                textAlign: "center",
              }}
            >
              Get verified to start listing
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#807E7E",
                textAlign: "center",
              }}
            >
              Complete your verification to unlock listings, inquiries, and full access to your account.
            </p>
          </div>
        </div>

        {/* Start Verification button — Figma 465:24321: x:40 y:326 w:423 h:48 r:12 blue gradient */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onProceed?.();
          }}
          className="absolute flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{
            left: "40px",
            top: "326px",
            width: "423px",
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Start Verification
        </button>
      </div>
    </div>
  );
}
