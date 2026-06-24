"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useGetBillingQuery,
  useGetPaymentProvidersQuery,
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

import { useGetMeQuery } from "@/services/meApi";
import { useToast } from "@/components/Toast";

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const { data: me } = useGetMeQuery();

  useEffect(() => {
    if (me?.userType === "PROPERTY_SEEKER") {
      toast("You don't have access to subscriptions.", "error");
      router.replace("/dashboard");
    }
  }, [me, router, toast]);

  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const { data: mySub } = useGetMySubscriptionQuery();
  const { data: billingPage, isLoading: billingLoading } = useGetBillingQuery({ page: 0, size: 20 });
  const { data: providers = [], isLoading: providersLoading } = useGetPaymentProvidersQuery();
  const [initiate] = useInitiateSubscriptionMutation();
  const [verify] = useVerifySubscriptionMutation();
  // Track which specific plan is being initiated so only its button shows busy.
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProviderModal, setShowProviderModal] = useState<boolean>(false);
  const [selectedPlanForProvider, setSelectedPlanForProvider] = useState<string | null>(null);

  // Returning from Paystack (?reference=...)
  // We rely on the Paystack webhook (POST) to fulfill the subscription on the backend.
  const reference = searchParams?.get("reference") ?? searchParams?.get("trxref");
  useEffect(() => {
    if (!reference) return;
    toast("Processing payment... Please wait for confirmation.", "success");
    router.replace("/dashboard/subscription");
  }, [reference, router, toast]);

  const billingRows = (billingPage?.content ?? []).map(toBillingRowVM);
  const currentPlan = plans.find((p) => p.id === mySub?.planId);

  async function handleSubscribe(planId: string) {
    setError(null);
    const plan = plans.find((p) => p.id === planId);
    if (plan && plan.price <= 0) {
      setError(`${plan.name} is free — it’s activated automatically once your account is verified.`);
      return;
    }
    
    if (providers.length > 1) {
      setSelectedPlanForProvider(planId);
      setShowProviderModal(true);
      return;
    }
    
    const provider = providers.length === 1 ? providers[0] : undefined;
    await proceedWithSubscribe(planId, provider);
  }

  async function proceedWithSubscribe(planId: string, provider?: string) {
    setShowProviderModal(false);
    setSelectedPlanForProvider(null);
    setPendingPlanId(planId);
    try {
      const res = await initiate({ planId, provider }).unwrap();
      if (res?.authorizationUrl) {
        window.location.assign(res.authorizationUrl);
        return;
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

      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#121212]">Choose Payment Method</h3>
              <button onClick={() => setShowProviderModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-sm text-gray-500">Select how you would like to securely pay for your subscription.</p>
            <div className="flex flex-col gap-3">
              {providers.map(p => (
                <button
                  key={p}
                  onClick={() => selectedPlanForProvider && proceedWithSubscribe(selectedPlanForProvider, p)}
                  className="flex items-center justify-between px-4 py-4 rounded-xl border border-gray-200 hover:border-[#305E82] hover:bg-[#F0F6FA] transition-all"
                >
                  <span className="font-medium text-[#121212] capitalize">{p.toLowerCase()}</span>
                  <span className="text-xs text-gray-400">Pay securely</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "24px" }}>
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

      <div className="hidden md:block" style={{ width: "100%", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}>
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

      {/* Mobile: billing cards */}
      <div className="md:hidden flex flex-col" style={{ gap: "12px" }}>
        {billingLoading ? (
          <div className="bg-white text-center" style={{ border: "1px solid #F6F6F6", borderRadius: "16px", padding: "40px", fontSize: "14px", color: "#807E7E" }}>Loading billing history…</div>
        ) : billingRows.length === 0 ? (
          <div className="bg-white text-center" style={{ border: "1px solid #F6F6F6", borderRadius: "16px", padding: "40px", fontSize: "14px", color: "#807E7E" }}>No billing history yet.</div>
        ) : (
          billingRows.map((r) => (
            <div key={r.id} className="bg-white flex flex-col" style={{ border: "1px solid #F6F6F6", borderRadius: "16px", padding: "16px", gap: "12px" }}>
              <div className="flex items-start justify-between" style={{ gap: "12px" }}>
                <span className="min-w-0 truncate" style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "13px", color: "#121212" }}>
                  {r.ref}
                </span>
                <StatusBadge status={r.status} />
              </div>
              <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>{r.plan}</span>
              <div className="flex items-center justify-between" style={{ paddingTop: "12px", borderTop: "1px solid #F6F6F6", gap: "12px" }}>
                <span style={{ fontSize: "16px", lineHeight: "20px", fontWeight: 600, color: "#305E82" }}>{r.amount}</span>
                <span style={{ fontSize: "12px", color: "#807E7E" }}>{r.date}</span>
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
      className="flex items-start justify-between"
      style={{ padding: "24px", borderRadius: "20px", border: "1px solid #F6F6F6", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", gap: "16px" }}
    >
      <div className="flex flex-col min-w-0" style={{ gap: "16px" }}>
        <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
          Current Plan
        </span>
        <div className="flex flex-col" style={{ gap: "8px", width: "100%" }}>
          <span style={{ fontSize: "24px", lineHeight: "32px", fontWeight: 600, color: "#FFFFFF" }}>
            {planName}
          </span>
          {hasSub && endsAt && (
            <div className="flex items-center flex-wrap" style={{ gap: "8px" }}>
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
        {/* Manage Subscription — in the left column on mobile (Figma) */}
        <Link href="/dashboard/subscription/manage" className="md:hidden flex items-center hover:opacity-90" style={{ gap: "8px" }}>
          <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#FFFFFF" }}>
            Manage Subscription
          </span>
          <Image src="/icons/dash/arrow-right-white.svg" alt="" width={20} height={20} />
        </Link>
      </div>

      <div className="flex flex-col items-end shrink-0" style={{ gap: "16px" }}>
        <span
          className="inline-flex items-center justify-center"
          style={{ padding: "2px 12px", background: statusBg, color: "#FFFFFF", borderRadius: "16px", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}
        >
          {statusLabel}
        </span>
        {/* Manage Subscription — on the right on desktop */}
        <Link href="/dashboard/subscription/manage" className="hidden md:flex items-center hover:opacity-90" style={{ gap: "8px" }}>
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
  const ctaLabel = plan.price > 0 ? "Subscribe" : "Get Started";
  const ctaStyle: React.CSSProperties = {
    padding: "8px 24px", height: "40px", borderRadius: "12px",
    background: highlighted ? "#FFAE00" : "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
    border: highlighted ? "none" : "1px solid rgba(120,158,187,0.5)",
    fontSize: "14px", fontWeight: 500,
  };

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

      {isCurrent ? (
        <Link href="/dashboard/subscription/manage" className="flex items-center justify-center text-white hover:opacity-90 transition-opacity" style={ctaStyle}>
          View Details
        </Link>
      ) : (
        <button
          type="button"
          onClick={onSubscribe}
          disabled={busy}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{ ...ctaStyle, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Redirecting…" : ctaLabel}
        </button>
      )}
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
