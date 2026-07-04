"use client";

import Image from "next/image";
import { useState } from "react";
import {
  useGetMeQuery,
  useSubmitKycIdentityMutation,
  useSubmitKycIdentitySelfieMutation,
  useSubmitKycBusinessMutation,
} from "@/services/meApi";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import { getRole } from "@/lib/role";
import SelfieCapture from "@/components/SelfieCapture";
import type {
  KycDocumentType,
  SelfieDocumentType,
  BusinessVerificationType,
} from "@/services/types";

/** ID types that carry a selfie face check. */
const SELFIE_TYPES = new Set<string>(["NIN", "BVN", "VNIN"]);

/** Individual ID document types Dojah verifies (backend DocumentType subset). */
const ID_DOCS: { value: KycDocumentType; label: string; requiresDob?: boolean; hint: string }[] = [
  { value: "NIN", label: "National ID (NIN)", hint: "11-digit National Identity Number" },
  { value: "BVN", label: "Bank Verification Number (BVN)", hint: "11-digit BVN" },
  { value: "VNIN", label: "Virtual NIN (vNIN)", hint: "16-character virtual NIN" },
  { value: "VOTERS_CARD", label: "Voter's Card (PVC)", hint: "Voter identification number" },
  { value: "DRIVERS_LICENSE", label: "Driver's License", hint: "Licence number", requiresDob: true },
  { value: "PASSPORT", label: "International Passport", hint: "Passport number", requiresDob: true },
];

/** Business document types for agencies (backend BusinessVerificationType). */
const BIZ_DOCS: { value: BusinessVerificationType; label: string; hint: string }[] = [
  { value: "CAC_REGISTRATION", label: "CAC Registration Number", hint: "e.g. RC1234567 / BN1234567" },
  { value: "TAX_ID", label: "Tax Identification Number (TIN)", hint: "Company TIN" },
];

/**
 * Drop-in replacement for the old QoreID widget button. Identity/business KYC is
 * now direct-submit via Dojah: the user enters an ID number and the backend
 * verifies it server-side (async; result arrives via webhook, then reflects on
 * the verification page). No third-party SDK/widget is loaded.
 */
