"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EditProfileModal from "@/components/EditProfileModal";
import { useGetMeQuery } from "@/services/meApi";
import {
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
} from "@/services/subscriptionApi";
import { useGetSeekerPreferencesQuery } from "@/services/seekerApi";
import { formatPrice } from "@/lib/property";
import type { SeekerPreferencesResponse } from "@/services/types";

function memberSince(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}

function initialsFrom(first?: string, last?: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "—";
}

const DASH = "—";

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  return Number.isNaN(end) ? null : Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

const LOOKING_FOR_LABEL: Record<string, string> = {
  RENT: "To Rent",
  BUY: "To Buy",
  SHORTLET: "Shortlet",
};

function longDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProfilePage() {
  const { data: me, isLoading } = useGetMeQuery();
  const isSeeker = me?.userType === "PROPERTY_SEEKER";
  const { data: mySub } = useGetMySubscriptionQuery(undefined, { skip: isSeeker });
  const { data: plans = [] } = useGetSubscriptionPlansQuery(undefined, { skip: isSeeker });
  const { data: prefs } = useGetSeekerPreferencesQuery(undefined, { skip: !isSeeker });
  const [editOpen, setEditOpen] = useState(false);

  // Local-only override for fields edited in the modal. NOTE: the backend has no
  // profile-update endpoint yet, so these changes don't persist across reloads.
  const [localEdits, setLocalEdits] = useState<{ state?: string; city?: string; bio?: string }>({});

  const p = me?.profile;
  const PROFILE = {
    firstName: p?.firstName ?? "",
    lastName: p?.lastName ?? "",
    email: me?.email ?? DASH,
    phone: p?.phoneNumber ?? DASH,
    state: localEdits.state ?? p?.state ?? DASH,
    city: localEdits.city ?? p?.city ?? DASH,
    bio: localEdits.bio ?? p?.bio ?? DASH,
    initials: initialsFrom(p?.firstName, p?.lastName),
    avatarUrl: p?.avatarUrl,
    memberSince: memberSince(me?.joinedAt),
    verified: Boolean(me?.verification?.complete),
  };

  // Real subscription summary (the card below). No sub → "No active plan".
  const subPlanName = plans.find((pl) => pl.id === mySub?.planId)?.name;
  const subDaysLeft = daysUntil(mySub?.endsAt);
  const subExpired = mySub?.status?.toUpperCase() === "EXPIRED" || (subDaysLeft !== null && subDaysLeft <= 0);
  const sub = {
    hasSub: !!mySub,
    name: subPlanName ?? (mySub ? "Active plan" : "No active plan"),
    endsAtFull: longDate(mySub?.endsAt),
    daysLeft: subDaysLeft,
    expired: subExpired,
    statusLabel: !mySub ? "Inactive" : subExpired ? "Expired" : "Active",
  };

  if (isLoading && !me) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "40vh", color: "#807E7E", fontSize: "14px" }}>
        Loading your profile…
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col" style={{ gap: "32px" }}>

      <div className="flex items-center justify-between" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div className="relative" style={{ width: "120px", height: "120px" }}>
            {PROFILE.avatarUrl ? (
              <Image
                src={PROFILE.avatarUrl}
                alt={`${PROFILE.firstName} ${PROFILE.lastName}`.trim()}
                width={120}
                height={120}
                unoptimized
                style={{ width: "120px", height: "120px", borderRadius: "100%", objectFit: "cover" }}
              />
            ) : (
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
            )}
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
                  {`${PROFILE.firstName} ${PROFILE.lastName}`.trim() || DASH}
                </span>
                {PROFILE.verified && (
                  <Image src="/icons/dash/verify.svg" alt="Verified" width={20} height={20} />
                )}
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

        {!isSeeker && <Field label="Bio" value={PROFILE.bio} />}
      </div>


      {isSeeker && <PropertyPreferencesSection prefs={prefs} />}


      {!isSeeker && (
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
                {sub.name}
              </span>
              {sub.hasSub && sub.endsAtFull && (
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
                    {sub.expired ? "Expired on" : "Renews on"}{" "}
                    <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{sub.endsAtFull}</span>
                  </span>
                  {!sub.expired && sub.daysLeft !== null && (
                    <>
                      <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>·</span>
                      <span style={{ fontSize: "12px", lineHeight: "24px", color: "rgba(255,255,255,0.8)" }}>
                        {sub.daysLeft} days left
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end" style={{ gap: "16px" }}>
            <span
              className="inline-flex items-center justify-center"
              style={{
                padding: "2px 8px",
                background: !sub.hasSub ? "rgba(255,255,255,0.2)" : sub.expired ? "#FFECF1" : "#ECFDF3",
                color: !sub.hasSub ? "#FFFFFF" : sub.expired ? "#E30045" : "#027A48",
                borderRadius: "16px",
                fontSize: "12px",
                lineHeight: "18px",
                fontWeight: 500,
              }}
            >
              {sub.statusLabel}
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
      )}
    </div>

    <EditProfileModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      initial={{ state: PROFILE.state, city: PROFILE.city, bio: PROFILE.bio }}
      onSave={(values) => setLocalEdits(values)}
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

function PropertyPreferencesSection({ prefs }: { prefs?: SeekerPreferencesResponse | null }) {
  const lookingFor = prefs?.lookingFor ? LOOKING_FOR_LABEL[prefs.lookingFor] ?? prefs.lookingFor : DASH;
  const propertyType = prefs?.propertyTypeName ?? DASH;
  const bedrooms = prefs?.bedrooms != null ? String(prefs.bedrooms) : DASH;
  const minPrice = prefs?.minPrice != null ? formatPrice(prefs.minPrice, prefs.currency) : DASH;
  const maxPrice = prefs?.maxPrice != null ? formatPrice(prefs.maxPrice, prefs.currency) : DASH;
  const locations = prefs?.preferredLocations ?? [];

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#305E82" }}>
        Property Preferences
      </h2>

      <FieldRow>
        <Field label="Looking for" value={lookingFor} />
        <Field label="Property Type" value={propertyType} />
        <Field label="Bedroom" value={bedrooms} />
      </FieldRow>

      <FieldRow>
        <Field label="Min. Price" value={minPrice} />
        <Field label="Max. Price" value={maxPrice} />
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <span style={{ fontSize: "13px", lineHeight: "20px", fontWeight: 400, color: "#807E7E", letterSpacing: "-0.02em" }}>
            Preferred Locations
          </span>
          {locations.length === 0 ? (
            <span style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>{DASH}</span>
          ) : (
            <div className="flex flex-wrap" style={{ gap: "8px" }}>
              {locations.map((l) => (
                <span
                  key={l.id}
                  className="inline-flex items-center justify-center"
                  style={{ padding: "4px 12px", background: "rgba(120,158,187,0.1)", color: "#305E82", borderRadius: "8px", fontSize: "13px", lineHeight: "20px", fontWeight: 500, whiteSpace: "nowrap" }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </FieldRow>
    </div>
  );
}
