"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import {
  useGetMeQuery,
  useSubmitKycIdentityMutation,
  useSubmitKycIdentitySelfieMutation,
  useSubmitKycBusinessMutation,
} from "@/services/meApi";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import { getRole } from "@/lib/role";
import LiveFaceCapture from "@/components/LiveFaceCapture";
import type {
  KycDocumentType,
  SelfieDocumentType,
  BusinessVerificationType,
} from "@/services/types";

type Option = { value: string; label: string; hint: string; requiresDob?: boolean; selfie?: boolean };

const ID_DOCS: Option[] = [
  { value: "NIN", label: "National ID (NIN)", hint: "11-digit National Identity Number", selfie: true },
  { value: "BVN", label: "Bank Verification Number", hint: "11-digit BVN", selfie: true },
  { value: "VNIN", label: "Virtual NIN (vNIN)", hint: "16-character virtual NIN", selfie: true },
  { value: "VOTERS_CARD", label: "Voter's Card (PVC)", hint: "Voter identification number" },
  { value: "DRIVERS_LICENSE", label: "Driver's License", hint: "Licence number + date of birth", requiresDob: true },
  { value: "PASSPORT", label: "International Passport", hint: "Passport number + date of birth", requiresDob: true },
];

const BIZ_DOCS: Option[] = [
  { value: "CAC_REGISTRATION", label: "CAC Registration Number", hint: "Your company's RC / BN number" },
  { value: "TAX_ID", label: "Tax Identification Number", hint: "Company TIN" },
];

type Step = "method" | "details" | "face";

/**
 * Guided KYC verification. Replaces the old QoreID widget with a stepped Dojah
 * flow: choose an ID → enter its number → (individuals) capture a LIVE selfie.
 * Face capture is camera-only — no photo upload — for basic liveness.
 */
