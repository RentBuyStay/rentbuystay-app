"use client";

import Image from "next/image";
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
import { useGetConversationsQuery } from "@/services/conversationApi";
import { toSeekerListing, toPropertyVM, type PropertyStatusLabel } from "@/lib/property";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";

type Metric = {
  label: string;
  value: string;
  trend: { prefix: string; suffix: string; direction: "up" | "down" };
  icon: string;
};

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
  // Honour the backend `me.verification.complete` and the localStorage flag
  // that VerifyPhoneModal sets on phone confirm, so the demo flow flips the
  // dashboard the moment the phone OTP succeeds — no backend round-trip needed.
  const [localVerified, setLocalVerified] = useState(false);
  useEffect(() => {
    setLocalVerified(localStorage.getItem("rbs-dashboard-verified") === "1");
    function onStorage(e: StorageEvent) {
      if (e.key === "rbs-dashboard-verified") setLocalVerified(e.newValue === "1");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const verified = Boolean(me?.verification?.complete) || localVerified;
  const metrics = verified ? AGENCY_METRICS_VERIFIED : AGENCY_METRICS_UNVERIFIED;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {metrics.map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>
      {verified ? <VerifiedDashboard /> : <UnverifiedDashboard />}
    </div>
  );
}

function AgentDashboardHome() {
  const { data: me } = useGetMeQuery();
  const { data: myProps } = useGetMyPropertiesQuery({ page: 0, size: 100 });
  const { data: conversations } = useGetConversationsQuery();

  // Verification gating is driven by the real KYC status from GET /me.
  const verified = Boolean(me?.verification?.complete);

  // Real values where the backend exposes them: listing count + view totals
  // from /me/properties, leads from active conversations. Revenue stays a
  // placeholder until the analytics/revenue endpoints are wired.
  const listings = myProps?.content ?? [];
  const totalViews = listings.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
  const leads = conversations?.length ?? 0;

  const metrics: Metric[] = AGENT_METRICS.map((m) => {
    if (m.label === "Total Listings") return { ...m, value: String(myProps?.totalElements ?? 0) };
    if (m.label === "Total Leads") return { ...m, value: String(leads) };
    if (m.label === "Total Views") return { ...m, value: totalViews.toLocaleString() };
    return m;
  });

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {metrics.map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>
      {verified ? <VerifiedDashboard /> : <UnverifiedDashboard />}
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
    { icon: "/icons/dash/nav-saved.svg", label: "Saved Properties", value: String(savedPage?.totalElements ?? 0) },
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
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
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
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px 16px" }}>
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
                fontFamily: "var(--font-neue-montreal), Geist, sans-serif",
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
                fontFamily: "var(--font-neue-montreal), Geist, sans-serif",
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
  const { data: myProps } = useGetMyPropertiesQuery({ page: 0, size: 1 });

  // Verification gating is driven by the real KYC status from GET /me.
  const verified = Boolean(me?.verification?.complete);

  // Surface the real listing count; other metrics stay as placeholders until
  // the analytics endpoints (/properties/analytics/mine) are wired.
  const baseMetrics = verified ? VERIFIED_METRICS : UNVERIFIED_METRICS;
  const metrics = baseMetrics.map((m) =>
    m.label === "Total Listings" && myProps
      ? { ...m, value: String(myProps.totalElements) }
      : m
  );

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {metrics.map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>

      {verified ? <VerifiedDashboard /> : <UnverifiedDashboard />}
    </div>
  );
}


function MetricTile({ metric }: { metric: Metric }) {
  const up = metric.trend.direction === "up";
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
      </div>
    </div>
  );
}


function UnverifiedDashboard() {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          width: "100%",
          height: "208px",
          borderRadius: "20px",
          background: "linear-gradient(175deg, rgba(117,163,199,1) 0%, rgba(48,94,130,1) 100%)",
        }}
      >
        <div
          className="absolute flex flex-col"
          style={{ left: "24px", top: "32px", width: "417px", gap: "16px" }}
        >
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h2 className="text-white" style={{ fontSize: "24px", lineHeight: "32px", fontWeight: 600 }}>
              Get verified to start listing
            </h2>
            <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "rgba(255,255,255,0.8)" }}>
              Complete your verification to unlock listings, inquiries, and full access to your account.
            </p>
          </div>
          <StartVerificationCTA />
        </div>
        <div className="absolute" style={{ right: "64px", top: "22px", width: "164px", height: "164px" }}>
          <Image src="/icons/dash/cta-verify-illu.svg" alt="" width={164} height={164} />
        </div>
      </section>

      <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: "20px" }}>
        <div
          className="flex items-center justify-between"
          style={{ padding: "20px 24px", borderBottom: "1px solid #F6F6F6" }}
        >
          <h2 style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
            Your Properties
          </h2>
          <Link
            href="/dashboard/properties"
            className="flex items-center hover:opacity-80"
            style={{ gap: "4px", fontSize: "14px", fontWeight: 500, color: "#305E82" }}
          >
            <span>View all</span>
            <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={16} height={16} />
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center" style={{ padding: "64px 24px", gap: "24px" }}>
          <Image
            src="/icons/dash/empty-state.svg"
            alt=""
            width={180}
            height={180}
            style={{ width: "180px", height: "180px" }}
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
      </section>
    </>
  );
}


function VerifiedDashboard() {
  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <ViewsChart />
        <RecentInquiries />
      </div>

      <YourProperties />
    </>
  );
}


const CHART_DATA = [
  { day: "Sun", views: 6 },
  { day: "Mon", views: 26 },
  { day: "Tue", views: 27 },
  { day: "Wed", views: 17 },
  { day: "Thu", views: 6 },
  { day: "Fri", views: 13 },
  { day: "Sat", views: 30 },
];

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

function ViewsChart() {
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
          <AreaChart data={CHART_DATA} margin={{ top: 56, right: 16, bottom: 0, left: 16 }}>
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
              tick={{ fontSize: 12, fill: "#807E7E", fontFamily: "Geist" }}
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
            <ReferenceDot
              x="Tue"
              y={27}
              r={5}
              fill="#FFFFFF"
              stroke="#305E82"
              strokeWidth={2}
            />
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
        message: c.title || "Started a conversation with you",
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
              <Link
                key={i.id}
                href={`/dashboard/messages?c=${i.id}`}
                className="flex items-start hover:opacity-80"
                style={{ gap: "16px" }}
              >
                <div
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "#F5F7F9",
                    color: "#305E82",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {i.initials}
                </div>
                <div className="flex flex-col" style={{ gap: "4px", minWidth: 0, flex: 1 }}>
                  <div className="flex items-center" style={{ gap: "6px" }}>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: "#121212" }}>
                      {i.name}
                    </span>
                    {i.unread && (
                      <span
                        className="shrink-0 rounded-full"
                        style={{ width: "8px", height: "8px", background: "#FFAE00" }}
                      />
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
                    {i.message}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
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

      <div style={{ width: "100%", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}>
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

        {rows.length === 0 ? (
          <div
            className="flex items-center justify-center text-center"
            style={{ padding: "48px 24px", fontSize: "14px", color: "#807E7E", background: "#FFFFFF" }}
          >
            {isLoading
              ? "Loading your listings…"
              : "You haven’t listed any properties yet."}
          </div>
        ) : (
          rows.map(({ vm, type }) => (
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
                  <Image src="/icons/dash/edit.svg" alt="" width={20} height={20} style={{ filter: "invert(28%) sepia(58%) saturate(485%) hue-rotate(170deg)" }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
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
