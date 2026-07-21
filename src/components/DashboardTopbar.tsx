"use client";

import Image from "next/image";
import Link from "next/link";
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
  { match: (p) => p.startsWith("/dashboard/verification"), title: "Verification" },
  { match: (p) => p.startsWith("/dashboard/settings"), title: "Settings" },
  { match: (p) => p.startsWith("/dashboard"), title: "Dashboard" },
];

export default function DashboardTopbar({
  userName = "Prince Akpolo",
  userInitials = "PA",
  userAvatar,
  onMenuClick,
}: {
  userName?: string;
  userInitials?: string;
  userAvatar?: string | null;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname() ?? "/dashboard";
  const title = TITLES.find((t) => t.match(pathname))?.title ?? "Dashboard";

  return (
    <header
      className="flex items-center justify-between bg-white px-6 md:px-10"
      style={{
        height: "80px",
        borderBottom: "1px solid #F6F6F6",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="flex items-center" style={{ gap: "16px" }}>
        {/* Hamburger — mobile only (opens the nav drawer) */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="md:hidden hover:opacity-80"
          style={{ background: "none", border: "none", padding: 0, width: "24px", height: "24px" }}
        >
          <Image src="/icons/dash/menu-burger.svg" alt="" width={24} height={24} />
        </button>

        <h1
          className="text-base md:text-xl font-semibold"
          style={{ lineHeight: "32px", color: "#121212" }}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center" style={{ gap: "16px" }}>

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

        
        <Link
          href="/dashboard/profile"
          aria-label="View profile"
          className="flex items-center hover:opacity-80"
          style={{ gap: "12px" }}
        >
          <div className="relative shrink-0" style={{ width: "40px", height: "40px" }}>
            <div
              className="rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: "40px",
                height: "40px",
                background: "#305E82",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {userAvatar ? (
                // Dynamic remote avatar URL of unknown intrinsic size, cover-filling a fixed 40x40 container; a plain img avoids next/image fill/host constraints here.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatar} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                userInitials
              )}
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
            className="hidden md:inline"
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#121212",
            }}
          >
            {userName}
          </span>
        </Link>
      </div>
    </header>
  );
}
