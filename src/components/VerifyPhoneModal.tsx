"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const COUNTDOWN_SECONDS = 57;

export default function VerifyPhoneModal({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}) {
  const [code, setCode] = useState("0937");
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSeconds(COUNTDOWN_SECONDS);
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [open, seconds]);

  if (!open) return null;

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const canVerify = code.length === 6;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white"
        style={{
          width: "580px",
          maxWidth: "100%",
          maxHeight: "calc(100vh - 32px)",
          borderRadius: "24px",
          overflowY: "auto",
        }}
      >

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute hover:opacity-70"
          style={{
            top: "40px",
            right: "40px",
            width: "24px",
            height: "24px",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
        </button>


        <div
          className="flex flex-col"
          style={{ position: "absolute", left: "40px", top: "40px", width: "363px", gap: "8px" }}
        >
          <h2
            style={{
              fontSize: "20px",
              lineHeight: "24px",
              fontWeight: 600,
              color: "#121212",
            }}
          >
            Verify Phone Number
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 400,
              color: "#807E7E",
            }}
          >
            Enter the 6-digit code sent to your phone number.
          </p>
        </div>


        <div
          className="relative flex flex-col"
          style={{
            paddingLeft: "40px",
            paddingRight: "40px",
            paddingTop: "136px",
            paddingBottom: "40px",
            gap: "8px",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#121212",
              letterSpacing: "-0.02em",
            }}
          >
            Enter Code
          </label>

          <div
            className="flex items-center"
            style={{
              background: "#F6F6F6",
              borderRadius: "12px",
              padding: "8px 16px",
              height: "40px",
            }}
          >
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              className="w-full outline-none bg-transparent"
              style={{
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
              }}
            />
          </div>


          <div className="flex items-center justify-between" style={{ marginTop: "8px" }}>
            <span
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#807E7E",
              }}
            >
              {mins}:{secs}
            </span>
            <button
              type="button"
              disabled={seconds > 0}
              onClick={() => setSeconds(COUNTDOWN_SECONDS)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 500,
                color: "#305E82",
                cursor: seconds > 0 ? "not-allowed" : "pointer",
                opacity: seconds > 0 ? 0.6 : 1,
              }}
            >
              Resend OTP
            </button>
          </div>


          <button
            type="button"
            disabled={!canVerify}
            onClick={() => {
              if (!canVerify) return;
              try {
                localStorage.setItem("rbs-dashboard-verified", "1");
              } catch {}
              onVerified?.();
              onClose();
            }}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{
              width: "100%",
              height: "48px",
              padding: "8px 24px",
              gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: canVerify ? "pointer" : "not-allowed",
              opacity: canVerify ? 1 : 0.6,
              marginTop: "16px",
            }}
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
