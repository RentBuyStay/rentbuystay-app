"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSendPhoneOtpMutation, useVerifyPhoneOtpMutation } from "@/services/authApi";

const COUNTDOWN_SECONDS = 120; // 2 minutes resend window

export default function VerifyPhoneModal({
  open,
  onClose,
  onVerified,
  phoneNumber,
}: {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
  phoneNumber?: string;
}) {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [error, setError] = useState<string | null>(phoneNumber ? null : "No phone number provided in profile.");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [sendOtp, { isLoading: isSending }] = useSendPhoneOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyPhoneOtpMutation();

  useEffect(() => {
    if (phoneNumber) {
      sendOtp({ phoneNumber })
        .unwrap()
        .then(() => {
          setSeconds(COUNTDOWN_SECONDS);
          setStatusMessage("OTP verification code sent!");
        })
        .catch((err: unknown) => {
          const errObj = err as { data?: { message?: string }; message?: string } | null;
          setError(errObj?.data?.message || errObj?.message || "Failed to send verification code. Please check your connection.");
        });
    }

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
  }, [phoneNumber, sendOtp, onClose]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  if (!open) return null;

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const canVerify = code.length === 6 && !isVerifying;

  const handleResend = async () => {
    if (!phoneNumber || isSending) return;
    setError(null);
    setStatusMessage(null);
    try {
      await sendOtp({ phoneNumber }).unwrap();
      setSeconds(COUNTDOWN_SECONDS);
      setCode("");
      setStatusMessage("Verification code resent successfully.");
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string } | null;
      setError(errObj?.data?.message || errObj?.message || "Failed to resend code.");
    }
  };

  const handleVerify = async () => {
    if (!canVerify) return;
    setError(null);
    setStatusMessage(null);
    try {
      await verifyOtp({ otp: code }).unwrap();
      onVerified?.();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string } | null;
      setError(errObj?.data?.message || errObj?.message || "Verification failed. Invalid code.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
      onClick={onClose}
    >
      {/* Bottom sheet on mobile (flush, rounded-top); centred dialog on desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full md:w-[580px] md:max-w-full rounded-t-[25px] md:rounded-[24px] overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 32px)" }}
      >

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute hover:opacity-70 top-6 right-6 md:top-10 md:right-10"
          style={{
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

        <div className="flex flex-col p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col" style={{ gap: "8px", paddingRight: "32px" }}>
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
              Enter the 6-digit code sent to your phone number {phoneNumber ? `(${phoneNumber})` : ""}.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col" style={{ gap: "8px", marginTop: "24px" }}>
            {error && (
              <p style={{ fontSize: "14px", color: "#D92D20", fontWeight: 500, margin: 0 }}>
                {error}
              </p>
            )}
            {statusMessage && !error && (
              <p style={{ fontSize: "14px", color: "#039855", fontWeight: 500, margin: 0 }}>
                {statusMessage}
              </p>
            )}

            <label
              style={{
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 500,
                color: "#121212",
                letterSpacing: "-0.02em",
                marginTop: error || statusMessage ? "8px" : 0
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
                disabled={isVerifying}
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
                disabled={seconds > 0 || isSending}
                onClick={handleResend}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "16px",
                  lineHeight: "24px",
                  fontWeight: 500,
                  color: "#305E82",
                  cursor: seconds > 0 || isSending ? "not-allowed" : "pointer",
                  opacity: seconds > 0 || isSending ? 0.6 : 1,
                }}
              >
                {isSending ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <button
              type="button"
              disabled={!canVerify}
              onClick={handleVerify}
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
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
