"use client";

import Image from "next/image";
import Link from "next/link";

type Plan = {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  ctaOrange?: boolean;
  badge?: { label: string; bg: string; color: string };
  href: string;
};

const PLANS: Plan[] = [
  {
    name: "Starter Plan",
    price: "₦0",
    features: ["Up To 5 Active Property Listings", "Basic Analytics", "Featured Listings", "Priority Support"],
    ctaLabel: "Get Started",
    href: "/dashboard/subscription/manage",
  },
  {
    name: "RBS Pro",
    price: "₦5,000",
    features: ["Up To 15 Active Property Listings", "Basic Analytics", "3 Featured Listings", "Priority Support"],
    highlighted: true,
    ctaLabel: "View Details",
    ctaOrange: true,
    badge: { label: "Expired", bg: "#CF3801", color: "#FFFFFF" },
    href: "/dashboard/subscription/manage?expired=1",
  },
  {
    name: "RBS Enterprise",
    price: "₦25,000",
    features: ["Up To 5 Active Property Listings", "Basic Analytics", "Featured Listings", "Priority Support"],
    ctaLabel: "Get Started",
    href: "/dashboard/subscription/manage",
  },
];

type BillingRow = {
  ref: string;
  date: string;
  plan: string;
  amount: string;
  status: "Paid" | "Failed";
};

const BILLING_ROWS: BillingRow[] = [
  { ref: "#TXN-2026-042", date: "12 Apr 2026", plan: "Pro", amount: "₦15,000.00", status: "Paid" },
  { ref: "#TXN-2026-043", date: "12 Mar 2026", plan: "Pro", amount: "₦15,000.00", status: "Paid" },
  { ref: "#TXN-2026-044", date: "12 Mar 2026", plan: "Pro", amount: "₦15,000.00", status: "Failed" },
  { ref: "#TXN-2026-045", date: "10 Feb 2026", plan: "Starter", amount: "₦0.00", status: "Paid" },
];

const STATUS_STYLES: Record<BillingRow["status"], { bg: string; color: string }> = {
  Paid: { bg: "#ECFDF3", color: "#027A48" },
  Failed: { bg: "#FFECF1", color: "#E30045" },
};

const BILLING_COLS = [
  { key: "ref", label: "Reference ID", width: 246 },
  { key: "date", label: "Date", width: 213 },
  { key: "plan", label: "Plan", width: 265 },
  { key: "amount", label: "Amount", width: 227 },
  { key: "status", label: "Status", width: 137 },
];

