"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import {
  useGetMeQuery,
  useSubmitKycWidgetResultMutation,
  useSubmitKycBusinessMutation,
} from "@/services/meApi";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import { getRole } from "@/lib/role";
import { useVerificationPoll } from "@/lib/useVerificationPoll";
import DojahBusinessVerifyButton from "@/components/DojahBusinessVerifyButton";
import type { BusinessVerificationType } from "@/services/types";

// react-dojah touches `window` on mount — load it client-side only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Dojah = dynamic(() => import("react-dojah"), { ssr: false }) as unknown as React.ComponentType<any>;

const APP_ID = process.env.NEXT_PUBLIC_DOJAH_APP_ID ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY ?? "";
const WIDGET_ID = process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID ?? "";
// Dev-only: on localhost the Dojah webhook can't reach the backend, so allow the
// browser to report success directly. In production the webhook is authoritative.
const TRUST_CLIENT = process.env.NEXT_PUBLIC_KYC_TRUST_CLIENT === "true";

/**
 * react-dojah (a React-16-era lib) removes its injected script/iframe nodes on
 * unmount, but React 19 has usually already detached them — so removeChild
 * throws "NotFoundError: … not a child of this node", crashing the tree right at
 * the success moment. Make removeChild/insertBefore no-op when the node isn't
 * actually a child (the well-known guard for third-party DOM libs). Installed
 * once, client-side only.
 */
