"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
} from "@/services/propertyApi";
import { useGetMeQuery } from "@/services/meApi";
import { useGetPropertyTypesQuery } from "@/services/referenceApi";
import { useGetAgencyStaffQuery } from "@/services/organizationApi";
import { useUploadFilesBatchMutation } from "@/services/fileApi";
import { unwrapApiError } from "@/services/api";
import { getRole } from "@/lib/role";
import type {
  CreatePropertyRequest,
  ListingType,
  PriceFrequency,
} from "@/services/types";

// UI label → backend enum maps.
const LISTING_MAP: Record<string, ListingType> = {
  "For Rent": "RENT",
  "For Sale": "BUY",
  Shortlet: "SHORTLET",
};
const FREQUENCY_MAP: Record<string, PriceFrequency> = {
  "per night": "PER_NIGHT",
  "per week": "PER_WEEK",
  "per month": "PER_MONTH",
  "per year": "PER_YEAR",
  "outright sale": "OUTRIGHT",
};

const toNumber = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

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
  existingPhotos?: { id: string; url: string; contentType?: string | null }[];
  charges?: Charge[];
  assignedAgentId?: string;
};

type Mode = "add" | "edit";

export default function PropertyForm({
  mode,
  initial = {},
  propertyId,
}: {
  mode: Mode;
  initial?: PropertyFormInitial;
  propertyId?: string;
}) {
  const router = useRouter();
  const { data: propertyTypes } = useGetPropertyTypesQuery();
  const [createProperty, { isLoading: creating }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: updating }] = useUpdatePropertyMutation();
  const [uploadFilesBatch, { isLoading: uploading }] = useUploadFilesBatchMutation();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
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
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; url: string; contentType?: string | null }[]>(initial.existingPhotos ?? []);
  const [assignedAgentId, setAssignedAgentId] = useState(initial.assignedAgentId ?? "");
  const [isAgency, setIsAgency] = useState(false);
  useEffect(() => {
    // Hydration-safe: role lives in localStorage, read once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAgency(getRole() === "Real Estate Agency or Developer");
  }, []);

  // Lock background scroll while the success modal is open.
  useEffect(() => {
    if (!showSuccess) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSuccess]);
  // The agency's own staff power the assign-agent picker. Only a real staff
  // member can be assigned, so we never fall back to demo ids here.
  const { data: me } = useGetMeQuery(undefined, { skip: !isAgency });
  const orgId = me?.organizationId;
  const { data: staffPage } = useGetAgencyStaffQuery(
    { orgId: orgId as string },
    { skip: !isAgency || !orgId }
  );
  const agents = (staffPage?.content ?? []).map((s) => ({
    userId: s.userId,
    name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email || "Agent",
  }));
  const realStaffIds = new Set(agents.map((a) => a.userId));
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

  // A property can carry 3–20 items. Cap on the TOTAL (already-saved media on an
  // edit + newly picked files), so selecting more just keeps the first that fit.
  const MAX_PHOTOS = 20;
  const IMG_LIMIT = 10 * 1024 * 1024; // 10MB
  const VIDEO_LIMIT = 50 * 1024 * 1024; // 50MB
  function onPhotoSelect(files: FileList | null) {
    if (!files) return;
    const picked = Array.from(files);
    // Reject oversized files up-front so the user isn't left waiting on an upload
    // the backend will reject anyway.
    const tooBig = picked.filter((f) => f.size > (f.type.startsWith("video/") ? VIDEO_LIMIT : IMG_LIMIT));
    if (tooBig.length) {
      setError(`Some files are too large (photos max 10MB, videos max 50MB): ${tooBig.map((f) => f.name).join(", ")}`);
    }
    const ok = picked.filter((f) => f.size <= (f.type.startsWith("video/") ? VIDEO_LIMIT : IMG_LIMIT));
    setPhotos((prev) => {
      const remaining = Math.max(0, MAX_PHOTOS - existingPhotos.length - prev.length);
      return [...prev, ...ok.slice(0, remaining)];
    });
  }

  const editing = mode === "edit";
  const headerTitle = editing ? "Edit Property Details" : "Property Details";
  const headerSubtitle = editing
    ? "Edit in the details below to update property information"
    : "Fill in the details for your new listing";
  const saving = creating || updating || uploading;
  const submitLabel = uploading
    ? "Uploading Photos…"
    : editing
    ? updating
      ? "Updating…"
      : "Update Listing"
    : creating
      ? "Publishing…"
      : "Publish Listing";

  // Property-type options come from the backend; fall back to the static list
  // while they load. The chosen displayName resolves to its numeric id on submit.
  const typeOptions = propertyTypes?.length
    ? propertyTypes.map((t) => t.displayName)
    : PROPERTY_TYPES;

  async function handleSubmit() {
    setError(null);
    const typeId = propertyTypes?.find((t) => t.displayName === propertyType)?.id;
    const listing = LISTING_MAP[listingType];
    const freq = FREQUENCY_MAP[frequency];

    if (!title || !typeId || !listing || !price || !freq || !stateField || !city || !address) {
      setError(
        "Please fill in the required fields: title, property type, listing type, price, frequency, state, city, and address."
      );
      return;
    }

    // A property must carry 3–20 photos (existing + newly selected).
    const totalPhotos = existingPhotos.length + photos.length;
    if (totalPhotos < 3) {
      setError(`Please upload at least 3 photos (you have ${totalPhotos}).`);
      return;
    }

    try {
      let uploadedPhotos: { uploadedFileId: string; isPrimary: boolean }[] = [];
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((file) => formData.append("files", file));
        const res = await uploadFilesBatch(formData).unwrap();
        uploadedPhotos = res.map((r, i) => ({ uploadedFileId: r.id, isPrimary: existingPhotos.length === 0 && i === 0 }));
      }

      const allPhotos = [
        ...existingPhotos.map((p, i) => ({ uploadedFileId: p.id, isPrimary: i === 0 })),
        ...uploadedPhotos
      ];

      // The backend rejects partial bodies ("Malformed request body"), so EVERY
      // field is sent — null/[]/false for anything not collected by the form.
      const body: CreatePropertyRequest = {
        title: title.trim(),
        description: description.trim() || null,
        propertyTypeId: typeId,
        listingType: listing,
        price: toNumber(price),
        priceFrequency: freq,
        state: stateField,
        city: city.trim(),
        address: address.trim(),
        latitude: null,
        longitude: null,
        bedrooms: bedrooms ?? 0,
        bathrooms: bathrooms ?? 0,
        parkingSpaces: parking ?? 0,
        totalAreaSqm: totalArea || null,
        yearBuilt: yearBuilt ? toNumber(yearBuilt) : null,
        isFurnished: false,
        isServiced: false,
        isShared: false,
        amenityIds: [],
        customAmenities: selectedAmenities,
        photos: allPhotos,
        charges: charges
        .filter((c) => c.title.trim() && c.amount)
        .map((c) => ({ title: c.title.trim(), amount: toNumber(c.amount) })),
      // Only send a real, mapped staff member (agency only).
      assignedAgentUserId:
        isAgency && assignedAgentId && realStaffIds.has(assignedAgentId)
          ? assignedAgentId
          : null,
    };

    // The inner try/catch can just be removed since we now have an outer try/catch
    if (editing && propertyId) {
      await updateProperty({ id: propertyId, body }).unwrap();
    } else if (!editing) {
      await createProperty(body).unwrap();
    }
    // Show the success modal (Figma) instead of navigating straight away.
    setShowSuccess(true);
  } catch (e) {
    setError(unwrapApiError(e)?.message ?? "Could not save the listing. Please try again.");
  }
}

  return (
    <>
    <div className="flex flex-col" style={{ gap: "40px" }}>
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center self-start hover:opacity-80"
        style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", color: "#121212" }}>Back</span>
      </button>

      <div className="flex items-start justify-between" style={{ gap: "16px" }}>
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <h1 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
            {headerTitle}
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
            {headerSubtitle}
          </p>
        </div>

        <div className="hidden md:flex items-center" style={{ gap: "16px" }}>
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
            onClick={handleSubmit}
            disabled={saving}
            className="text-white hover:opacity-90 transition-opacity"
            style={{
              height: "40px",
              padding: "8px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045", margin: "-24px 0 0" }}>
          {error}
        </p>
      )}


      <div className="flex flex-col" style={{ gap: "24px" }}>
        <FieldGroup label="Property Title">
          <TextInput value={title} onChange={setTitle} placeholder="Enter property title" />
        </FieldGroup>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
          <FieldGroup label="Property Type">
            <Select
              value={propertyType}
              onChange={setPropertyType}
              options={typeOptions}
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

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
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

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
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
              className="flex-1 min-w-0 outline-none bg-transparent"
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
              aria-label="Mark location on map"
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
              {/* Icon only on mobile; full label from md up */}
              <span className="hidden md:inline">Mark location on map</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
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
            Upload 3 to 20 items. Photos: PNG/JPG up to 5MB. Videos: MP4/MOV/WEBM up to 50MB.
          </p>
          <input
            id="property-photos"
            type="file"
            accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
            multiple
            className="sr-only"
            onChange={(e) => onPhotoSelect(e.target.files)}
          />
        </label>

        {(existingPhotos.length > 0 || photos.length > 0) && (
          <div className="flex flex-wrap" style={{ gap: "16px" }}>
            {existingPhotos.map((photo, i) => (
              <PhotoThumb
                key={`e-${i}`}
                src={photo.url}
                isVideo={photo.contentType?.startsWith("video/")}
                onRemove={() => setExistingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              />
            ))}
            {photos.map((p, i) => (
              <PhotoThumb
                key={`n-${i}`}
                isVideo={p.type.startsWith("video/")}
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
            <div
              key={c.id}
              className="flex flex-col md:grid md:items-end"
              style={{ gridTemplateColumns: "2fr 1fr 40px", gap: "12px" }}
            >
              <FieldGroup label={i === 0 ? "Charge Title" : ""}>
                <TextInput
                  value={c.title}
                  onChange={(v) => updateCharge(c.id, "title", v)}
                  placeholder="Write charge/fee title (e.g. caution fee, commission, etc.)"
                />
              </FieldGroup>
              {/* On desktop these flow into the grid (md:contents); on mobile they
                  share one row: amount fills, delete stays 40px. */}
              <div className="flex items-end md:contents" style={{ gap: "12px" }}>
                <div className="flex-1 md:flex-none">
                  <FieldGroup label={i === 0 ? "Amount (₦)" : ""}>
                    <TextInput
                      value={c.amount}
                      onChange={(v) => updateCharge(c.id, "amount", v)}
                      placeholder="0.00"
                      inputMode="decimal"
                    />
                  </FieldGroup>
                </div>
                <button
                  type="button"
                  onClick={() => removeCharge(c.id)}
                  aria-label="Remove charge"
                  disabled={charges.length === 1}
                  className="shrink-0"
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

      {isAgency && (
        <Section title="Agent">
          <FieldGroup label="Assign to">
            <div
              className="flex items-center"
              style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
            >
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full outline-none bg-transparent appearance-none"
                style={{
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: assignedAgentId ? "#121212" : "#807E7E",
                  letterSpacing: "-0.02em",
                }}
              >
                <option value="" disabled hidden>
                  {agents.length ? "Select agent to assign" : "No agents yet — invite one first"}
                </option>
                {agents.map((a) => (
                  <option key={a.userId} value={a.userId} style={{ color: "#121212" }}>
                    {a.name}
                  </option>
                ))}
              </select>
              <Image
                src="/icons/dash/form-chevron.svg"
                alt=""
                width={16}
                height={16}
                className="shrink-0"
              />
            </div>
          </FieldGroup>
        </Section>
      )}

      {/* Mobile: full-width stacked actions (desktop shows them in the header) */}
      <div className="md:hidden flex flex-col" style={{ gap: "16px" }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="text-white hover:opacity-90 transition-opacity w-full"
          style={{
            height: "48px",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: 500,
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/properties")}
          className="w-full hover:opacity-80"
          style={{
            height: "48px",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#121212",
            background: "#FFFFFF",
            border: "1px solid #EDEDED",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>

      {/* Success modal (Figma) — bottom sheet on mobile, centred on desktop */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center md:p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full md:w-[503px] md:max-w-full rounded-t-[25px] md:rounded-[24px] flex flex-col items-center p-6 md:p-10"
          >
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              aria-label="Close"
              className="absolute hover:opacity-70 top-6 right-6 md:top-10 md:right-10"
              style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
            </button>

            <div className="flex flex-col items-center w-full" style={{ gap: "24px", paddingTop: "24px" }}>
              <Image
                src="/icons/noti-success.svg"
                alt=""
                width={165}
                height={112}
                style={{ width: "165px", height: "112.5px" }}
              />
              <div className="flex flex-col w-full" style={{ gap: "8px" }}>
                <h2 style={{ fontSize: "20px", lineHeight: "30px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
                  {editing ? "Changes Saved Successfully" : "Property Listing Successful"}
                </h2>
                <p style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
                  {editing
                    ? "Your property details have been updated. Your listing is live with the most recent information you just submitted."
                    : "Your property listing has been submitted successfully. It will be active immediately after review by one of our admin."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/properties")}
                className="flex items-center justify-center text-white hover:opacity-90 transition-opacity w-full"
                style={{
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
                View My Properties
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  isVideo,
}: {
  src: string;
  onRemove: () => void;
  unoptimized?: boolean;
  isVideo?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden shrink-0"
      style={{ width: "160px", height: "160px", background: "#F6F6F6", borderRadius: "15px" }}
    >
      {isVideo ? (
        <>
          <video src={src} muted playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <span className="absolute inline-flex items-center justify-center" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 36, height: 36, borderRadius: 999, background: "rgba(18,18,18,0.5)", border: "1px solid rgba(255,255,255,0.6)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </>
      ) : (
        <Image src={src} alt="" fill style={{ objectFit: "cover" }} unoptimized={unoptimized} />
      )}
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