export default function SubscriptionPage() {
  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <CurrentPlanBanner />


      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
        Available Plans
      </h2>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        {PLANS.map((p) => (
          <PricingCard key={p.name} plan={p} />
        ))}
      </div>


      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
        Billing History
      </h2>


      <div style={{ width: "100%", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}>

        <div className="flex" style={{ background: "#FFFFFF", borderBottom: "1px solid #F6F6F6" }}>
          {BILLING_COLS.map((c) => (
            <div
              key={c.key}
              style={{
                flex: `1 1 ${c.width}px`,
                padding: "12px 24px",
                fontSize: "12px",
                lineHeight: "20px",
                fontWeight: 500,
                color: "#807E7E",
              }}
            >
              {c.label}
            </div>
          ))}
        </div>


        {BILLING_ROWS.map((r) => (
          <div
            key={r.ref + r.date}
            className="flex items-center"
            style={{ borderBottom: "1px solid #F6F6F6", background: "#FFFFFF" }}
          >
            <div
              style={{
                flex: `1 1 ${BILLING_COLS[0].width}px`,
                padding: "16px 24px",
                fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "14px",
                lineHeight: "20px",
                color: "#121212",
              }}
            >
              {r.ref}
            </div>
            <div
              style={{
                flex: `1 1 ${BILLING_COLS[1].width}px`,
                padding: "16px 24px",
                fontSize: "14px",
                lineHeight: "20px",
                color: "#121212",
              }}
            >
              {r.date}
            </div>
            <div
              style={{
                flex: `1 1 ${BILLING_COLS[2].width}px`,
                padding: "16px 24px",
                fontSize: "14px",
                lineHeight: "20px",
                color: "#121212",
              }}
            >
              {r.plan}
            </div>
            <div
              style={{
                flex: `1 1 ${BILLING_COLS[3].width}px`,
                padding: "16px 24px",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 500,
                color: "#121212",
              }}
            >
              {r.amount}
            </div>
            <div
              style={{ flex: `1 1 ${BILLING_COLS[4].width}px`, padding: "16px 24px" }}
            >
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function CurrentPlanBanner() {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid #F6F6F6",
        background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
      }}
    >

      <div className="flex flex-col" style={{ gap: "16px" }}>
        <span
          style={{
            fontSize: "12px",
            lineHeight: "24px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Current Plan
        </span>
        <div className="flex flex-col" style={{ gap: "8px", width: "100%" }}>
          <span
            style={{
              fontSize: "24px",
              lineHeight: "32px",
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            RBS Pro
          </span>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
              Renews on{" "}
              <span style={{ fontWeight: 600, color: "#FFFFFF" }}>15 May 2026</span>
            </span>
            <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>·</span>
            <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
              32 days left
            </span>
          </div>
        </div>
      </div>


      <div className="flex flex-col items-end" style={{ gap: "16px" }}>
        <span
          className="inline-flex items-center justify-center"
          style={{
            padding: "2px 12px",
            background: "#CF3801",
            color: "#FFFFFF",
            borderRadius: "16px",
            fontSize: "12px",
            lineHeight: "18px",
            fontWeight: 500,
          }}
        >
          Expired
        </span>
        <Link
          href="/dashboard/subscription/manage?expired=1"
          className="flex items-center hover:opacity-90"
          style={{ gap: "8px" }}
        >
          <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#FFFFFF" }}>
            Manage Subscription
          </span>
          <Image src="/icons/dash/arrow-right-white.svg" alt="" width={20} height={20} />
        </Link>
      </div>
    </div>
  );
}


function PricingCard({ plan }: { plan: Plan }) {
  const highlighted = plan.highlighted;
  const textPrimary = highlighted ? "#FFFFFF" : "#121212";
  const textGray = highlighted ? "rgba(255,255,255,0.8)" : "#807E7E";
  const priceNumColor = highlighted ? "#FFFFFF" : "#305E82";
  const priceSuffixColor = highlighted ? "#FFFFFF" : "#121212";

  return (
    <div
      className="flex flex-col"
      style={{
        padding: "24px 36px",
        gap: "40px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        background: highlighted
          ? "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)"
          : "#FFFFFF",
      }}
    >

      <div className="flex flex-col" style={{ gap: "24px" }}>
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: textGray }}>
              {plan.name}
            </span>
            {plan.badge && (
              <span
                className="inline-flex items-center justify-center"
                style={{
                  padding: "2px 8px",
                  background: plan.badge.bg,
                  color: plan.badge.color,
                  borderRadius: "16px",
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 500,
                }}
              >
                {plan.badge.label}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontSize: "32px",
                lineHeight: "40px",
                fontWeight: 700,
                color: priceNumColor,
              }}
            >
              {plan.price}
            </span>
            <span
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 400,
                color: priceSuffixColor,
              }}
            >
              /month
            </span>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #F6F6F6", margin: 0 }} />

        <div className="flex flex-col" style={{ gap: "24px" }}>
          <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: textPrimary }}>
            Benefits include:
          </span>
          <div className="flex flex-col" style={{ gap: "24px" }}>
            {plan.features.map((f) => (
              <div key={f} className="flex items-center" style={{ gap: "8px" }}>
                <Image
                  src={highlighted ? "/icons/dash/check-circle-current.svg" : "/icons/dash/check-circle.svg"}
                  alt=""
                  width={20}
                  height={20}
                />
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: textGray }}>
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>


      <Link
        href={plan.href}
        className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
        style={{
          padding: "8px 24px",
          height: "40px",
          borderRadius: "12px",
          background: plan.ctaOrange
            ? "#FFAE00"
            : "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
          border: plan.ctaOrange
            ? "none"
            : "1px solid rgba(120,158,187,0.5)",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  );
}


function StatusBadge({ status }: { status: BillingRow["status"] }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        padding: "2px 8px",
        background: s.bg,
        color: s.color,
        borderRadius: "16px",
        fontSize: "12px",
        lineHeight: "18px",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}
