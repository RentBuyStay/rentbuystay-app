"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

// Figma 348:30376 (Desktop-19) — Property Owner / Property Requests
// Top: tabs "All Requests" / "My Requests" at x:312 y:124
// Right side of header: Filter: dropdowns + Post Request button at x:899 y:120 w:501
// Body: 2-col grid of request cards (532 wide each, gap 16) at x:312 y:198

type RequestType = "For Rent" | "For Sale" | "Shortlet";
type RequesterKind = "Individual" | "Real Estate Agent" | "Corporate" | "Family";

type SeekerRequest = {
  id: string;
  seeking: string;
  type: RequestType;
  bedrooms: number | "Studio";
  area: string;
  by: RequesterKind;
  budget: string;
  budgetSuffix?: string;
  listed: string;
  initials: string;
  name: string;
};

const REQUESTS: SeekerRequest[] = [
  { id: "r1", seeking: "House for Rent", type: "For Rent", bedrooms: 1, area: "Lekki Phase 1, Lagos", by: "Individual", budget: "₦800,000", budgetSuffix: "/year", listed: "15 Apr 2026", initials: "CO", name: "Chioma Okeke" },
  { id: "r2", seeking: "Apartment for Sale", type: "For Sale", bedrooms: 3, area: "Ikoyi, Lagos", by: "Real Estate Agent", budget: "₦45,000,000", listed: "15 Apr 2026", initials: "EN", name: "Emeka Nwosu" },
  { id: "r3", seeking: "Apartment for Rent", type: "For Rent", bedrooms: 2, area: "Victoria Island, Lagos", by: "Corporate", budget: "₦1,500,000", budgetSuffix: "/year", listed: "20 Apr 2026", initials: "TB", name: "Tunde Balogun" },
  { id: "r4", seeking: "Apartment for Rent", type: "For Rent", bedrooms: 2, area: "Victoria Island, Lagos", by: "Real Estate Agent", budget: "₦1,500,000", budgetSuffix: "/year", listed: "20 Apr 2026", initials: "TB", name: "Tunde Balogun" },
  { id: "r5", seeking: "Studio for Rent", type: "For Rent", bedrooms: "Studio", area: "Ikoyi, Lagos", by: "Individual", budget: "₦600,000", budgetSuffix: "/year", listed: "18 Apr 2026", initials: "AY", name: "Amina Yusuf" },
  { id: "r6", seeking: "Studio for Rent", type: "For Rent", bedrooms: "Studio", area: "Ikoyi, Lagos", by: "Individual", budget: "₦600,000", budgetSuffix: "/year", listed: "18 Apr 2026", initials: "AY", name: "Amina Yusuf" },
  { id: "r7", seeking: "Duplex for Rent", type: "For Rent", bedrooms: 4, area: "Surulere, Lagos", by: "Family", budget: "₦2,200,000", budgetSuffix: "/year", listed: "22 Apr 2026", initials: "EN", name: "Emeka Nwosu" },
  { id: "r8", seeking: "Bungalow for Rent", type: "For Rent", bedrooms: 3, area: "Ajah, Lagos", by: "Individual", budget: "₦1,200,000", budgetSuffix: "/year", listed: "19 Apr 2026", initials: "CO", name: "Chinwe Obi" },
];

// My Requests — sample data per Figma Desktop-21 (348:32888): one published request
type MyRequest = Omit<SeekerRequest, "initials" | "name">;
const MY_REQUESTS: MyRequest[] = [
  {
    id: "mr1",
    seeking: "Mini Flat for Rent",
    type: "For Rent",
    bedrooms: 1,
    area: "Yaba, Lagos",
    by: "Individual",
    budget: "₦1,200,000",
    budgetSuffix: "/year",
    listed: "15 Apr 2026",
  },
];

const TYPES: ("All" | RequestType)[] = ["All", "For Rent", "For Sale", "Shortlet"];
const PROPERTY_TYPES = ["Any", "Apartment", "House", "Duplex", "Studio", "Bungalow", "Office Space"];

type Tab = "All Requests" | "My Requests";
const TABS: Tab[] = ["All Requests", "My Requests"];

