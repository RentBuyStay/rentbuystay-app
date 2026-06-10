"use client";

import Image from "next/image";
import { useEffect } from "react";

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
    <div
      className="fixed inset-0 z-10000 flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(18,18,18,0.25)", zIndex: 10000 }}
      onClick={onClose}
    >
      {/* Bottom sheet on mobile; centred dialog on desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full md:w-[503px] md:max-w-full rounded-t-[25px] md:rounded-[24px] flex flex-col items-center p-6 md:p-10"
      >
        <div className="flex flex-col items-center w-full" style={{ gap: "24px" }}>
          <Image
            src="/icons/dash/verify-illu.svg"
            alt=""
            width={120}
            height={120}
            className="w-[104px] h-[104px] md:w-[120px] md:h-[120px]"
          />

          <div className="flex flex-col w-full" style={{ gap: "8px" }}>
            <h2
              className="text-lg md:text-xl leading-6 md:leading-[30px]"
              style={{ fontWeight: 600, color: "#121212", textAlign: "center" }}
            >
              Get verified to start listing
            </h2>
            <p
              className="text-sm md:text-base"
              style={{ lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}
            >
              Complete your verification to unlock listings, inquiries, and full access to your account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onProceed?.();
            }}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity w-full"
            style={{
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
    </div>
  );
}
