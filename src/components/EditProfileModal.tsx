"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const STATES = ["Lagos", "Abuja", "Rivers", "Oyo", "Kaduna", "Kano"];
const CITIES_LAGOS = ["Eti-Osa", "Ikeja", "Lekki", "Victoria Island", "Yaba", "Surulere"];

export type EditProfileValues = {
  state: string;
  city: string;
  bio: string;
  // Agency-only fields. Optional on the default variant; ignored by `onSave`
  // unless `variant === "agency"`.
  whatsappNumber?: string;
  businessName?: string;
  businessRegNo?: string;
  // Seeker-only display fields. These have no backend update endpoint yet, so
  // they render read-only and are NOT sent by `onSave` (only state/city are).
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  lookingFor?: string;
  propertyType?: string;
  bedrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  preferredLocations?: string[];
};

export default function EditProfileModal({
  open,
  onClose,
  initial = { state: "Lagos", city: "Eti-Osa", bio: "" },
  onSave,
  variant = "default",
}: {
  open: boolean;
  onClose: () => void;
  initial?: EditProfileValues;
  onSave?: (values: EditProfileValues) => void | Promise<void>;
  variant?: "default" | "agency" | "seeker";
}) {
  const [state, setState] = useState(initial.state);
  const [city, setCity] = useState(initial.city);
  const [bio, setBio] = useState(initial.bio);
  const [whatsappNumber, setWhatsapp] = useState(initial.whatsappNumber ?? "");
  const [businessName, setBusinessName] = useState(initial.businessName ?? "");
  const [businessRegNo, setBusinessRegNo] = useState(initial.businessRegNo ?? "");
  const [submitting, setSubmitting] = useState(false);
  const isAgency = variant === "agency";

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // ---- Seeker variant: full-screen on mobile, 2-column dialog on desktop.
  // Only State + City persist; every other field is read-only until the
  // backend exposes profile/preferences update endpoints.
  if (variant === "seeker") {
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-stretch md:items-center justify-center md:p-4"
        style={{ background: "rgba(18,18,18,0.5)" }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white w-full h-full md:h-auto md:w-[860px] md:max-w-full md:max-h-[calc(100vh-32px)] md:rounded-[24px] overflow-y-auto flex flex-col p-4 md:p-10"
        >
          {/* Mobile: back button */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden inline-flex items-center self-start hover:opacity-80"
            style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/dash/detail-back.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>Back</span>
          </button>

          {/* Desktop: close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hidden md:block absolute top-10 right-10 hover:opacity-70"
            style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
          </button>

          {/* Header */}
          <div className="flex flex-col mt-4 md:mt-0" style={{ gap: "8px" }}>
            <h2 className="text-[16px] md:text-[20px]" style={{ lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
              Edit Profile
            </h2>
            <p className="text-[12px] md:text-[16px]" style={{ lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
              Update your profile information
            </p>
          </div>

          {/* Fields — 1 column on mobile, 2 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 mt-6" style={{ gap: "16px" }}>
            <FieldGroup label="First Name">
              <TextInput value={initial.firstName ?? ""} onChange={() => {}} placeholder="Enter your first name here" readOnly />
            </FieldGroup>
            <FieldGroup label="Last Name">
              <TextInput value={initial.lastName ?? ""} onChange={() => {}} placeholder="Enter your last name here" readOnly />
            </FieldGroup>
            <FieldGroup label="Email">
              <TextInput value={initial.email ?? ""} onChange={() => {}} placeholder="Enter your email address here" readOnly />
            </FieldGroup>
            <FieldGroup label="Phone Number">
              <TextInput value={initial.phone ?? ""} onChange={() => {}} placeholder="Enter phone number" readOnly />
            </FieldGroup>

            <FieldGroup label="State">
              <Select value={state} onChange={setState} options={STATES} />
            </FieldGroup>
            <FieldGroup label="City/LGA">
              <Select value={city} onChange={setCity} options={CITIES_LAGOS} />
            </FieldGroup>

            <FieldGroup label="Looking for">
              <TextInput value={initial.lookingFor ?? ""} onChange={() => {}} placeholder="Select category (e.g. for Rent, for Sale, Shortlet)" readOnly />
            </FieldGroup>
            <FieldGroup label="Property Type">
              <TextInput value={initial.propertyType ?? ""} onChange={() => {}} placeholder="Select type (e.g. Flats/Apartment, house, duplex)" readOnly />
            </FieldGroup>
            <FieldGroup label="Bedrooms">
              <TextInput value={initial.bedrooms ?? ""} onChange={() => {}} placeholder="Select no. of bedrooms" readOnly />
            </FieldGroup>
            <FieldGroup label="Min. Price (₦)">
              <TextInput value={initial.minPrice ?? ""} onChange={() => {}} placeholder="0.00" readOnly />
            </FieldGroup>
            <FieldGroup label="Max. Price (₦)">
              <TextInput value={initial.maxPrice ?? ""} onChange={() => {}} placeholder="0.00" readOnly />
            </FieldGroup>
            <FieldGroup label="Preferred Locations">
              {initial.preferredLocations && initial.preferredLocations.length > 0 ? (
                <div className="flex flex-wrap" style={{ gap: "8px" }}>
                  {initial.preferredLocations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center"
                      style={{ padding: "8px 12px", background: "rgba(120,158,187,0.1)", color: "#305E82", borderRadius: "8px", fontSize: "12px", lineHeight: "24px", fontWeight: 500, whiteSpace: "nowrap" }}
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              ) : (
                <TextInput value="" onChange={() => {}} placeholder="Type here and press “Enter”" readOnly />
              )}
            </FieldGroup>
          </div>

          <p className="mt-3" style={{ fontSize: "12px", lineHeight: "18px", color: "#807E7E" }}>
            Only State and City can be updated for now — the other details are read-only until the backend supports editing them.
          </p>

          <button
            type="button"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onSave?.({ state, city, bio: "" });
                onClose();
              } catch {
                /* keep open; page surfaces the error */
              } finally {
                setSubmitting(false);
              }
            }}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity w-full md:w-auto md:self-end"
            style={{
              height: "48px",
              padding: "8px 24px",
              gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              marginTop: "24px",
            }}
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
      onClick={onClose}
    >
      {/* Bottom sheet on mobile; centred dialog on desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full md:w-[720px] md:max-w-full rounded-t-[25px] md:rounded-[24px] overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 32px)" }}
      >

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute hover:opacity-70 top-6 right-6 md:top-10 md:right-10"
          style={{
            width: "24px",
            height: "24px",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
        </button>

        <div className="flex flex-col p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col" style={{ gap: "8px", paddingRight: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                lineHeight: "24px",
                fontWeight: 600,
                color: "#121212",
              }}
            >
              Edit Profile
            </h2>
            <p
              style={{
                fontSize: "12px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#807E7E",
              }}
            >
              Update your profile information
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col" style={{ gap: "16px", marginTop: "24px" }}>
          <FieldGroup label="State">
            <Select value={state} onChange={setState} options={STATES} />
          </FieldGroup>

          <FieldGroup label="City/LGA">
            <Select value={city} onChange={setCity} options={CITIES_LAGOS} />
          </FieldGroup>

          {isAgency && (
            <>
              <FieldGroup label="Whatsapp Number">
                <PhoneInput value={whatsappNumber} onChange={setWhatsapp} />
              </FieldGroup>

              <FieldGroup label="Business Name">
                <TextInput value={businessName} onChange={setBusinessName} readOnly />
                <span style={{ fontSize: "12px", lineHeight: "18px", color: "#807E7E" }}>
                  Set at signup and can&rsquo;t be changed here.
                </span>
              </FieldGroup>

              <FieldGroup label="Business Reg No">
                <TextInput
                  value={businessRegNo}
                  onChange={setBusinessRegNo}
                  placeholder="Enter business registration number here"
                />
              </FieldGroup>
            </>
          )}

          <FieldGroup label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a brief description about yourself"
              rows={5}
              className="outline-none resize-none w-full"
              style={{
                background: "#F6F6F6",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#121212",
                letterSpacing: "-0.02em",
              }}
            />
          </FieldGroup>

          <button
            type="button"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                const payload: EditProfileValues = isAgency
                  ? { state, city, bio, whatsappNumber, businessName, businessRegNo }
                  : { state, city, bio };
                await onSave?.(payload);
                onClose();
              } catch {
                /* keep the modal open; the page surfaces the error toast */
              } finally {
                setSubmitting(false);
              }
            }}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{
              width: "100%",
              height: "48px",
              padding: "8px 24px",
              gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              marginTop: "8px",
            }}
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
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
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
        opacity: readOnly ? 0.7 : 1,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-readonly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        className="w-full outline-none bg-transparent"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: readOnly ? "#807E7E" : "#121212",
          letterSpacing: "-0.02em",
          cursor: readOnly ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}

function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
        gap: "16px",
      }}
    >
      <div className="flex items-center" style={{ gap: "4px" }}>
        <Image src="/icons/flag-us.svg" alt="" width={24} height={24} />
        <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#807E7E" }}>
          +1
        </span>
        <Image src="/icons/chevron-down.svg" alt="" width={16} height={16} />
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter phone number"
        className="flex-1 outline-none bg-transparent"
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
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div
      className="flex items-center"
      style={{
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
        height: "40px",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none bg-transparent appearance-none"
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
          <option key={o} value={o} style={{ color: "#121212" }}>
            {o}
          </option>
        ))}
      </select>
      <Image
        src="/icons/chevron-down.svg"
        alt=""
        width={16}
        height={16}
        className="shrink-0"
      />
    </div>
  );
}
