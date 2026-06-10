"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Browse "Filters" modal.
 * Desktop: centred dialog (628px). Mobile: full-screen sheet.
 * Mirrors the Figma section order, which differs between breakpoints
 * (Furnished/Servicing & Shared/Listed sit above Bedrooms/Property Type on
 * mobile but below them on desktop) — handled with Tailwind `order-*`.
 */

export type BrowseFilters = {
  search: string;
  propertyType: string; // "Any" or a property-type display name
  bedrooms: string; // "Any" or "1".."10"
  minPrice: string;
  maxPrice: string;
  furnished: string;
};

const SERVICING = ["Any", "Serviced", "Unserviced"];
const SHARED = ["Any", "Shared", "Not shared"];
const LISTED = ["Anytime", "Last 24 hours", "Last 7 days", "Last 30 days"];
const BEDROOM_PILLS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function FilterModal({
  open,
  onClose,
  value,
  onApply,
  propertyTypeNames,
  minPriceOptions,
  maxPriceOptions,
  furnishedOptions,
  onMarkOnMap,
}: {
  open: boolean;
  onClose: () => void;
  value: BrowseFilters;
  onApply: (next: BrowseFilters) => void;
  propertyTypeNames: string[];
  minPriceOptions: string[];
  maxPriceOptions: string[];
  furnishedOptions: string[];
  onMarkOnMap?: () => void;
}) {
  const defaults: BrowseFilters = {
    search: "",
    propertyType: "Any",
    bedrooms: "Any",
    minPrice: minPriceOptions[0],
    maxPrice: maxPriceOptions[0],
    furnished: furnishedOptions[0],
  };

  const [draft, setDraft] = useState<BrowseFilters>(value);
  // Servicing / Shared / Listed match the Figma but aren't filterable on the
  // backend yet, so they stay local to the modal.
  const [servicing, setServicing] = useState(SERVICING[0]);
  const [shared, setShared] = useState(SHARED[0]);
  const [listed, setListed] = useState(LISTED[0]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(value);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, value, onClose]);

  if (!open) return null;

  const set = (patch: Partial<BrowseFilters>) => setDraft((d) => ({ ...d, ...patch }));

  function reset() {
    setDraft(defaults);
    setServicing(SERVICING[0]);
    setShared(SHARED[0]);
    setListed(LISTED[0]);
  }

  function apply() {
    onApply(draft);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-stretch md:items-center justify-center md:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full h-full md:h-auto md:w-[628px] md:max-w-full md:max-h-[90vh] md:rounded-[24px] overflow-y-auto flex flex-col p-4 md:p-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h2 style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:opacity-70"
            style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
          </button>
        </div>

        {/* Sections */}
        <div className="flex flex-col mt-6" style={{ gap: "16px" }}>
          {/* Location */}
          <Section>
            <SectionLabel>Location</SectionLabel>
            <div
              className="flex items-center justify-between"
              style={{ height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}
            >
              <div className="flex items-center flex-1 min-w-0" style={{ gap: "8px" }}>
                <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
                <input
                  type="text"
                  value={draft.search}
                  onChange={(e) => set({ search: e.target.value })}
                  placeholder="Search address, neighbourhood..."
                  className="flex-1 min-w-0 outline-none bg-transparent"
                  style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onMarkOnMap?.();
                  onClose();
                }}
                className="flex items-center shrink-0 hover:opacity-70"
                style={{ gap: "10px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <Image src="/icons/dash/gps.svg" alt="" width={20} height={20} />
                <span className="hidden md:inline" style={{ fontSize: "12px", lineHeight: "23px", fontWeight: 400, color: "#305E82" }}>
                  Mark location on map
                </span>
              </button>
            </div>
          </Section>

          {/* Price Range */}
          <Section>
            <SectionLabel>Price Range</SectionLabel>
            <div className="flex items-center" style={{ gap: "16px" }}>
              <Select className="flex-1" value={draft.minPrice} onChange={(v) => set({ minPrice: v })} options={minPriceOptions} />
              <Select className="flex-1" value={draft.maxPrice} onChange={(v) => set({ maxPrice: v })} options={maxPriceOptions} />
            </div>
          </Section>

          {/* Bedrooms */}
          <Section>
            <SectionLabel>Bedrooms</SectionLabel>
            <div className="flex flex-wrap" style={{ gap: "8px" }}>
              {BEDROOM_PILLS.map((n) => {
                const active = draft.bedrooms === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set({ bedrooms: active ? "Any" : n })}
                    className="flex items-center justify-center"
                    style={{
                      width: "38px",
                      height: "38px",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      background: active ? "rgba(120,158,187,0.1)" : "#F6F6F6",
                      color: active ? "#305E82" : "#807E7E",
                      fontSize: "14px",
                      lineHeight: "24px",
                      fontWeight: 500,
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Property Type */}
          <Section>
            <SectionLabel>Property Type</SectionLabel>
            <div className="flex flex-wrap" style={{ gap: "8px" }}>
              <Chip label="All" active={draft.propertyType === "Any"} onClick={() => set({ propertyType: "Any" })} />
              {propertyTypeNames.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  active={draft.propertyType === name}
                  onClick={() => set({ propertyType: name })}
                />
              ))}
            </div>
          </Section>

          {/* Furnished / Servicing */}
          <Section>
            <div className="flex items-start" style={{ gap: "16px" }}>
              <div className="flex flex-col flex-1" style={{ gap: "8px" }}>
                <SectionLabel>Furnished</SectionLabel>
                <Select value={draft.furnished} onChange={(v) => set({ furnished: v })} options={furnishedOptions} />
              </div>
              <div className="flex flex-col flex-1" style={{ gap: "8px" }}>
                <SectionLabel>Servicing</SectionLabel>
                <Select value={servicing} onChange={setServicing} options={SERVICING} />
              </div>
            </div>
          </Section>

          {/* Shared / Listed */}
          <Section>
            <div className="flex items-start" style={{ gap: "16px" }}>
              <div className="flex flex-col flex-1" style={{ gap: "8px" }}>
                <SectionLabel>Shared</SectionLabel>
                <Select value={shared} onChange={setShared} options={SHARED} />
              </div>
              <div className="flex flex-col flex-1" style={{ gap: "8px" }}>
                <SectionLabel>Listed</SectionLabel>
                <Select value={listed} onChange={setListed} options={LISTED} />
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end mt-8" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center flex-1 md:flex-none hover:opacity-70"
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              fontSize: "14px",
              fontWeight: 500,
              color: "#121212",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex items-center justify-center text-white flex-1 md:flex-none md:w-auto hover:opacity-90 transition-opacity"
            style={{
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
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col ${className ?? ""}`} style={{ gap: "8px" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
      {children}
    </span>
  );
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between ${className ?? ""}`}
      style={{ height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 outline-none bg-transparent appearance-none"
        style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}
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

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center"
      style={{
        height: "32px",
        padding: "12px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        background: active ? "rgba(120,158,187,0.1)" : "#F6F6F6",
        color: active ? "#305E82" : "#807E7E",
        fontSize: "12px",
        lineHeight: "24px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
