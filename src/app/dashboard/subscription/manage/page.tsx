"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useToggleAutoRenewMutation,
} from "@/services/subscriptionApi";
import { useGetMeQuery } from "@/services/meApi";
import { planFeatures, planPriceLabel, planPeriodLabel } from "@/lib/subscription";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";

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
  const { toast } = useToast();
  const [toggleAutoRenew, { isLoading: togglingAutoRenew }] = useToggleAutoRenewMutation();

  const plan = plans.find((p) => p.id === mySub?.planId);
  const expired = mySub?.status?.toUpperCase() === "EXPIRED";

  // Optimistic display while the PATCH is in flight; otherwise reflect the server value.
  const [autoRenewOverride, setAutoRenewOverride] = useState<boolean | null>(null);
  const autoRenew = autoRenewOverride ?? !!mySub?.autoRenew;
  const cardName = [me?.profile?.firstName, me?.profile?.lastName].filter(Boolean).join(" ") || me?.organization?.name || "—";

  async function handleToggleAutoRenew() {
    const next = !autoRenew;
    setAutoRenewOverride(next);
    try {
      const res = await toggleAutoRenew(next).unwrap();
      // Turning it on without a saved card → redirect to add one.
      if (res?.authorizationUrl) {
        window.location.assign(res.authorizationUrl);
        return;
      }
      toast(next ? "Auto-renewal turned on." : "Auto-renewal turned off.", "success");
      setAutoRenewOverride(null); // fall back to the refreshed server value
    } catch (e) {
      setAutoRenewOverride(null);
      toast(unwrapApiError(e)?.message ?? "Couldn’t update auto-renewal.", "error");
    }
  }

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
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-20">
          <div
            className="flex flex-col shrink-0 w-full lg:w-[346px] justify-between"
            style={{ padding: "24px 36px", gap: "40px", border: "1px solid #F6F6F6", borderRadius: "20px", background: "#FFFFFF" }}
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
                      <Image src="/icons/dash/check-circle-blue.svg" alt="" width={20} height={20} />
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
              style={{ padding: "8px 24px", height: "48px", borderRadius: "12px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
            >
              {expired ? "Renew Subscription" : "Upgrade Subscription"}
            </button>
          </div>

          <div className="flex flex-col w-full lg:flex-1 lg:pt-7" style={{ maxWidth: "662px", gap: "40px" }}>
            <InfoBlock label="Payment Method">
              {mySub?.cardBrand && mySub?.last4 ? (
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000", textTransform: "capitalize" }}>
                    {mySub.cardBrand} •••• {mySub.last4}
                  </span>
                  <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>{cardName}</span>
                  {mySub.cardExpiry && (
                    <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>{mySub.cardExpiry}</span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>No card on file</span>
              )}
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

            <div className="flex items-center justify-between" style={{ width: "100%" }}>
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
                onClick={handleToggleAutoRenew}
                disabled={togglingAutoRenew}
                className="shrink-0 hover:opacity-80 disabled:opacity-60"
              >
                <Image
                  src={autoRenew ? "/icons/dash/check-box-on.svg" : "/icons/dash/check-box-off.svg"}
                  alt=""
                  width={32}
                  height={32}
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
