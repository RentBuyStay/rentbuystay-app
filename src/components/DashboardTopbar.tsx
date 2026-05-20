"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

// Figma 348:28846 / 348:30377 / 348:27434 / 341:16017 — topbar across all dashboard pages.
// Figma OO9DOX: 1168 wide x 80 tall (sits to the right of the 272-wide sidebar).
// White fill, 1px bottom border, title left + notification + help + avatar right.
// Title text changes per page: "Dashboard" / "My Properties" / "Add New Property" / "Property Requests" / etc.

// Map URL → topbar title — kept centralised so it matches Figma per page.
const TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/dashboard/properties/new", title: "Add New Property" },
  { match: (p) => p.startsWith("/dashboard/properties"), title: "My Properties" },
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
      {/* Figma topbar title — Geist SemiBold 20/32 (style_SROVGK) */}
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
        {/* Notification — Figma 341:16020 */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative hover:opacity-80"
          style={{ background: "none", border: "none", padding: 0, width: "24px", height: "24px" }}
        >
          <Image src="/icons/dash/tb-notification.svg" alt="" width={24} height={24} />
          <span
            className="absolute"
            style={{
              top: "2px",
              right: "2px",
              width: "8px",
              height: "8px",
              borderRadius: "100%",
              background: "#E11900",
              border: "1.5px solid #FFFFFF",
            }}
          />
        </button>

        {/* Message-question (Help) — Figma 341:16021 */}
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

        {/* Avatar + name — Figma Frame 2147237124 */}
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
