import Image from "next/image";
import Link from "next/link";
import StartVerificationCTA from "@/components/StartVerificationCTA";

type Metric = {
  label: string;
  value: string;
  trend: { prefix: string; suffix: string };
  icon: string;
};

const metrics: Metric[] = [
  { label: "Total Listings", value: "0", trend: { prefix: "+1", suffix: "this month" }, icon: "/icons/dash/metric-home.svg" },
  { label: "Total Views", value: "0", trend: { prefix: "+13%", suffix: "this week" }, icon: "/icons/dash/metric-eye.svg" },
  { label: "New Inquiries", value: "0", trend: { prefix: "5%", suffix: "this week" }, icon: "/icons/dash/metric-messages.svg" },
  { label: "Revenue", value: "₦0", trend: { prefix: "+6.4%", suffix: "vs last month" }, icon: "/icons/dash/metric-dollar.svg" },
];

export default function DashboardHome() {
  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white flex flex-col"
            style={{
              border: "1px solid #F6F6F6",
              borderRadius: "16px",
              padding: "20px",
              gap: "12px",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <div
                className="flex items-center justify-center rounded-[8px]"
                style={{ width: "32px", height: "32px", background: "rgba(48,94,130,0.08)" }}
              >
                <Image src={m.icon} alt="" width={18} height={18} />
              </div>
              <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#807E7E" }}>
                {m.label}
              </span>
            </div>
            <div className="flex flex-col" style={{ gap: "4px" }}>
              <span
                style={{
                  fontSize: "28px",
                  lineHeight: "36px",
                  fontWeight: 600,
                  color: "#121212",
                  letterSpacing: "-0.02em",
                }}
              >
                {m.value}
              </span>
              <div className="flex items-center" style={{ gap: "4px" }}>
                <Image src="/icons/dash/arrow-up.svg" alt="" width={14} height={14} />
                <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 500, color: "#00B63E" }}>
                  {m.trend.prefix}
                </span>
                <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>
                  {m.trend.suffix}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      
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
            <h2
              className="text-white"
              style={{
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: 600,
              }}
            >
              Get verified to start listing
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Complete your verification to unlock listings, inquiries, and full access to your account.
            </p>
          </div>
          <StartVerificationCTA />
        </div>

        
        <div
          className="absolute"
          style={{ right: "64px", top: "22px", width: "164px", height: "164px" }}
        >
          <Image src="/icons/dash/cta-verify-illu.svg" alt="" width={164} height={164} />
        </div>
      </section>

      
      <section
        className="bg-white"
        style={{ border: "1px solid #F6F6F6", borderRadius: "20px" }}
      >
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#305E82" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        
        <div
          className="flex flex-col items-center justify-center"
          style={{ padding: "64px 24px", gap: "24px" }}
        >
          <Image
            src="/icons/dash/empty-state.svg"
            alt=""
            width={180}
            height={180}
            style={{ width: "180px", height: "180px" }}
          />
          <div className="flex flex-col items-center" style={{ gap: "8px", maxWidth: "520px" }}>
            <h3
              style={{
                fontSize: "20px",
                lineHeight: "28px",
                fontWeight: 600,
                color: "#121212",
                textAlign: "center",
              }}
            >
              Nothing to show yet
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#807E7E",
                textAlign: "center",
              }}
            >
              You&rsquo;ve not posted any property yet, verify your account now and start
              connecting with buyers and renters.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
