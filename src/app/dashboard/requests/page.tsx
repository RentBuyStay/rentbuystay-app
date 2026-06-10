"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useGetMeQuery } from "@/services/meApi";
import { useGetPropertyTypesQuery } from "@/services/referenceApi";
import {
  useGetPropertyRequestsQuery,
  useDeletePropertyRequestMutation,
} from "@/services/propertyRequestApi";
import ReplyToRequestModal from "@/components/ReplyToRequestModal";
import { toRequestVM, type RequestVM, type RequestTag } from "@/lib/propertyRequest";

type RequestType = RequestTag;

const TYPES: ("All" | RequestType)[] = ["All", "For Rent", "For Sale", "Shortlet"];

type Tab = "All Requests" | "My Requests";
const TABS: Tab[] = ["All Requests", "My Requests"];

export default function PropertyRequestsPage() {
  // Initial tab from ?tab=my query (set by success modal "View My Requests" after Publish Request).
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams?.get("tab") === "my" ? "My Requests" : "All Requests";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [typeFilter, setTypeFilter] = useState<"All" | RequestType>("All");
  const [propTypeFilter, setPropTypeFilter] = useState<string>("Any");

  const { data: me } = useGetMeQuery();
  const { data, isLoading, isError } = useGetPropertyRequestsQuery({ page: 0, size: 50 });
  // Real property-type names (the "class" names) — same source as the listing form.
  const { data: propertyTypes } = useGetPropertyTypesQuery();
  const propTypeOptions = [
    { label: "Select type", value: "Any" },
    ...(propertyTypes ?? []).map((t) => ({ label: t.displayName, value: t.displayName })),
  ];
  const allRequests: RequestVM[] = (data?.content ?? []).map(toRequestVM);

  const matchesFilters = (r: RequestVM) => {
    if (typeFilter !== "All" && r.type !== typeFilter) return false;
    if (propTypeFilter !== "Any" && r.propertyType !== propTypeFilter) return false;
    return true;
  };

  const visibleAll = allRequests.filter(matchesFilters);
  const visibleMine = allRequests.filter((r) => r.posterUserId === me?.id).filter(matchesFilters);
  const isMy = tab === "My Requests";
  const visibleCount = isMy ? visibleMine.length : visibleAll.length;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ gap: "16px" }}>
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="hover:opacity-80 shrink-0 whitespace-nowrap"
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: active ? "#305E82" : "#807E7E",
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <span className="shrink-0" style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
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
              options={propTypeOptions}
              grow
            />
          </div>

          {/* Post Request — icon-only on mobile, "+ Post Request" on desktop */}
          <Link
            href="/dashboard/requests/new"
            aria-label="Post Request"
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 gap-0 md:gap-2 px-4 md:px-5"
            style={{
              height: "48px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>+</span>
            <span className="hidden md:inline">Post Request</span>
          </Link>
        </div>
      </div>

      
      {isLoading ? (
        <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", fontSize: "14px", color: "#807E7E" }}>
          Loading requests…
        </div>
      ) : isError ? (
        <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", fontSize: "14px", color: "#807E7E" }}>
          Couldn&rsquo;t load property requests.
        </div>
      ) : visibleCount === 0 ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "16px" }}>
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
  grow,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  /** When true, fills remaining width (the "Select type" field); otherwise a
   *  fixed-narrow field (the "For …" field) — matches the Figma proportions. */
  grow?: boolean;
}) {
  return (
    <div
      className={`flex items-center md:flex-none md:w-[140px] ${
        grow ? "flex-1 min-w-0" : "shrink-0 w-[96px]"
      }`}
      style={{
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
        gap: "8px",
        height: "48px",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none bg-transparent appearance-none flex-1 min-w-0"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
          cursor: "pointer",
          textOverflow: "ellipsis",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      
      <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} className="shrink-0" />
    </div>
  );
}

function RequestCard({ request }: { request: RequestVM }) {
  const [replyOpen, setReplyOpen] = useState(false);

  function handleMessage(e: React.MouseEvent) {
    e.stopPropagation();
    if (!request.posterUserId) return;
    setReplyOpen(true);
  }

  const avatar = (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: "40px", height: "40px", background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: "14px", fontWeight: 600 }}
    >
      {request.initials}
    </div>
  );
  const nameRow = (
    <div className="flex items-center min-w-0" style={{ gap: "4px" }}>
      <span className="truncate" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: "#121212" }}>
        {request.name}
      </span>
      <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} className="shrink-0" />
    </div>
  );

  return (
    <>
      {/* Desktop — two-column grid + "Message" button footer (Figma 348:31513) */}
      <div
        className="hidden md:flex flex-col bg-white"
        style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px", gap: "20px" }}
      >
        <div className="flex flex-col" style={{ gap: "20px" }}>
          <div className="grid grid-cols-2" style={{ gap: "24px" }}>
            <StatCell label="Seeking" value={request.seeking} valueSize="md" />
            <StatCell label="Bedroom" value={String(request.bedrooms)} valueSize="md" />
          </div>
          <div className="grid grid-cols-2" style={{ gap: "24px" }}>
            <StatCell label="Budget" value={request.budget} valueSuffix={request.budgetSuffix} valueColor="#305E82" valueSize="lg" />
            <StatCell label="Listed on" value={request.listed} valueSize="md" />
          </div>
          <div className="grid grid-cols-2" style={{ gap: "24px" }}>
            <StatCell label="Area" value={request.area} valueSize="md" />
            <StatCell label="Request by" value={request.by} valueSize="md" />
          </div>
        </div>
        <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6", gap: "12px" }}>
          <div className="flex items-center min-w-0" style={{ gap: "12px" }}>
            {avatar}
            {nameRow}
          </div>
          <button
            type="button"
            onClick={handleMessage}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0"
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

      {/* Mobile — stacked, message icon in the Request-by row (Figma 825:66979) */}
      <div
        className="md:hidden flex flex-col bg-white"
        style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px", gap: "20px" }}
      >
        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="flex items-start justify-between" style={{ gap: "16px" }}>
            <StatCell label="Seeking" value={request.seeking} />
            <StatCell label="Bedroom" value={String(request.bedrooms)} />
          </div>
          <StatCell label="Budget" value={request.budget} valueSuffix={request.budgetSuffix} valueColor="#305E82" valueSize="lg" />
          <StatCell label="Area" value={request.area} />
          <div className="flex items-end justify-between" style={{ gap: "16px" }}>
            <StatCell label="Request by" value={request.by} />
            <button
              type="button"
              onClick={handleMessage}
              aria-label="Message"
              className="shrink-0 hover:opacity-80"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "24px", height: "24px" }}
            >
              <Image src="/icons/dash/messages-2-blue.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6", gap: "12px" }}>
          <div className="flex items-center min-w-0" style={{ gap: "8px" }}>
            {avatar}
            {nameRow}
          </div>
          <span className="shrink-0" style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}>
            Listed on {request.listed}
          </span>
        </div>
      </div>

      <ReplyToRequestModal
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        posterUserId={request.posterUserId}
        name={request.name}
        initials={request.initials}
      />
    </>
  );
}