function installDomGuardOnce() {
  if (typeof window === "undefined") return;
  const win = window as unknown as { __rbsDomGuard?: boolean };
  if (win.__rbsDomGuard) return;
  win.__rbsDomGuard = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

const BIZ_DOCS: { value: BusinessVerificationType; label: string; hint: string }[] = [
  { value: "CAC_REGISTRATION", label: "CAC Registration Number", hint: "Your company's RC / BN number" },
  { value: "TAX_ID", label: "Tax Identification Number", hint: "Company TIN" },
];

/**
 * Identity verification entry point.
 *  - Individuals (seeker/owner/agent) → Dojah Web widget (NIN/BVN + selfie + ID),
 *    verified client-side; the result is posted to the backend on success.
 *  - Agencies → a separate Dojah business (KYB/CAC) widget (see
 *    DojahBusinessVerifyButton). The manual CAC/TIN form below is kept only as a
 *    fallback and is no longer the default agency path.
 */
export default function DojahVerifyButton({ compact = false }: { compact?: boolean }) {
  const { data: me, refetch: refetchMe } = useGetMeQuery();
  const { toast } = useToast();
  const isAgency = getRole() === "Real Estate Agency or Developer";
  const { finalizing, poll } = useVerificationPoll(refetchMe);

  const [widgetOpen, setWidgetOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [bizOpen, setBizOpen] = useState(false);
  const [docType, setDocType] = useState<string>("CAC_REGISTRATION");
  const [docNumber, setDocNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [submitWidget] = useSubmitKycWidgetResultMutation();
  const [submitBusiness, { isLoading: submittingBiz }] = useSubmitKycBusinessMutation();

  // Warm the Dojah widget: preconnect + preload the script so the modal opens
  // instantly on click instead of fetching it fresh each time.
  useEffect(() => {
    if (isAgency || !APP_ID) return;
    installDomGuardOnce();
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://widget.dojah.io";
    preconnect.crossOrigin = "anonymous";
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "script";
    preload.href = "https://widget.dojah.io/widget.js";
    document.head.append(preconnect, preload);
    return () => {
      preconnect.remove();
      preload.remove();
    };
  }, [isAgency]);

  if (me?.verification?.complete) return null;

  // Agencies verify their business on Dojah's KYB flow, not the individual widget.
  if (isAgency) return <DojahBusinessVerifyButton compact={compact} />;

  const openVerify = () => {
    if (isAgency) {
      setBizOpen(true);
      return;
    }
    if (!APP_ID || !PUBLIC_KEY) {
      toast("Verification isn't configured yet. Please try again shortly.", "error");
      return;
    }
    setStarting(true);
    setWidgetOpen(true);
  };

  // Inline flow (no dashboard widget_id needed): government-data + selfie + ID doc.
  const dojahConfig = WIDGET_ID
    ? { widget_id: WIDGET_ID }
    : {
        pages: [
          { page: "government-data", config: { nin: true, bvn: true, dl: true, selfie: true } },
          { page: "selfie" },
          { page: "id", config: { passport: true, dl: true } },
        ],
      };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWidgetResponse = async (type: string, data: any) => {
    // Any callback means the widget is up — drop the "Starting…" state.
    if (starting) setStarting(false);
    if (type === "success") {
      const referenceId =
        data?.referenceId || data?.reference_id || data?.verificationId || data?.data?.reference_id || undefined;
      // Standard path: Dojah's webhook records the result server-side (spoof-proof).
      // We just refresh /me so the new status shows. The dev fallback below only
      // runs on localhost where the webhook can't reach the backend.
      if (TRUST_CLIENT) {
        try { await submitWidget({ verified: true, referenceId }).unwrap(); } catch { /* webhook still records it */ }
      }
      setWidgetOpen(false);
      toast("Verification submitted! Finalizing…", "success");
      // Poll /me until the webhook records the result — the button then removes
      // itself automatically, no manual refresh needed.
      const done = await poll((m) => Boolean(m?.verification?.identity?.verified || m?.verification?.complete));
      if (done) toast("You're verified! 🎉", "success");
      else toast("Almost there — your badge will update once verification is confirmed.", "info");
    } else if (type === "error") {
      toast("Verification didn't complete. Please try again.", "error");
      setWidgetOpen(false);
    } else if (type === "close") {
      setWidgetOpen(false);
    }
  };

  const submitBiz = async () => {
    if (submittingBiz) return;
    setError(null);
    if (!docNumber.trim()) {
      setError("Please enter your document number.");
      return;
    }
    try {
      await submitBusiness({ verificationType: docType as BusinessVerificationType, documentNumber: docNumber.trim() }).unwrap();
      toast("Verification submitted! We'll notify you once it's reviewed.", "success");
      setBizOpen(false);
      setDocNumber("");
    } catch (e) {
      setError(unwrapApiError(e)?.message ?? "Verification failed. Please check your details and try again.");
    }
  };

  const bizHint = BIZ_DOCS.find((d) => d.value === docType)?.hint;

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={openVerify}
          disabled={finalizing}
          aria-label="Verify Identity"
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 disabled:opacity-80"
          style={{ width: "40px", height: "40px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", borderRadius: "12px", cursor: finalizing ? "wait" : "pointer" }}
        >
          {finalizing ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
        </button>
      ) : (
        <button
          type="button"
          onClick={openVerify}
          disabled={starting || finalizing}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap h-11 md:h-12 px-4 md:px-6 text-[13px] md:text-[14px] disabled:opacity-80"
          style={{ gap: "8px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", borderRadius: "12px", fontWeight: 600, cursor: starting || finalizing ? "wait" : "pointer" }}
        >
          {finalizing ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}{" "}
          {finalizing ? "Finalizing…" : starting ? "Starting…" : "Verify Identity"}
        </button>
      )}

      {/* Individuals — Dojah widget (renders its own overlay) */}
      {widgetOpen && (
        <Dojah
          response={handleWidgetResponse}
          appID={APP_ID}
          publicKey={PUBLIC_KEY}
          type="custom"
          config={dojahConfig}
          userData={{
            first_name: me?.profile?.firstName || "",
            last_name: me?.profile?.lastName || "",
          }}
          metadata={{ user_id: me?.id }}
        />
      )}

      {/* Agencies — CAC / Tax ID */}
      {bizOpen && (
        <div
          className="fixed inset-0 flex items-end md:items-center justify-center md:p-4"
          style={{ background: "rgba(18,18,18,0.5)", zIndex: 10000 }}
          onClick={() => setBizOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full md:w-[520px] md:max-w-full rounded-t-[25px] md:rounded-[24px] overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 24px)" }}
          >
            <button
              type="button"
              onClick={() => setBizOpen(false)}
              aria-label="Close"
              className="absolute hover:opacity-70 top-6 right-6 md:top-10 md:right-10"
              style={{ width: "24px", height: "24px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
            </button>

            <div className="flex flex-col p-6 md:p-10">
              <div className="flex flex-col" style={{ gap: "8px", paddingRight: "32px" }}>
                <h2 style={{ fontSize: "20px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>Verify Your Business</h2>
                <p style={{ fontSize: "14px", lineHeight: "22px", fontWeight: 400, color: "#807E7E" }}>
                  Enter your company registration details. We verify them securely with Dojah — no documents to upload.
                </p>
              </div>

              <div className="flex flex-col" style={{ gap: "16px", marginTop: "24px" }}>
                {error && <p style={{ fontSize: "14px", color: "#D92D20", fontWeight: 500, margin: 0 }}>{error}</p>}

                <label className="flex flex-col" style={{ gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#121212" }}>Document Type</span>
                  <select
                    value={docType}
                    onChange={(e) => { setDocType(e.target.value); setError(null); }}
                    className="w-full outline-none"
                    style={{ background: "#F6F6F6", borderRadius: "12px", padding: "12px 16px", height: "48px", fontSize: "14px", color: "#121212", appearance: "none" }}
                  >
                    {BIZ_DOCS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col" style={{ gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#121212" }}>Document Number</span>
                  <input
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder={bizHint}
                    className="w-full outline-none"
                    style={{ background: "#F6F6F6", borderRadius: "12px", padding: "12px 16px", height: "48px", fontSize: "14px", color: "#121212" }}
                  />
                </label>

                <button
                  type="button"
                  onClick={submitBiz}
                  disabled={submittingBiz}
                  className="flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ width: "100%", height: "52px", borderRadius: "12px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", fontSize: "14px", fontWeight: 600, cursor: submittingBiz ? "not-allowed" : "pointer", marginTop: "8px" }}
                >
                  {submittingBiz ? "Submitting…" : "Submit for Verification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
