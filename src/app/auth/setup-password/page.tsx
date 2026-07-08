"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { emailFromParam } from "@/lib/email";
import OnboardingShell from "@/components/OnboardingShell";
import { useVerifyEmailMutation, useSetPasswordMutation } from "@/services/authApi";
import { unwrapApiError } from "@/services/api";

/**
 * Invite landing — the "Verify your Email & Set Password" link from the admin's
 * create-user email points here: /auth/setup-password?email=…&code=…
 * We verify the email with the emailed code, then set the password, then send
 * the user to log in. (Distinct from /create-password, which is the session-based
 * self-signup step.)
 */
const HINTS = [
  { id: "len", label: "Password must be at least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  {
    id: "numspec",
    label: "Must contain at least one number or special character",
    test: (p: string) => /[0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(p),
  },
] as const;

function SetupPasswordInner() {
  const sp = useSearchParams();
  const email = emailFromParam(sp.get("email"));
  const code = (sp.get("code") ?? "").trim();

  const [verifyEmail] = useVerifyEmailMutation();
  const [setPasswordReq, { isLoading }] = useSetPasswordMutation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkValid = Boolean(email && code);
  const passedHints = HINTS.filter((h) => h.test(password));
  const allHintsOk = passedHints.length === HINTS.length;
  const canSubmit = linkValid && allHintsOk && password === confirm && confirm.length > 0 && !isLoading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    try {
      // Verify the emailed code first, then set the password for that account.
      await verifyEmail({ email, code }).unwrap();
      await setPasswordReq({ email, password }).unwrap();
      setSubmitted(true);
    } catch (err) {
      setError(
        unwrapApiError(err)?.message ??
          "This link may be invalid or expired. Please ask for a new invite.",
      );
    }
  }

  return (
    <>
      <OnboardingShell>
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <h1 style={{ fontSize: "24px", lineHeight: "40px", fontWeight: 600, color: "#121212", textAlign: "left" }}>
            Set Up Password
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "left" }}>
            {linkValid
              ? <>Verify your email and set a password to finish setting up{email ? <> <span style={{ color: "#305E82", fontWeight: 500 }}>{email}</span></> : ""}.</>
              : "This invite link is invalid or has expired. Please ask your administrator for a new one."}
          </p>
        </div>

        {linkValid && (
          <div className="flex flex-col" style={{ gap: "16px" }}>
            {/* Password */}
            <div className="flex flex-col" style={{ gap: "16px" }}>
              <div className="flex flex-col" style={{ gap: "8px" }}>
                <label style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em", textAlign: "left" }}>
                  Password
                </label>
                <div className="flex items-center justify-between" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password here"
                    className="flex-1 outline-none bg-transparent"
                    style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em", textAlign: "left" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="shrink-0 hover:opacity-70"
                    style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
                  >
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
                      <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 400, color: ok ? "#305E82" : "#807E7E" }}>
                        {h.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <label style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em", textAlign: "left" }}>
                Confirm Password
              </label>
              <div className="flex items-center justify-between" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Enter password here"
                  className="flex-1 outline-none bg-transparent"
                  style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em", textAlign: "left" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="shrink-0 hover:opacity-70"
                  style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
                >
                  <Image src={showConfirm ? "/icons/eye-show.svg" : "/icons/eye-hide.svg"} alt="" width={24} height={24} />
                </button>
              </div>
              {confirm.length > 0 && confirm !== password && (
                <span style={{ fontSize: "12px", lineHeight: "24px", color: "#E11900" }}>Passwords don&rsquo;t match</span>
              )}
            </div>
          </div>
        )}

        {error && (
          <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", textAlign: "left" }}>
            {error}
          </p>
        )}

        {linkValid ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
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
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {isLoading ? "Setting up…" : "Set Password & Continue"}
          </button>
        ) : (
          <Link
            href="/log-in"
            className="flex items-center justify-center self-stretch text-white hover:opacity-90 transition-opacity"
            style={{
              height: "48px",
              padding: "8px 24px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Go to Login
          </Link>
        )}
      </OnboardingShell>

      {submitted && (
        <div
          className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center md:p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSubmitted(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full md:w-[503px] md:max-w-full rounded-t-[25px] md:rounded-[24px] flex flex-col items-center p-6 md:p-10"
          >
            <button
              onClick={() => setSubmitted(false)}
              aria-label="Close"
              className="absolute hover:opacity-70 top-6 right-6 md:top-10 md:right-10"
              style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
            >
              <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
            </button>

            <div className="flex flex-col items-center w-full" style={{ gap: "24px", paddingTop: "24px" }}>
              <Image src="/icons/noti-success.svg" alt="" width={165} height={112} style={{ width: "165px", height: "112.5px" }} />
              <div className="flex flex-col w-full" style={{ gap: "8px" }}>
                <h2 style={{ fontSize: "20px", lineHeight: "30px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
                  You&rsquo;re all set!
                </h2>
                <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
                  Your account is ready. Log in to start using RentBuyStay.
                </p>
              </div>
              <Link
                href="/log-in"
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
                }}
              >
                Okay, log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<OnboardingShell><div /></OnboardingShell>}>
      <SetupPasswordInner />
    </Suspense>
  );
}