function MyRequestCard({ request }: { request: RequestVM }) {
  const [deleteRequest, { isLoading: deleting }] = useDeletePropertyRequestMutation();

  function handleDelete() {
    if (window.confirm(`Delete your request "${request.seeking}"?`)) {
      deleteRequest(request.id).unwrap().catch(() => {});
    }
  }

  return (
    <div
      className="bg-white flex flex-col w-full"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        padding: "24px",
        gap: "20px",
      }}
    >
      {/* Desktop details — two-column grid (16px values) */}
      <div className="hidden md:flex flex-col" style={{ gap: "20px" }}>
        <div className="grid grid-cols-2" style={{ gap: "24px" }}>
          <StatCell label="Seeking" value={request.seeking} valueSize="md" />
          <StatCell label="Bedroom" value={String(request.bedrooms)} valueSize="md" />
        </div>
        <div className="grid grid-cols-2" style={{ gap: "24px" }}>
          <StatCell label="Budget" value={request.budget} valueSuffix={request.budgetSuffix} valueColor="#305E82" valueSize="lg" />
          <StatCell label="Listed on" value={request.listed} valueSize="md" />
        </div>
        <div className="grid grid-cols-2" style={{ gap: "24px" }}>
          <StatCell label="Area" value={request.area} valueSize="md" />
          <StatCell label="Request by" value={request.by} valueSize="md" />
        </div>
      </div>

      {/* Mobile details — stacked (14px values) */}
      <div className="md:hidden flex flex-col" style={{ gap: "16px" }}>
        <div className="flex items-start justify-between" style={{ gap: "16px" }}>
          <StatCell label="Seeking" value={request.seeking} />
          <StatCell label="Bedroom" value={String(request.bedrooms)} />
        </div>
        <StatCell label="Budget" value={request.budget} valueSuffix={request.budgetSuffix} valueColor="#305E82" valueSize="lg" />
        <StatCell label="Area" value={request.area} />
        <StatCell label="Request by" value={request.by} />
        <StatCell label="Listed on" value={request.listed} />
      </div>

      <div
        className="flex items-center"
        style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6", gap: "16px" }}
      >
        
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
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
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <Image src="/icons/dash/trash.svg" alt="" width={20} height={20} />
          {deleting ? "Deleting…" : "Delete"}
        </button>

        
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
  valueSize = "sm",
}: {
  label: string;
  value: string;
  valueSuffix?: string;
  valueColor?: string;
  /** "sm" = 14/20 Medium (mobile values). "md" = 16/24 Medium (desktop values).
   *  "lg" = 20/24 Bold (Budget, both). */
  valueSize?: "sm" | "md" | "lg";
}) {
  const isLg = valueSize === "lg";
  const fontSize = isLg ? "20px" : valueSize === "md" ? "16px" : "14px";
  const lineHeight = valueSize === "sm" ? "20px" : "24px";
  return (
    <div className="flex flex-col min-w-0" style={{ gap: "4px" }}>
      <span style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 400, color: "#807E7E" }}>
        {label}
      </span>
      <span
        style={{
          fontSize,
          lineHeight,
          fontWeight: isLg ? 700 : 500,
          color: valueColor,
          letterSpacing: isLg ? "-0.02em" : "0",
        }}
      >
        {value}
        {valueSuffix && (
          <span style={{ fontSize: "12px", fontWeight: 400, color: "#121212" }}>{valueSuffix}</span>
        )}
      </span>
    </div>
  );
}
