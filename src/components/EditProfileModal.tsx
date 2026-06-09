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
  variant?: "default" | "agency";
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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white"
        style={{
          width: "720px",
          maxWidth: "100%",
          maxHeight: "calc(100vh - 32px)",
          borderRadius: "24px",
          overflowY: "auto",
        }}
      >

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute hover:opacity-70"
          style={{
            top: "40px",
            right: "40px",
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


        <div
          className="flex flex-col"
          style={{ position: "absolute", left: "40px", top: "40px", width: "363px", gap: "8px" }}
        >
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


        <div
          className="relative flex flex-col"
          style={{
            paddingLeft: "40px",
            paddingRight: "40px",
            paddingTop: "132px",
            paddingBottom: "40px",
            gap: "16px",
          }}
        >
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
