"use client";

import Link from "next/link";

/**
 * Primary "Post Property" call-to-action — the brand-blue gradient button that
 * takes a lister straight to the add-property form. Shared by the dashboard home
 * header and the My Properties page so the two never drift apart.
 */
export default function PostPropertyButton({
  label = "Post Property",
  compactOnMobile = false,
  className = "",
}: {
  /** Button text next to the "+". */
  label?: string;
  /** Show just the "+" on mobile, revealing the label from md up. */
  compactOnMobile?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/dashboard/properties/new"
      aria-label={label}
      className={`flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 ${
        compactOnMobile ? "gap-0 md:gap-2 px-3 md:px-5" : "gap-2 px-5"
      } ${className}`}
      style={{
        height: "44px",
        background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        border: "1px solid rgba(120,158,187,0.5)",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
      <span className={compactOnMobile ? "hidden md:inline" : ""}>{label}</span>
    </Link>
  );
}
