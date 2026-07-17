"use client";

import Image from "next/image";
import { pageTotal } from "@/services/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetMyPropertiesQuery } from "@/services/propertyApi";
import { useGetDashboardMetricsQuery } from "@/services/analyticsApi";
import { toPropertyVM, formatPrice, type PropertyVM, type PropertyStatusLabel } from "@/lib/property";

const STATUS_STYLES: Record<PropertyStatusLabel, { bg: string; color: string }> = {
  Active: { bg: "#ECFDF3", color: "#027A48" },
  "Awaiting Approval": { bg: "#FFF7E9", color: "#EA651A" },
  Archived: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Rejected: { bg: "#FEF3F2", color: "#B42318" },
  Draft: { bg: "#F2F4F7", color: "#475467" },
};

const COLS = [
  { key: "ref", label: "Property ID", width: 150 },
  { key: "property", label: "Property", width: 260 },
  { key: "type", label: "Type", width: 120 },
  { key: "price", label: "Price", width: 160 },
  { key: "date", label: "Date", width: 130 },
  { key: "status", label: "Status", width: 130 },
];

const PAGE_SIZE = 10;

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

type Row = { vm: PropertyVM; type: string; date: string };

export default function TransactionsPage() {
  const router = useRouter();
  const { data: myProps, isLoading, isError } = useGetMyPropertiesQuery({ page: 0, size: 100 });
  const { data: dash } = useGetDashboardMetricsQuery();

  const rows: Row[] = (myProps?.content ?? []).map((p) => ({
    vm: toPropertyVM(p),
    type: p.propertyTypeName || "—",
    date: fmtDate(p.listedAt ?? p.createdAt),
  }));

  // Real where available; "Total Deals" proxied by sold/rented (Archived) listings,
  // "Additional Earnings" has no backend source yet so it shows ₦0.
  const totalListings = (pageTotal(myProps) || rows.length);
  const totalDeals = rows.filter((r) => r.vm.status === "Archived").length;
  // Revenue comes pre-formatted from the role-aware dashboard cards
  // ("Revenue" for an agency, "Total earned" for an owner/agent).
  const revenue = dash?.cards.find((c) => /revenue|earn/i.test(c.label))?.value;
  const additionalEarnings = 0;

  const metrics = [
    { label: "Total Listings", value: String(totalListings), icon: "/icons/dash/metric-home.svg" },
    { label: "Total Deals", value: String(totalDeals), icon: "/icons/dash/metric-coin.svg" },
    { label: "Revenue", value: revenue ?? formatPrice(0), icon: "/icons/dash/metric-dollar.svg" },
    { label: "Additional Earnings", value: formatPrice(additionalEarnings), icon: "/icons/dash/metric-dollar.svg" },
  ];

  // Selection + pagination (client-side over the fetched page).
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pageNum, setPageNum] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.vm.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.vm.id));
      else pageRows.forEach((r) => next.add(r.vm.id));
      return next;
    });
  }

  function exportCsv() {
    const header = ["Property ID", "Property", "Location", "Type", "Price", "Date", "Status"];
    const lines = rows.map((r) =>
      [r.vm.referenceCode, r.vm.title, r.vm.location, r.type, `${r.vm.price}${r.vm.priceSuffix ?? ""}`, r.date, r.vm.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      {/* Export CSV — desktop (Figma) */}
      <div className="hidden md:flex justify-end">
        <button
          type="button"
          onClick={exportCsv}
          disabled={rows.length === 0}
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
            cursor: rows.length === 0 ? "not-allowed" : "pointer",
            opacity: rows.length === 0 ? 0.6 : 1,
          }}
        >
          <Image src="/icons/dash/export.svg" alt="" width={20} height={20} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "16px" }}>
        {metrics.map((m) => (
          <div key={m.label} className="bg-white flex flex-col p-4 md:p-6" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", gap: "16px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src={m.icon} alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#807E7E" }}>{m.label}</span>
            </div>
            <span className="text-2xl md:text-[32px] leading-8 md:leading-10" style={{ fontWeight: 600, color: "#121212" }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
        Transaction History
      </h2>

      {isLoading ? (
        <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", fontSize: "14px", color: "#807E7E" }}>
          Loading transactions…
        </div>
      ) : isError ? (
        <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", fontSize: "14px", color: "#807E7E" }}>
          Couldn&rsquo;t load transactions.
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", fontSize: "14px", color: "#807E7E" }}>
          No transactions yet.
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block" style={{ width: "100%", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}>
            <div className="flex items-center" style={{ background: "#FFFFFF", borderBottom: "1px solid #F6F6F6" }}>
              <div style={{ padding: "12px 24px" }}>
                <Checkbox checked={allOnPageSelected} onChange={toggleAll} />
              </div>
              {COLS.map((c) => (
                <div key={c.key} style={{ flex: `1 1 ${c.width}px`, padding: "12px 24px", fontSize: "12px", lineHeight: "18px", fontWeight: 500, color: "#807E7E" }}>
                  {c.label}
                </div>
              ))}
            </div>

            {pageRows.map(({ vm, type, date }) => (
              <div key={vm.id} className="flex items-center" style={{ borderBottom: "1px solid #F6F6F6", background: "#FFFFFF" }}>
                <div style={{ padding: "16px 24px" }}>
                  <Checkbox checked={selected.has(vm.id)} onChange={() => toggle(vm.id)} />
                </div>
                <div style={{ flex: `1 1 ${COLS[0].width}px`, padding: "16px 24px", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                  {vm.referenceCode}
                </div>
                <div className="flex items-center" style={{ flex: `1 1 ${COLS[1].width}px`, padding: "12px 24px", gap: "12px", minWidth: 0 }}>
                  <div className="relative shrink-0" style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", background: "#EDEDED" }}>
                    <Image src={vm.image} alt="" fill style={{ objectFit: "cover" }} sizes="40px" />
                  </div>
                  <div className="flex flex-col" style={{ gap: "2px", minWidth: 0 }}>
                    <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {vm.title}
                    </span>
                    <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {vm.location}
                    </span>
                  </div>
                </div>
                <div style={{ flex: `1 1 ${COLS[2].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                  {type}
                </div>
                <div style={{ flex: `1 1 ${COLS[3].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: "#305E82" }}>
                  {vm.price}
                  {vm.priceSuffix ?? ""}
                </div>
                <div style={{ flex: `1 1 ${COLS[4].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                  {date}
                </div>
                <div style={{ flex: `1 1 ${COLS[5].width}px`, padding: "16px 24px" }}>
                  <StatusBadge status={vm.status} />
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between" style={{ padding: "16px 24px", borderTop: "1px solid #F6F6F6", background: "#FFFFFF" }}>
                <PagerBtn label="Previous" disabled={pageNum === 0} onClick={() => setPageNum((p) => Math.max(0, p - 1))} />
                <div className="flex items-center" style={{ gap: "4px" }}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPageNum(i)}
                      className="flex items-center justify-center"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: i === pageNum ? "rgba(120,158,187,0.1)" : "transparent",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: i === pageNum ? "#305E82" : "#807E7E",
                        cursor: "pointer",
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <PagerBtn label="Next" disabled={pageNum >= totalPages - 1} onClick={() => setPageNum((p) => Math.min(totalPages - 1, p + 1))} />
              </div>
            )}
          </div>

          {/* Mobile: deal cards */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2" style={{ gap: "24px 16px" }}>
            {rows.map(({ vm }) => (
              <DealCard key={vm.id} property={vm} onEdit={() => router.push(`/dashboard/properties/${vm.id}/edit`)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center justify-center shrink-0"
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "6px",
        border: `1px solid ${checked ? "#305E82" : "#D0D5DD"}`,
        background: checked ? "#305E82" : "#FFFFFF",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M10 3L4.5 8.5L2 6" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function PagerBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="hover:opacity-80"
      style={{
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #F6F6F6",
        background: "#FFFFFF",
        fontSize: "14px",
        fontWeight: 500,
        color: "#121212",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: PropertyStatusLabel }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ padding: "2px 8px", background: s.bg, color: s.color, borderRadius: "16px", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}
    >
      {status}
    </span>
  );
}

function DealCard({ property, onEdit }: { property: PropertyVM; onEdit: () => void }) {
  const status = STATUS_STYLES[property.status];
  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow w-full"
      style={{ height: "414px", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}
    >
      <div className="relative" style={{ width: "100%", height: "218px", background: "#EDEDED" }}>
        <Image src={property.image} alt={property.title} fill style={{ objectFit: "cover" }} sizes="100vw" />
        <span
          className="absolute"
          style={{
            right: "16px",
            bottom: "16px",
            padding: "4px 12px",
            background: "#FFAE00",
            color: "#FFFFFF",
            borderRadius: "50px",
            fontSize: "12px",
            lineHeight: "20px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {property.tag}
        </span>
      </div>

      <div className="absolute flex flex-col" style={{ left: "16px", right: "16px", top: "242px", gap: "8px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "8px", minWidth: 0 }}>
            <span style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#305E82", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
              {property.price}
              {property.priceSuffix && (
                <span style={{ fontSize: "14px", fontWeight: 400, color: "#807E7E" }}>{property.priceSuffix}</span>
              )}
            </span>
            <span
              style={{ padding: "4px 8px", borderRadius: "16px", background: status.bg, color: status.color, fontSize: "11px", lineHeight: "16px", fontWeight: 500, whiteSpace: "nowrap" }}
            >
              {property.status}
            </span>
          </div>
          <button
            type="button"
            aria-label={`Edit ${property.title}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="hover:opacity-80 shrink-0"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/dash/edit-blue.svg" alt="" width={20} height={20} style={{ width: "20px", height: "20px", maxWidth: "none", flexShrink: 0, display: "block" }} />
          </button>
        </div>

        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h3 style={{ fontSize: "16px", lineHeight: "20px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
            {property.title}
          </h3>
          <div className="flex items-center flex-wrap" style={{ gap: "4px 12px" }}>
            <span className="flex items-center" style={{ gap: "4px" }}>
              <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>{property.location}</span>
            </span>
            <span className="flex items-center" style={{ gap: "4px" }}>
              <Image src="/icons/dash/metric-eye.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>
                {property.viewCount} {property.viewCount === 1 ? "view" : "views"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
