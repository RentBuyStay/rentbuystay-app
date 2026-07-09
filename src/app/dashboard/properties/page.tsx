"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyCardImage } from "@/components/PropertyGallery";
import { useEffect, useRef, useState } from "react";
import {
  useGetMyPropertiesQuery,
  useArchivePropertyMutation,
  useDeletePropertyMutation,
} from "@/services/propertyApi";
import { toPropertyVM, type PropertyVM, type PropertyStatusLabel } from "@/lib/property";
import { getRole } from "@/lib/role";

const TABS = ["All", "Active", "Awaiting Approval", "Archived", "Rejected"] as const;
type Tab = (typeof TABS)[number];

function statusStyles(status: PropertyStatusLabel) {
  switch (status) {
    case "Active":
      return { bg: "#ECFDF3", color: "#027A48" };
    case "Awaiting Approval":
      return { bg: "#FFF7E9", color: "#EA651A" };
    case "Archived":
      return { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" };
    case "Rejected":
      return { bg: "#FEF3F2", color: "#B42318" };
    case "Draft":
    default:
      return { bg: "#F2F4F7", color: "#475467" };
  }
}

export default function MyPropertiesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (getRole() === "Property Seeker") {
      router.push("/dashboard/browse");
    }
  }, [router]);

  // Fetch the owner's listings (all statuses) and filter client-side so the
  // per-tab counts stay accurate.
  const { data, isLoading, isError, refetch } = useGetMyPropertiesQuery({
    page: 0,
    size: 100,
  });
  const properties: PropertyVM[] = (data?.content ?? []).map(toPropertyVM);

  const visible = properties.filter((p) => {
    if (activeTab !== "All" && p.status !== activeTab) return false;
    if (search && !`${p.title} ${p.location}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    All: properties.length,
    Active: properties.filter((p) => p.status === "Active").length,
    "Awaiting Approval": properties.filter((p) => p.status === "Awaiting Approval").length,
    Archived: properties.filter((p) => p.status === "Archived").length,
    Rejected: properties.filter((p) => p.status === "Rejected").length,
  };

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      

      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* Tabs — horizontally-scrollable pills on mobile, underline on desktop */}
        <div className="flex items-center gap-2 md:gap-0 overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = t === activeTab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className="shrink-0 whitespace-nowrap cursor-pointer text-xs md:text-sm font-medium"
                style={{
                  padding: "8px 12px",
                  lineHeight: "20px",
                  background: "transparent",
                  color: active ? "#305E82" : "#807E7E",
                  borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
                }}
              >
                {t} ({counts[t]})
              </button>
            );
          })}
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-3 md:gap-4 md:shrink-0">
          <div
            className="flex items-center flex-1 md:flex-none md:w-[320px]"
            style={{
              background: "#F6F6F6",
              borderRadius: "12px",
              padding: "8px 16px",
              gap: "8px",
              minWidth: 0,
              height: "44px",
            }}
          >
            <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter location, area or keyword..."
              className="flex-1 min-w-0 outline-none bg-transparent"
              style={{
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#121212",
              }}
            />
          </div>

          {/* Add — icon-only on mobile, "+ Add Property" on desktop */}
          <Link
            href="/dashboard/properties/new"
            aria-label="Add Property"
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 gap-0 md:gap-2 px-3 md:px-5"
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
            <span className="hidden md:inline">Add Property</span>
          </Link>
        </div>
      </div>

      
      {isLoading ? (
        <div
          className="bg-white flex items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", fontSize: "14px", color: "#807E7E" }}
        >
          Loading your properties…
        </div>
      ) : isError ? (
        <div
          className="bg-white flex flex-col items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", gap: "12px", fontSize: "14px", color: "#807E7E" }}
        >
          <span>Couldn&rsquo;t load your properties.</span>
          <button
            type="button"
            onClick={() => refetch()}
            style={{ color: "#305E82", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
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
          {properties.length === 0
            ? "You haven't listed any properties yet."
            : "No properties match this filter."}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "24px 16px" }}
        >
          {visible.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: PropertyVM }) {
  const status = statusStyles(property.status);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [archiveProperty, { isLoading: archiving }] = useArchivePropertyMutation();
  const [deleteProperty, { isLoading: deleting }] = useDeletePropertyMutation();

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  function go(path: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
      router.push(path);
    };
  }

  function handleArchive(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (property.status === "Archived") return; // backend has no unarchive endpoint yet
    archiveProperty({ id: property.id, reason: "OTHER" });
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Delete "${property.title}"? This can't be undone.`)) {
      deleteProperty(property.id);
    }
  }

  function noop(label: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
      console.log(`${label} ${property.id}`);
    };
  }

  const busy = archiving || deleting;

  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow w-full"
      style={{
        height: "414px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >

      <div className="relative" style={{ width: "100%", height: "218px", background: "#EDEDED" }}>
        <PropertyCardImage media={property.media} images={property.images ?? [property.image]} alt={property.title} sizes="352px" />

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

      
      <div
        className="absolute flex flex-col"
        style={{ left: "16px", right: "16px", top: "242px", gap: "8px" }}
      >
        
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "8px" }}>
            
            <span
              style={{
                fontSize: "20px",
                lineHeight: "28px",
                fontWeight: 600,
                color: "#305E82",
                letterSpacing: "-0.02em",
              }}
            >
              {property.price}
              {property.priceSuffix && (
                <span style={{ fontSize: "14px", fontWeight: 400, color: "#807E7E" }}>
                  {property.priceSuffix}
                </span>
              )}
            </span>
            {/* Status badge */}
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "16px",
                background: status.bg,
                color: status.color,
                fontSize: "11px",
                lineHeight: "16px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {property.status}
            </span>
          </div>
          
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              aria-label="Property actions"
              aria-expanded={menuOpen}
              className="hover:opacity-70"
              style={{ background: "none", border: "none", padding: 0, width: "24px", height: "24px", cursor: "pointer" }}
            >
              <Image src="/icons/dash/card-menu.svg" alt="" width={24} height={24} />
            </button>
            {menuOpen && (
              <div
                className="absolute bg-white"
                style={{
                  top: "28px",
                  right: 0,
                  minWidth: "160px",
                  padding: "8px",
                  background: "#FFFFFF",
                  border: "1px solid #F6F6F6",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(18,18,18,0.08)",
                  zIndex: 20,
                }}
              >
                <MenuItem label="Edit" onClick={go(`/dashboard/properties/${property.id}/edit`)} />
                {property.status !== "Archived" && (
                  <MenuItem label={busy ? "Archiving…" : "Archive"} onClick={handleArchive} />
                )}
                <MenuItem label="Share" onClick={noop("Share")} />
                <MenuItem label={deleting ? "Deleting…" : "Delete"} onClick={handleDelete} danger />
              </div>
            )}
          </div>
        </div>

        
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h3
            style={{
              fontSize: "16px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#121212",
              letterSpacing: "-0.02em",
            }}
          >
            {property.title}
          </h3>
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>
              {property.location}
            </span>
          </div>
        </div>

        
        <div
          className="flex items-center"
          style={{
            gap: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #F6F6F6",
            marginTop: "4px",
            fontSize: "12px",
            color: "#807E7E",
          }}
        >
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-maximize.svg" alt="" width={16} height={16} />
            {property.sqft}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bed.svg" alt="" width={16} height={16} />
            {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bath.svg" alt="" width={16} height={16} />
            {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left hover:bg-[#F6F6F6]"
      style={{
        padding: "8px 12px",
        borderRadius: "8px",
        background: "none",
        border: "none",
        fontSize: "14px",
        lineHeight: "24px",
        fontWeight: 500,
        color: danger ? "#E30045" : "#121212",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
