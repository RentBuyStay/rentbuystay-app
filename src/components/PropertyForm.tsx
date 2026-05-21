"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AMENITIES = [
  "24/7 Security",
  "Gated Estate",
  "Generator",
  "Air Conditioning",
  "CCTV",
  "Parking Space",
  "Swimming Pool",
  "Gym",
  "Borehole Water",
  "Tiled Floor",
  "Internet/WiFi",
];

const PROPERTY_TYPES = ["Flat/Apartment", "House", "Duplex", "Bungalow", "Office Space", "Land", "Other"];
const LISTING_TYPES = ["For Rent", "For Sale", "Shortlet"];
const FREQUENCIES = ["per week", "per month", "per year", "outright sale", "per night"];
const STATES = ["Lagos", "Abuja", "Rivers", "Oyo", "Kaduna", "Kano"];

type Charge = { id: string; title: string; amount: string };

export type PropertyFormInitial = {
  title?: string;
  propertyType?: string;
  listingType?: string;
  price?: string;
  frequency?: string;
  state?: string;
  city?: string;
  address?: string;
  description?: string;
  amenities?: string[];
  otherAmenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  parking?: number;
  totalArea?: number;
  yearBuilt?: string;
  existingPhotos?: string[];
  charges?: Charge[];
};

type Mode = "add" | "edit";

