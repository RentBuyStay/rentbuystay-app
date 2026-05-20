"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string; icon: string };

const overview: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "/icons/dash/nav-dashboard.svg" },
];

const listings: NavItem[] = [
  { label: "My Properties", href: "/dashboard/properties", icon: "/icons/dash/nav-properties.svg" },
  { label: "Add New Property", href: "/dashboard/properties/new", icon: "/icons/dash/nav-add-property.svg" },
  { label: "Property Requests", href: "/dashboard/requests", icon: "/icons/dash/nav-requests.svg" },
  { label: "Inquiries/Messages", href: "/dashboard/messages", icon: "/icons/dash/nav-messages.svg" },
  { label: "Appointments", href: "/dashboard/appointments", icon: "/icons/dash/nav-calendar.svg" },
];

const finance: NavItem[] = [
  { label: "Transactions", href: "/dashboard/transactions", icon: "/icons/dash/nav-transactions.svg" },
  { label: "Subscription", href: "/dashboard/subscription", icon: "/icons/dash/nav-subscription.svg" },
];

const account: NavItem[] = [
  { label: "Profile", href: "/dashboard/profile", icon: "/icons/dash/nav-profile.svg" },
  { label: "Verification (Qore ID)", href: "/dashboard/verification", icon: "/icons/dash/nav-verification.svg" },
  { label: "Settings", href: "/dashboard/settings", icon: "/icons/dash/nav-settings.svg" },
];

const groups: { label: string; items: NavItem[] }[] = [
  { label: "OVERVIEW", items: overview },
  { label: "LISTINGS", items: listings },
  { label: "FINANCE", items: finance },
  { label: "ACCOUNT", items: account },
];

const TINT = "rgba(117,163,199,0.4)";

export default function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="flex flex-col text-white shrink-0"
      style={{
        width: "272px",
        background: "#305E82",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      
      <div style={{ paddingTop: "24px" }}>
        <Image
          src="/icons/dash/rbs-dash-logo.svg"
          alt="RentBuyStay"
          width={272}
          height={56}
          priority
          style={{ width: "272px", height: "56px" }}
        />
      </div>

      
      <div style={{ marginTop: "16px", paddingLeft: "24px" }}>
        <div
          className="inline-flex items-center"
          style={{
            background: TINT,
            borderRadius: "25px",
            padding: "5px 10px",
            gap: "8px",
            height: "30px",
          }}
        >
          <Image src="/icons/dash/nav-profile-tick.svg" alt="" width={20} height={20} />
          <span
            style={{
              fontSize: "12px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#FFFFFF",
            }}
          >
            PROPERTY OWNER
          </span>
        </div>
      </div>

      
      <nav
        className="flex flex-col"
        style={{ padding: "32px 16px 30px", gap: "16px", flex: 1, overflowY: "auto" }}
      >
        {groups.map((g) => (
          <div key={g.label} className="flex flex-col" style={{ gap: "8px" }}>
            
            <div style={{ padding: "0 16px" }}>
              <span
                style={{
                  fontSize: "10px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  letterSpacing: "2px",
                }}
              >
                {g.label}
              </span>
            </div>
            {g.items.map((item) => {
              // Active only on exact match — prevents "Dashboard" (/dashboard) from staying
              // highlighted when you're on /dashboard/properties etc.
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center transition-colors"
                  style={{
                    height: "48px",
                    padding: "8px 16px",
                    gap: "8px",
                    borderRadius: "12px",
                    background: active ? TINT : "transparent",
                    fontSize: "13px",
                    lineHeight: "24px",
                    fontWeight: 500,
                    color: "#FFFFFF",
                  }}
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      
      <Link
        href="/log-in"
        className="flex items-center justify-between"
        style={{
          width: "272px",
          height: "64px",
          padding: "12px 24px",
          background: TINT,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 500,
            color: "#FFFFFF",
          }}
        >
          Log out
        </span>
        <Image src="/icons/dash/nav-logout.svg" alt="" width={24} height={24} />
      </Link>
    </aside>
  );
}
