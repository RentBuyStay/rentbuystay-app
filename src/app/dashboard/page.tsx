"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRole, type AccountRole } from "@/lib/role";
import SeekerPropertyCard, { type SeekerListing } from "@/components/SeekerPropertyCard";
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
  { label: "Total Listings", value: "11", trend: { prefix: "+3", suffix: "this month", direction: "up" }, icon: "/icons/dash/metric-home.svg" },
  { label: "Total Leads", value: "16", trend: { prefix: "5%", suffix: "this week", direction: "down" }, icon: "/icons/dash/metric-people.svg" },
  { label: "Revenue", value: "₦840k", trend: { prefix: "+6.4%", suffix: "vs last month", direction: "up" }, icon: "/icons/dash/metric-dollar.svg" },
  { label: "Total Views", value: "1,385", trend: { prefix: "+13%", suffix: "this week", direction: "up" }, icon: "/icons/dash/metric-eye.svg" },
];

export default function DashboardHome() {
  const [role, setRoleState] = useState<AccountRole | null>(null);

  useEffect(() => {
    setRoleState(getRole());
  }, []);

  if (!role) return null;
  if (role === "Property Seeker") return <SeekerDashboardPlaceholder />;
  if (role === "Real Estate Agent") return <AgentDashboardHome />;
  return <OwnerDashboardHome />;
}

