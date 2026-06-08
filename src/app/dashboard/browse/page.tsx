"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import SeekerPropertyCard, { type SeekerListing } from "@/components/SeekerPropertyCard";
import SeekerPropertyRow from "@/components/SeekerPropertyRow";
import {
  useGetActivePropertiesQuery,
  useGetSavedPropertiesQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from "@/services/propertyApi";
import { useGetPropertyTypesQuery } from "@/services/referenceApi";
import { toSeekerListing } from "@/lib/property";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";

const PAGE_SIZE = 12;

const BrowseLeafletMap = dynamic(() => import("@/components/BrowseLeafletMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#807E7E",
        fontSize: "14px",
      }}
    >
      Loading map…
    </div>
  ),
});

const BEDROOMS = ["Any", "1", "2", "3", "4", "5+"];
const MIN_PRICE = ["No min", "₦100k", "₦500k", "₦1m", "₦5m", "₦10m"];
const MAX_PRICE = ["No max", "₦500k", "₦1 million", "₦5 million", "₦10 million", "₦100 million"];
const FURNISHED = ["Any", "Furnished", "Unfurnished", "Semi-Furnished"];
const SORT = ["Newest", "Oldest", "Price: Low to High", "Price: High to Low"];

const LISTING_FROM_FILTER: Record<string, string> = {
  "For Sale": "BUY",
  "For Rent": "RENT",
  Shortlet: "SHORTLET",
};

