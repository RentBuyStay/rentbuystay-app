"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { COUNTRIES, flagEmoji, type Country } from "@/lib/countries";

type Props = {
  country: Country;
  onCountryChange: (c: Country) => void;
  value: string; // national digits only
  onChange: (digits: string) => void;
  placeholder?: string;
};

/**
 * Phone field with a searchable country-code selector. Emits the national digits
 * via onChange and the chosen country via onCountryChange; the parent composes
 * E.164 as `${country.dial}${value}`.
 */
export default function PhoneNumberInput({
  country,
  onCountryChange,
  value,
  onChange,
  placeholder = "Enter phone number",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso2.toLowerCase() === q
    );
  }, [search]);

  return (
    <div ref={rootRef} className="relative">
      <div
        className="flex items-center"
        style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "16px", height: "48px" }}
      >
        {/* Country selector trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center shrink-0 hover:opacity-80"
          style={{ gap: "4px", background: "none", border: "none", padding: 0 }}
          aria-label="Select country code"
        >
          <span style={{ fontSize: "18px", lineHeight: "24px" }}>{flagEmoji(country.iso2)}</span>
          <span style={{ fontSize: "14px", lineHeight: "140%", fontWeight: 500, color: "#807E7E" }}>
            {country.dial}
          </span>
          <Image
            src="/icons/chevron-down.svg"
            alt=""
            width={16}
            height={16}
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s" }}
          />
        </button>

        {/* National number */}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          type="tel"
          inputMode="numeric"
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent"
          style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-white shadow-lg"
          style={{ borderRadius: "12px", zIndex: 20, border: "1px solid #F6F6F6", overflow: "hidden" }}
        >
          <div style={{ padding: "8px" }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code"
              className="w-full outline-none"
              style={{
                background: "#F6F6F6",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "14px",
                lineHeight: "20px",
                color: "#121212",
              }}
            />
          </div>
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 16px", fontSize: "14px", color: "#807E7E" }}>
                No matches
              </div>
            )}
            {filtered.map((c) => {
              const selected = c.iso2 === country.iso2;
              return (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => {
                    onCountryChange(c);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center w-full text-left hover:bg-[#F6F6F6]"
                  style={{
                    gap: "12px",
                    padding: "8px 16px",
                    background: selected ? "#F6F6F6" : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{flagEmoji(c.iso2)}</span>
                  <span
                    className="flex-1"
                    style={{ fontSize: "14px", lineHeight: "20px", color: "#121212", fontWeight: selected ? 500 : 400 }}
                  >
                    {c.name}
                  </span>
                  <span style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>{c.dial}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
