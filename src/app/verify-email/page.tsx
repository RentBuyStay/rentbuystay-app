"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";

const RESEND_SECONDS = 57;

export default function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const canVerify = code.length === 6;
  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const canResend = secondsLeft === 0;

  return (
    <OnboardingShell>
      
      <Link href="/sign-up" className="inline-flex items-center self-start hover:opacity-80" style={{ gap: "12px" }}>
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      
      <div className="flex flex-col items-center" style={{ gap: "8px" }}>
        <h1
          style={{
            fontSize: "24px",
            lineHeight: "40px",
            fontWeight: 600,
            color: "#121212",
            textAlign: "center",
          }}
        >
          Verify your Email
        </h1>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#807E7E",
            textAlign: "center",
          }}
        >
          Enter the 6-digit code sent to your email address.
        </p>
      </div>

      
      <div className="flex flex-col" style={{ gap: "16px" }}>
        
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <label
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#121212",
              letterSpacing: "-0.02em",
              textAlign: "left",
            }}
          >
            Enter Code
          </label>
          {/* Field — bg #F6F6F6 r:12 padding 8 16, hidden actual input + visible monospaced display */}
          <div
            className="flex items-center"
            onClick={() => inputRef.current?.focus()}
            style={{
              background: "#F6F6F6",
              borderRadius: "12px",
              padding: "8px 16px",
              cursor: "text",
              height: "40px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
              className="w-full outline-none bg-transparent"
              style={{
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
              }}
              aria-label="6-digit verification code"
            />
          </div>
        </div>

        
        <div className="flex items-center justify-between">
          <span
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 400,
              color: "#807E7E",
            }}
          >
            {timer}
          </span>
          <button
            type="button"
            disabled={!canResend}
            onClick={() => setSecondsLeft(RESEND_SECONDS)}
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#305E82",
              textAlign: "right",
              background: "none",
              border: "none",
              padding: 0,
              cursor: canResend ? "pointer" : "not-allowed",
              opacity: canResend ? 1 : 0.5,
            }}
            className={canResend ? "hover:underline" : ""}
          >
            Resend OTP
          </button>
        </div>
      </div>

      
      <Link
        href={canVerify ? "/create-password" : "#"}
        aria-disabled={!canVerify}
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
          opacity: canVerify ? 1 : 0.5,
          pointerEvents: canVerify ? "auto" : "none",
        }}
      >
        Verify Code
      </Link>
    </OnboardingShell>
  );
}
