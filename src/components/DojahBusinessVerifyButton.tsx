"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { useGetMeQuery, useStartBusinessKycMutation } from "@/services/meApi";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import { useVerificationPoll } from "@/lib/useVerificationPoll";

// react-dojah touches `window` on mount — load it client-side only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Dojah = dynamic(() => import("react-dojah"), { ssr: false }) as unknown as React.ComponentType<any>;

const APP_ID = process.env.NEXT_PUBLIC_DOJAH_APP_ID ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY ?? "";
// A dedicated business/KYB widget id from the Dojah dashboard. If unset, the
// business (CAC) flow is defined inline.
const BUSINESS_WIDGET_ID = process.env.NEXT_PUBLIC_DOJAH_BUSINESS_WIDGET_ID ?? "";

/**
 * react-dojah (a React-16-era lib) removes its injected script/iframe nodes on
 * unmount, but React 19 has usually already detached them — so removeChild
 * throws. No-op removeChild/insertBefore when the node isn't actually a child.
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

/**
 * Business (KYB) verification for agencies — runs Dojah's business/CAC flow.
 * Separate from the individual identity widget. Flow:
 *   1. POST /me/kyc/business/start → a customerReference (a PENDING row).
 *   2. Open the Dojah business widget, tagging metadata so the webhook links the
 *      result to that row and routes it to business verification.
 *   3. Dojah's webhook records the outcome server-side; we just refresh /me.
 */
export default function DojahBusinessVerifyButton({ compact = false }: { compact?: boolean }) {
  const { data: me, refetch: refetchMe } = useGetMeQuery();
  const { toast } = useToast();
  const [startBusinessKyc] = useStartBusinessKycMutation();
  const { finalizing, poll } = useVerificationPoll(refetchMe);

  const [widgetOpen, setWidgetOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    if (!APP_ID) return;
    installDomGuardOnce();
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://widget.dojah.io";
    preconnect.crossOrigin = "anonymous";
    document.head.append(preconnect);
    return () => preconnect.remove();
  }, []);

  if (me?.verification?.complete) return null;

  const openVerify = async () => {
    if (!APP_ID || !PUBLIC_KEY) {
      toast("Verification isn't configured yet. Please try again shortly.", "error");
      return;
    }
    setStarting(true);
    try {
      // Reserve a business-verification row and get its reference to tag the widget.
      const init = await startBusinessKyc().unwrap();
      setReference(init.customerReference ?? init.verificationId ?? null);
      setWidgetOpen(true);
    } catch (err) {
      setStarting(false);
      toast(
        unwrapApiError(err)?.message ?? "Couldn't start business verification. Please try again.",
        "error",
      );
    }
  };

  // Dashboard business widget if configured; otherwise an inline CAC flow.
  const dojahConfig = BUSINESS_WIDGET_ID
    ? { widget_id: BUSINESS_WIDGET_ID }
    : { pages: [{ page: "business-data", config: { cac: true } }] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWidgetResponse = async (type: string, _data: any) => {
    if (starting) setStarting(false);
    if (type === "success") {
      // Dojah's webhook records the result (spoof-proof); poll /me until it lands
      // so the button removes itself without a manual refresh.
      setWidgetOpen(false);
      toast("Business verification submitted! Finalizing…", "success");
      const done = await poll((m) => Boolean(m?.verification?.business?.verified || m?.verification?.complete));
      if (done) toast("Your business is verified! 🎉", "success");
      else toast("Almost there — your status will update once verification is confirmed.", "info");
    } else if (type === "error") {
      toast("Verification didn't complete. Please try again.", "error");
      setWidgetOpen(false);
    } else if (type === "close") {
      setWidgetOpen(false);
    }
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={openVerify}
          disabled={starting || finalizing}
          aria-label="Verify Business"
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 disabled:opacity-80"
          style={{ width: "40px", height: "40px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", borderRadius: "12px", cursor: starting || finalizing ? "wait" : "pointer" }}
        >
          {finalizing ? <Loader2 size={20} className="animate-spin" /> : <Building2 size={20} />}
        </button>
      ) : (
        <button
          type="button"
          onClick={openVerify}
          disabled={starting || finalizing}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap h-11 md:h-12 px-4 md:px-6 text-[13px] md:text-[14px] disabled:opacity-80"
          style={{ gap: "8px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", borderRadius: "12px", fontWeight: 600, cursor: starting || finalizing ? "wait" : "pointer" }}
        >
          {finalizing ? <Loader2 size={18} className="animate-spin" /> : <Building2 size={18} />}{" "}
          {finalizing ? "Finalizing…" : starting ? "Starting…" : "Verify Business"}
        </button>
      )}

      {widgetOpen && reference && (
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
          metadata={{
            user_id: me?.id,
            verification_id: reference,
            verification_type: "BUSINESS",
          }}
        />
      )}
    </>
  );
}
