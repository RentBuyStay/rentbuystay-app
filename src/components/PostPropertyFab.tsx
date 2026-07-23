"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRole, type AccountRole } from "@/lib/role";

// Only roles that actually list get the create shortcut. A Property Seeker
// browses; they never post, so no FAB for them.
const LISTER_ROLES: AccountRole[] = [
  "Property Owner",
  "Real Estate Agent",
  "Real Estate Agency or Developer",
];

// The FAB lives on the dashboard landing page only — the screen a lister hits
// right after login. Elsewhere the side menu's "Add New Property" covers it, so
// a floating "+" would just be clutter on account/settings pages.
const HOME_ROUTE = "/dashboard";

/**
 * "Post a property" floating action button, shown on the dashboard home for the
 * roles that can list (Owner / Agent / Agency). Puts the create action in front
 * of the user the moment they land, no menu-hunting — the TikTok/Gmail "+"
 * pattern. Icon-only circle on mobile; expands to a labelled pill from md up.
 */
export default function PostPropertyFab({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname() ?? "";
  const [role, setRole] = useState<AccountRole | null>(null);

  useEffect(() => {
    // One-time read of the persisted role after mount (hydration-safe).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(getRole());
  }, []);

  if (!role || !LISTER_ROLES.includes(role)) return null;
  if (pathname !== HOME_ROUTE) return null;

  return (
    <Link
      href="/dashboard/properties/new"
      aria-label="Post a property"
      className={`${hidden ? "hidden" : "flex"} fixed z-40 items-center justify-center gap-0 md:gap-2 w-14 md:w-auto md:px-6 text-white hover:opacity-95 active:scale-95 transition-[opacity,transform] duration-150 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#305E82]`}
      style={{
        right: "max(20px, env(safe-area-inset-right))",
        bottom: "calc(20px + env(safe-area-inset-bottom))",
        height: "56px",
        borderRadius: "9999px",
        background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        border: "1px solid rgba(120,158,187,0.5)",
        boxShadow: "0 10px 24px rgba(48,94,130,0.38)",
        fontSize: "15px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="hidden md:inline">Post Property</span>
    </Link>
  );
}
