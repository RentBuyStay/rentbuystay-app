"use client";

import { useEffect, useState } from "react";
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
      
      await QoreID.init({
        // Optional init config here
      });

      QoreID.on("success", (payload) => {
        console.log("QoreID Success:", payload);
        toast("Verification submitted! We'll notify you once reviewed.", "success");
        setLoading(false);
      });

      QoreID.on("error", (error) => {
        console.error("QoreID Error:", error);
        toast("Verification failed or encountered an error.", "error");
        setLoading(false);
      });

      QoreID.on("close", () => {
        console.log("QoreID Closed");
        setLoading(false);
      });

      // Start the SDK workflow
      await QoreID.start({
        token: initRes.clientId, // Some SDK versions use 'clientId', others use 'token'
        clientId: initRes.clientId,
        customerReference: initRes.customerReference,
        flowId: initRes.flowId,
        applicantData: {
          firstname: me?.profile?.firstName || me?.organization?.name || "Applicant",
          lastname: me?.profile?.lastName || "Name",
          email: me?.email || "",
          phone: me?.profile?.phoneNumber || me?.organization?.phoneNumber || "",
        },
      } as any);

    } catch (err) {
      console.error(err);
      toast("Failed to start verification.", "error");
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
