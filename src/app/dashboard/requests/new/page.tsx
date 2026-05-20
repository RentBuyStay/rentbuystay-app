"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Figma 348:32210 (Desktop-20) — Property Owner / Post Property Request
// Layout (positions inside content area at x:312 — sidebar 272 + 40 padding):
//   Back link at y:0 (x:0 y:50357 in absolute, w:70 h:24, gap 12 row)
//   Header row at y:64-128: title block (460x64) LEFT + Publish Request button (155x48) RIGHT
//   Form fields at y:168+: column gap 24, 1088 wide, 2-col rows + Comments full

const PROPERTY_TYPES = ["Flat/Apartment", "House", "Duplex", "Bungalow", "Office Space", "Land", "Other"];
const CATEGORIES = ["For Rent", "For Sale", "Shortlet"];
const REQUESTER_KINDS = ["Individual", "Corporate", "Real Estate Agent", "Family"];
const STATES = ["Lagos", "Abuja", "Rivers", "Oyo", "Kaduna", "Kano"];
const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5+"];

export default function PostPropertyRequestPage() {
  const router = useRouter();
  const [seeking, setSeeking] = useState("");
  const [iAm, setIAm] = useState("");
  const [category, setCategory] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [stateField, setStateField] = useState("");
  const [locality, setLocality] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [budget, setBudget] = useState("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Lock body scroll when success modal open + ESC closes
  useEffect(() => {
    if (!submitted) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSubmitted(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [submitted]);

  return (
    <>
      <div className="flex flex-col" style={{ gap: "24px", maxWidth: "1088px" }}>
        {/* Back — Figma 348:32807: 70x24 row gap 12, arrow-left + "Back" text. ON_CLICK = BACK */}
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center self-start hover:opacity-80"
          style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
            Back
          </span>
        </button>

        {/* Header row — Figma: title block (460x64) on LEFT + Publish Request (155x48) on RIGHT,
            both at ~y:64-128, justify-between. */}
        <div className="flex items-start justify-between" style={{ gap: "16px" }}>
          <div className="flex flex-col" style={{ width: "460px", maxWidth: "100%", gap: "8px" }}>
            <h1 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
              Property Request
            </h1>
            <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
              Fill the form below to create property request
            </p>
          </div>

          {/* Publish Request — Figma 348:32349: 155x48, padding 8/24, r:12, blue gradient.
              ON_CLICK → OVERLAY success modal (348:32846). */}
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0"
            style={{
              height: "48px",
              padding: "8px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Publish Request
          </button>
        </div>

        {/* Form fields — Figma 348:32224: 1088x616 column gap 24 */}
        <div className="flex flex-col" style={{ gap: "24px" }}>
          {/* Row 1: Seeking | I am a/an */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <FieldGroup label="Seeking">
              <TextInput
                value={seeking}
                onChange={setSeeking}
                placeholder="Enter request title (e.g. Studio Apartment for Rent, etc)"
              />
            </FieldGroup>
            <FieldGroup label="I am a/an">
              <Select
                value={iAm}
                onChange={setIAm}
                options={REQUESTER_KINDS}
                placeholder="Select who you are (individual, corporate, real estate agent, etc)"
              />
            </FieldGroup>
          </div>

          {/* Row 2: Category | Property Type */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <FieldGroup label="Category">
              <Select
                value={category}
                onChange={setCategory}
                options={CATEGORIES}
                placeholder="Select category (e.g. for Rent, for Sale, Shortlet, etc)"
              />
            </FieldGroup>
            <FieldGroup label="Property Type">
              <Select
                value={propertyType}
                onChange={setPropertyType}
                options={PROPERTY_TYPES}
                placeholder="Select type (e.g. Flats/Apartment, house, duplex, etc)"
              />
            </FieldGroup>
          </div>

          {/* Row 3: State | Locality */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <FieldGroup label="State">
              <Select value={stateField} onChange={setStateField} options={STATES} placeholder="Select state" />
            </FieldGroup>
            <FieldGroup label="Locality">
              <TextInput value={locality} onChange={setLocality} placeholder="Select city/LGA" />
            </FieldGroup>
          </div>

          {/* Row 4: Bedrooms | Budget (₦) */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <FieldGroup label="Bedrooms">
              <Select
                value={bedrooms}
                onChange={setBedrooms}
                options={BEDROOM_OPTIONS}
                placeholder="Select no. of bedrooms"
              />
            </FieldGroup>
            <FieldGroup label="Budget (₦)">
              <TextInput value={budget} onChange={setBudget} placeholder="0.00" inputMode="decimal" />
            </FieldGroup>
          </div>

          {/* Comments — full width textarea */}
          <FieldGroup label="Comments">
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Write any comment here"
              rows={5}
              className="outline-none resize-none w-full"
              style={{
                background: "#F6F6F6",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
              }}
            />
          </FieldGroup>
        </div>
      </div>

      {/* Success modal — Figma 348:32846: 503x462 r:24, same component family as create-password success */}
      {submitted && (
        <div
          className="fixed inset-0 z-10000 flex items-center justify-center p-4"
          style={{ background: "rgba(18,18,18,0.25)", zIndex: 10000 }}
          onClick={() => setSubmitted(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white"
            style={{ width: "503px", maxWidth: "100%", height: "462px", borderRadius: "24px" }}
          >
            {/* Cancel X — 24x24 */}
            <button
              onClick={() => setSubmitted(false)}
              aria-label="Close"
              className="absolute hover:opacity-70"
              style={{ top: "40px", right: "40px", width: "24px", height: "24px", background: "none", border: "none", padding: 0 }}
            >
              <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
            </button>

            {/* Content frame — x:40 y:88 w:423 column align-center gap 24 */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: "40px", top: "88px", width: "423px", gap: "24px" }}
            >
              <Image
                src="/icons/noti-success.svg"
                alt=""
                width={165}
                height={112}
                style={{ width: "165px", height: "112.5px" }}
              />
              <div className="flex flex-col" style={{ gap: "8px", width: "100%" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    lineHeight: "30px",
                    fontWeight: 600,
                    color: "#121212",
                    textAlign: "center",
                  }}
                >
                  Request Published Successful
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: "#807E7E",
                    textAlign: "center",
                  }}
                >
                  Your request is now live. You will be notified as soon as there is matching
                  properties or interested parties send a message.
                </p>
              </div>
            </div>

            {/* View My Requests — Figma button x:40 y:374.5 w:423 h:48 blue gradient r:12 */}
            <Link
              href="/dashboard/requests?tab=my"
              className="absolute flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              style={{
                left: "40px",
                top: "374.5px",
                width: "423px",
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
              View My Requests
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- helpers ---------------- */

function FieldGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <label
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 500,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric";
}) {
  return (
    <div className="flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full outline-none bg-transparent"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px", height: "40px" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none bg-transparent appearance-none"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: value ? "#121212" : "#807E7E",
          letterSpacing: "-0.02em",
          cursor: "pointer",
        }}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} style={{ color: "#121212" }}>
            {o}
          </option>
        ))}
      </select>
      <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} className="shrink-0" />
    </div>
  );
}
