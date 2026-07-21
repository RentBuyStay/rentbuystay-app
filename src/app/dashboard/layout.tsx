"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import ToastProvider from "@/components/Toast";
import GlobalSocket from "@/components/GlobalSocket";
import { getRole, setRole as persistRole, type AccountRole } from "@/lib/role";
import { userTypeToRole, isAdminType } from "@/lib/userType";
import { useGetMeQuery } from "@/services/meApi";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth/authSlice";

const USER_NAME_BY_ROLE: Partial<Record<AccountRole, string>> = {
  "Real Estate Agency or Developer": "Urban Nest Realty",
};

const USER_INITIALS_BY_ROLE: Partial<Record<AccountRole, string>> = {
  "Real Estate Agency or Developer": "UN",
};

function initialsFrom(first?: string, last?: string): string {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  return (a + b).toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<AccountRole | null>(null);
  const [checked, setChecked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: me, isError: meError } = useGetMeQuery();
  // Rehydrated from localStorage by hydrateAuth (see providers.tsx) before the
  // first client render, so a returning signed-in user reads as authenticated
  // immediately — no brief "logged-out" window that would flash /log-in.
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // Administrators belong to the admin portal, never the user dashboard —
    // even if they arrive via the shared auth cookie. Bounce them out.
    if (me && isAdminType(me.userType)) {
      router.replace("/log-in");
      return;
    }
    // Existing same-app session — role already in localStorage.
    const r = getRole();
    if (r) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(r);
      setChecked(true);
      return;
    }
    // No local role: this may be a fresh cross-app arrival (e.g. logged in on
    // the marketing site) where only the shared auth cookie exists. Trust the
    // cookie-backed /me instead of bouncing straight to log-in.
    if (me) {
      const derived = userTypeToRole(me.userType);
      persistRole(derived);
      setRole(derived);
      setChecked(true);
    } else if (meError && !isAuthenticated) {
      // Only bounce to log-in when genuinely unauthenticated. A rehydrated
      // access token means the session is real, so a transient /me failure must
      // not flash log-in — the reauth flow (services/api.ts) clears the token
      // and redirects on its own if the session is truly dead. Carry a returnTo
      // so a cross-app arrival (e.g. a listing from the marketing site) lands
      // back on that page after logging in.
      router.replace(`/log-in?returnTo=${encodeURIComponent(pathname)}`);
    }
    // else: /me still loading (or authenticated + retrying) — wait.
  }, [router, pathname, me, meError, isAuthenticated]);

  if (!checked || !role) return null;

  // Prefer the real user from GET /me; fall back to role-based defaults.
  const fullName = [me?.profile?.firstName, me?.profile?.lastName]
    .filter(Boolean)
    .join(" ");
  const userName =
    fullName || me?.organization?.name || USER_NAME_BY_ROLE[role] || "Prince Akpolo";
  const userInitials =
    initialsFrom(me?.profile?.firstName, me?.profile?.lastName) ||
    USER_INITIALS_BY_ROLE[role] ||
    "PA";
  const userAvatar = me?.profile?.avatarUrl || me?.organization?.logoUrl || null;

  return (
    <ToastProvider>
      {/* overflow-x-clip lets the content push off-screen-right without a
          scrollbar, while keeping the desktop sticky sidebar working. When the
          drawer is open the backdrop is the sidebar blue, so the content's
          rounded-left corners reveal blue (matching the Figma). */}
      <GlobalSocket />
      <div
        className="flex overflow-x-clip"
        style={{ minHeight: "100vh", background: drawerOpen ? "#305E82" : "#FFFFFF" }}
      >
        {/* Full-width tint strip across the very bottom (matches the logout
            row colour) so the content's bottom-left curve "rhythms" with it. */}
        {drawerOpen && (
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-[5]"
            style={{ height: "64px", background: "rgba(117,163,199,0.4)" }}
            aria-hidden="true"
          />
        )}
        {/* Drawer sits at the left, revealed when the content is pushed right */}
        <DashboardSidebar role={role} onClose={() => setDrawerOpen(false)} />

        <div
          className={`relative z-20 md:z-auto flex flex-col flex-1 min-w-0 bg-white transition-transform duration-200 ease-out ${
            drawerOpen
              ? "translate-x-[242px] rounded-l-[30px] overflow-hidden h-screen md:translate-x-0 md:rounded-none md:overflow-visible md:h-auto"
              : ""
          }`}
        >
          {/* Scrim over the pushed content (mobile only) */}
          {drawerOpen && (
            <div
              className="md:hidden absolute inset-0 z-[55]"
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
          )}
          <DashboardTopbar
            userName={userName}
            userInitials={userInitials}
            userAvatar={userAvatar}
            onMenuClick={() => setDrawerOpen(true)}
          />
          <main className="p-4 md:p-8 lg:px-10 lg:py-8" style={{ flex: 1 }}>{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
