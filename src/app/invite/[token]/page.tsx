"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";
import { useAcceptInvitationMutation } from "@/services/organizationApi";
import { unwrapApiError } from "@/services/api";

const HINTS = [
  { id: "len", label: "Password must be at least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  {
    id: "numspec",
    label: "Must contain at least one number or special character",
    test: (p: string) => /[0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(p),
  },
] as const;

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [acceptInvitation, { isLoading }] = useAcceptInvitationMutation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const allHintsOk = HINTS.every((h) => h.test(password));
  const canSubmit = allHintsOk && password === confirm && confirm.length > 0 && !isLoading;

  useEffect(() => {
    if (!done) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [done]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    try {
      await acceptInvitation({ token, body: { password } }).unwrap();
      setDone(true);
    } catch (e) {
      setError(
        unwrapApiError(e)?.message ??
          "This invitation link is invalid or has expired. Ask your agency to resend it."
      );
    }
  }

  return (
    <>
      <OnboardingShell>
        <Image
          src="/images/logo-icon-3d7b24.png"
          alt="RentBuyStay"
          width={76}
          height={64}
          style={{ width: "76px", height: "64px" }}
        />

        <div className="flex flex-col items-center" style={{ gap: "8px" }}>
          <h1 style={{ fontSize: "24px", lineHeight: "40px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
            Accept your invitation
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
            Set a password to join your agency on RentBuyStay.
          </p>
        </div>

        <div className="flex flex-col" style={{ gap: "16px" }}>
          {/* Password */}
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
              Password
            </label>
            <div className="flex items-center justify-between" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password here"
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}
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

          {/* Hints */}
          <div className="flex flex-wrap" style={{ gap: "16px", maxWidth: "100%" }}>
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

          {/* Confirm */}
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
              Confirm Password
            </label>
            <div className="flex items-center justify-between" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Enter password here"
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}
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

        {error && (
          <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", textAlign: "left" }}>
            {error}
          </p>
        )}

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
          {isLoading ? "Joining…" : "Accept & Join"}
        </button>
      </OnboardingShell>

      {done && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="relative bg-white" style={{ width: "503px", maxWidth: "100%", borderRadius: "24px", padding: "40px" }}>
            <div className="flex flex-col items-center" style={{ gap: "24px" }}>
              <Image src="/icons/noti-success.svg" alt="" width={165} height={112} style={{ width: "165px", height: "112.5px" }} />
              <div className="flex flex-col items-center" style={{ gap: "8px" }}>
                <h2 style={{ fontSize: "20px", lineHeight: "30px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
                  You&rsquo;re all set!
                </h2>
                <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
                  Your agent account is ready. Log in to start managing the properties assigned to you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/log-in")}
                className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                style={{
                  width: "100%",
                  height: "48px",
                  background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
                  border: "1px solid rgba(120,158,187,0.5)",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Okay, log in
              </button>
            </div>
          </div>
        </div>
      )}

      <noscript>
        <Link href="/log-in">Log in</Link>
      </noscript>
    </>
  );
}