export default function DojahVerifyButton() {
  const { data: me } = useGetMeQuery();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitIdentity, { isLoading: submittingId }] = useSubmitKycIdentityMutation();
  const [submitSelfie, { isLoading: submittingSelfie }] = useSubmitKycIdentitySelfieMutation();
  const [submitBusiness, { isLoading: submittingBiz }] = useSubmitKycBusinessMutation();

  const isAgency = getRole() === "Real Estate Agency or Developer";
  const submitting = submittingId || submittingSelfie || submittingBiz;

  // Form state
  const [docType, setDocType] = useState<string>(isAgency ? "CAC_REGISTRATION" : "NIN");
  const [docNumber, setDocNumber] = useState("");
  const [dob, setDob] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (me?.verification?.complete) return null;

  const selectedIdDoc = ID_DOCS.find((d) => d.value === docType);
  const requiresDob = !isAgency && !!selectedIdDoc?.requiresDob;
  // NIN/BVN/vNIN support a selfie face check — required for every individual.
  const needsSelfie = !isAgency && SELFIE_TYPES.has(docType);
  const hint = isAgency
    ? BIZ_DOCS.find((d) => d.value === docType)?.hint
    : selectedIdDoc?.hint;

  const reset = () => {
    setDocNumber("");
    setDob("");
    setSelfie(null);
    setError(null);
    setDocType(isAgency ? "CAC_REGISTRATION" : "NIN");
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    if (!docNumber.trim()) {
      setError("Please enter your document number.");
      return;
    }
    if (requiresDob && !dob) {
      setError("Date of birth is required for this document type.");
      return;
    }
    if (needsSelfie && !selfie) {
      setError("Please take or upload a selfie to complete face verification.");
      return;
    }
    try {
      if (isAgency) {
        await submitBusiness({
          verificationType: docType as BusinessVerificationType,
          documentNumber: docNumber.trim(),
        }).unwrap();
      } else if (needsSelfie && selfie) {
        // Strip the data-URL prefix — backend expects raw base64 JPEG (starts with /9).
        const base64 = selfie.includes(",") ? selfie.slice(selfie.indexOf(",") + 1) : selfie;
        await submitSelfie({
          documentType: docType as SelfieDocumentType,
          documentNumber: docNumber.trim(),
          selfieImage: base64,
        }).unwrap();
      } else {
        await submitIdentity({
          documentType: docType as KycDocumentType,
          documentNumber: docNumber.trim(),
          ...(requiresDob ? { dateOfBirth: dob } : {}),
        }).unwrap();
      }
      toast("Verification submitted! We'll notify you once it's reviewed.", "success");
      close();
    } catch (e) {
      setError(unwrapApiError(e)?.message ?? "Verification failed. Please check your details and try again.");
    }
  };

  const docs = isAgency ? BIZ_DOCS : ID_DOCS;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0"
        style={{
          height: "48px",
          padding: "8px 24px",
          gap: "8px",
          background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
          border: "none",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Verify Identity
      </button>

      {open && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center md:p-4"
          style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full md:w-[520px] md:max-w-full rounded-t-[25px] md:rounded-[24px] overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 32px)" }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute hover:opacity-70 top-6 right-6 md:top-10 md:right-10"
              style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
            </button>

            <div className="flex flex-col p-6 md:p-10">
              {/* Header */}
              <div className="flex flex-col" style={{ gap: "8px", paddingRight: "32px" }}>
                <h2 style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
                  {isAgency ? "Verify Your Business" : "Verify Your Identity"}
                </h2>
                <p style={{ fontSize: "14px", lineHeight: "22px", fontWeight: 400, color: "#807E7E" }}>
                  {isAgency
                    ? "Enter your business registration details. We verify them securely with Dojah — no documents to upload."
                    : "Choose a government-issued ID and enter its number. We verify it securely with Dojah — no documents to upload."}
                </p>
              </div>

              {/* Form */}
              <div className="flex flex-col" style={{ gap: "16px", marginTop: "24px" }}>
                {error && (
                  <p style={{ fontSize: "14px", color: "#D92D20", fontWeight: 500, margin: 0 }}>{error}</p>
                )}

                <label className="flex flex-col" style={{ gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#121212" }}>
                    {isAgency ? "Document Type" : "ID Type"}
                  </span>
                  <select
                    value={docType}
                    onChange={(e) => { setDocType(e.target.value); setError(null); }}
                    className="w-full outline-none"
                    style={{ background: "#F6F6F6", borderRadius: "12px", padding: "12px 16px", height: "48px", fontSize: "14px", color: "#121212", appearance: "none" }}
                  >
                    {docs.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col" style={{ gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#121212" }}>Document Number</span>
                  <input
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder={hint}
                    className="w-full outline-none"
                    style={{ background: "#F6F6F6", borderRadius: "12px", padding: "12px 16px", height: "48px", fontSize: "14px", color: "#121212" }}
                  />
                </label>

                {requiresDob && (
                  <label className="flex flex-col" style={{ gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#121212" }}>Date of Birth</span>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full outline-none"
                      style={{ background: "#F6F6F6", borderRadius: "12px", padding: "12px 16px", height: "48px", fontSize: "14px", color: "#121212" }}
                    />
                  </label>
                )}

                {needsSelfie && (
                  <div className="flex flex-col" style={{ gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#121212" }}>Selfie (face verification)</span>
                    <span style={{ fontSize: "12px", color: "#807E7E" }}>
                      We match your photo against your ID. Make sure your face is clear and well-lit.
                    </span>
                    <div style={{ marginTop: "4px" }}>
                      <SelfieCapture value={selfie} onChange={(v) => { setSelfie(v); setError(null); }} />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
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
                    opacity: submitting ? 0.6 : 1,
                    marginTop: "8px",
                  }}
                >
                  {submitting ? "Submitting…" : "Submit for Verification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
