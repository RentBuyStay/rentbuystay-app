"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useGetMeQuery } from "@/services/meApi";
import {
  useGetPropertyRequestsQuery,
  useDeletePropertyRequestMutation,
} from "@/services/propertyRequestApi";
import { useOpenDirectConversationMutation } from "@/services/conversationApi";
import { toRequestVM, type RequestVM, type RequestTag } from "@/lib/propertyRequest";

type RequestType = RequestTag;

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

  const { data: me } = useGetMeQuery();
  const { data, isLoading, isError } = useGetPropertyRequestsQuery({ page: 0, size: 50 });
  const allRequests: RequestVM[] = (data?.content ?? []).map(toRequestVM);

  const matchesFilters = (r: RequestVM) => {
    if (typeFilter !== "All" && r.type !== typeFilter) return false;
    if (propTypeFilter !== "Any" && !r.seeking.toLowerCase().includes(propTypeFilter.toLowerCase())) return false;
    return true;
  };

  const visibleAll = allRequests.filter(matchesFilters);
  const visibleMine = allRequests.filter((r) => r.posterUserId === me?.id).filter(matchesFilters);
  const isMy = tab === "My Requests";
  const visibleCount = isMy ? visibleMine.length : visibleAll.length;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

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

        
        <div className="flex flex-wrap items-center" style={{ gap: "12px" }}>
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
      
      <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} className="shrink-0" />
    </div>
  );
}

function RequestCard({ request }: { request: RequestVM }) {
  const router = useRouter();
  const [openDirect, { isLoading: contacting }] = useOpenDirectConversationMutation();

  function handleMessage(e: React.MouseEvent) {
    e.stopPropagation();
    if (!request.posterUserId) return;
    // Open (or reuse) a direct chat with the poster, then jump to Messages with
    // that conversation selected so the user composes/sends there.
    openDirect(request.posterUserId)
      .unwrap()
      .then((conv) => router.push(`/dashboard/messages?c=${conv.id}`))
      .catch(() => {});
  }

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
          
          <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
        </div>
        
        <button
          type="button"
          onClick={handleMessage}
          disabled={contacting}
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
            cursor: contacting ? "not-allowed" : "pointer",
            opacity: contacting ? 0.6 : 1,
          }}
        >
          <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
          {contacting ? "Opening…" : "Message"}
        </button>
      </div>
    </div>
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
  valueSize = "md",
}: {
  label: string;
  value: string;
  valueSuffix?: string;
  
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
