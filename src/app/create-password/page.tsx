"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";

// Figma node 332:11609 (Desktop - 10) — Property Owner Onboarding/Auth — Create Password
// Back, centered title block, Password field with eye-show toggle + 3 wrap hints,
// Confirm Password field with eye-hide toggle, Complete Sign up button → success modal (332:11659).

const HINTS = [
  { id: "len", label: "Password must be at least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  {
    id: "numspec",
    label: "Must contain at least one number or special character",
    test: (p: string) => /[0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(p),
  },
] as const;

export default function CreatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passedHints = HINTS.filter((h) => h.test(password));
  const allHintsOk = passedHints.length === HINTS.length;
  const canSubmit = allHintsOk && password === confirm && confirm.length > 0;

  // Lock body scroll when success modal open + ESC closes
  useEffect(() => {
    if (!submitted) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSubmitted(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [submitted]);

  return (
    <>
      <OnboardingShell>
        {/* Back */}
        <Link href="/verify-email" className="inline-flex items-center self-start hover:opacity-80" style={{ gap: "12px" }}>
          <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
        </Link>

        {/* Title block — Figma 332:11615: column justify-center alignItems: CENTER, gap 8 */}
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
            Create Password
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
            Set your password for security below.
          </p>
        </div>

        {/* Fields — Figma 332:11801: column gap 16 */}
        <div className="flex flex-col" style={{ gap: "16px" }}>
          {/* Password — label + input with eye-show + hint pills */}
          <div className="flex flex-col" style={{ gap: "16px" }}>
            {/* Password field */}
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
                Password
              </label>
              <div
                className="flex items-center justify-between"
                style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
              >
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password here"
                  className="flex-1 outline-none bg-transparent"
                  style={{
                    fontSize: "14px",
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: "#121212",
                    letterSpacing: "-0.02em",
                    textAlign: "left",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="shrink-0 hover:opacity-70"
                  style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
                >
                  <Image
                    src={showPw ? "/icons/eye-show.svg" : "/icons/eye-hide.svg"}
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>

            {/* Hint pills — Figma 332:11642: row wrap gap 16, each row gap 8 align-center
                hint-check-fill (#305E82) + #305E82 text when met
                hint-check-empty + #807E7E text when not yet met */}
            <div className="flex flex-wrap" style={{ gap: "16px", width: "457px", maxWidth: "100%" }}>
              {HINTS.map((h) => {
                const ok = h.test(password);
                return (
                  <div key={h.id} className="flex items-center" style={{ gap: "8px" }}>
                    <Image
                      src={ok ? "/icons/hint-check-fill.svg" : "/icons/hint-check-empty.svg"}
                      alt=""
                      width={20}
                      height={20}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        lineHeight: "24px",
                        fontWeight: 400,
                        color: ok ? "#305E82" : "#807E7E",
                      }}
                    >
                      {h.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Password — Figma 332:11635: column gap 16 (just one field here) */}
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
              Confirm Password
            </label>
            <div
              className="flex items-center justify-between"
              style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
            >
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Enter password here"
                className="flex-1 outline-none bg-transparent"
                style={{
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: "#121212",
                  letterSpacing: "-0.02em",
                  textAlign: "left",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="shrink-0 hover:opacity-70"
                style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
              >
                <Image
                  src={showConfirm ? "/icons/eye-show.svg" : "/icons/eye-hide.svg"}
                  alt=""
                  width={24}
                  height={24}
                />
              </button>
            </div>
            {confirm.length > 0 && confirm !== password && (
              <span style={{ fontSize: "12px", lineHeight: "24px", color: "#E11900" }}>
                Passwords don&rsquo;t match
              </span>
            )}
          </div>
        </div>

        {/* Complete Sign up — Figma 332:11628: full width 48h gradient r:12.
            Prototype: ON_CLICK → success modal (332:11659) */}
        <button
          type="button"
          onClick={() => canSubmit && setSubmitted(true)}
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
          Complete Sign up
        </button>
      </OnboardingShell>

      {/* Success modal — Figma 332:11659: 503x462 r:24 */}
      {submitted && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSubmitted(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white"
            style={{ width: "503px", maxWidth: "100%", height: "462px", borderRadius: "24px" }}
          >
            {/* Cancel — Figma 332:11667: x:439 y:40, 24x24 */}
            <button
              onClick={() => setSubmitted(false)}
              aria-label="Close"
              className="absolute hover:opacity-70"
              style={{ top: "40px", right: "40px", width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
            >
              <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
            </button>

            {/* Content — Figma 332:11662: x:40 y:88 w:423 column align-center gap 24 */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: "40px", top: "88px", width: "423px", gap: "24px" }}
            >
              {/* Success icon — Figma 332:11663: 165x112.5 (green check with confetti) */}
              <Image
                src="/icons/noti-success.svg"
                alt=""
                width={165}
                height={112}
                style={{ width: "165px", height: "112.5px" }}
              />
              {/* Title + body */}
              <div className="flex flex-col" style={{ gap: "8px", width: "100%" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    lineHeight: "30px",
                    fontWeight: 600,
                    color: "#121212",
                    textAlign: "center",
                  }}
                >
                  You&rsquo;re all set!
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
                  Your account has been created successfully! Start exploring properties or
                  list yours to connect with potential buyers and renters.
                </p>
              </div>
            </div>

            {/* Okay, log in — Figma 332:11660: x:40 y:374.5 w:423 h:48 r:12 blue gradient */}
            <Link
              href="/log-in"
              className="absolute flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{
                left: "40px",
                top: "374.5px",
                width: "423px",
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
      )}
    </>
  );
}
