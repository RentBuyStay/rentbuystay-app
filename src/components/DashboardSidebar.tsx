"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { roleBadgeLabel, type AccountRole } from "@/lib/role";
import { useLogoutMutation } from "@/services/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logOut, selectRefreshToken } from "@/features/auth/authSlice";

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

const ownerGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "/icons/dash/nav-dashboard.svg" }],
  },
  {
    label: "LISTINGS",
    items: [
      { label: "My Properties", href: "/dashboard/properties", icon: "/icons/dash/nav-properties.svg" },
      { label: "Add New Property", href: "/dashboard/properties/new", icon: "/icons/dash/nav-add-property.svg" },
      { label: "Saved Properties", href: "/dashboard/saved", icon: "/icons/dash/nav-saved.svg" },
      { label: "Property Requests", href: "/dashboard/requests", icon: "/icons/dash/nav-requests.svg" },
      { label: "Inquiries/Messages", href: "/dashboard/messages", icon: "/icons/dash/nav-messages.svg" },
      { label: "Appointments", href: "/dashboard/appointments", icon: "/icons/dash/nav-calendar.svg" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Transactions", href: "/dashboard/transactions", icon: "/icons/dash/nav-transactions.svg" },
      { label: "Subscription", href: "/dashboard/subscription", icon: "/icons/dash/nav-subscription.svg" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: "/icons/dash/nav-profile.svg" },
      { label: "Verification", href: "/dashboard/verification", icon: "/icons/dash/nav-verification.svg" },
      { label: "Settings", href: "/dashboard/settings", icon: "/icons/dash/nav-settings.svg" },
    ],
  },
];

const seekerGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "/icons/dash/nav-dashboard.svg" }],
  },
  {
    label: "DISCOVER",
    items: [
      { label: "Browse Properties", href: "/dashboard/browse", icon: "/icons/dash/nav-search.svg" },
      { label: "Saved Properties", href: "/dashboard/saved", icon: "/icons/dash/nav-saved.svg" },
      { label: "Property Requests", href: "/dashboard/requests", icon: "/icons/dash/nav-seeker-requests.svg" },
      { label: "Discover Agents", href: "/dashboard/agents", icon: "/icons/dash/nav-discover-agents.svg" },
    ],
  },
  {
    label: "ACTIVITY",
    items: [
      { label: "Inquiries/Messages", href: "/dashboard/messages", icon: "/icons/dash/nav-messages.svg" },
      { label: "Appointments", href: "/dashboard/appointments", icon: "/icons/dash/nav-calendar.svg" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: "/icons/dash/nav-profile.svg" },
      { label: "Settings", href: "/dashboard/settings", icon: "/icons/dash/nav-settings.svg" },
    ],
  },
];

const agentGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "/icons/dash/nav-dashboard.svg" }],
  },
  {
    label: "LISTINGS",
    items: [
      { label: "My Properties", href: "/dashboard/properties", icon: "/icons/dash/nav-properties.svg" },
      { label: "Add New Property", href: "/dashboard/properties/new", icon: "/icons/dash/nav-add-property.svg" },
      { label: "Saved Properties", href: "/dashboard/saved", icon: "/icons/dash/nav-saved.svg" },
      { label: "Property Requests", href: "/dashboard/requests", icon: "/icons/dash/nav-requests.svg" },
    ],
  },
  {
    label: "CLIENT MANAGEMENT",
    items: [
      { label: "Inquiries/Messages", href: "/dashboard/messages", icon: "/icons/dash/nav-messages.svg" },
      { label: "Appointments", href: "/dashboard/appointments", icon: "/icons/dash/nav-calendar.svg" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Transactions", href: "/dashboard/transactions", icon: "/icons/dash/nav-transactions.svg" },
      { label: "Subscription", href: "/dashboard/subscription", icon: "/icons/dash/nav-subscription.svg" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: "/icons/dash/nav-profile.svg" },
      { label: "Verification", href: "/dashboard/verification", icon: "/icons/dash/nav-verification.svg" },
      { label: "Settings", href: "/dashboard/settings", icon: "/icons/dash/nav-settings.svg" },
    ],
  },
];

const agencyGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "/icons/dash/nav-dashboard.svg" }],
  },
  {
    label: "LISTINGS",
    items: [
      { label: "All Properties", href: "/dashboard/properties", icon: "/icons/dash/nav-properties.svg" },
      { label: "Agents Management", href: "/dashboard/agents-management", icon: "/icons/dash/badge-user-tag.svg" },
      { label: "Add New Property", href: "/dashboard/properties/new", icon: "/icons/dash/nav-add-property.svg" },
      { label: "Saved Properties", href: "/dashboard/saved", icon: "/icons/dash/nav-saved.svg" },
    ],
  },
  {
    label: "CLIENT MANAGEMENT",
    items: [
      { label: "Inquiries/Messages", href: "/dashboard/messages", icon: "/icons/dash/nav-messages.svg" },
      { label: "Appointments", href: "/dashboard/appointments", icon: "/icons/dash/nav-calendar.svg" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Transactions", href: "/dashboard/transactions", icon: "/icons/dash/nav-transactions.svg" },
      { label: "Subscription", href: "/dashboard/subscription", icon: "/icons/dash/nav-subscription.svg" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: "/icons/dash/nav-profile.svg" },
      { label: "Verification", href: "/dashboard/verification", icon: "/icons/dash/nav-verification.svg" },
      { label: "Settings", href: "/dashboard/settings", icon: "/icons/dash/nav-settings.svg" },
    ],
  },
];

const GROUPS_BY_ROLE: Partial<Record<AccountRole, NavGroup[]>> = {
  "Property Owner": ownerGroups,
  "Property Seeker": seekerGroups,
  "Real Estate Agent": agentGroups,
  "Real Estate Agency or Developer": agencyGroups,
};

const BADGE_ICON_BY_ROLE: Partial<Record<AccountRole, string>> = {
  "Property Owner": "/icons/dash/nav-profile-tick.svg",
  "Property Seeker": "/icons/dash/nav-profile-tick.svg",
  "Real Estate Agent": "/icons/dash/badge-user-tag.svg",
  "Real Estate Agency or Developer": "/icons/dash/badge-user-tag.svg",
};

const TINT = "rgba(117,163,199,0.4)";

export default function DashboardSidebar({
  role,
  onClose,
}: {
  role: AccountRole;
  /** kept for API compat; the drawer is revealed by the push layout, not a slide */
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector(selectRefreshToken);
  const [logout] = useLogoutMutation();
  const groups = GROUPS_BY_ROLE[role] ?? [];

  async function handleLogout() {
    // Revoke the refresh token server-side (best effort), then clear ALL local
    // auth — tokens + role + cached API state — so no stale JWT lingers.
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {
      /* ignore network/again errors — local clear below is what matters */
    }
    dispatch(logOut());
    router.replace("/log-in");
  }
  return (
    <aside
      className="flex flex-col text-white shrink-0 fixed md:sticky top-0 left-0 z-10 md:z-auto w-[242px] md:w-[272px]"
      style={{
        background: "#305E82",
        height: "100vh",
      }}
    >

      <div style={{ paddingTop: "24px" }}>
        <Image
          src="/icons/dash/rbs-dash-logo.svg"
          alt="RentBuyStay"
          width={272}
          height={56}
          priority
          className="w-full h-auto"
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
          <Image src={BADGE_ICON_BY_ROLE[role] ?? "/icons/dash/nav-profile-tick.svg"} alt="" width={20} height={20} />
          <span
            style={{
              fontSize: "12px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#FFFFFF",
            }}
          >
            {roleBadgeLabel(role)}
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
                  onClick={onClose}
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

      
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-between hover:opacity-90 w-full"
        style={{
          height: "64px",
          padding: "12px 24px",
          background: TINT,
          border: "none",
          cursor: "pointer",
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
      </button>
    </aside>
  );
}
