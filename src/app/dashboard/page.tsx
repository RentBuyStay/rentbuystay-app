"use client";

import Image from "next/image";
import { PropertyCardImage } from "@/components/PropertyGallery";
import { pageTotal } from "@/services/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRole, type AccountRole } from "@/lib/role";
import SeekerPropertyCard from "@/components/SeekerPropertyCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceDot,
} from "recharts";
import StartVerificationCTA from "@/components/StartVerificationCTA";
import { useGetMeQuery } from "@/services/meApi";
import {
  useGetMyPropertiesQuery,
  useGetActivePropertiesQuery,
  useGetSavedPropertiesQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from "@/services/propertyApi";
import { useGetMyInspectionsQuery } from "@/services/inspectionApi";
import { useGetConversationsQuery, useGetMessagesQuery } from "@/services/conversationApi";
import {
  useGetDashboardMetricsQuery,
  useGetDashboardDailyQuery,
  type DashboardMetric,
} from "@/services/analyticsApi";

import { toSeekerListing, toPropertyVM, type PropertyVM, type PropertyStatusLabel } from "@/lib/property";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";

type Metric = {
  label: string;
  value: string;
  trend?: { prefix: string; suffix: string; direction: "up" | "down" };
  icon: string;
};

// Pick a tile icon from the metric label (the backend sends free-text labels like
// "Total Views" / "Listed properties" / "New Inquiries").
const METRIC_ICONS: Array<[RegExp, string]> = [
  [/view/i, "/icons/dash/metric-eye.svg"],
  [/agent/i, "/icons/dash/metric-people.svg"],
  [/appointment/i, "/icons/dash/nav-calendar.svg"],
  [/inquir|lead|conversation|message/i, "/icons/dash/metric-messages.svg"],
  [/revenue|earn/i, "/icons/dash/metric-dollar.svg"],
  [/listing|listed|propert/i, "/icons/dash/metric-home.svg"],
];
function iconForMetric(label: string, value: string): string {
  for (const [re, icon] of METRIC_ICONS) if (re.test(label)) return icon;
  if (value.includes("₦")) return "/icons/dash/metric-dollar.svg";
  return "/icons/dash/metric-home.svg";
}

// Map a backend dashboard card to a tile. `delta` (e.g. "+13% this week", "-5%")
// drives the trend line: leading "-" → down/red, otherwise up/green. No delta →
// no trend line at all.
function cardToMetric(c: DashboardMetric): Metric {
  const delta = c.delta?.trim();
  return {
    label: c.label,
    value: c.value,
    icon: iconForMetric(c.label, c.value),
    trend: delta
      ? { prefix: delta, suffix: "", direction: delta.startsWith("-") ? "down" : "up" }
      : undefined,
  };
}

const VERIFIED_METRICS: Metric[] = [
  { label: "Total Listings", value: "3", trend: { prefix: "+1", suffix: "this month", direction: "up" }, icon: "/icons/dash/metric-home.svg" },
  { label: "Total Views", value: "1,385", trend: { prefix: "+13%", suffix: "this week", direction: "up" }, icon: "/icons/dash/metric-eye.svg" },
  { label: "New Inquiries", value: "16", trend: { prefix: "5%", suffix: "this week", direction: "down" }, icon: "/icons/dash/metric-messages.svg" },
  { label: "Revenue", value: "₦840k", trend: { prefix: "+6.4%", suffix: "vs last month", direction: "up" }, icon: "/icons/dash/metric-dollar.svg" },
];

const UNVERIFIED_METRICS: Metric[] = VERIFIED_METRICS.map((m) => ({
  ...m,
  value: m.label === "Revenue" ? "₦0" : "0",
}));

const AGENT_METRICS: Metric[] = [
  { label: "Total Listings", value: "0", trend: { prefix: "Listings you manage", suffix: "", direction: "up" }, icon: "/icons/dash/metric-home.svg" },
  { label: "Total Leads", value: "0", trend: { prefix: "Active conversations", suffix: "", direction: "up" }, icon: "/icons/dash/metric-people.svg" },
  { label: "Revenue", value: "₦0", trend: { prefix: "Coming soon", suffix: "", direction: "up" }, icon: "/icons/dash/metric-dollar.svg" },
  { label: "Total Views", value: "0", trend: { prefix: "Across your listings", suffix: "", direction: "up" }, icon: "/icons/dash/metric-eye.svg" },
];

// Agency dashboard mirrors Figma 677:62236 (unverified) / 677:62377 (verified):
// six tiles in a 3x2 grid (Listings / Views / Revenue, then Agents / Appointments / Inquiries).
const AGENCY_METRICS_VERIFIED: Metric[] = [
  { label: "Total Listings", value: "27", trend: { prefix: "+3", suffix: "this month", direction: "up" }, icon: "/icons/dash/metric-home.svg" },
  { label: "Total Views", value: "1,385", trend: { prefix: "+13%", suffix: "this week", direction: "up" }, icon: "/icons/dash/metric-eye.svg" },
  { label: "Revenue", value: "₦840k", trend: { prefix: "+6.4%", suffix: "vs last month", direction: "up" }, icon: "/icons/dash/metric-dollar.svg" },
  { label: "Total Agents", value: "11", trend: { prefix: "+2", suffix: "this month", direction: "up" }, icon: "/icons/dash/metric-people.svg" },
  { label: "Upcoming Appointments", value: "8", trend: { prefix: "+7%", suffix: "this week", direction: "up" }, icon: "/icons/dash/nav-calendar.svg" },
  { label: "New Inquiries", value: "16", trend: { prefix: "5%", suffix: "this week", direction: "down" }, icon: "/icons/dash/metric-messages.svg" },
];

// Same labels + icons as the verified state — Figma renders zeros in the
// unverified state while keeping the trend lines visible.
const AGENCY_METRICS_UNVERIFIED: Metric[] = AGENCY_METRICS_VERIFIED.map((m) => ({
  ...m,
  value: m.label === "Revenue" ? "₦0" : "0",
}));

/**
 * The demo verification flow (VerifyPhoneModal) sets this localStorage flag on
 * success. Honour it across ALL roles so the dashboard flips to the verified
 * state immediately after verifying — same behaviour the agency already had.
 */
function useLocalVerified(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setV(localStorage.getItem("rbs-dashboard-verified") === "1");
    function onStorage(e: StorageEvent) {
      if (e.key === "rbs-dashboard-verified") setV(e.newValue === "1");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return v;
}

export default function DashboardHome() {
  const [role, setRoleState] = useState<AccountRole | null>(null);

  useEffect(() => {
    // One-time read of the persisted role after mount (hydration-safe).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoleState(getRole());
  }, []);

  if (!role) return null;
  if (role === "Property Seeker") return <SeekerDashboardPlaceholder />;
  if (role === "Real Estate Agent") return <AgentDashboardHome />;
  if (role === "Real Estate Agency or Developer") return <AgencyDashboardHome />;
  return <OwnerDashboardHome />;
}

function AgencyDashboardHome() {
  const { data: me } = useGetMeQuery();
  // Honour real KYC status (me.verification.complete) or the demo verification
  // flag — shared across all roles so the dashboard flips right after verifying.
  const localVerified = useLocalVerified();
  const verified = Boolean(me?.verification?.complete) || localVerified;

  // GET /properties/analytics/mine now returns the agency's six cards ready to
  // render (listings, views, revenue, agents, appointments, inquiries) — values,
  // deltas and labels all resolved server-side for the caller's role.
  const { data: dash } = useGetDashboardMetricsQuery(undefined, { skip: !verified });
  const { data: daily } = useGetDashboardDailyQuery(undefined, { skip: !verified });

  const metrics: Metric[] =
    verified && dash?.cards.length ? dash.cards.map(cardToMetric) : AGENCY_METRICS_UNVERIFIED;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "16px" }}>
        {metrics.map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>
      {verified ? <VerifiedDashboard daily={daily} /> : <UnverifiedDashboard />}
    </div>
  );
}

