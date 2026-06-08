"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import { getRole, type AccountRole } from "@/lib/role";

const USER_NAME_BY_ROLE: Partial<Record<AccountRole, string>> = {
  "Real Estate Agency or Developer": "Urban Nest Realty",
};

const USER_INITIALS_BY_ROLE: Partial<Record<AccountRole, string>> = {
  "Real Estate Agency or Developer": "UN",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole | null>(null);
  const [checked, setChecked] = useState(false);

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

  return (
    <div className="flex bg-white" style={{ minHeight: "100vh" }}>
      <DashboardSidebar role={role} />
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
        <DashboardTopbar
          userName={USER_NAME_BY_ROLE[role] ?? "Prince Akpolo"}
          userInitials={USER_INITIALS_BY_ROLE[role] ?? "PA"}
        />
        <main style={{ padding: "32px 40px", flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
