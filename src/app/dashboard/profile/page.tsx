"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EditProfileModal from "@/components/EditProfileModal";

const INITIAL_PROFILE = {
  firstName: "Olaitan",
  lastName: "Badejo",
  email: "olaitanbadejo@email.com",
  phone: "+234 801 234 5678",
  state: "Lagos",
  city: "Eti-Osa",
  bio: "Experienced property owner with 8+ years in Lagos real estate market. Specializing in residential and commercial properties in Lekki, VI, and Ikoyi.",
  initials: "OB",
  memberSince: "Jan 2026",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editOpen, setEditOpen] = useState(false);
  const PROFILE = profile;

  return (
    <>
    <div className="flex flex-col" style={{ gap: "32px" }}>

      <div className="flex items-center justify-between" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div className="relative" style={{ width: "120px", height: "120px" }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "100%",
                background: "rgba(48,94,130,0.05)",
                color: "#305E82",
                fontSize: "42px",
                lineHeight: "61px",
                fontWeight: 700,
              }}
            >
              {PROFILE.initials}
            </div>
            <button
              type="button"
              aria-label="Change photo"
              className="absolute flex items-center justify-center hover:opacity-90"
              style={{
                bottom: 0,
                right: 0,
                width: "32px",
                height: "32px",
                padding: "8px",
                background: "#305E82",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Image src="/icons/dash/camera.svg" alt="" width={16} height={16} />
            </button>
          </div>

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span
                  style={{
                    fontSize: "24px",
                    lineHeight: "32px",
                    fontWeight: 600,
                    color: "#121212",
                  }}
                >
                  {PROFILE.firstName} {PROFILE.lastName}
                </span>
                <Image src="/icons/dash/verify.svg" alt="Verified" width={20} height={20} />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  color: "#807E7E",
                }}
              >
                {PROFILE.email}
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: 500,
                color: "#FFAE00",
              }}
            >
              Member since {PROFILE.memberSince}
            </span>
          </div>
        </div>


        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0"
          style={{
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/edit.svg" alt="" width={20} height={20} />
          Edit Profile
        </button>
      </div>


      <div className="flex flex-col" style={{ gap: "24px" }}>
        <FieldRow>
          <Field label="First Name" value={PROFILE.firstName} />
          <Field label="Last Name" value={PROFILE.lastName} />
          <Field label="Email Address" value={PROFILE.email} />
        </FieldRow>

        <FieldRow>
          <Field label="Phone Number" value={PROFILE.phone} />
          <Field label="State" value={PROFILE.state} />
          <Field label="City" value={PROFILE.city} />
        </FieldRow>

        <Field label="Bio" value={PROFILE.bio} />
      </div>


      <div className="flex flex-col" style={{ gap: "16px" }}>
        <h2
          style={{
            fontSize: "16px",
            lineHeight: "32px",
            fontWeight: 500,
            color: "#121212",
          }}
        >
          Subscription
        </h2>

        <div
          className="flex items-center justify-between"
          style={{
            padding: "24px",
            borderRadius: "20px",
            border: "1px solid #F6F6F6",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
          }}
        >
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <span
              style={{
                fontSize: "12px",
                lineHeight: "24px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Current Plan
            </span>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <span
                style={{
                  fontSize: "24px",
                  lineHeight: "32px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                }}
              >
                RBS Pro
              </span>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
                  Renews on{" "}
                  <span style={{ fontWeight: 600, color: "#FFFFFF" }}>15 May 2026</span>
                </span>
                <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>·</span>
                <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
                  32 days left
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end" style={{ gap: "16px" }}>
            <span
              className="inline-flex items-center justify-center"
              style={{
                padding: "2px 8px",
                background: "#ECFDF3",
                color: "#027A48",
                borderRadius: "16px",
                fontSize: "12px",
                lineHeight: "18px",
                fontWeight: 500,
              }}
            >
              Active
            </span>
            <Link
              href="/dashboard/subscription/manage"
              className="flex items-center hover:opacity-90"
              style={{ gap: "8px" }}
            >
              <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#FFFFFF" }}>
                Manage Subscription
              </span>
              <Image src="/icons/dash/arrow-right-white.svg" alt="" width={20} height={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>

    <EditProfileModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      initial={{ state: profile.state, city: profile.city, bio: profile.bio }}
      onSave={(values) => setProfile((p) => ({ ...p, ...values }))}
    />
    </>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
    >
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <span
        style={{
          fontSize: "13px",
          lineHeight: "20px",
          fontWeight: 400,
          color: "#807E7E",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "16px",
          lineHeight: "32px",
          fontWeight: 500,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
