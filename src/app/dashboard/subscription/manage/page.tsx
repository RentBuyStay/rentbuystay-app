"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const FEATURES = [
  "Up To 15 Active Property Listings",
  "Basic Analytics",
  "3 Featured Listings",
  "Priority Support",
];

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const expired = params.get("expired") === "1";

  const badge = expired
    ? { label: "Expired", bg: "#CF3801", color: "#FFFFFF" }
    : { label: "Current Plan", bg: "rgba(138,56,245,0.08)", color: "#8A38F5" };

  const ctaLabel = expired ? "Renew Subscription" : "Upgrade Subscription";
  const autoRenewOn = !expired;

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center self-start hover:opacity-80"
        style={{
          gap: "12px",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
          Back
        </span>
      </button>


      <h1
        style={{
          fontSize: "20px",
          lineHeight: "32px",
          fontWeight: 600,
          color: "#121212",
        }}
      >
        Manage Subscription
      </h1>


      <div className="flex items-start" style={{ gap: "16px" }}>

        <div
          className="flex flex-col shrink-0"
          style={{
            width: "346px",
            padding: "24px 36px",
            gap: "40px",
            border: "1px solid #F6F6F6",
            borderRadius: "20px",
            background: "#FFFFFF",
          }}
        >
          <div className="flex flex-col" style={{ gap: "24px" }}>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#807E7E" }}>
                  RBS Pro
                </span>
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    padding: "2px 8px",
                    background: badge.bg,
                    color: badge.color,
                    borderRadius: "16px",
                    fontSize: "10px",
                    lineHeight: "18px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {badge.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span
                  style={{
                    fontSize: "32px",
                    lineHeight: "40px",
                    fontWeight: 700,
                    color: "#305E82",
                  }}
                >
                  ₦5,000
                </span>
                <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
                  /month
                </span>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #F6F6F6", margin: 0 }} />

            <div className="flex flex-col" style={{ gap: "24px" }}>
              <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
                Benefits include:
              </span>
              <div className="flex flex-col" style={{ gap: "24px" }}>
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-center" style={{ gap: "8px" }}>
                    <Image
                      src={expired ? "/icons/dash/check-circle.svg" : "/icons/dash/check-circle-current.svg"}
                      alt=""
                      width={20}
                      height={20}
                    />
                    <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{
              padding: "8px 24px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "none",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {ctaLabel}
          </button>
        </div>


        <div
          className="flex flex-col"
          style={{
            marginLeft: "80px",
            flex: 1,
            gap: "40px",
            paddingTop: "28px",
          }}
        >

          <InfoBlock label="Payment Method">
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>
                23456768578787878
              </span>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
                James Bond
              </span>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
                12/24
              </span>
            </div>
          </InfoBlock>


          <InfoBlock label="Next Billing Cycle">
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>
              23/03/24
            </span>
          </InfoBlock>


          <InfoBlock label="Duration">
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>
              Yearly
            </span>
          </InfoBlock>


          <div className="flex items-center justify-between" style={{ width: "100%", maxWidth: "440px" }}>
            <InfoBlock label="Auto Renewal">
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#000000" }}>
                Turn On Auto Renewal
              </span>
            </InfoBlock>
            <Image
              src={autoRenewOn ? "/icons/checkbox-checked.svg" : "/icons/checkbox-unchecked.svg"}
              alt=""
              width={24}
              height={24}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}>
        {label}
      </span>
      {children}
    </div>
  );
}