function AgentDashboardHome() {
  const { data: me } = useGetMeQuery();

  // Verification gating is driven by the real KYC status from GET /me.
  const localVerified = useLocalVerified();
  const verified = Boolean(me?.verification?.complete) || localVerified;

  // analytics/mine resolves the agent's own cards (listings, views, inquiries,
  // earnings, appointments); analytics/mine/daily gives the role-aware daily
  // view breakdown behind the chart.
  const { data: dash } = useGetDashboardMetricsQuery(undefined, { skip: !verified });
  const { data: daily } = useGetDashboardDailyQuery(undefined, { skip: !verified });

  const metrics: Metric[] =
    verified && dash?.cards.length ? dash.cards.map(cardToMetric) : AGENT_METRICS;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "16px" }}>
        {metrics.map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>
      {verified ? <VerifiedDashboard daily={daily} /> : <UnverifiedDashboard />}
    </div>
  );
}

type SeekerMetric = {
  icon: string;
  label: string;
  value: string;
  trendPrefix?: string;
  trendSuffix?: string;
  direction?: "up" | "down";
};

function SeekerDashboardPlaceholder() {
  const { data: propPage, isLoading } = useGetActivePropertiesQuery({ page: 0, size: 6 });
  const { data: savedPage } = useGetSavedPropertiesQuery({ page: 0, size: 100 });
  const { data: inspections } = useGetMyInspectionsQuery();
  const { data: conversations } = useGetConversationsQuery();
  const [saveProperty] = useSavePropertyMutation();
  const [unsaveProperty] = useUnsavePropertyMutation();
  const { toast } = useToast();

  const savedIds = new Set((savedPage?.content ?? []).map((p) => p.id));
  const recommended = (propPage?.content ?? []).map(toSeekerListing);
  const upcoming = (inspections ?? []).filter(
    (i) => i.status === "PENDING" || i.status === "CONFIRMED"
  ).length;
  const unreadMessages = (conversations ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  // Real counts; no fabricated trend deltas.
  const metrics: SeekerMetric[] = [
    { icon: "/icons/dash/nav-saved.svg", label: "Saved Properties", value: String(pageTotal(savedPage)) },
    { icon: "/icons/dash/nav-messages.svg", label: "Unread Messages", value: String(unreadMessages) },
    { icon: "/icons/dash/nav-calendar.svg", label: "Upcoming Appointments", value: String(upcoming) },
  ];

  async function toggleSave(id: string, currentlySaved: boolean) {
    try {
      if (currentlySaved) {
        await unsaveProperty(id).unwrap();
        toast("Removed from saved", "info");
      } else {
        await saveProperty(id).unwrap();
        toast("Saved to your list", "success");
      }
    } catch (e) {
      toast(unwrapApiError(e)?.message ?? "Couldn’t update your saved list.", "error");
    }
  }

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "16px" }}>
        {metrics.map((m) => (
          <SeekerMetricTile key={m.label} metric={m} />
        ))}
      </div>

      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h2 style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>
              Recommended For You
            </h2>
            <p style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>
              Based on your search history and preferences
            </p>
          </div>
          <Link
            href="/dashboard/browse"
            className="flex items-center hover:opacity-80"
            style={{ gap: "8px", fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}
          >
            Browse all
            <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px", color: "#807E7E", fontSize: "14px" }}>
            Loading recommendations…
          </div>
        ) : recommended.length === 0 ? (
          <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px", color: "#807E7E", fontSize: "14px" }}>
            No recommendations yet. Browse properties to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "24px 16px" }}>
            {recommended.map((listing) => (
              <SeekerPropertyCard
                key={listing.id}
                listing={listing}
                saved={savedIds.has(listing.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SeekerMetricTile({ metric }: { metric: SeekerMetric }) {
  const up = metric.direction === "up";
  return (
    <div
      className="bg-white flex flex-col"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        padding: "16px 24px",
        gap: "16px",
      }}
    >
      <div className="flex items-center" style={{ gap: "8px" }}>
        <Image src={metric.icon} alt="" width={16} height={16} />
        <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#807E7E" }}>
          {metric.label}
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: "8px" }}>
        <span style={{ fontSize: "32px", lineHeight: "40px", fontWeight: 600, color: "#121212" }}>
          {metric.value}
        </span>
        {metric.trendPrefix && (
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Image
              src={up ? "/icons/dash/arrow-up.svg" : "/icons/dash/arrow-down-red.svg"}
              alt=""
              width={16}
              height={16}
            />
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: 400,
                color: up ? "#027B2A" : "#CF3801",
              }}
            >
              {metric.trendPrefix}
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#807E7E",
              }}
            >
              {metric.trendSuffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function OwnerDashboardHome() {
  const { data: me } = useGetMeQuery();

  // Verification gating is driven by the real KYC status from GET /me.
  const localVerified = useLocalVerified();
  const verified = Boolean(me?.verification?.complete) || localVerified;

  // analytics/mine returns the owner's cards (listed properties, views + delta,
  // inquiries, earnings) already resolved for this role; mine/daily feeds the chart.
  const { data: dash } = useGetDashboardMetricsQuery(undefined, { skip: !verified });
  const { data: daily } = useGetDashboardDailyQuery(undefined, { skip: !verified });

  const metrics: Metric[] =
    verified && dash?.cards.length ? dash.cards.map(cardToMetric) : UNVERIFIED_METRICS;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "16px" }}>
        {metrics.map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>

      {verified ? <VerifiedDashboard daily={daily} /> : <UnverifiedDashboard />}
    </div>
  );
}


