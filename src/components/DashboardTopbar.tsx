"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import NotificationsBell from "@/components/NotificationsBell";

const TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/dashboard/properties/new", title: "Add New Property" },
  { match: (p) => p.startsWith("/dashboard/properties"), title: "My Properties" },
  { match: (p) => /^\/dashboard\/browse\/[^/]+$/.test(p), title: "Property Details" },
  { match: (p) => p.startsWith("/dashboard/browse"), title: "Browse Properties" },
  { match: (p) => /^\/dashboard\/agents-management\/[^/]+$/.test(p), title: "Agents Management" },
  { match: (p) => p.startsWith("/dashboard/agents-management"), title: "Agents Management" },
  { match: (p) => p.startsWith("/dashboard/saved"), title: "Saved Properties" },
  { match: (p) => p.startsWith("/dashboard/agents"), title: "Discover Agents" },
  { match: (p) => p.startsWith("/dashboard/requests"), title: "Property Requests" },
  { match: (p) => p.startsWith("/dashboard/messages"), title: "Inquiries/Messages" },
  { match: (p) => p.startsWith("/dashboard/appointments"), title: "Inspection Appointments" },
  { match: (p) => p.startsWith("/dashboard/transactions"), title: "Transactions" },
  { match: (p) => p.startsWith("/dashboard/subscription"), title: "Subscription" },
  { match: (p) => p.startsWith("/dashboard/profile"), title: "Profile" },
  { match: (p) => p.startsWith("/dashboard/verification"), title: "Verification (Qore ID)" },
  { match: (p) => p.startsWith("/dashboard/settings"), title: "Settings" },
  { match: (p) => p.startsWith("/dashboard"), title: "Dashboard" },
];

export default function DashboardTopbar({
  userName = "Prince Akpolo",
  userInitials = "PA",
}: {
  userName?: string;
  userInitials?: string;
}) {
  const pathname = usePathname() ?? "/dashboard";
  const title = TITLES.find((t) => t.match(pathname))?.title ?? "Dashboard";

  return (
    <header
      className="flex items-center justify-between bg-white"
      style={{
        height: "80px",
        padding: "0 40px",
        borderBottom: "1px solid #F6F6F6",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      
      <h1
        style={{
          fontSize: "20px",
          lineHeight: "32px",
          fontWeight: 600,
          color: "#121212",
        }}
      >
        {title}
      </h1>

      <div className="flex items-center" style={{ gap: "24px" }}>

        <NotificationsBell />


        <button
          type="button"
          aria-label="Help"
          className="hover:opacity-80"
          style={{ background: "none", border: "none", padding: 0, width: "24px", height: "24px" }}
        >
          <Image src="/icons/dash/tb-help.svg" alt="" width={24} height={24} />
        </button>

        {/* Divider */}
        <span style={{ width: "1px", height: "32px", background: "#EDEDED" }} />

        
        <div className="flex items-center" style={{ gap: "12px" }}>
          <div className="relative shrink-0" style={{ width: "40px", height: "40px" }}>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: "40px",
                height: "40px",
                background: "#305E82",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {userInitials}
            </div>
            <span
              className="absolute"
              style={{
                bottom: "0",
                right: "0",
                width: "10px",
                height: "10px",
                borderRadius: "100%",
                background: "#00B63E",
                border: "2px solid #FFFFFF",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#121212",
            }}
          >
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
