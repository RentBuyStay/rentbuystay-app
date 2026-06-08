"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import ToastProvider from "@/components/Toast";
import { getRole, type AccountRole } from "@/lib/role";
import { useGetMeQuery } from "@/services/meApi";

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
  const [role, setRole] = useState<AccountRole | null>(null);
  const [checked, setChecked] = useState(false);
  const { data: me } = useGetMeQuery();

  useEffect(() => {
    const r = getRole();
    if (!r) {
      router.replace("/log-in");
      return;
    }
    setRole(r);
    setChecked(true);
  }, [router]);

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

  return (
    <ToastProvider>
      <div className="flex bg-white" style={{ minHeight: "100vh" }}>
        <DashboardSidebar role={role} />
        <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
          <DashboardTopbar
            userName={userName}
            userInitials={userInitials}
          />
          <main style={{ padding: "32px 40px", flex: 1 }}>{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