function MetricTile({ metric }: { metric: Metric }) {
  const up = metric.trend?.direction !== "down";
  return (
    <div
      className="bg-white flex flex-col"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        padding: "16px 24px",
        gap: "16px",
      }}
    >
      <div className="flex items-center" style={{ gap: "8px" }}>
        <Image src={metric.icon} alt="" width={16} height={16} />
        <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#807E7E" }}>
          {metric.label}
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: "8px" }}>
        <span
          style={{
            fontSize: "32px",
            lineHeight: "40px",
            fontWeight: 600,
            color: "#121212",
          }}
        >
          {metric.value}
        </span>
        {metric.trend && (
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Image
              src={up ? "/icons/dash/arrow-up.svg" : "/icons/dash/arrow-down-red.svg"}
              alt=""
              width={16}
              height={16}
            />
            <span
              style={{
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: 400,
                color: up ? "#027B2A" : "#CF3801",
              }}
            >
              {metric.trend.prefix}
            </span>
            <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
              {metric.trend.suffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


function UnverifiedDashboard() {
  return (
    <>
      <section
        className="relative overflow-hidden w-full rounded-[20px]"
        style={{
          background: "linear-gradient(175deg, rgba(117,163,199,1) 0%, rgba(48,94,130,1) 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-4 p-6 md:px-6 md:py-8">
          <div className="flex flex-col min-w-0" style={{ gap: "16px" }}>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <h2
                className="text-white text-xl md:text-2xl leading-7 md:leading-8"
                style={{ fontWeight: 600 }}
              >
                Get verified to start listing
              </h2>
              <p
                className="text-sm md:text-base leading-5 md:leading-6"
                style={{ fontWeight: 400, color: "rgba(255,255,255,0.8)" }}
              >
                Complete your verification to unlock listings, inquiries, and full access to your account.
              </p>
            </div>
            <StartVerificationCTA />
          </div>
          <Image
            src="/icons/dash/cta-verify-illu.svg"
            alt=""
            width={164}
            height={164}
            className="w-[88px] h-[88px] md:w-[164px] md:h-[164px] shrink-0"
          />
        </div>
      </section>

      {/* Real listings from GET /properties/mine — shows the empty-state
          illustration when there are none, or the user's actual properties. */}
      <YourProperties />
    </>
  );
}


function VerifiedDashboard({ daily }: { daily?: Record<string, number> }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "16px" }}>
        <ViewsChart daily={daily} />
        <RecentInquiries />
      </div>

      <YourProperties />
    </>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Build the last 7 days (UTC, oldest→newest) from the analytics dailyBreakdown
// (ISO date → views). Missing days fill to 0 so the chart always has 7 points.
function buildWeekViews(daily?: Record<string, number>): { day: string; views: number }[] {
  const map = daily ?? {};
  const now = new Date();
  const out: { day: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
    out.push({ day: WEEKDAYS[d.getUTCDay()], views: Number(map[key] ?? 0) });
  }
  return out;
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: { day: string; views: number } }>;
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const { day, views } = payload[0].payload;
  const fullDay = ({ Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" } as Record<string, string>)[day] || day;
  return (
    <div
      className="flex flex-col items-center"
      style={{
        padding: "8px 12px",
        gap: "4px",
        background: "#305E82",
        borderRadius: "4px",
        boxShadow: "0 4px 12px rgba(48,94,130,0.25)",
      }}
    >
      <span style={{ fontSize: "12px", lineHeight: "16px", color: "rgba(255,255,255,0.8)" }}>
        {fullDay}
      </span>
      <span style={{ fontSize: "12px", lineHeight: "16px", color: "#FFFFFF", fontWeight: 600 }}>
        {views} views
      </span>
    </div>
  );
}

function ViewsChart({ daily }: { daily?: Record<string, number> }) {
  const data = buildWeekViews(daily);
  // Mark the peak day (only when there are any views) like the Figma.
  const peak = data.reduce((a, b) => (b.views >= a.views ? b : a), data[0]);
  const hasViews = data.some((d) => d.views > 0);

  return (
    <section
      className="bg-white flex flex-col"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px", gap: "16px", height: "240px" }}
    >
      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
        Views this month
      </h2>

      <div className="flex-1" style={{ width: "100%", minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 56, right: 16, bottom: 0, left: 16 }}>
            <defs>
              <linearGradient id="viewsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#305E82" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#305E82" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#807E7E", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis hide domain={[0, "dataMax + 8"]} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#305E82", strokeDasharray: "3 3", strokeWidth: 1 }}
              position={{ y: 0 }}
              offset={0}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#305E82"
              strokeWidth={2}
              fill="url(#viewsArea)"
              activeDot={{ r: 5, fill: "#FFFFFF", stroke: "#305E82", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {hasViews && (
              <ReferenceDot
                x={peak.day}
                y={peak.views}
                r={5}
                fill="#FFFFFF"
                stroke="#305E82"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}


function initialsOf(first?: string, last?: string, fallback = "") {
  const i = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  return i || fallback.slice(0, 2).toUpperCase() || "··";
}

function RecentInquiries() {
  const { data: me } = useGetMeQuery();
  const { data: conversations } = useGetConversationsQuery();
  const meId = me?.id;

  const rows = (conversations ?? [])
    .slice()
    .sort((a, b) =>
      (b.lastMessageAt ?? b.createdAt ?? "").localeCompare(a.lastMessageAt ?? a.createdAt ?? "")
    )
    .slice(0, 5)
    .map((c) => {
      const other = c.participants?.find((p) => p.userId !== meId) ?? c.participants?.[0];
      const name =
        [other?.firstName, other?.lastName].filter(Boolean).join(" ") || "RentBuyStay user";
      return {
        id: c.id,
        name,
        initials: initialsOf(other?.firstName, other?.lastName, name),
        unread: (c.unreadCount ?? 0) > 0,
      };
    });

  return (
    <section
      className="bg-white flex flex-col"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", height: "240px", overflow: "hidden" }}
    >
      <div className="flex items-center justify-between" style={{ padding: "16px 24px" }}>
        <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
          Recent Inquiries
        </h2>
        {rows.length > 0 && (
          <Link
            href="/dashboard/messages"
            className="hover:opacity-80"
            style={{ fontSize: "13px", fontWeight: 500, color: "#305E82" }}
          >
            View all
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: "0 24px 24px" }}>
        {rows.length === 0 ? (
          <div
            className="flex items-center justify-center text-center"
            style={{ height: "100%", fontSize: "13px", color: "#807E7E" }}
          >
            No inquiries yet. New messages from buyers and renters will show up here.
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "16px" }}>
            {rows.map((i) => (
              <InquiryRow
                key={i.id}
                conversationId={i.id}
                name={i.name}
                initials={i.initials}
                unread={i.unread}
                meId={meId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


// One Recent Inquiry row. The conversations list endpoint doesn't carry a
// message preview, so fetch the conversation's messages and show the latest
// body (matching the Figma, which shows the real message text).
function InquiryRow({
  conversationId,
  name,
  initials,
  unread,
  meId,
}: {
  conversationId: string;
  name: string;
  initials: string;
  unread: boolean;
  meId?: string;
}) {
  const { data: messages } = useGetMessagesQuery({ id: conversationId, limit: 20 });
  const list = messages ?? [];
  let latest = list.length ? list[0] : null;
  for (const m of list) {
    if (!latest || m.createdAt.localeCompare(latest.createdAt) >= 0) latest = m;
  }
  const preview = latest
    ? `${latest.senderUserId === meId ? "You: " : ""}${latest.body}`
    : "Started a conversation with you";

  return (
    <Link
      href={`/dashboard/messages?c=${conversationId}`}
      className="flex items-start hover:opacity-80"
      style={{ gap: "16px" }}
    >
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: "44px", height: "44px", background: "#F5F7F9", color: "#305E82", fontSize: "13px", fontWeight: 600 }}
      >
        {initials}
      </div>
      <div className="flex flex-col" style={{ gap: "4px", minWidth: 0, flex: 1 }}>
        <div className="flex items-center" style={{ gap: "6px" }}>
          <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: "#121212" }}>
            {name}
          </span>
          {unread && (
            <span className="shrink-0 rounded-full" style={{ width: "8px", height: "8px", background: "#FFAE00" }} />
          )}
        </div>
        <p
          style={{
            fontSize: "12px",
            lineHeight: "18px",
            fontWeight: 400,
            color: "#807E7E",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {preview}
        </p>
      </div>
    </Link>
  );
}

const STATUS_STYLES: Record<PropertyStatusLabel, { bg: string; color: string }> = {
  Active: { bg: "#ECFDF3", color: "#027A48" },
  "Awaiting Approval": { bg: "#FFF7E9", color: "#EA651A" },
  Archived: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Rejected: { bg: "#FEF3F2", color: "#B42318" },
  Draft: { bg: "#F2F4F7", color: "#475467" },
};

const PROPERTY_COLS = [
  { key: "id", label: "Property ID", width: 149 },
  { key: "property", label: "Property", width: 260 },
  { key: "type", label: "Type", width: 135 },
  { key: "price", label: "Price", width: 184 },
  { key: "views", label: "Views", width: 100 },
  { key: "status", label: "Status", width: 144 },
  { key: "edit", label: "", width: 56 },
];

function YourProperties() {
  const router = useRouter();
  const { data: myProps, isLoading } = useGetMyPropertiesQuery({ page: 0, size: 5 });
  const rows = (myProps?.content ?? []).map((p) => ({
    vm: toPropertyVM(p),
    type: p.propertyTypeName || "—",
  }));

  return (
    <section className="flex flex-col" style={{ gap: "16px" }}>
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
          Your Properties
        </h2>
        <Link
          href="/dashboard/properties"
          className="flex items-center hover:opacity-80"
          style={{ gap: "8px", fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}
        >
          View all
          <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
        </Link>
      </div>

      <div className="hidden md:block" style={{ width: "100%", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}>
        {rows.length === 0 ? (
          <EmptyProperties loading={isLoading} />
        ) : (
          <>
            <div className="flex" style={{ background: "#FFFFFF", borderBottom: "1px solid #F6F6F6" }}>
              {PROPERTY_COLS.map((c) => (
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

            {rows.map(({ vm, type }) => (
            <div
              key={vm.id}
              className="flex items-center"
              style={{ borderBottom: "1px solid #F6F6F6", background: "#FFFFFF" }}
            >
              <div
                style={{
                  flex: `1 1 ${PROPERTY_COLS[0].width}px`,
                  padding: "16px 24px",
                  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                  fontSize: "14px",
                  color: "#121212",
                  whiteSpace: "nowrap",
                }}
              >
                {vm.referenceCode}
              </div>
              <div
                className="flex flex-col"
                style={{ flex: `1 1 ${PROPERTY_COLS[1].width}px`, padding: "12px 24px", gap: "4px", minWidth: 0 }}
              >
                <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {vm.title}
                </span>
                <span style={{ fontSize: "12px", lineHeight: "18px", color: "#807E7E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {vm.location}
                </span>
              </div>
              <div
                style={{ flex: `1 1 ${PROPERTY_COLS[2].width}px`, padding: "16px 24px", fontSize: "14px", color: "#121212" }}
              >
                {type}
              </div>
              <div
                style={{ flex: `1 1 ${PROPERTY_COLS[3].width}px`, padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#305E82" }}
              >
                {vm.price}
                {vm.priceSuffix ?? ""}
              </div>
              <div
                style={{ flex: `1 1 ${PROPERTY_COLS[4].width}px`, padding: "16px 24px", fontSize: "14px", color: "#121212" }}
              >
                {vm.viewCount}
              </div>
              <div style={{ flex: `1 1 ${PROPERTY_COLS[5].width}px`, padding: "16px 24px" }}>
                <StatusBadge status={vm.status} />
              </div>
              <div style={{ flex: `1 1 ${PROPERTY_COLS[6].width}px`, padding: "16px 24px" }}>
                <button
                  type="button"
                  aria-label={`Edit ${vm.title}`}
                  onClick={() => router.push(`/dashboard/properties/${vm.id}/edit`)}
                  className="hover:opacity-80"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  {/* Plain img (not next/image) so the icon stays a fixed 20px
                      regardless of row height / zoom — next/image's responsive
                      sizing was rescaling it when the Property ID wrapped. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/dash/edit-blue.svg" alt="" width={20} height={20} style={{ width: "20px", height: "20px", maxWidth: "none", flexShrink: 0, display: "block" }} />
                </button>
              </div>
            </div>
            ))}
          </>
        )}
      </div>

      {/* Mobile: full-width cards instead of the table */}
      {/* Mobile: full property cards (matches the Figma owner dashboard) */}
      <div className="md:hidden flex flex-col" style={{ gap: "16px" }}>
        {rows.length === 0 ? (
          <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: "20px" }}>
            <EmptyProperties loading={isLoading} />
          </div>
        ) : (
          rows.map(({ vm }) => (
            <MiniPropertyCard
              key={vm.id}
              property={vm}
              onEdit={() => router.push(`/dashboard/properties/${vm.id}/edit`)}
            />
          ))
        )}
      </div>
    </section>
  );
}

// Shared empty / loading state for the "Your Properties" sections (table + cards).
function EmptyProperties({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center text-center"
        style={{ padding: "48px 24px", fontSize: "14px", color: "#807E7E", background: "#FFFFFF" }}
      >
        Loading your listings…
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: "48px 24px", gap: "24px" }}>
      <Image
        src="/icons/dash/empty-state.svg"
        alt=""
        width={180}
        height={180}
        className="w-[120px] h-[120px] md:w-[180px] md:h-[180px]"
      />
      <div className="flex flex-col items-center" style={{ gap: "8px", maxWidth: "520px" }}>
        <h3 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
          Nothing to show yet
        </h3>
        <p style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
          You&rsquo;ve not posted any property yet, verify your account now and start connecting with buyers and renters.
        </p>
      </div>
    </div>
  );
}

// Full property card used by the dashboard "Your Properties" on mobile —
// image + tag, price + status + edit, title/location, beds·baths·sqft.
function MiniPropertyCard({
  property,
  onEdit,
}: {
  property: PropertyVM;
  onEdit: () => void;
}) {
  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow w-full"
      style={{ height: "414px", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}
    >
      <div className="relative" style={{ width: "100%", height: "218px", background: "#EDEDED" }}>
        <PropertyCardImage media={property.media} images={property.images ?? [property.image]} alt={property.title} sizes="100vw" />
        <span
          className="absolute"
          style={{
            right: "16px",
            bottom: "16px",
            padding: "4px 12px",
            background: "#FFAE00",
            color: "#FFFFFF",
            borderRadius: "50px",
            fontSize: "12px",
            lineHeight: "20px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {property.tag}
        </span>
      </div>

      <div className="absolute flex flex-col" style={{ left: "16px", right: "16px", top: "242px", gap: "8px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "8px", minWidth: 0 }}>
            <span
              style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#305E82", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}
            >
              {property.price}
              {property.priceSuffix && (
                <span style={{ fontSize: "14px", fontWeight: 400, color: "#807E7E" }}>{property.priceSuffix}</span>
              )}
            </span>
            <StatusBadge status={property.status} />
          </div>
          <button
            type="button"
            aria-label={`Edit ${property.title}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="hover:opacity-80 shrink-0"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/dash/edit-blue.svg" alt="" width={20} height={20} style={{ width: "20px", height: "20px", maxWidth: "none", flexShrink: 0, display: "block" }} />
          </button>
        </div>

        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h3 style={{ fontSize: "16px", lineHeight: "20px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
            {property.title}
          </h3>
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>{property.location}</span>
          </div>
        </div>

        <div
          className="flex items-center"
          style={{ gap: "12px", paddingTop: "12px", borderTop: "1px solid #F6F6F6", marginTop: "4px", fontSize: "12px", color: "#807E7E" }}
        >
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-maximize.svg" alt="" width={16} height={16} />
            {property.sqft}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bed.svg" alt="" width={16} height={16} />
            {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bath.svg" alt="" width={16} height={16} />
            {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: PropertyStatusLabel }) {
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
