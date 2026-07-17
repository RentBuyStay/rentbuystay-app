"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingShell from "@/components/OnboardingShell";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { useSignupMutation } from "@/services/authApi";
import { unwrapApiError } from "@/services/api";
import { roleToUserType } from "@/lib/userType";
import type { AccountRole } from "@/lib/role";
import { setOnboarding } from "@/lib/onboarding";
import { DEFAULT_COUNTRY, type Country } from "@/lib/countries";

const ACCOUNT_TYPES: AccountRole[] = [
  "Property Owner",
  "Property Seeker",
  "Real Estate Agent",
  "Real Estate Agency or Developer",
];

// The marketing site's "Get Started Free" flow picks the account type and hands
// off here as /sign-up?type=<slug>, so the choice carries across the two apps.
const TYPE_PARAM_TO_ROLE: Record<string, AccountRole> = {
  seeker: "Property Seeker",
  agent: "Real Estate Agent",
  owner: "Property Owner",
  agency: "Real Estate Agency or Developer",
};

export default function PropertyOwnerSignUpPage() {
  const router = useRouter();
  const [signup, { isLoading }] = useSignupMutation();
  const [accountType, setAccountType] = useState<AccountRole>("Property Owner");
  const [accountOpen, setAccountOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Preselect the account type chosen on the marketing site (?type=agency…).
  // Read from window on mount — searchParams during SSR would need a Suspense
  // boundary, and this is a one-time sync of external state.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("type");
    const role = t ? TYPE_PARAM_TO_ROLE[t.toLowerCase()] : undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (role) setAccountType(role);
  }, []);

  const isAgency = accountType === "Real Estate Agency or Developer";
  const isSeeker = accountType === "Property Seeker";
  // Property seekers don't provide a phone number at signup.
  const phoneOk = isSeeker || Boolean(phone);

  const canProceed = isAgency
    ? Boolean(companyName && email && phoneOk && agreed && !isLoading)
    : Boolean(firstName && lastName && email && phoneOk && agreed && !isLoading);

  async function handleSignup() {
    if (!canProceed) return;
    setError(null);
    const userType = roleToUserType(accountType);
    try {
      await signup({
        email: email.trim(),
        phoneNumber: isSeeker ? undefined : `${country.dial}${phone.replace(/\D/g, "")}`,
        userType,
        // An agency registers with its company name; everyone else with a
        // personal name. The backend validates whichever applies to the type.
        ...(isAgency
          ? { companyDetails: { companyName: companyName.trim() } }
          : { userDetails: { firstName: firstName.trim(), lastName: lastName.trim() } }),
      }).unwrap();
      setOnboarding({ email: email.trim(), userType, flow: "signup" });
      router.push("/verify-email");
    } catch (err) {
      setError(
        unwrapApiError(err)?.message ?? "Could not create your account. Please try again."
      );
    }
  }

  return (
    <OnboardingShell>
          
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

          
          <Image
            src="/images/logo-icon-3d7b24.png"
            alt="RentBuyStay"
            width={76}
            height={64}
            style={{ width: "76px", height: "64px" }}
          />

          
          <h1 style={{ fontSize: "24px", lineHeight: "40px", fontWeight: 600, color: "#121212", textAlign: "left" }}>
            Create an account to get
            <br />
            started with RentBuyStay
          </h1>

          
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
                  height: "48px",
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

            {isAgency ? (
              <FieldGroup label="Company Name">
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  type="text"
                  placeholder="Enter your company name here"
                  style={inputStyle}
                  className="w-full outline-none bg-transparent"
                />
              </FieldGroup>
            ) : (
              <>
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
              </>
            )}

            <FieldGroup label={isAgency ? "Company Email" : "Email"}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email address here"
                style={inputStyle}
                className="w-full outline-none bg-transparent"
              />
            </FieldGroup>

            {/* Phone Number — hidden for property seekers (they don't provide one) */}
            {!isSeeker && (
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
                <PhoneNumberInput
                  country={country}
                  onCountryChange={setCountry}
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            )}

            
            <label className="flex items-start cursor-pointer" style={{ gap: "8px" }}>
              <span
                aria-hidden="true"
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
                <Link href="/tos" onClick={(e) => e.stopPropagation()} style={{ fontWeight: 500, color: "#305E82", textDecoration: "underline" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" onClick={(e) => e.stopPropagation()} style={{ fontWeight: 500, color: "#305E82", textDecoration: "underline" }}>
                  Privacy Policy
                </Link>{" "}
                of RentBuyStay.
              </span>
            </label>
          </div>


          <div className="flex flex-col" style={{ gap: "24px" }}>
            {error && (
              <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", textAlign: "left" }}>
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleSignup}
              disabled={!canProceed}
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
                cursor: canProceed ? "pointer" : "not-allowed",
              }}
            >
              {isLoading ? "Creating account…" : "Proceed"}
            </button>
            <p
              className="text-center"
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
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
        style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "48px" }}
      >
        {children}
      </div>
    </div>
  );
}
