"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useGetBillingQuery,
  useInitiateSubscriptionMutation,
  useVerifySubscriptionMutation,
} from "@/services/subscriptionApi";
import {
  planFeatures,
  planPriceLabel,
  planPeriodLabel,
  toBillingRowVM,
  type BillingStatusLabel,
} from "@/lib/subscription";
import { unwrapApiError } from "@/services/api";
import type { SubscriptionPlan } from "@/services/types";

const STATUS_STYLES: Record<BillingStatusLabel, { bg: string; color: string }> = {
  Paid: { bg: "#ECFDF3", color: "#027A48" },
  Pending: { bg: "#FFF7E9", color: "#EA651A" },
  Failed: { bg: "#FFECF1", color: "#E30045" },
};

const BILLING_COLS = [
  { key: "ref", label: "Reference ID", width: 246 },
  { key: "date", label: "Date", width: 213 },
  { key: "plan", label: "Plan", width: 265 },
  { key: "amount", label: "Amount", width: 227 },
  { key: "status", label: "Status", width: 137 },
];

function daysLeft(endsAt?: string): number | null {
  if (!endsAt) return null;
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: mySub } = useGetMySubscriptionQuery();
  const { data: billingPage, isLoading: billingLoading } = useGetBillingQuery({ page: 0, size: 20 });
  const [initiate] = useInitiateSubscriptionMutation();
  const [verify] = useVerifySubscriptionMutation();
  // Track which specific plan is being initiated so only its button shows busy.
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Returning from Paystack (?reference=...) → verify, then clean the URL.
  const reference = searchParams?.get("reference") ?? searchParams?.get("trxref");
  useEffect(() => {
    if (!reference) return;
    verify(reference).finally(() => router.replace("/dashboard/subscription"));
  }, [reference, verify, router]);

  const billingRows = (billingPage?.content ?? []).map(toBillingRowVM);
  const currentPlan = plans.find((p) => p.id === mySub?.planId);

  async function handleSubscribe(planId: string) {
    setError(null);
    const plan = plans.find((p) => p.id === planId);
    // Free plans can't go through Paystack (the backend 500s on a ₦0 charge),
    // and there's no free-activation endpoint, so don't fire a doomed request.
    if (plan && plan.price <= 0) {
      setError(`${plan.name} is free — no checkout is required.`);
      return;
    }
    setPendingPlanId(planId);
    try {
      const res = await initiate(planId).unwrap();
      if (res?.authorizationUrl) {
        window.location.assign(res.authorizationUrl); // Paystack hosted checkout
        return; // leave the page; keep the button busy during navigation
      }
      setPendingPlanId(null);
    } catch (e) {
      setError(unwrapApiError(e)?.message ?? "Couldn’t start checkout. Please try again.");
      setPendingPlanId(null);
    }
  }

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <CurrentPlanBanner
        planName={currentPlan?.name ?? (mySub ? "Active plan" : "No active plan")}
        status={mySub?.status}
        endsAt={mySub?.endsAt}
        hasSub={!!mySub}
      />

      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
        Available Plans
      </h2>

      {error && (
        <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", margin: "-8px 0 0" }}>
          {error}
        </p>
      )}

      {plans.length === 0 ? (
        <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "48px", color: "#807E7E", fontSize: "14px" }}>
          No plans available right now.
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {plans.map((p, i) => (
            <PricingCard
              key={p.id}
              plan={p}
              highlighted={i === 1}
              isCurrent={p.id === mySub?.planId}
              busy={pendingPlanId === p.id}
              onSubscribe={() => handleSubscribe(p.id)}
            />
          ))}
        </div>
      )}

      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
        Billing History
      </h2>

      <div style={{ width: "100%", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}>
        <div className="flex" style={{ background: "#FFFFFF", borderBottom: "1px solid #F6F6F6" }}>
          {BILLING_COLS.map((c) => (
            <div
              key={c.key}
              style={{ flex: `1 1 ${c.width}px`, padding: "12px 24px", fontSize: "12px", lineHeight: "20px", fontWeight: 500, color: "#807E7E" }}
            >
              {c.label}
            </div>
          ))}
        </div>

        {billingLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807E7E", fontSize: "14px", background: "#fff" }}>
            Loading billing history…
          </div>
        ) : billingRows.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807E7E", fontSize: "14px", background: "#fff" }}>
            No billing history yet.
          </div>
        ) : (
          billingRows.map((r) => (
            <div key={r.id} className="flex items-center" style={{ borderBottom: "1px solid #F6F6F6", background: "#FFFFFF" }}>
              <div style={{ flex: `1 1 ${BILLING_COLS[0].width}px`, padding: "16px 24px", fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                {r.ref}
              </div>
              <div style={{ flex: `1 1 ${BILLING_COLS[1].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                {r.date}
              </div>
              <div style={{ flex: `1 1 ${BILLING_COLS[2].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                {r.plan}
              </div>
              <div style={{ flex: `1 1 ${BILLING_COLS[3].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
                {r.amount}
              </div>
              <div style={{ flex: `1 1 ${BILLING_COLS[4].width}px`, padding: "16px 24px" }}>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CurrentPlanBanner({
  planName,
  status,
  endsAt,
  hasSub,
}: {
  planName: string;
  status?: string;
  endsAt?: string;
  hasSub: boolean;
}) {
  const left = daysLeft(endsAt);
  const expired = status?.toUpperCase() === "EXPIRED" || (left !== null && left <= 0);
  const statusLabel = !hasSub ? "Inactive" : expired ? "Expired" : "Active";
  const statusBg = !hasSub ? "#807E7E" : expired ? "#CF3801" : "#027A48";

  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "24px", borderRadius: "20px", border: "1px solid #F6F6F6", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" }}
    >
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
          Current Plan
        </span>
        <div className="flex flex-col" style={{ gap: "8px", width: "100%" }}>
          <span style={{ fontSize: "24px", lineHeight: "32px", fontWeight: 600, color: "#FFFFFF" }}>
            {planName}
          </span>
          {hasSub && endsAt && (
            <div className="flex items-center" style={{ gap: "8px" }}>
              <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
                {expired ? "Expired on" : "Renews on"}{" "}
                <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{fmtDate(endsAt)}</span>
              </span>
              {!expired && left !== null && (
                <>
                  <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>·</span>
                  <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
                    {left} days left
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end" style={{ gap: "16px" }}>
        <span
          className="inline-flex items-center justify-center"
          style={{ padding: "2px 12px", background: statusBg, color: "#FFFFFF", borderRadius: "16px", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}
        >
          {statusLabel}
        </span>
        <Link href="/dashboard/subscription/manage" className="flex items-center hover:opacity-90" style={{ gap: "8px" }}>
          <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#FFFFFF" }}>
            Manage Subscription
          </span>
          <Image src="/icons/dash/arrow-right-white.svg" alt="" width={20} height={20} />
        </Link>
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  highlighted,
  isCurrent,
  busy,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  highlighted?: boolean;
  isCurrent?: boolean;
  busy?: boolean;
  onSubscribe: () => void;
}) {
  const textPrimary = highlighted ? "#FFFFFF" : "#121212";
  const textGray = highlighted ? "rgba(255,255,255,0.8)" : "#807E7E";
  const priceNumColor = highlighted ? "#FFFFFF" : "#305E82";
  const priceSuffixColor = highlighted ? "#FFFFFF" : "#121212";
  const features = planFeatures(plan);
  const ctaLabel = isCurrent ? "Current Plan" : plan.price > 0 ? "Subscribe" : "Get Started";

  return (
    <div
      className="flex flex-col"
      style={{
        padding: "24px 36px",
        gap: "40px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        background: highlighted ? "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" : "#FFFFFF",
      }}
    >
      <div className="flex flex-col" style={{ gap: "24px" }}>
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: textGray }}>
              {plan.name}
            </span>
            {isCurrent && (
              <span
                className="inline-flex items-center justify-center"
                style={{ padding: "2px 8px", background: highlighted ? "#FFFFFF" : "#ECFDF3", color: highlighted ? "#305E82" : "#027A48", borderRadius: "16px", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}
              >
                Current
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: "32px", lineHeight: "40px", fontWeight: 700, color: priceNumColor }}>
              {planPriceLabel(plan)}
            </span>
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: priceSuffixColor }}>
              {planPeriodLabel(plan) || "/mo"}
            </span>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #F6F6F6", margin: 0 }} />

        <div className="flex flex-col" style={{ gap: "24px" }}>
          <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: textPrimary }}>
            Benefits include:
          </span>
          <div className="flex flex-col" style={{ gap: "24px" }}>
            {features.length === 0 ? (
              <span style={{ fontSize: "14px", color: textGray }}>
                {plan.listingLimit ? `Up to ${plan.listingLimit} active listings` : plan.description || "—"}
              </span>
            ) : (
              features.map((f) => (
                <div key={f} className="flex items-center" style={{ gap: "8px" }}>
                  <Image
                    src={highlighted ? "/icons/dash/check-circle-current.svg" : "/icons/dash/check-circle.svg"}
                    alt=""
                    width={20}
                    height={20}
                  />
                  <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: textGray }}>{f}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubscribe}
        disabled={isCurrent || busy}
        className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
        style={{
          padding: "8px 24px",
          height: "40px",
          borderRadius: "12px",
          background: highlighted ? "#FFAE00" : "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
          border: highlighted ? "none" : "1px solid rgba(120,158,187,0.5)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: isCurrent || busy ? "not-allowed" : "pointer",
          opacity: isCurrent || busy ? 0.6 : 1,
        }}
      >
        {busy ? "Redirecting…" : ctaLabel}
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: BillingStatusLabel }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ padding: "2px 8px", background: s.bg, color: s.color, borderRadius: "16px", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}
    >
      {status}
    </span>
  );
}