export default function PropertyRequestsPage() {
  // Initial tab from ?tab=my query (set by success modal "View My Requests" after Publish Request).
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams?.get("tab") === "my" ? "My Requests" : "All Requests";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [typeFilter, setTypeFilter] = useState<"All" | RequestType>("All");
  const [propTypeFilter, setPropTypeFilter] = useState<string>("Any");

  // All Requests: feed from REQUESTS (other property seekers).
  // My Requests: feed from MY_REQUESTS (property owner's own posts) — Figma Desktop-21.
  const visibleAll = REQUESTS.filter((r) => {
    if (typeFilter !== "All" && r.type !== typeFilter) return false;
    if (propTypeFilter !== "Any" && !r.seeking.toLowerCase().includes(propTypeFilter.toLowerCase())) return false;
    return true;
  });
  const visibleMine = MY_REQUESTS.filter((r) => {
    if (typeFilter !== "All" && r.type !== typeFilter) return false;
    if (propTypeFilter !== "Any" && !r.seeking.toLowerCase().includes(propTypeFilter.toLowerCase())) return false;
    return true;
  });
  const isMy = tab === "My Requests";
  const visibleCount = isMy ? visibleMine.length : visibleAll.length;

  return (
    <div className="flex flex-col" style={{ gap: "24px", maxWidth: "1088px" }}>
      {/* Page title + toolbar — Figma: tabs at left + filter + Post Request on right */}
      <div className="flex items-center justify-between">
        {/* Tabs — Figma Frame 2147237068: row gap 16, each 120x40 padding 8 16 */}
        <div className="flex items-center" style={{ gap: "0" }}>
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="hover:opacity-80"
                style={{
                  width: "140px",
                  height: "40px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: active ? "#305E82" : "#807E7E",
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "2px solid #305E82" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Filter + Post Request — Figma Frame 2147237139: row gap 16 */}
        <div className="flex items-center" style={{ gap: "16px" }}>
          <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#807E7E", letterSpacing: "-0.02em" }}>
            Filter:
          </span>
          <FilterSelect
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as "All" | RequestType)}
            options={TYPES.map((t) => ({ label: t === "All" ? "For ..." : t, value: t }))}
          />
          <FilterSelect
            value={propTypeFilter}
            onChange={setPropTypeFilter}
            options={PROPERTY_TYPES.map((t) => ({ label: t === "Any" ? "Select type" : t, value: t }))}
          />
          {/* Post Request — Figma fill_4YDD5D: orange (bottom) + blue gradient (top).
              Top wins → blue gradient. */}
          <Link
            href="/dashboard/requests/new"
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{
              height: "40px",
              padding: "8px 20px",
              gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: "16px" }}>+</span>
            Post Request
          </Link>
        </div>
      </div>

      {/* Cards grid — Figma Frame 2147237160: 2-col layout (532 each), gap 16.
          All Requests: seeker cards with avatar + Message button.
          My Requests: owner's own cards with Delete + Edit Request buttons (Figma Desktop-21). */}
      {visibleCount === 0 ? (
        <div
          className="bg-white flex items-center justify-center"
          style={{
            border: "1px solid #F6F6F6",
            borderRadius: "20px",
            padding: "80px",
            fontSize: "14px",
            color: "#807E7E",
          }}
        >
          {isMy
            ? "You haven't posted any property requests yet."
            : "No requests match your filters."}
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
          {isMy
            ? visibleMine.map((r) => <MyRequestCard key={r.id} request={r} />)
            : visibleAll.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div
      className="flex items-center"
      style={{
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
        gap: "8px",
        height: "40px",
        minWidth: "140px",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none bg-transparent appearance-none flex-1"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {/* arrow-down — Figma 348:32095 / componentId 7:200. Already on disk as chevron-down.svg */}
      <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} className="shrink-0" />
    </div>
  );
}

function RequestCard({ request }: { request: SeekerRequest }) {
  // Figma 348:31513 — 532x316 white r:20 with 1px #F6F6F6 stroke.
  // Grid: 2 columns, 16px gap (2 cards = 1088 = 532*2 + 24 gap... actually 16 looks tighter).
  return (
    <div
      className="bg-white flex flex-col"
      style={{
        width: "100%",
        height: "316px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        padding: "24px",
        gap: "20px",
      }}
    >
      {/* Row 1 — Seeking (left) | Bedroom (right) — Figma layout: 2-col grid */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <StatCell label="Seeking" value={request.seeking} valueColor="#121212" valueSize="lg" />
        <StatCell label="Bedroom" value={String(request.bedrooms)} />
      </div>

      {/* Row 2 — Budget (navy blue) | Listed on */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <StatCell
          label="Budget"
          value={request.budget}
          valueSuffix={request.budgetSuffix}
          valueColor="#305E82"
          valueSize="lg"
        />
        <StatCell label="Listed on" value={request.listed} />
      </div>

      {/* Row 3 — Area | Request by */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <StatCell label="Area" value={request.area} />
        <StatCell label="Request by" value={request.by} />
      </div>

      {/* Footer: avatar+name(+verified) + Message — Figma Frame 2147237068 */}
      <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
        <div className="flex items-center" style={{ gap: "12px" }}>
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: "40px",
              height: "40px",
              background: "#305E82",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {request.initials}
          </div>
          <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
            {request.name}
          </span>
          {/* Verified check — Figma 348:31540 (componentId 36:1509 "verify"). 20x20. */}
          <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
        </div>
        {/* Message button — Figma 348:31586: 173.5x48, padding 8/24, gap 8, blue gradient r:12.
            Contains messages-2 SVG (20x20 white) + "Message" text.
            Figma prototype: ON_CLICK → 348:32110 overlay (reply-to-request modal). */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: open reply-to-request modal (Figma 348:32110)
          }}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
          Message
        </button>
      </div>
    </div>
  );
}

// MyRequestCard — Figma Desktop-21 (348:32888). Same body as RequestCard but:
// footer has Delete (outlined #F6F6F6 stroke, #E30045 text+icon)
// + Edit Request (solid blue gradient, white text+icon).
// Both buttons: 242x48, padding 8/24, r:12, gap 8 (icon + text).
function MyRequestCard({ request }: { request: MyRequest }) {
  return (
    <div
      className="bg-white flex flex-col"
      style={{
        width: "100%",
        height: "316px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        padding: "24px",
        gap: "20px",
      }}
    >
      {/* Row 1 — Seeking title | Bedroom */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <StatCell label="Seeking" value={request.seeking} valueColor="#121212" valueSize="lg" />
        <StatCell label="Bedroom" value={String(request.bedrooms)} />
      </div>

      {/* Row 2 — Budget (navy) | Listed on */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <StatCell
          label="Budget"
          value={request.budget}
          valueSuffix={request.budgetSuffix}
          valueColor="#305E82"
          valueSize="lg"
        />
        <StatCell label="Listed on" value={request.listed} />
      </div>

      {/* Row 3 — Area | Request by */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <StatCell label="Area" value={request.area} />
        <StatCell label="Request by" value={request.by} />
      </div>

      {/* Footer: Delete (red outline) + Edit Request (blue gradient) — Figma 348:33507 row gap 16 */}
      <div
        className="flex items-center"
        style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6", gap: "16px" }}
      >
        {/* Delete — Figma 348:33508: 242x48 padding 8/24, bg none, stroke #F6F6F6, text+icon #E30045.
            Prototype: trash ON_CLICK → OVERLAY (delete confirm modal) — placeholder for now. */}
        <button
          type="button"
          onClick={() => {
            // TODO: open delete-confirm modal
          }}
          className="flex items-center justify-center hover:bg-[#FFF5F8] transition-colors"
          style={{
            flex: 1,
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "transparent",
            border: "1px solid #F6F6F6",
            borderRadius: "12px",
            color: "#E30045",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/trash.svg" alt="" width={20} height={20} />
          Delete
        </button>

        {/* Edit Request — Figma 348:33511: same dims, blue gradient bg, white text+icon */}
        <Link
          href={`/dashboard/requests/${request.id}/edit`}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{
            flex: 1,
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <Image src="/icons/dash/edit.svg" alt="" width={20} height={20} />
          Edit Request
        </Link>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  valueSuffix,
  valueColor = "#121212",
  valueSize = "md",
}: {
  label: string;
  value: string;
  valueSuffix?: string;
  /** Override value text color — e.g. #305E82 navy for Budget per Figma */
  valueColor?: string;
  /** "lg" = 16/24 SemiBold (Seeking title, Budget). "md" = 14/20 Medium (rest). */
  valueSize?: "md" | "lg";
}) {
  const isLg = valueSize === "lg";
  return (
    <div className="flex flex-col" style={{ gap: "4px" }}>
      <span style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 400, color: "#807E7E" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: isLg ? "16px" : "14px",
          lineHeight: isLg ? "24px" : "20px",
          fontWeight: isLg ? 600 : 500,
          color: valueColor,
          letterSpacing: isLg ? "-0.02em" : "0",
        }}
      >
        {value}
        {valueSuffix && (
          <span style={{ fontSize: "12px", fontWeight: 400, color: "#807E7E" }}>{valueSuffix}</span>
        )}
      </span>
    </div>
  );
}
