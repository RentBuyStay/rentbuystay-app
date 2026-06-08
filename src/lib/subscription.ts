import type { BillingTransaction, SubscriptionPlan } from "@/services/types";
import { formatPrice } from "./property";

export type BillingStatusLabel = "Paid" | "Pending" | "Failed";

export type BillingRowVM = {
  id: string;
  ref: string;
  plan: string;
  amount: string;
  date: string;
  status: BillingStatusLabel;
};

export function planFeatures(plan: SubscriptionPlan): string[] {
  if (!plan.features) return [];
  // Backend stores features as a single string; support newline / comma / semicolon.
  return plan.features
    .split(/\r?\n|,|;/)
    .map((f) => f.trim())
    .filter(Boolean);
}

export function planPriceLabel(plan: SubscriptionPlan): string {
  if (!plan.price) return "₦0";
  return formatPrice(plan.price);
}

export function planPeriodLabel(plan: SubscriptionPlan): string {
  const d = plan.durationDays;
  if (!d) return "";
  if (d % 365 === 0) return d === 365 ? "/yr" : `/${d / 365} yrs`;
  if (d % 30 === 0) return d === 30 ? "/mo" : `/${d / 30} mo`;
  return `/${d} days`;
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function billingStatus(s: string): BillingStatusLabel {
  const v = s?.toUpperCase();
  if (v === "SUCCESS" || v === "PAID" || v === "COMPLETED" || v === "ACTIVE") return "Paid";
  if (v === "FAILED" || v === "CANCELLED" || v === "REVERSED") return "Failed";
  return "Pending";
}

export function toBillingRowVM(t: BillingTransaction): BillingRowVM {
  return {
    id: t.id,
    ref: t.referenceId ? `#${t.referenceId}` : "—",
    plan: t.planName || "—",
    amount: formatPrice(t.amount ?? 0),
    date: fmtDate(t.createdAt),
    status: billingStatus(t.status),
  };
}