function AgentDashboardHome() {
  const [verified, setVerified] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVerified(localStorage.getItem("rbs-dashboard-verified") === "1");
    function onStorage(e: StorageEvent) {
      if (e.key === "rbs-dashboard-verified") {
        setVerified(e.newValue === "1");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showVerified = mounted && verified;
  const metrics = showVerified ? VERIFIED_METRICS : AGENT_METRICS;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {metrics.map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>
      {showVerified ? <VerifiedDashboard /> : <UnverifiedDashboard />}
    </div>
  );
}

type SeekerMetric = {
  icon: string;
  label: string;
  value: string;
  trendPrefix: string;
  trendSuffix: string;
  direction: "up" | "down";
};

const SEEKER_METRICS: SeekerMetric[] = [
  { icon: "/icons/dash/nav-saved.svg", label: "Saved Properties", value: "5", trendPrefix: "+2", trendSuffix: "this week", direction: "up" },
  { icon: "/icons/dash/nav-messages.svg", label: "Unread Messages", value: "4", trendPrefix: "5%", trendSuffix: "this week", direction: "down" },
  { icon: "/icons/dash/nav-calendar.svg", label: "Upcoming Appointments", value: "3", trendPrefix: "+13%", trendSuffix: "this week", direction: "up" },
];

const SEEKER_RECOMMENDED: SeekerListing[] = [
  {
    id: "s1",
    title: "Luxury Penthouse, Eko Atlantic",
    location: "Eko Atlantic City, Lagos",
    price: "₦1,200,000,000",
    tag: "FOR SALE",
    sqft: "4200 sqft",
    beds: 4,
    baths: 5,
    image: "/images/prop1.jpg",
    amenities: ["Newly Built", "24/7 Security", "Swimming Pool", "Gym", "Smart Home"],
    seller: { name: "Gabriel Okechukwu", initials: "GO", verified: true },
  },
  {
    id: "s2",
    title: "2-Bedroom Flat, Jibowu, Yaba",
    location: "Yaba, Lagos",
    price: "₦1,800,000",
    priceSuffix: "/yr",
    tag: "FOR RENT",
    sqft: "2000 sqft",
    beds: 3,
    baths: 3,
    image: "/images/prop5.jpg",
    amenities: ["Newly Built", "24/7 Security", "Borehole Water", "Internet/WiFi", "Tiled Floor"],
    seller: { name: "Aishat Dada", initials: "AD", verified: true, avatarUrl: "/images/seekers/aishat-dada.png" },
  },
  {
    id: "s3",
    title: "2-Bedroom Apartment, Victoria Island",
    location: "Victoria Island, Lagos",
    price: "₦450,000",
    priceSuffix: "/night",
    tag: "SHORTLET",
    sqft: "1800 sqft",
    beds: 3,
    baths: 2,
    image: "/images/prop2.jpg",
    amenities: ["Newly Built", "24/7 Security", "Furnished", "Swimming Pool", "Internet/WiFi"],
    seller: { name: "Dare Okoye", initials: "DO", verified: true, avatarUrl: "/images/seekers/dare-okoye.png" },
  },
  {
    id: "s4",
    title: "Office Space, Ikeja GRA",
    location: "Ikeja GRA, Lagos",
    price: "₦3,400,000",
    priceSuffix: "/yr",
    tag: "FOR RENT",
    sqft: "1200 sqft",
    beds: 2,
    baths: 1,
    image: "/images/prop3.jpg",
    amenities: ["Newly Built", "24/7 Security", "Backup Generator", "High Speed Internet"],
    seller: { name: "Stanley Alabi", initials: "SA", verified: true },
  },
  {
    id: "s5",
    title: "1-Bedroom Serviced Apartment, Oniru",
    location: "Oniru Estate, Lagos",
    price: "₦160,000",
    priceSuffix: "/night",
    tag: "SHORTLET",
    sqft: "560 sqft",
    beds: 2,
    baths: 1,
    image: "/images/prop2.jpg",
    amenities: ["Newly Built", "24/7 Security", "Furnished", "Air Conditioning"],
    seller: { name: "Olaide Batifeori", initials: "OB", verified: true, avatarUrl: "/images/seekers/olaide-batifeori.png" },
  },
  {
    id: "s6",
    title: "4-Bedroom Duplex, Ikoyi",
    location: "Ikoyi, Lagos",
    price: "₦260,000,000",
    tag: "FOR SALE",
    sqft: "5000 sqft",
    beds: 5,
    baths: 6,
    image: "/images/prop4.jpg",
    amenities: ["Newly Built", "24/7 Security", "Swimming Pool", "Smart Home", "Gym Facility"],
    seller: { name: "Seun Olaoye", initials: "SO", verified: true },
  },
];

function SeekerDashboardPlaceholder() {
  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {SEEKER_METRICS.map((m) => (
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

        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 352px)", gap: "24px 16px" }}>
          {SEEKER_RECOMMENDED.map((listing) => (
            <SeekerPropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
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
      </div>
    </div>
  );
}

function OwnerDashboardHome() {
  const [verified, setVerified] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVerified(localStorage.getItem("rbs-dashboard-verified") === "1");
    function onStorage(e: StorageEvent) {
      if (e.key === "rbs-dashboard-verified") {
        setVerified(e.newValue === "1");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {(mounted && verified ? VERIFIED_METRICS : UNVERIFIED_METRICS).map((m) => (
          <MetricTile key={m.label} metric={m} />
        ))}
      </div>

      {mounted && verified ? <VerifiedDashboard /> : <UnverifiedDashboard />}
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


type Inquiry = { initials: string; name: string; message: string };

const INQUIRIES: Inquiry[] = [
  {
    initials: "CN",
    name: "Chidi Nwosu",
    message: "Good morning, I am interested in visiting the property...",
  },
  {
    initials: "AY",
    name: "Amina Yusuf",
    message: "Hello, can you please provide more details about the neighborhood?",
  },
  {
    initials: "JC",
    name: "Jamal Clarke",
    message: "Is the apartment still available for inspection this weekend?",
  },
];

function RecentInquiries() {
  return (
    <section
      className="bg-white flex flex-col"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", height: "240px", overflow: "hidden" }}
    >
      <div style={{ padding: "16px 24px" }}>
        <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
          Recent Inquiries
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: "0 24px 24px" }}>
        <div className="flex flex-col" style={{ gap: "16px" }}>
          {INQUIRIES.map((i) => (
            <div key={i.name} className="flex items-start" style={{ gap: "16px" }}>
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
                  <Image src="/icons/dash/verify.svg" alt="" width={14} height={14} />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


type PropertyRow = {
  id: string;
  slug: string;
  property: string;
  location: string;
  type: "Apartment" | "Duplex" | "Commercial";
  price: string;
  views: number;
  status: "Active" | "Awaiting Approval" | "Archived";
};

const PROPERTIES: PropertyRow[] = [
  { id: "RBS-L-004821", slug: "p1", property: "3-Bedroom Flat, Lekki Phase 1", location: "Lekki Phase 1, Lagos", type: "Apartment", price: "₦2,800,000.00/yr", views: 412, status: "Active" },
  { id: "RBS-L-004822", slug: "p2", property: "2-Bedroom Apartment, Victoria Island", location: "Victoria Island, Lagos", type: "Apartment", price: "₦450,000.00/night", views: 287, status: "Active" },
  { id: "RBS-L-004823", slug: "p4", property: "4-Bedroom Duplex, Ikoyi", location: "Ikoyi, Lagos", type: "Duplex", price: "₦260,000,000.00", views: 396, status: "Awaiting Approval" },
  { id: "RBS-L-004824", slug: "p3", property: "Office Space, Ikeja GRA", location: "Ikeja GRA, Lagos", type: "Commercial", price: "₦3,400,000.00/yr", views: 122, status: "Archived" },
  { id: "RBS-L-004826", slug: "p5", property: "2-Bedroom Flat, Lekki Phase 1", location: "Lekki Phase 1, Lagos", type: "Apartment", price: "₦4,800,000.00/yr", views: 462, status: "Active" },
];

const STATUS_STYLES: Record<PropertyRow["status"], { bg: string; color: string }> = {
  Active: { bg: "#ECFDF3", color: "#027A48" },
  "Awaiting Approval": { bg: "#FFF7E9", color: "#EA651A" },
  Archived: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
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

        {PROPERTIES.map((r) => (
          <div
            key={r.id}
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
              {r.id}
            </div>
            <div
              className="flex flex-col"
              style={{ flex: `1 1 ${PROPERTY_COLS[1].width}px`, padding: "12px 24px", gap: "4px" }}
            >
              <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
                {r.property}
              </span>
              <span style={{ fontSize: "12px", lineHeight: "18px", color: "#807E7E" }}>{r.location}</span>
            </div>
            <div
              style={{ flex: `1 1 ${PROPERTY_COLS[2].width}px`, padding: "16px 24px", fontSize: "14px", color: "#121212" }}
            >
              {r.type}
            </div>
            <div
              style={{ flex: `1 1 ${PROPERTY_COLS[3].width}px`, padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#305E82" }}
            >
              {r.price}
            </div>
            <div
              style={{ flex: `1 1 ${PROPERTY_COLS[4].width}px`, padding: "16px 24px", fontSize: "14px", color: "#121212" }}
            >
              {r.views}
            </div>
            <div style={{ flex: `1 1 ${PROPERTY_COLS[5].width}px`, padding: "16px 24px" }}>
              <StatusBadge status={r.status} />
            </div>
            <div style={{ flex: `1 1 ${PROPERTY_COLS[6].width}px`, padding: "16px 24px" }}>
              <button
                type="button"
                aria-label={`Edit ${r.property}`}
                onClick={() => router.push(`/dashboard/properties/${r.slug}/edit`)}
                className="hover:opacity-80"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <Image src="/icons/dash/edit.svg" alt="" width={20} height={20} style={{ filter: "invert(28%) sepia(58%) saturate(485%) hue-rotate(170deg)" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: PropertyRow["status"] }) {
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
