"use client";

import { useState } from "react";
import QoreID from "@qore-id/web-sdk";
import {
  useStartKycIdentityMutation,
  useStartKycBusinessMutation,
  useGetMeQuery,
} from "@/services/meApi";
import { useToast } from "@/components/Toast";
import { getRole } from "@/lib/role";

export default function QoreIdButton() {
  const { data: me } = useGetMeQuery();
  const [startIdentity] = useStartKycIdentityMutation();
  const [startBusiness] = useStartKycBusinessMutation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isAgency = getRole() === "Real Estate Agency or Developer";

  // Hide button if already verified
  if (me?.verification?.complete) {
    return null;
  }

  const handleVerify = async () => {
    try {
      setLoading(true);
      
      // Request SDK init params from backend
      const initRes = isAgency ? await startBusiness().unwrap() : await startIdentity().unwrap();
      
      QoreID.on("success", (payload) => {
        console.log("QoreID Success:", payload);
        toast("Verification submitted! We'll notify you once reviewed.", "success");
        setLoading(false);
      });

      QoreID.on("error", (error: unknown) => {
        console.error("QoreID Error:", error);
        // QoreID sometimes throws a CustomEvent where the message is inside `detail`
        const errObj = error as { detail?: { message?: string }; message?: string } | null;
        const errorMessage = errObj?.detail?.message || errObj?.message || "Verification failed or encountered an error.";
        toast(errorMessage, "error");
      });
      
      QoreID.on("close", () => {
        console.log("QoreID Closed");
        setLoading(false);
      });

      // Start the SDK workflow
      console.log("QOREID INIT RES:", initRes);
      await QoreID.start({
        token: initRes.token,
        customerReference: initRes.customerReference,
        applicantData: {
          firstname: me?.profile?.firstName || me?.organization?.name || "Applicant",
          lastname: me?.profile?.lastName || "Name",
          email: me?.email || "",
          phone: me?.profile?.phoneNumber || me?.organization?.phoneNumber || "",
        },
      });

    } catch (err) {
      console.error("QoreID Start Exception:", err);
      const message = err instanceof Error ? err.message : "Failed to start verification.";
      toast(message, "error");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleVerify}
      disabled={loading}
      className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0"
      style={{
        height: "48px",
        padding: "8px 24px",
        gap: "8px",
        background: "linear-gradient(175deg, #FF9900 0%, #E68A00 100%)", // Distinguish from edit profile
        border: "none",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Starting..." : "Verify Identity"}
    </button>
  );
}
