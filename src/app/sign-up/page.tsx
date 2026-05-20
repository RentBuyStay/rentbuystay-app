"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";

// Figma node 280:11579 (Desktop - 8) — Property Owner Onboarding/Auth — Create Account
// Frame: 1440x1123 white
// Left form: x:140 y:120 w:460 column gap 40 — Back, logo, title, fields, proceed/sign-in
// Right image card: x:740 y:24 w:676 h:976 r:20 — interior photo with dark gradient overlay

const ACCOUNT_TYPES = [
  "Property Owner",
  "Property Seeker",
  "Real Estate Agent",
  "Real Estate Agency or Developer",
];

export default function PropertyOwnerSignUpPage() {
  const [accountType, setAccountType] = useState("Property Owner");
  const [accountOpen, setAccountOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Form valid → ready to proceed. Figma prototype: Proceed → Verify Email (329:11544)
  const canProceed = firstName && lastName && email && phone && agreed;

  return (
    <OnboardingShell>
          {/* Back — Figma: row gap 12, arrow + "Back" 16/400 Geist */}
          <Link
            href="/"
            className="inline-flex items-center self-start hover:opacity-80"
            style={{ gap: "12px" }}
          >
            <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
              Back
            </span>
          </Link>

          {/* Logo — Figma 280:12312: 76x64 cropped image */}
          <Image
            src="/images/logo-icon-3d7b24.png"
            alt="RentBuyStay"
            width={76}
            height={64}
            style={{ width: "76px", height: "64px" }}
          />

          {/* Title — Figma: 24/600 Geist line-height 40, has explicit \n after "get" */}
          <h1 style={{ fontSize: "24px", lineHeight: "40px", fontWeight: 600, color: "#121212", textAlign: "left" }}>
            Create an account to get
            <br />
            started with RentBuyStay
          </h1>

          {/* Form fields — Figma Frame 2147237035: column gap 16 */}
          <div className="flex flex-col" style={{ gap: "16px" }}>
            {/* Account Type dropdown — bg #F6F6F6 r:12 padding 8 16, justify-between, height fixed */}
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
                Account Type
              </label>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center justify-between relative"
                style={{
                  background: "#F6F6F6",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  height: "40px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}>
                  {accountType}
                </span>
                <Image
                  src="/icons/chevron-down.svg"
                  alt=""
                  width={24}
                  height={24}
                  style={{ transform: accountOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s" }}
                />
                {accountOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 bg-white shadow-lg"
                    style={{ borderRadius: "12px", padding: "8px 0", zIndex: 10, border: "1px solid #F6F6F6" }}
                  >
                    {ACCOUNT_TYPES.map((opt) => (
                      <div
                        key={opt}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccountType(opt);
                          setAccountOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setAccountType(opt);
                            setAccountOpen(false);
                          }
                        }}
                        className="hover:bg-[#F6F6F6] cursor-pointer"
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          lineHeight: "24px",
                          fontWeight: opt === accountType ? 500 : 400,
                          color: opt === accountType ? "#305E82" : "#121212",
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            </div>

            {/* First Name */}
            <FieldGroup label="First Name">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="Enter your first name here"
                style={inputStyle}
                className="w-full outline-none bg-transparent"
              />
            </FieldGroup>

            {/* Last Name */}
            <FieldGroup label="Last Name">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Enter your last name here"
                style={inputStyle}
                className="w-full outline-none bg-transparent"
              />
            </FieldGroup>

            {/* Email */}
            <FieldGroup label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email address here"
                style={inputStyle}
                className="w-full outline-none bg-transparent"
              />
            </FieldGroup>

            {/* Phone Number — US flag + +1 + chevron + input */}
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
                Phone Number
              </label>
              <div
                className="flex items-center"
                style={{
                  background: "#F6F6F6",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  gap: "16px",
                }}
              >
                <div className="flex items-center" style={{ gap: "4px" }}>
                  <Image src="/icons/flag-us.svg" alt="" width={24} height={24} />
                  <span style={{ fontSize: "14px", lineHeight: "140%", fontWeight: 500, color: "#807E7E", textAlign: "center" }}>
                    +1
                  </span>
                  <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} />
                </div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="Enter phone number"
                  className="flex-1 outline-none bg-transparent"
                  style={{ ...inputStyle, lineHeight: "24px" }}
                />
              </div>
            </div>

            {/* Checkbox + agreement — Figma 280:11883: row gap 8 align-center
                ts2 override: SemiBold underline #305E82 for "Terms of Service" and "Privacy Policy" */}
            <label className="flex items-start cursor-pointer" style={{ gap: "8px" }}>
              <span
                onClick={() => setAgreed((v) => !v)}
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: "20px",
                  height: "20px",
                  border: "1.5px solid #807E7E",
                  borderRadius: "5px",
                  background: agreed ? "#305E82" : "transparent",
                  borderColor: agreed ? "#305E82" : "#807E7E",
                  marginTop: "2px",
                }}
              >
                {agreed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input type="checkbox" className="sr-only" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
                I agree to the{" "}
                <Link href="/tos" style={{ fontWeight: 500, color: "#305E82", textDecoration: "underline" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" style={{ fontWeight: 500, color: "#305E82", textDecoration: "underline" }}>
                  Privacy Policy
                </Link>{" "}
                of RentBuyStay.
              </span>
            </label>
          </div>

          {/* Bottom — Figma Frame 2147237090: column gap 24, Proceed button + Sign In link */}
          <div className="flex flex-col" style={{ gap: "24px" }}>
            <Link
              href={canProceed ? "/verify-email" : "#"}
              aria-disabled={!canProceed}
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
                opacity: canProceed ? 1 : 0.5,
                pointerEvents: canProceed ? "auto" : "none",
              }}
            >
              Proceed
            </Link>
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
              Have a RentBuyStay account?{" "}
              <Link href="/log-in" style={{ fontWeight: 500, color: "#305E82" }}>
                Sign In
              </Link>
            </p>
          </div>
    </OnboardingShell>
  );
}

const inputStyle = {
  fontSize: "14px",
  lineHeight: "24px",
  fontWeight: 400 as const,
  color: "#121212",
  letterSpacing: "-0.02em",
  textAlign: "left" as const,
};

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
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
        {label}
      </label>
      <div
        className="flex items-center"
        style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
      >
        {children}
      </div>
    </div>
  );
}
