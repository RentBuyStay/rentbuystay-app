"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";
import {
  useVerifyEmailMutation,
  useVerifyDeviceMutation,
  useResendOtpMutation,
} from "@/services/authApi";
import { useLazyGetMeQuery } from "@/services/meApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/features/auth/authSlice";
import { unwrapApiError } from "@/services/api";
import {
  getOnboarding,
  clearOnboarding,
  type OnboardingState,
} from "@/lib/onboarding";

// Backend OTP is 4 digits with a 60s resend cooldown (rbs.auth.otp).
const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [verifyEmail, { isLoading: verifyingEmail }] = useVerifyEmailMutation();
  const [verifyDevice, { isLoading: verifyingDevice }] = useVerifyDeviceMutation();
  const [resendOtp] = useResendOtpMutation();
  const [getMe] = useLazyGetMeQuery();

  const [onboarding, setOnboardingState] = useState<OnboardingState | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  // No in-flight onboarding (e.g. opened directly) → send them back to sign-up.
  useEffect(() => {
    const o = getOnboarding();
    if (!o) {
      router.replace("/sign-up");
      return;
    }
    // Read once on mount (sessionStorage is unavailable during SSR; lazy init
    // would cause a hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnboardingState(o);
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const isLoading = verifyingEmail || verifyingDevice;
  const canVerify = code.length === OTP_LENGTH && !isLoading && !!onboarding;
  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const canResend = secondsLeft === 0 && !!onboarding;

  async function handleVerify() {
    if (!canVerify || !onboarding) return;
    setError(null);
    try {
      if (onboarding.flow === "login-device") {
        // Trust this device and receive tokens, then resolve the user + role.
        const tokens = await verifyDevice({ email: onboarding.email, code }).unwrap();
        dispatch(setCredentials(tokens));
        await getMe().unwrap();
        clearOnboarding();
        router.push("/dashboard");
      } else {
        // Signup flow: confirm the email, then set a password.
        await verifyEmail({ email: onboarding.email, code }).unwrap();
        router.push("/create-password");
      }
    } catch (err) {
      setError(unwrapApiError(err)?.message ?? "Invalid or expired code. Please try again.");
    }
  }

  async function handleResend() {
    if (!canResend || !onboarding) return;
    setError(null);
    try {
      await resendOtp({
        email: onboarding.email,
        purpose: onboarding.flow === "login-device" ? "NEW_DEVICE" : "EMAIL_VERIFY",
      }).unwrap();
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(unwrapApiError(err)?.message ?? "Could not resend the code.");
    }
  }

  return (
    <OnboardingShell>
      
      <Link href="/sign-up" className="inline-flex items-center self-start hover:opacity-80" style={{ gap: "12px" }}>
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      
      <div className="flex flex-col" style={{ gap: "8px" }}>
        <h1
          style={{
            fontSize: "24px",
            lineHeight: "40px",
            fontWeight: 600,
            color: "#121212",
            textAlign: "left",
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
            textAlign: "left",
          }}
        >
          Enter the {OTP_LENGTH}-digit code sent to{onboarding?.email ? ` ${onboarding.email}` : " your email address"}.
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
              maxLength={OTP_LENGTH}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
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
            onClick={handleResend}
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

      {error && (
        <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", textAlign: "left" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleVerify}
        disabled={!canVerify}
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
          cursor: canVerify ? "pointer" : "not-allowed",
        }}
      >
        {isLoading ? "Verifying…" : "Verify Code"}
      </button>
    </OnboardingShell>
  );
}