export default function PropertyForm({
  mode,
  initial = {},
}: {
  mode: Mode;
  initial?: PropertyFormInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title ?? "");
  const [propertyType, setPropertyType] = useState(initial.propertyType ?? "");
  const [listingType, setListingType] = useState(initial.listingType ?? "");
  const [price, setPrice] = useState(initial.price ?? "");
  const [frequency, setFrequency] = useState(initial.frequency ?? "");
  const [stateField, setStateField] = useState(initial.state ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initial.amenities ?? []);
  const [otherAmenity, setOtherAmenity] = useState("");
  const [otherList, setOtherList] = useState<string[]>(initial.otherAmenities ?? []);
  const [bedrooms, setBedrooms] = useState(initial.bedrooms ?? 0);
  const [bathrooms, setBathrooms] = useState(initial.bathrooms ?? 0);
  const [toilets, setToilets] = useState(initial.toilets ?? 0);
  const [parking, setParking] = useState(initial.parking ?? 0);
  const [totalArea, setTotalArea] = useState(initial.totalArea ?? 0);
  const [yearBuilt, setYearBuilt] = useState(initial.yearBuilt ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initial.existingPhotos ?? []);
  const [charges, setCharges] = useState<Charge[]>(
    initial.charges && initial.charges.length > 0 ? initial.charges : [{ id: "c1", title: "", amount: "" }]
  );

  function toggleAmenity(name: string) {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  }

  function addOther() {
    const v = otherAmenity.trim();
    if (!v) return;
    if (otherList.includes(v) || selectedAmenities.includes(v)) {
      setOtherAmenity("");
      return;
    }
    setOtherList((prev) => [...prev, v]);
    setSelectedAmenities((prev) => [...prev, v]);
    setOtherAmenity("");
  }

  function addChargeRow() {
    setCharges((prev) => [...prev, { id: `c${Date.now()}`, title: "", amount: "" }]);
  }

  function updateCharge(id: string, field: "title" | "amount", value: string) {
    setCharges((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function removeCharge(id: string) {
    setCharges((prev) => (prev.length === 1 ? prev : prev.filter((c) => c.id !== id)));
  }

  function onPhotoSelect(files: FileList | null) {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 12));
  }

  const editing = mode === "edit";
  const headerTitle = editing ? "Edit Property Details" : "Property Details";
  const headerSubtitle = editing
    ? "Edit in the details below to update property information"
    : "Fill in the details for your new listing";
  const submitLabel = editing ? "Update Listing" : "Publish Listing";

  return (
    <div className="flex flex-col" style={{ gap: "40px" }}>

      <div className="flex items-start justify-between" style={{ gap: "16px" }}>
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <h1 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
            {headerTitle}
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
            {headerSubtitle}
          </p>
        </div>

        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={() => router.push("/dashboard/properties")}
            className="hover:opacity-70"
            style={{
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#121212",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/properties")}
            className="text-white hover:opacity-90 transition-opacity"
            style={{
              height: "40px",
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
            {submitLabel}
          </button>
        </div>
      </div>


      <div className="flex flex-col" style={{ gap: "24px" }}>
        <FieldGroup label="Property Title">
          <TextInput value={title} onChange={setTitle} placeholder="Enter property title" />
        </FieldGroup>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <FieldGroup label="Property Type">
            <Select
              value={propertyType}
              onChange={setPropertyType}
              options={PROPERTY_TYPES}
              placeholder="Select category (e.g. Flats/Apartment, house, duplex, etc.)"
            />
          </FieldGroup>
          <FieldGroup label="Listing Type">
            <Select
              value={listingType}
              onChange={setListingType}
              options={LISTING_TYPES}
              placeholder="Select type (e.g. for Rent, for Sale, Shortlet)"
            />
          </FieldGroup>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <FieldGroup label="Price (₦)">
            <TextInput value={price} onChange={setPrice} placeholder="0.00" inputMode="decimal" />
          </FieldGroup>
          <FieldGroup label="Frequency">
            <Select
              value={frequency}
              onChange={setFrequency}
              options={FREQUENCIES}
              placeholder="Select frequency (e.g. per week, per year, outright sale, etc)"
            />
          </FieldGroup>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <FieldGroup label="State">
            <Select value={stateField} onChange={setStateField} options={STATES} placeholder="Select state" />
          </FieldGroup>
          <FieldGroup label="City/LGA">
            <TextInput value={city} onChange={setCity} placeholder="Select city/LGA" />
          </FieldGroup>
        </div>


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
            Address
          </label>
          <div
            className="flex items-center justify-between"
            style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "16px" }}
          >
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property full address"
              className="flex-1 outline-none bg-transparent"
              style={{
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
              }}
            />
            <button
              type="button"
              className="inline-flex items-center shrink-0 hover:underline"
              style={{
                fontSize: "12px",
                lineHeight: "23px",
                fontWeight: 400,
                color: "#305E82",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                gap: "10px",
              }}
            >
              <Image src="/icons/dash/gps.svg" alt="" width={20} height={20} />
              Mark location on map
            </button>
          </div>
        </div>

        <FieldGroup label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the property in detail"
            rows={4}
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

        <FieldGroup
          label={
            <>
              Amenities <span style={{ color: "#807E7E", fontWeight: 400 }}>(Select all that apply)</span>
            </>
          }
        >
          <div className="flex flex-wrap" style={{ gap: "8px" }}>
            {[...AMENITIES, ...otherList].map((a) => {
              const active = selectedAmenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className="inline-flex items-center justify-center"
                  style={{
                    height: "32px",
                    padding: "0 8px",
                    borderRadius: "8px",
                    background: active ? "rgba(120,158,187,0.1)" : "#F6F6F6",
                    color: active ? "#305E82" : "#807E7E",
                    border: "none",
                    fontSize: "12px",
                    lineHeight: 1,
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={otherAmenity}
            onChange={(e) => setOtherAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOther();
              }
            }}
            placeholder='Others... (Type here and press "Enter")'
            className="outline-none w-full"
            style={{
              marginTop: "12px",
              background: "#F6F6F6",
              borderRadius: "12px",
              padding: "8px 16px",
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 400,
              color: "#121212",
              letterSpacing: "-0.02em",
            }}
          />
        </FieldGroup>
      </div>


      <Section title="Room Details">
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <FieldGroup label="Bedrooms">
            <NumberStepper value={bedrooms} onChange={setBedrooms} />
          </FieldGroup>
          <FieldGroup label="Bathrooms">
            <NumberStepper value={bathrooms} onChange={setBathrooms} />
          </FieldGroup>
          <FieldGroup label="Toilets">
            <NumberStepper value={toilets} onChange={setToilets} />
          </FieldGroup>
          <FieldGroup label="Parking Spaces">
            <NumberStepper value={parking} onChange={setParking} />
          </FieldGroup>
          <FieldGroup label="Total Area (Sqm)">
            <NumberStepper value={totalArea} onChange={setTotalArea} />
          </FieldGroup>
          <FieldGroup label="Year Built">
            <TextInput value={yearBuilt} onChange={setYearBuilt} placeholder="Enter year" inputMode="numeric" />
          </FieldGroup>
        </div>
      </Section>


      <Section title="Property Photos">
        <label
          htmlFor="property-photos"
          className="flex flex-col items-center justify-center cursor-pointer"
          style={{
            background: "#FAFAFA",
            border: "2px dashed #EDEDED",
            borderRadius: "12px",
            padding: "40px",
            gap: "12px",
          }}
        >
          <Image src="/icons/dash/gallery-upload.svg" alt="" width={64} height={64} />
          <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>
            <span style={{ color: "#807E7E", fontWeight: 400 }}>Drag &amp; drop photos or </span>
            <span style={{ color: "#305E82", textDecoration: "underline" }}>click to upload</span>
          </p>
          <p style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E", textAlign: "center", maxWidth: "440px" }}>
            To ensure best quality, please upload PNG, JPG up to 5MB each with high resolution. Min. 3 photos required.
          </p>
          <input
            id="property-photos"
            type="file"
            accept="image/png,image/jpeg"
            multiple
            className="sr-only"
            onChange={(e) => onPhotoSelect(e.target.files)}
          />
        </label>

        {(existingPhotos.length > 0 || photos.length > 0) && (
          <div className="flex flex-wrap" style={{ gap: "16px" }}>
            {existingPhotos.map((src, i) => (
              <PhotoThumb
                key={`e-${i}`}
                src={src}
                onRemove={() => setExistingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              />
            ))}
            {photos.map((p, i) => (
              <PhotoThumb
                key={`n-${i}`}
                src={URL.createObjectURL(p)}
                unoptimized
                onRemove={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        )}
      </Section>


      <Section title="Additional Charges">
        <div className="flex flex-col" style={{ gap: "12px" }}>
          {charges.map((c, i) => (
            <div key={c.id} className="grid items-end" style={{ gridTemplateColumns: "2fr 1fr 40px", gap: "12px" }}>
              <FieldGroup label={i === 0 ? "Charge Title" : ""}>
                <TextInput
                  value={c.title}
                  onChange={(v) => updateCharge(c.id, "title", v)}
                  placeholder="Write charge/fee title (e.g. caution fee, commission, etc.)"
                />
              </FieldGroup>
              <FieldGroup label={i === 0 ? "Amount (₦)" : ""}>
                <TextInput
                  value={c.amount}
                  onChange={(v) => updateCharge(c.id, "amount", v)}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </FieldGroup>
              <button
                type="button"
                onClick={() => removeCharge(c.id)}
                aria-label="Remove charge"
                disabled={charges.length === 1}
                style={{
                  height: "40px",
                  width: "40px",
                  borderRadius: "12px",
                  background: "#F6F6F6",
                  border: "1px solid #EDEDED",
                  color: "#807E7E",
                  cursor: charges.length === 1 ? "not-allowed" : "pointer",
                  opacity: charges.length === 1 ? 0.4 : 1,
                  fontSize: "16px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addChargeRow}
          className="self-start hover:underline"
          style={{
            marginTop: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#305E82",
            background: "none",
            border: "none",
            padding: "8px 0",
            cursor: "pointer",
          }}
        >
          + Add new
        </button>
      </Section>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <h2 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>{title}</h2>
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  trailing,
  children,
}: {
  label: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      {(label || trailing) && (
        <div className="flex items-center justify-between">
          <label style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212", letterSpacing: "-0.02em" }}>
            {label}
          </label>
          {trailing}
        </div>
      )}
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
    <div className="flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}>
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
          textAlign: "left",
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
    <div className="flex items-center" style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}>
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
      <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} className="shrink-0" />
    </div>
  );
}

function PhotoThumb({
  src,
  onRemove,
  unoptimized,
}: {
  src: string;
  onRemove: () => void;
  unoptimized?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden shrink-0"
      style={{ width: "160px", height: "160px", background: "#F6F6F6", borderRadius: "15px" }}
    >
      <Image src={src} alt="" fill style={{ objectFit: "cover" }} unoptimized={unoptimized} />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute inline-flex items-center justify-center hover:opacity-90"
        style={{
          top: "8px",
          right: "8px",
          padding: "4px",
          background: "rgba(255,255,255,0.75)",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        <Image src="/icons/dash/trash.svg" alt="" width={16} height={16} />
      </button>
    </div>
  );
}

function NumberStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", height: "40px" }}
    >
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="outline-none bg-transparent flex-1"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
          MozAppearance: "textfield",
        }}
      />

      <div className="flex flex-col shrink-0" style={{ width: "16px", height: "32px" }}>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label="Increment"
          className="hover:opacity-70"
          style={{ width: "16px", height: "16px", padding: 0, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 6L6 1L11 6" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="Decrement"
          className="hover:opacity-70"
          style={{ width: "16px", height: "16px", padding: 0, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 2L6 7L11 2" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
