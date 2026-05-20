"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";

// Figma node 332:11758 (Desktop - 11) — Property Owner Login
// Form left (x:140 y:120 w:460 column gap 40): Back, logo, centered "Welcome back" + subtitle,
// Email field, Password field with eye-hide toggle, Remember me + Forgot password row,
// Sign In button, "Don't have an account yet? Register here" (Manrope center)

export default function LogInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const canSignIn = email && password;

  return (
    <OnboardingShell>
      {/* Back — Figma 332:11760 */}
      <Link href="/" className="inline-flex items-center self-start hover:opacity-80" style={{ gap: "12px" }}>
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      {/* Logo — Figma 332:11763: 76x64 cropped image (same imageRef as sign-up) */}
      <Image
        src="/images/logo-icon-3d7b24.png"
        alt="RentBuyStay"
        width={76}
        height={64}
        style={{ width: "76px", height: "64px" }}
      />

      {/* Title block — Figma 332:11764: column justify-center alignItems: CENTER, gap 8 */}
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
          Welcome back
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
          Sign in to continue to your account.
        </p>
      </div>

      {/* Form fields — Figma 332:11802: column gap 16 */}
      <div className="flex flex-col" style={{ gap: "16px" }}>
        {/* Email field — Figma 332:11834 */}
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
            Email
          </label>
          <div
            className="flex items-center"
            style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address here"
              className="w-full outline-none bg-transparent"
              style={{
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
                textAlign: "left",
              }}
            />
          </div>
        </div>

        {/* Password field + Remember/Forgot row — Figma 332:11825: column gap 16 */}
        <div className="flex flex-col" style={{ gap: "16px" }}>
          {/* Password — Figma 332:11826: label + field with eye-hide icon */}
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
                type={showPassword ? "text" : "password"}
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
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="shrink-0 hover:opacity-70"
                style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
              >
                <Image src="/icons/eye-hide.svg" alt="" width={24} height={24} />
              </button>
            </div>
          </div>

          {/* Remember me / Forgot password — Figma 332:11844: row justify-between */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer" style={{ gap: "8px" }}>
              <span
                onClick={() => setRemember((v) => !v)}
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: "24px",
                  height: "24px",
                  border: "1.5px solid #807E7E",
                  borderRadius: "5px",
                  background: remember ? "#305E82" : "transparent",
                  borderColor: remember ? "#305E82" : "#807E7E",
                }}
              >
                {remember && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: "#807E7E",
                }}
              >
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 500,
                color: "#305E82",
                textAlign: "right",
              }}
              className="hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      {/* Sign In + Register row — Figma 332:11924: column gap 24 */}
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {/* Sign In button — Figma 332:11925: full width 48h gradient r:12 */}
        <Link
          href={canSignIn ? "/dashboard" : "#"}
          aria-disabled={!canSignIn}
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
            opacity: canSignIn ? 1 : 0.5,
            pointerEvents: canSignIn ? "auto" : "none",
          }}
        >
          Sign In
        </Link>

        {/* "Don't have an account yet? Register here" — Manrope 16/400 CENTER
            Figma ts1 = #807E7E, ts3 = Medium 500 #305E82 */}
        <p
          className="text-center"
          style={{
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#807E7E",
          }}
        >
          Don&rsquo;t have an account yet?{" "}
          <Link href="/sign-up" style={{ fontWeight: 500, color: "#305E82" }}>
            Register here
          </Link>
        </p>
      </div>
    </OnboardingShell>
  );
}
