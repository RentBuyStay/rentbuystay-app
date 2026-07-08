"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import OnboardingShell from "@/components/OnboardingShell";
import { useVerifyEmailMutation } from "@/services/authApi";
import { unwrapApiError } from "@/services/api";

/**
 * Account-activation landing — the "Activate your Account" email links here:
 * /auth/activate?email=…&code=…
 * The account already has a password (set when it was created); this only
 * verifies the email with the emailed code, then points the user to log in.
 */
type Status = "verifying" | "done" | "error" | "invalid";

function ActivateInner() {
  const sp = useSearchParams();
  const email = (sp.get("email") ?? "").trim();
  const code = (sp.get("code") ?? "").trim();

  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<Status>(email && code ? "verifying" : "invalid");
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !email || !code) return;
    ran.current = true;
    (async () => {
      try {
        await verifyEmail({ email, code }).unwrap();
        setStatus("done");
      } catch (err) {
        setError(
          unwrapApiError(err)?.message ??
            "This activation link may be invalid or expired. Please ask for a new one.",
        );
        setStatus("error");
      }
    })();
  }, [email, code, verifyEmail]);

  const heading =
    status === "done" ? "Account activated" : status === "verifying" ? "Activating your account…" : "Activation failed";
  const sub =
    status === "done"
      ? <>Your account{email ? <> <span style={{ color: "#305E82", fontWeight: 500 }}>{email}</span></> : ""} is verified and ready. Log in to get started.</>
      : status === "verifying"
        ? "Please wait while we verify your email."
        : status === "invalid"
          ? "This activation link is invalid. Please ask your administrator for a new one."
          : (error ?? "We couldn't activate your account.");

  return (
    <OnboardingShell>
      <div className="flex flex-col items-center text-center self-stretch" style={{ gap: "24px", paddingTop: "8px" }}>
        {status === "done" ? (
          <Image src="/icons/noti-success.svg" alt="" width={165} height={112} style={{ width: "165px", height: "112.5px" }} />
        ) : status === "verifying" ? (
          <div
            className="animate-spin rounded-full"
            style={{ width: "44px", height: "44px", border: "4px solid #F6F6F6", borderTopColor: "#305E82" }}
            aria-label="Verifying"
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: "72px", height: "72px", background: "rgba(227,0,69,0.08)", color: "#E30045", fontSize: "36px", fontWeight: 600 }}
          >
            !
          </div>
        )}

        <div className="flex flex-col self-stretch" style={{ gap: "8px" }}>
          <h1 style={{ fontSize: "24px", lineHeight: "32px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
            {heading}
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
            {sub}
          </p>
        </div>

        {status !== "verifying" && (
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
            {status === "done" ? "Okay, log in" : "Go to Login"}
          </Link>
        )}
      </div>
    </OnboardingShell>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<OnboardingShell><div /></OnboardingShell>}>
      <ActivateInner />
    </Suspense>
  );
}
