"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useVerifySubscriptionMutation } from "@/services/subscriptionApi";
import { unwrapApiError } from "@/services/api";

type Phase = "verifying" | "success" | "failed";

export default function PaymentCallbackPage() {
  // useSearchParams requires a Suspense boundary in a statically-rendered route.
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center" style={{ minHeight: "100vh", background: "#F4F8FB", color: "#807E7E", fontSize: "14px" }}>
          Loading…
        </div>
      }
    >
      <PaymentCallbackInner />
    </Suspense>
  );
}

function PaymentCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams?.get("tx_ref") ?? searchParams?.get("trxref") ?? searchParams?.get("reference") ?? "";
  const status = searchParams?.get("status");
  // Card-setup returns (the ₦50 "save a card" step for auto-renewal) carry an
  // RBS-SUB-CARD reference. They have no plan to upgrade — the card is saved
  // server-side via the payment webhook — so we must not run the plan verify.
  const isCardSetup = reference.toUpperCase().includes("SUB-CARD");
  const succeeded = status === "successful" || status === "success";

  const [verify] = useVerifySubscriptionMutation();
  const [phase, setPhase] = useState<Phase>("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // verify exactly once
    ran.current = true;

    if (!reference) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("failed");
      setErrorMsg("Missing payment reference.");
      return;
    }

    if (status === "cancelled") {
      setPhase("failed");
      setErrorMsg("Payment Cancelled by User.");
      // Fire-and-forget verify call to notify backend of cancellation
      verify(reference).catch(() => {});
      return;
    }

    // Card setup: confirmed by webhook, not the plan-verify endpoint.
    if (isCardSetup) {
      setPhase(succeeded ? "success" : "failed");
      if (!succeeded) setErrorMsg("Card setup wasn’t completed. Please try again.");
      return;
    }

    verify(reference)
      .unwrap()
      .then(() => setPhase("success"))
      .catch((e) => {
        setPhase("failed");
        setErrorMsg(unwrapApiError(e)?.message ?? "We couldn’t verify your payment.");
      });
  }, [reference, status, verify, isCardSetup, succeeded]);

  const proceed = () => router.replace(isCardSetup ? "/dashboard/subscription/manage" : "/dashboard/subscription");

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "100vh", background: "#F4F8FB", padding: "16px" }}
    >
      <div
        className="relative bg-white"
        style={{ width: "503px", maxWidth: "100%", minHeight: "462px", borderRadius: "24px" }}
      >
        {/* Close (top-right, 24×24 @ x:439 y:40) */}
        <button
          type="button"
          onClick={proceed}
          aria-label="Close"
          className="absolute hover:opacity-70"
          style={{ top: "40px", right: "40px", width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
        </button>

        {phase === "verifying" ? (
          <div className="absolute flex flex-col items-center" style={{ left: "40px", top: "88px", width: "423px", gap: "24px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "3px solid rgba(48,94,130,0.2)",
                borderTopColor: "#305E82",
                borderRadius: "50%",
                animation: "rbsspin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes rbsspin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: "20px", lineHeight: "30px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
              Verifying payment…
            </h2>
            <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
              Please wait while we confirm your transaction.
            </p>
          </div>
        ) : (
          <>
            {/* Content frame — x:40 y:88 w:423, column align-center gap 24 */}
            <div className="absolute flex flex-col items-center" style={{ left: "40px", top: "88px", width: "423px", gap: "24px" }}>
              <Image
                src={phase === "success" ? "/icons/noti-success.svg" : "/icons/modal-cancel.svg"}
                alt=""
                width={165}
                height={112}
                style={{ width: "165px", height: "112.5px", objectFit: "contain" }}
              />
              <div className="flex flex-col" style={{ gap: "8px", width: "100%" }}>
                <h2 style={{ fontSize: "20px", lineHeight: "30px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
                  {phase === "success"
                    ? isCardSetup
                      ? "Card Saved"
                      : "Payment Successful"
                    : status === "cancelled"
                    ? "Payment Cancelled"
                    : "Payment Not Verified"}
                </h2>
                <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
                  {phase === "success" ? (
                    isCardSetup ? (
                      "Your card has been saved and auto-renewal is being enabled. It may take a moment to reflect on your subscription."
                    ) : (
                      <>
                        Thank you! Your subscription payment was completed successfully.
                        {reference && (
                          <>
                            <br />
                            Your reference ID is:{" "}
                            <span style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", color: "#121212" }}>
                              {reference}
                            </span>
                          </>
                        )}
                      </>
                    )
                  ) : (
                    errorMsg ?? "We couldn’t verify your payment. If you were charged, it will reflect shortly."
                  )}
                </p>
              </div>
            </div>

            {/* Bottom button — x:40 y:374.5 w:423 h:48 */}
            <button
              type="button"
              onClick={proceed}
              className="absolute flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{
                left: "40px",
                bottom: "40px",
                width: "423px",
                maxWidth: "calc(100% - 80px)",
                height: "48px",
                padding: "8px 24px",
                gap: "8px",
                background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
                border: "1px solid rgba(120,158,187,0.5)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {phase === "success" ? "Okay, proceed" : "Back to Subscription"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
