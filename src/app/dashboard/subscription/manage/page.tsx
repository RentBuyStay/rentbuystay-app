"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
} from "@/services/subscriptionApi";
import { useGetMeQuery } from "@/services/meApi";
import { planFeatures, planPriceLabel, planPeriodLabel } from "@/lib/subscription";

function durationLabel(days?: number): string {
  if (!days) return "—";
  if (days % 365 === 0) return days === 365 ? "Yearly" : `${days / 365} years`;
  if (days % 30 === 0) return days === 30 ? "Monthly" : `${days / 30} months`;
  return `${days} days`;
}

function longDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const { data: mySub, isLoading } = useGetMySubscriptionQuery();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: me } = useGetMeQuery();

  const plan = plans.find((p) => p.id === mySub?.planId);
  const expired = mySub?.status?.toUpperCase() === "EXPIRED";

  // Auto-renewal toggle is local for now (no backend mutation yet); seeded from the subscription.
  const [autoRenewOverride, setAutoRenewOverride] = useState<boolean | null>(null);
  const autoRenew = autoRenewOverride ?? !!mySub?.autoRenew;
  const cardName = [me?.profile?.firstName, me?.profile?.lastName].filter(Boolean).join(" ") || me?.organization?.name || "—";

  const Back = (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center self-start hover:opacity-80"
      style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
      <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
    </button>
  );

  const Heading = (
    <h1 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
      Manage Subscription
    </h1>
  );

  // No active subscription → empty state with a path to plans.
  if (!isLoading && !mySub) {
    return (
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {Back}
        {Heading}
        <div
          className="bg-white flex flex-col items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px", gap: "16px" }}
        >
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#121212" }}>No active subscription</span>
          <span style={{ fontSize: "14px", color: "#807E7E" }}>Choose a plan to start listing more properties.</span>
          <button
            type="button"
            onClick={() => router.push("/dashboard/subscription")}
            className="flex items-center justify-center text-white hover:opacity-90"
            style={{ marginTop: "8px", height: "44px", padding: "8px 24px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const badge = expired
    ? { label: "Expired", bg: "#CF3801", color: "#FFFFFF" }
    : { label: "Current Plan", bg: "#305E82", color: "#FFFFFF" };
  const features = plan ? planFeatures(plan) : [];

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      {Back}
      {Heading}

      {isLoading ? (
        <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px", color: "#807E7E", fontSize: "14px" }}>
          Loading subscription…
        </div>
      ) : (
        <div className="flex items-start" style={{ gap: "16px" }}>
          <div
            className="flex flex-col shrink-0"
            style={{ width: "346px", padding: "24px 36px", gap: "40px", border: "1px solid #F6F6F6", borderRadius: "20px", background: "#FFFFFF" }}
          >
            <div className="flex flex-col" style={{ gap: "24px" }}>
              <div className="flex flex-col" style={{ gap: "8px" }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#807E7E" }}>
                    {plan?.name ?? "Your plan"}
                  </span>
                  <span
                    className="inline-flex items-center justify-center"
                    style={{ padding: "2px 8px", background: badge.bg, color: badge.color, borderRadius: "16px", fontSize: "10px", lineHeight: "18px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ fontSize: "40px", lineHeight: "48px", fontWeight: 600, color: "#305E82" }}>
                    {plan ? planPriceLabel(plan) : "—"}
                  </span>
                  <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
                    {plan ? planPeriodLabel(plan) || "/mo" : ""}
                  </span>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #F6F6F6", margin: 0 }} />

              <div className="flex flex-col" style={{ gap: "24px" }}>
                <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
                  Benefits include:
                </span>
                <div className="flex flex-col" style={{ gap: "24px" }}>
                  {(features.length ? features : plan?.listingLimit ? [`Up to ${plan.listingLimit} active listings`] : []).map((f) => (
                    <div key={f} className="flex items-center" style={{ gap: "8px" }}>
                      <Image src="/icons/dash/check-circle-current.svg" alt="" width={20} height={20} />
                      <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard/subscription")}
              className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{ padding: "8px 24px", height: "40px", borderRadius: "12px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
            >
              {expired ? "Renew Subscription" : "Upgrade Subscription"}
            </button>
          </div>

          <div className="flex flex-col" style={{ marginLeft: "80px", flex: 1, gap: "40px", paddingTop: "28px" }}>
            <InfoBlock label="Payment Method">
              <div className="flex flex-col" style={{ gap: "4px" }}>
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>—</span>
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>{cardName}</span>
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>—</span>
              </div>
            </InfoBlock>

            <InfoBlock label={expired ? "Expired On" : "Next Billing Cycle"}>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>
                {longDate(mySub?.endsAt)}
              </span>
            </InfoBlock>

            <InfoBlock label="Duration">
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>
                {durationLabel(plan?.durationDays)}
              </span>
            </InfoBlock>

            <div className="flex items-center justify-between" style={{ width: "100%", maxWidth: "440px" }}>
              <InfoBlock label="Auto Renewal">
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>
                  Turn On Auto Renewal
                </span>
              </InfoBlock>
              <button
                type="button"
                role="switch"
                aria-checked={autoRenew}
                aria-label="Toggle auto renewal"
                onClick={() => setAutoRenewOverride(!autoRenew)}
                className="shrink-0 hover:opacity-80"
              >
                <Image
                  src={autoRenew ? "/icons/dash/check-circle-current.svg" : "/icons/dash/check-circle.svg"}
                  alt=""
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>{label}</span>
      {children}
    </div>
  );
}