export default function DojahVerifyButton({ compact = false }: { compact?: boolean }) {
  const { data: me } = useGetMeQuery();
  const { toast } = useToast();
  const isAgency = getRole() === "Real Estate Agency or Developer";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("method");
  const [docType, setDocType] = useState<string>(isAgency ? "CAC_REGISTRATION" : "NIN");
  const [docNumber, setDocNumber] = useState("");
  const [dob, setDob] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [submitIdentity, { isLoading: sId }] = useSubmitKycIdentityMutation();
  const [submitSelfie, { isLoading: sSelfie }] = useSubmitKycIdentitySelfieMutation();
  const [submitBusiness, { isLoading: sBiz }] = useSubmitKycBusinessMutation();
  const submitting = sId || sSelfie || sBiz;

  const options = isAgency ? BIZ_DOCS : ID_DOCS;
  const selected = useMemo(() => options.find((o) => o.value === docType) ?? options[0], [options, docType]);
  const needsSelfie = !isAgency && !!selected.selfie;
  const requiresDob = !isAgency && !!selected.requiresDob;

  // Ordered steps for the current choice — drives the progress dots + nav.
  const steps: Step[] = needsSelfie ? ["method", "details", "face"] : ["method", "details"];
  const stepIndex = steps.indexOf(step);
  const isLastStep = stepIndex === steps.length - 1;

  if (me?.verification?.complete) return null;

  const resetAll = () => {
    setStep("method");
    setDocType(isAgency ? "CAC_REGISTRATION" : "NIN");
    setDocNumber("");
    setDob("");
    setSelfie(null);
    setError(null);
  };
  const close = () => { setOpen(false); resetAll(); };

  const chooseType = (v: string) => {
    setDocType(v);
    setSelfie(null);
    setError(null);
  };

  const goNext = () => {
    setError(null);
    if (step === "method") { setStep("details"); return; }
    if (step === "details") {
      if (!docNumber.trim()) { setError("Please enter your document number."); return; }
      if (requiresDob && !dob) { setError("Date of birth is required for this document."); return; }
      if (needsSelfie) { setStep("face"); return; }
      void submit();
      return;
    }
    if (step === "face") void submit();
  };

  const goBack = () => {
    setError(null);
    if (step === "details") setStep("method");
    else if (step === "face") setStep("details");
  };

  const submit = async () => {
    if (submitting) return;
    setError(null);
    try {
      if (isAgency) {
        await submitBusiness({ verificationType: docType as BusinessVerificationType, documentNumber: docNumber.trim() }).unwrap();
      } else if (needsSelfie) {
        if (!selfie) { setError("Please capture your live selfie to continue."); return; }
        const base64 = selfie.includes(",") ? selfie.slice(selfie.indexOf(",") + 1) : selfie;
        await submitSelfie({ documentType: docType as SelfieDocumentType, documentNumber: docNumber.trim(), selfieImage: base64 }).unwrap();
      } else {
        await submitIdentity({ documentType: docType as KycDocumentType, documentNumber: docNumber.trim(), ...(requiresDob ? { dateOfBirth: dob } : {}) }).unwrap();
      }
      toast("Verification submitted! We'll notify you once it's reviewed.", "success");
      close();
    } catch (e) {
      setError(unwrapApiError(e)?.message ?? "Verification failed. Please check your details and try again.");
    }
  };

  const primaryLabel = submitting ? "Submitting…" : isLastStep ? "Submit for Verification" : "Continue";
  const primaryDisabled = submitting || (step === "face" && !selfie);

  const titleByStep: Record<Step, string> = {
    method: isAgency ? "Verify Your Business" : "Verify Your Identity",
    details: `Enter ${isAgency ? "Business" : ""} Details`.replace("  ", " "),
    face: "Live Face Verification",
  };
  const subtitleByStep: Record<Step, string> = {
    method: isAgency
      ? "Choose how you'd like to verify your company. Verified securely via Dojah."
      : "Choose a government-issued ID. Verified securely via Dojah — no documents to upload.",
    details: `Enter your ${selected.label.toLowerCase()} details exactly as they appear.`,
    face: "Position your face in the circle and capture a live photo. We match it to your ID.",
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Verify Identity"
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0"
          style={{ width: "40px", height: "40px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", borderRadius: "12px", cursor: "pointer" }}
        >
          <ShieldCheck size={20} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap h-11 md:h-12 px-4 md:px-6 text-[13px] md:text-[14px]"
          style={{ gap: "8px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", borderRadius: "12px", fontWeight: 600, cursor: "pointer" }}
        >
          <ShieldCheck size={18} /> Verify Identity
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center md:p-4"
          style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full md:w-[540px] md:max-w-full rounded-t-[25px] md:rounded-[24px] overflow-y-auto flex flex-col"
            style={{ maxHeight: "calc(100vh - 24px)" }}
          >
            {/* Header */}
            <div className="flex flex-col px-6 pt-6 md:px-10 md:pt-10" style={{ gap: "16px" }}>
              <div className="flex items-center justify-between">
                {stepIndex > 0 ? (
                  <button type="button" onClick={goBack} aria-label="Back" className="flex items-center hover:opacity-70" style={{ gap: 6, color: "#807E7E", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                    <ArrowLeft size={18} /> Back
                  </button>
                ) : <span />}
                <button type="button" onClick={close} aria-label="Close" className="hover:opacity-70" style={{ width: 24, height: 24, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                  <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex items-center" style={{ gap: 6 }}>
                {steps.map((s, i) => (
                  <span key={s} className="rounded-full transition-all" style={{ height: 4, flex: 1, background: i <= stepIndex ? "#305E82" : "#EAECF0" }} />
                ))}
              </div>

              <div className="flex flex-col" style={{ gap: 4 }}>
                <h2 style={{ fontSize: 20, lineHeight: "28px", fontWeight: 600, color: "#121212" }}>{titleByStep[step]}</h2>
                <p style={{ fontSize: 14, lineHeight: "22px", fontWeight: 400, color: "#807E7E" }}>{subtitleByStep[step]}</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 md:px-10 md:py-8 flex-1">
              {error && <p style={{ fontSize: 14, color: "#D92D20", fontWeight: 500, margin: "0 0 16px" }}>{error}</p>}

              {step === "method" && (
                <div className="flex flex-col" style={{ gap: 12 }}>
                  {options.map((o) => {
                    const active = o.value === docType;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => chooseType(o.value)}
                        className="flex items-center text-left transition-colors"
                        style={{ gap: 12, padding: "14px 16px", borderRadius: 14, border: `1px solid ${active ? "#305E82" : "#EAECF0"}`, background: active ? "rgba(48,94,130,0.04)" : "#FFFFFF", cursor: "pointer" }}
                      >
                        <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 20, height: 20, border: `2px solid ${active ? "#305E82" : "#D0D5DD"}`, background: active ? "#305E82" : "transparent" }}>
                          {active && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                        </span>
                        <span className="flex flex-col min-w-0" style={{ gap: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{o.label}</span>
                          <span style={{ fontSize: 12, color: "#807E7E" }}>{o.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === "details" && (
                <div className="flex flex-col" style={{ gap: 16 }}>
                  <label className="flex flex-col" style={{ gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>{selected.label}</span>
                    <input
                      autoFocus
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      placeholder={selected.hint}
                      className="w-full outline-none"
                      style={{ background: "#F6F6F6", borderRadius: 12, padding: "12px 16px", height: 48, fontSize: 14, color: "#121212" }}
                    />
                  </label>
                  {requiresDob && (
                    <label className="flex flex-col" style={{ gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>Date of Birth</span>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full outline-none" style={{ background: "#F6F6F6", borderRadius: 12, padding: "12px 16px", height: 48, fontSize: 14, color: "#121212" }} />
                    </label>
                  )}
                  {needsSelfie && (
                    <div className="flex items-start" style={{ gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(48,94,130,0.05)" }}>
                      <ShieldCheck size={18} color="#305E82" className="shrink-0" style={{ marginTop: 1 }} />
                      <span style={{ fontSize: 12, lineHeight: "18px", color: "#305E82" }}>
                        Next you'll take a quick live selfie so we can match your face to this ID.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {step === "face" && (
                <LiveFaceCapture captured={selfie} onCapture={(d) => { setSelfie(d); setError(null); }} onRetake={() => setSelfie(null)} />
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 md:px-10 md:pb-10">
              <button
                type="button"
                onClick={goNext}
                disabled={primaryDisabled}
                className="flex items-center justify-center text-white hover:opacity-90 transition-opacity w-full disabled:opacity-50"
                style={{ height: 52, borderRadius: 12, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", fontSize: 14, fontWeight: 600, cursor: primaryDisabled ? "not-allowed" : "pointer" }}
              >
                {primaryLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