/** Parse a price dropdown label (e.g. "₦500k", "₦1 million") to a number, or null. */
function parsePriceFilter(s: string): number | null {
  if (!s || /^no (min|max)$/i.test(s)) return null;
  const t = s.toLowerCase().replace(/[₦,\s]/g, "").replace("million", "m");
  const m = t.match(/^([\d.]+)(k|m)?$/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (m[2] === "k") n *= 1_000;
  if (m[2] === "m") n *= 1_000_000;
  return n;
}

/** Min-bedrooms from the dropdown ("Any" → null, "5+" → 5). */
function parseBedroomsFilter(s: string): number | null {
  if (!s || s === "Any") return null;
  return parseInt(s, 10) || null;
}


export default function BrowsePropertiesPage() {
  const [search, setSearch] = useState("");
  const [filterAll, setFilterAll] = useState("All");
  const [propertyType, setPropertyType] = useState("Any");
  const [bedrooms, setBedrooms] = useState("Any");
  const [minPrice, setMinPrice] = useState(MIN_PRICE[0]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE[0]);
  const [furnished, setFurnished] = useState(FURNISHED[0]);
  const [sort, setSort] = useState(SORT[0]);
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [page, setPage] = useState(1);

  const { data: propPage, isLoading, isError } = useGetActivePropertiesQuery({ page: 0, size: 100 });
  const { data: savedPage } = useGetSavedPropertiesQuery({ page: 0, size: 100 });
  const { data: propertyTypes = [] } = useGetPropertyTypesQuery();
  const [saveProperty] = useSavePropertyMutation();
  const [unsaveProperty] = useUnsavePropertyMutation();
  const { toast } = useToast();

  const savedIds = new Set((savedPage?.content ?? []).map((p) => p.id));
  const typeOptions = ["Any", ...propertyTypes.map((t) => t.displayName)];

  // The backend currently ignores GET /properties filter/sort params, so filter
  // and sort client-side on the raw response (we have price/beds/type/listing).
  const selectedTypeId = propertyTypes.find((t) => t.displayName === propertyType)?.id;
  const minP = parsePriceFilter(minPrice);
  const maxP = parsePriceFilter(maxPrice);
  const minBeds = parseBedroomsFilter(bedrooms);
  const q = search.trim().toLowerCase();

  const filteredRaw = (propPage?.content ?? []).filter((p) => {
    if (filterAll !== "All" && p.listingType !== LISTING_FROM_FILTER[filterAll]) return false;
    if (selectedTypeId != null && p.propertyTypeId !== selectedTypeId) return false;
    if (minBeds != null && (p.bedrooms ?? 0) < minBeds) return false;
    if (minP != null && (p.price ?? 0) < minP) return false;
    if (maxP != null && (p.price ?? 0) > maxP) return false;
    if (q && !`${p.title} ${p.city ?? ""} ${p.state ?? ""} ${p.address ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sortedRaw = [...filteredRaw].sort((a, b) => {
    if (sort === "Price: Low to High") return (a.price ?? 0) - (b.price ?? 0);
    if (sort === "Price: High to Low") return (b.price ?? 0) - (a.price ?? 0);
    const ta = new Date(a.createdAt ?? 0).getTime();
    const tb = new Date(b.createdAt ?? 0).getTime();
    return sort === "Oldest" ? ta - tb : tb - ta; // Newest default
  });

  const filtered: SeekerListing[] = sortedRaw.map(toSeekerListing);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = view === "map" ? filtered : filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function toggleSave(id: string, currentlySaved: boolean) {
    try {
      if (currentlySaved) {
        await unsaveProperty(id).unwrap();
        toast("Removed from saved", "info");
      } else {
        await saveProperty(id).unwrap();
        toast("Saved to your list", "success");
      }
    } catch (e) {
      toast(unwrapApiError(e)?.message ?? "Couldn’t update your saved list.", "error");
    }
  }

  return (
    <div className="flex flex-col" style={{ gap: "40px" }}>

      <div className="flex flex-col" style={{ gap: "16px" }}>
        <p style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>
          Discover properties matching your needs across Nigeria.
        </p>

        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="flex items-center" style={{ gap: "16px" }}>
            <DropdownPill value={filterAll} onChange={setFilterAll} options={["All", "For Sale", "For Rent", "Shortlet"]} />

            <div
              className="flex items-center"
              style={{
                flex: 1,
                height: "48px",
                background: "#F6F6F6",
                borderRadius: "12px",
                padding: "8px 16px",
                gap: "8px",
              }}
            >
              <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter location, area, property type or keyword..."
                className="flex-1 outline-none bg-transparent"
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 400,
                  color: "#121212",
                  letterSpacing: "-0.02em",
                }}
              />
            </div>

            <button
              type="button"
              className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{
                width: "160px",
                height: "48px",
                padding: "8px 24px",
                background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
                border: "1px solid rgba(120,158,187,0.5)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center hover:opacity-80"
              style={{
                height: "48px",
                padding: "8px 16px",
                gap: "8px",
                background: "#F6F6F6",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                cursor: "pointer",
              }}
            >
              <Image src="/icons/dash/filter-setting.svg" alt="" width={16} height={16} />
              Filter
            </button>
          </div>

          <div className="flex items-center" style={{ gap: "16px" }}>
            <FilterField label="Property Type" value={propertyType} onChange={setPropertyType} options={typeOptions} width={205} />
            <FilterField label="Bedrooms" value={bedrooms} onChange={setBedrooms} options={BEDROOMS} width={204} />
            <FilterField label="Min. Price" value={minPrice} onChange={setMinPrice} options={MIN_PRICE} width={204} />
            <FilterField label="Max Price" value={maxPrice} onChange={setMaxPrice} options={MAX_PRICE} width={205} />
            <FilterField label="Furnished" value={furnished} onChange={setFurnished} options={FURNISHED} width={205} />
          </div>
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: "24px" }}>
        <div className="flex items-center justify-between">
          <p style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>
            Showing {visible.length} of {filtered.length.toLocaleString()}{" "}
            {filtered.length === 1 ? "property" : "properties"}
          </p>

          <div className="flex items-center" style={{ gap: "24px" }}>
            <SortDropdown value={sort} onChange={setSort} options={SORT} />

            <div className="flex items-center" style={{ gap: "16px" }}>
              <ViewToggle icon="/icons/dash/view-grid.svg" active={view === "grid"} onClick={() => setView("grid")} label="Grid view" />
              <ViewToggle icon="/icons/dash/view-list.svg" active={view === "list"} onClick={() => setView("list")} label="List view" />
              <ViewToggle icon="/icons/dash/view-map.svg" active={view === "map"} onClick={() => setView("map")} label="Map view" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}>
            Loading properties…
          </div>
        ) : isError ? (
          <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}>
            Couldn&rsquo;t load properties.
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}>
            No properties match your search.
          </div>
        ) : view === "list" ? (
          <div className="flex flex-col" style={{ gap: "16px" }}>
            {visible.map((l) => (
              <SeekerPropertyRow key={l.id} listing={l} />
            ))}
          </div>
        ) : view === "map" ? (
          <BrowseMapView listings={visible} />
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px 16px" }}>
            {visible.map((l) => (
              <SeekerPropertyCard
                key={l.id}
                listing={l}
                saved={savedIds.has(l.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}
      </div>

      {view !== "map" && filtered.length > 0 && (
        <Pagination current={safePage} total={totalPages} onChange={setPage} />
      )}
    </div>
  );
}

function DropdownPill({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div
      className="flex items-center"
      style={{
        height: "48px",
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none bg-transparent appearance-none"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
          paddingRight: "24px",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ marginLeft: "-16px", pointerEvents: "none" }} />
    </div>
  );
}

function FilterField({
  label,
  value,
  onChange,
  options,
  width,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  width: number;
}) {
  return (
    <div className="flex flex-col" style={{ width: `${width}px`, gap: "8px" }}>
      <label
        style={{
          fontSize: "12px",
          lineHeight: "20px",
          fontWeight: 500,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </label>
      <div
        className="flex items-center justify-between"
        style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 outline-none bg-transparent appearance-none"
          style={{
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#121212",
            letterSpacing: "-0.02em",
          }}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} className="shrink-0" style={{ pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div
      className="flex items-center"
      style={{
        width: "120px",
        height: "40px",
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
        gap: "24px",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 outline-none bg-transparent appearance-none"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} className="shrink-0" style={{ pointerEvents: "none" }} />
    </div>
  );
}

function ViewToggle({
  icon,
  active,
  onClick,
  label,
}: {
  icon: string;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="hover:opacity-80"
      style={{
        background: "none",
        border: "none",
        padding: 0,
        width: "20px",
        height: "20px",
        cursor: "pointer",
        opacity: active ? 1 : 0.5,
      }}
    >
      <Image src={icon} alt="" width={20} height={20} />
    </button>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = pageRange(current, total);
  return (
    <div className="flex items-center justify-center" style={{ gap: "40px" }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        aria-label="Previous page"
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none",
          border: "none",
          padding: "8px",
          gap: "8px",
          color: "#305E82",
          fontSize: "14px",
          fontWeight: 500,
          cursor: current === 1 ? "not-allowed" : "pointer",
          opacity: current === 1 ? 0.4 : 1,
        }}
      >
        <Image src="/icons/dash/pag-arrow-left.svg" alt="" width={20} height={20} />
      </button>

      <div className="flex items-center" style={{ gap: "40px" }}>
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dot-${i}`}
              style={{ fontFamily: "Inter, Geist, sans-serif", fontSize: "16px", fontWeight: 500, color: "#807E7E" }}
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className="hover:opacity-80"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "16px",
                fontWeight: 500,
                color: p === current ? "#305E82" : "#807E7E",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        aria-label="Next page"
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none",
          border: "none",
          padding: "8px",
          gap: "8px",
          color: "#305E82",
          fontSize: "14px",
          fontWeight: 500,
          cursor: current === total ? "not-allowed" : "pointer",
          opacity: current === total ? 0.4 : 1,
        }}
      >
        Next
        <Image src="/icons/dash/pag-arrow-right.svg" alt="" width={20} height={20} />
      </button>
    </div>
  );
}

function pageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function BrowseMapView({ listings }: { listings: SeekerListing[] }) {
  return (
    <div
      className="relative"
      style={{
        width: "100%",
        height: "595px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        background: "#F6F6F6",
      }}
    >
      <div
        className="absolute overflow-hidden"
        style={{ left: 0, top: 0, right: "400px", bottom: 0, borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px" }}
      >
        <BrowseLeafletMap listings={listings} />
      </div>

      <aside
        className="absolute bg-white overflow-y-auto"
        style={{
          right: 0,
          top: 0,
          width: "400px",
          height: "100%",
          borderLeft: "1px solid #F6F6F6",
        }}
      >
        <div className="flex flex-col" style={{ padding: "24px 16px", gap: "16px", width: "100%" }}>
          <h3
            style={{
              fontSize: "14px",
              lineHeight: "32px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#121212",
            }}
          >
            {listings.length.toLocaleString()} Available Properties
          </h3>

          {listings.map((l) => (
            <Link
              key={l.id}
              href={`/dashboard/browse/${l.id}`}
              className="flex items-center hover:bg-[#F9FAFB]"
              style={{
                gap: "16px",
                padding: "16px",
                border: "1px solid #F6F6F6",
                borderRadius: "20px",
                background: "#FFFFFF",
              }}
            >
              <div
                className="relative overflow-hidden shrink-0"
                style={{ width: "80px", height: "80px", background: "#EDEDED", borderRadius: "12px" }}
              >
                <Image src={l.image} alt={l.title} fill style={{ objectFit: "cover" }} sizes="80px" />
              </div>
              <div className="flex flex-col" style={{ width: "196px", gap: "8px" }}>
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 700, color: "#305E82" }}>
                  {l.price}
                  {l.priceSuffix && (
                    <span style={{ fontSize: "13px", fontWeight: 400, color: "#121212" }}>{l.priceSuffix}</span>
                  )}
                </span>
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "24px",
                      fontWeight: 500,
                      color: "#121212",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {l.title}
                  </span>
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <Image src="/icons/dash/card-location.svg" alt="" width={20} height={20} />
                    <span style={{ fontSize: "12px", lineHeight: "20px", color: "#305E82" }}>{l.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

