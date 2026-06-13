"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";
import {
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} from "@/services/authApi";
import { unwrapApiError } from "@/services/api";

// Reset OTP is 6 digits (Figma "Verify your Email" — 6-digit code) with a 60s
// resend cooldown.
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const HINTS = [
  { id: "len", label: "Password must be at least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  {
    id: "numspec",
    label: "Must contain at least one number or special character",
    test: (p: string) => /[0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(p),
  },
] as const;

type Step = "email" | "code" | "password";

const labelStyle = {
  fontSize: "14px",
  lineHeight: "24px",
  fontWeight: 500 as const,
  color: "#121212",
  letterSpacing: "-0.02em",
  textAlign: "left" as const,
};

const fieldStyle = {
  background: "#F6F6F6",
  borderRadius: "12px",
  padding: "8px 16px",
  height: "48px",
};

const inputStyle = {
  fontSize: "14px",
  lineHeight: "24px",
  fontWeight: 400 as const,
  color: "#121212",
  letterSpacing: "-0.02em",
  textAlign: "left" as const,
};

const primaryBtn = (enabled: boolean) => ({
  width: "100%",
  height: "48px",
  padding: "8px 24px",
  gap: "8px",
  background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
  border: "1px solid rgba(120,158,187,0.5)",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: 500 as const,
  opacity: enabled ? 1 : 0.5,
  cursor: enabled ? ("pointer" as const) : ("not-allowed" as const),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [requestReset, { isLoading: requesting }] = useRequestPasswordResetMutation();
  const [confirmReset, { isLoading: confirming }] = useConfirmPasswordResetMutation();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  // Resend countdown — runs while on the code step.
  useEffect(() => {
    if (step !== "code" || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, secondsLeft]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const canResend = secondsLeft === 0 && !requesting;

  const passedHints = HINTS.filter((h) => h.test(password));
  const allHintsOk = passedHints.length === HINTS.length;
  const canProceed = allHintsOk && password === confirm && confirm.length > 0 && !confirming;

  async function sendCode() {
    if (!emailValid || requesting) return;
    setError(null);
    try {
      await requestReset({ email: email.trim() }).unwrap();
      setStep("code");
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(unwrapApiError(err)?.message ?? "Could not send the code. Please try again.");
    }
  }

  async function resend() {
    if (!canResend) return;
    setError(null);
    try {
      await requestReset({ email: email.trim() }).unwrap();
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(unwrapApiError(err)?.message ?? "Could not resend the code.");
    }
  }

  async function reset() {
    if (!canProceed) return;
    setError(null);
    try {
      await confirmReset({ email: email.trim(), code, newPassword: password }).unwrap();
      router.push("/log-in");
    } catch (err) {
      setError(unwrapApiError(err)?.message ?? "Could not reset your password. Please try again.");
    }
  }

  // Back: code → email, password → code, email → log-in.
  const onBack = () => {
    setError(null);
    if (step === "code") setStep("email");
    else if (step === "password") setStep("code");
    else router.push("/log-in");
  };

  return (
    <OnboardingShell>
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center self-start hover:opacity-80"
        style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
      </button>

      {/* ---- Step 1: email ---- */}
      {step === "email" && (
        <>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h1 style={{ fontSize: "24px", lineHeight: "40px", fontWeight: 600, color: "#121212", textAlign: "left" }}>
              Reset your Password
            </h1>
            <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "left" }}>
              Enter your email address to receive a verification code.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label style={labelStyle}>Email</label>
            <div className="flex items-center" style={fieldStyle}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
                placeholder="Enter your email address here"
                className="w-full outline-none bg-transparent"
                style={inputStyle}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", textAlign: "left" }}>
              {error}
            </p>
          )}

          <button type="button" onClick={sendCode} disabled={!emailValid || requesting} className="flex items-center justify-center text-white hover:opacity-90 transition-opacity" style={primaryBtn(emailValid && !requesting)}>
            {requesting ? "Sending…" : "Send Code"}
          </button>
        </>
      )}

      {/* ---- Step 2: code ---- */}
      {step === "code" && (
        <>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h1 style={{ fontSize: "24px", lineHeight: "40px", fontWeight: 600, color: "#121212", textAlign: "left" }}>
              Verify your Email
            </h1>
            <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "left" }}>
              Enter the {OTP_LENGTH}-digit code sent to {email || "your email address"}.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <label style={labelStyle}>Enter Code</label>
              <div className="flex items-center" onClick={() => codeRef.current?.focus()} style={{ ...fieldStyle, cursor: "text" }}>
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={OTP_LENGTH}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                  autoFocus
                  className="w-full outline-none bg-transparent"
                  style={inputStyle}
                  aria-label={`${OTP_LENGTH}-digit verification code`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>{timer}</span>
              <button
                type="button"
                disabled={!canResend}
                onClick={resend}
                className={canResend ? "hover:underline" : ""}
                style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#305E82", textAlign: "right", background: "none", border: "none", padding: 0, cursor: canResend ? "pointer" : "not-allowed", opacity: canResend ? 1 : 0.5 }}
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

          <button type="button" onClick={() => code.length === OTP_LENGTH && setStep("password")} disabled={code.length !== OTP_LENGTH} className="flex items-center justify-center text-white hover:opacity-90 transition-opacity" style={primaryBtn(code.length === OTP_LENGTH)}>
            Verify Code
          </button>
        </>
      )}

      {/* ---- Step 3: new password ---- */}
      {step === "password" && (
        <>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h1 style={{ fontSize: "24px", lineHeight: "40px", fontWeight: 600, color: "#121212", textAlign: "left" }}>
              Reset Password
            </h1>
            <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "left" }}>
              Create new password for your account below.
            </p>
          </div>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            {/* Password + hints */}
            <div className="flex flex-col" style={{ gap: "16px" }}>
              <div className="flex flex-col" style={{ gap: "8px" }}>
                <label style={labelStyle}>Password</label>
                <div className="flex items-center justify-between" style={fieldStyle}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password here"
                    className="flex-1 outline-none bg-transparent"
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} className="shrink-0 hover:opacity-70" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}>
                    <Image src={showPw ? "/icons/eye-show.svg" : "/icons/eye-hide.svg"} alt="" width={24} height={24} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap" style={{ gap: "16px", width: "457px", maxWidth: "100%" }}>
                {HINTS.map((h) => {
                  const ok = h.test(password);
                  return (
                    <div key={h.id} className="flex items-center" style={{ gap: "8px" }}>
                      <Image src={ok ? "/icons/hint-check-fill.svg" : "/icons/hint-check-empty.svg"} alt="" width={20} height={20} />
                      <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 400, color: ok ? "#305E82" : "#807E7E" }}>{h.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <label style={labelStyle}>Confirm Password</label>
              <div className="flex items-center justify-between" style={fieldStyle}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Enter password here"
                  className="flex-1 outline-none bg-transparent"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide password" : "Show password"} className="shrink-0 hover:opacity-70" style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}>
                  <Image src={showConfirm ? "/icons/eye-show.svg" : "/icons/eye-hide.svg"} alt="" width={24} height={24} />
                </button>
              </div>
              {confirm.length > 0 && confirm !== password && (
                <span style={{ fontSize: "12px", lineHeight: "24px", color: "#E11900" }}>Passwords don&rsquo;t match</span>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", textAlign: "left" }}>
              {error}
            </p>
          )}

          <button type="button" onClick={reset} disabled={!canProceed} className="flex items-center justify-center text-white hover:opacity-90 transition-opacity" style={primaryBtn(canProceed)}>
            {confirming ? "Resetting…" : "Proceed"}
          </button>
        </>
      )}
    </OnboardingShell>
  );
}
