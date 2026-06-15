"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import EditProfileModal from "@/components/EditProfileModal";
import { useUploadFileMutation } from "@/services/fileApi";
import {
  useGetMeQuery,
  useUpdateMyProfileMutation,
  useUpdateMyOrganizationMutation,
} from "@/services/meApi";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import QoreIdButton from "@/components/QoreIdButton";
import {
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
} from "@/services/subscriptionApi";
import { useGetSeekerPreferencesQuery, useUpdateSeekerPreferencesMutation } from "@/services/seekerApi";
import { useGetPropertyTypesQuery } from "@/services/referenceApi";
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

/** Treat the dash placeholder (or blank) as empty so it is never re-saved as a
 *  real profile value. */
function clean(v?: string): string {
  return !v || v === DASH ? "" : v;
}

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
  const isAgency = me?.userType === "PROPERTY_AGENCY";
  const { data: mySub } = useGetMySubscriptionQuery(undefined, { skip: isSeeker });
  const { data: plans = [] } = useGetSubscriptionPlansQuery(undefined, { skip: isSeeker });
  const { data: prefs } = useGetSeekerPreferencesQuery(undefined, { skip: !isSeeker });
  const { data: propertyTypes = [] } = useGetPropertyTypesQuery(undefined, { skip: !isSeeker });
  const [updateSeekerPreferences] = useUpdateSeekerPreferencesMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const [updateMyOrganization] = useUpdateMyOrganizationMutation();
  const [uploadFile, { isLoading: uploadingAvatar }] = useUploadFileMutation();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFile(formData).unwrap();
      if (isAgency) {
        await updateMyOrganization({ logoUrl: res.url }).unwrap();
      } else {
        await updateMyProfile({ avatarFileId: res.id }).unwrap();
      }
      toast("Profile photo updated successfully!", "success");
    } catch (err) {
      toast("Failed to update profile photo.", "error");
    }
  };

  const p = me?.profile;
  // Agency-specific demo defaults — Figma 714:88389 shows these exact values
  // for Urban Nest Realty. The real backend can populate them via me/profile
  // and me/organization once those fields exist; until then the page renders
  // with sensible placeholders that match the Figma comp.
  const AGENCY_DEMO = {
    companyName: "Urban Nest Realty",
    initials: "UN",
    contactEmail: "contact@urbannestrealty.com",
    email: "olaitanbadejo@email.com",
    phone: "+234 801 234 5678",
    whatsapp: DASH,
    website: "www.urbannestrealty.com",
    state: "Lagos",
    city: "Eti-Osa",
    officeAddress: "14 Adeola Odeku Street, Victoria Island",
    companyRegNo: DASH,
    esvarbonLicence: DASH,
    yearEstablished: "2018",
    bio:
      "Established in 2018, Urban Nest Realty offers a wide range of residential and commercial properties in Lagos, Abuja, Ogun, and Ibadan. Our experienced team is dedicated to helping you find the perfect space with confidence and ease.",
  };
  // Real agency org data (GET /me organization) with demo fallbacks so the page
  // still renders sensibly before the org is populated. Display reads from here;
  // edits to org-level fields go to PATCH /me/organization.
  const o = me?.organization;
  const org = {
    name: o?.name || AGENCY_DEMO.companyName,
    email: o?.email || AGENCY_DEMO.contactEmail,
    phone: o?.phoneNumber || p?.phoneNumber || AGENCY_DEMO.phone,
    whatsapp: o?.whatsappNumber || AGENCY_DEMO.whatsapp,
    website: o?.website || AGENCY_DEMO.website,
    state: o?.state || p?.state || AGENCY_DEMO.state,
    city: o?.city || p?.city || AGENCY_DEMO.city,
    officeAddress: o?.officeAddress || AGENCY_DEMO.officeAddress,
    companyRegNo: o?.registrationNumber || AGENCY_DEMO.companyRegNo,
    esvarbonLicence: o?.esvarbonLicenceNumber || AGENCY_DEMO.esvarbonLicence,
    yearEstablished:
      o?.yearEstablished != null ? String(o.yearEstablished) : AGENCY_DEMO.yearEstablished,
    bio: o?.bio || p?.bio || AGENCY_DEMO.bio,
  };
  const agencyInitials =
    org.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || AGENCY_DEMO.initials;

  const PROFILE = isAgency
    ? {
        firstName: org.name,
        lastName: "",
        email: me?.email ?? AGENCY_DEMO.email,
        phone: org.phone,
        state: org.state,
        city: org.city,
        bio: org.bio,
        initials: agencyInitials,
        avatarUrl: o?.logoUrl || p?.avatarUrl,
        memberSince: memberSince(me?.joinedAt) || "Jan 2026",
        verified: Boolean(me?.verification?.complete),
      }
    : {
        firstName: p?.firstName ?? "",
        lastName: p?.lastName ?? "",
        email: me?.email ?? DASH,
        phone: p?.phoneNumber ?? DASH,
        state: p?.state ?? DASH,
        city: p?.city ?? DASH,
        bio: p?.bio ?? DASH,
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
          <div className="relative shrink-0 w-[72px] h-[72px] md:w-[120px] md:h-[120px]">
            {PROFILE.avatarUrl ? (
              <Image
                src={PROFILE.avatarUrl}
                alt={`${PROFILE.firstName} ${PROFILE.lastName}`.trim()}
                fill
                unoptimized
                sizes="120px"
                style={{ borderRadius: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                className="flex items-center justify-center w-full h-full text-[25px] md:text-[42px]"
                style={{
                  borderRadius: "100%",
                  background: "rgba(48,94,130,0.05)",
                  color: "#305E82",
                  fontWeight: 700,
                }}
              >
                {PROFILE.initials}
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={avatarInputRef} 
              style={{ display: "none" }} 
              onChange={handleAvatarUpload} 
            />
            <button
              type="button"
              aria-label="Change photo"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute flex items-center justify-center hover:opacity-90 w-5 h-5 md:w-8 md:h-8 rounded-[10px] md:rounded-[20px]"
              style={{ bottom: 0, right: 0, background: "#305E82", border: "none", cursor: uploadingAvatar ? "wait" : "pointer", opacity: uploadingAvatar ? 0.7 : 1 }}
            >
              <img src="/icons/dash/camera.svg" alt="" className="w-[11px] h-[11px] md:w-4 md:h-4" />
            </button>
          </div>

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <div className="flex flex-col" style={{ gap: "8px" }}>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span
                  className="text-[16px] md:text-[24px]"
                  style={{ lineHeight: "32px", fontWeight: 600, color: "#121212" }}
                >
                  {(isAgency ? PROFILE.firstName : `${PROFILE.firstName} ${PROFILE.lastName}`.trim()) || DASH}
                </span>
                {PROFILE.verified && (
                  <Image src="/icons/dash/verify.svg" alt="Verified" width={20} height={20} />
                )}
              </div>
              <span
                className="text-[12px] md:text-[14px]"
                style={{ lineHeight: "24px", fontWeight: 400, color: "#807E7E" }}
              >
                {isAgency ? org.email : PROFILE.email}
              </span>
            </div>
            <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#FFAE00" }}>
              Member since {PROFILE.memberSince}
            </span>
          </div>
        </div>

        {/* Mobile: edit icon only */}
        <div className="md:hidden flex items-center" style={{ gap: "8px" }}>
          <QoreIdButton />
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Edit Profile"
            className="shrink-0 hover:opacity-80"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/dash/edit-blue.svg" alt="" width={24} height={24} />
          </button>
        </div>

        {/* Desktop: full Edit Profile button */}
        <div className="hidden md:flex items-center" style={{ gap: "16px" }}>
          <QoreIdButton />
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
      </div>


      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "24px" }}>
        {isAgency ? (
          <>
            <Field label="Company Name" value={org.name} />
            <Field label="Email Address" value={PROFILE.email} />
            <Field label="Phone Number" value={org.phone} />
            <Field label="Whatsapp Number" value={org.whatsapp} />
            <Field label="Website" value={org.website} />
            <Field label="State" value={org.state} />
            <Field label="City" value={org.city} />
            <Field label="Office Address" value={org.officeAddress} />
            <Field label="Company Reg No" value={org.companyRegNo} />
            <Field label="ESVARBON Licence Number" value={org.esvarbonLicence} />
            <Field label="Year Established" value={org.yearEstablished} />
            <Field label="Bio" value={org.bio} className="col-span-full" />
          </>
        ) : (
          <>
            <Field label="First Name" value={PROFILE.firstName} />
            <Field label="Last Name" value={PROFILE.lastName} />
            <Field label="Email Address" value={PROFILE.email} />
            <Field label="Phone Number" value={PROFILE.phone} />
            <Field label="State" value={PROFILE.state} />
            <Field label="City" value={PROFILE.city} />
            {!isSeeker && <Field label="Bio" value={PROFILE.bio} className="col-span-full" />}
          </>
        )}
      </div>


      {isSeeker && <PropertyPreferencesSection prefs={prefs} />}


      {!isSeeker && (
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <h2
          style={{
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 600,
            color: "#131313",
          }}
        >
          Subscription
        </h2>

        <div
          className="flex items-start justify-between"
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
                className="text-[16px] md:text-[24px]"
                style={{ lineHeight: "32px", fontWeight: 600, color: "#FFFFFF" }}
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

            {/* Manage — left column on mobile (Figma) */}
            <Link
              href="/dashboard/subscription/manage"
              className="md:hidden flex items-center hover:opacity-90"
              style={{ gap: "8px" }}
            >
              <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#FFFFFF" }}>
                Manage Subscription
              </span>
              <Image src="/icons/dash/arrow-right-white.svg" alt="" width={20} height={20} />
            </Link>
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
            {/* Manage — right column on desktop */}
            <Link
              href="/dashboard/subscription/manage"
              className="hidden md:flex items-center hover:opacity-90"
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
      variant={isAgency ? "agency" : isSeeker ? "seeker" : "default"}
      initial={
        isAgency
          ? {
              state: clean(o?.state) || clean(p?.state) || "Lagos",
              city: clean(o?.city) || clean(p?.city) || "Eti-Osa",
              bio: clean(o?.bio) || clean(p?.bio),
              whatsappNumber: clean(o?.whatsappNumber),
              businessName: o?.name || "",
              businessRegNo: o?.registrationNumber || "",
            }
          : isSeeker
          ? {
              state: clean(p?.state) || "Lagos",
              city: clean(p?.city) || "Eti-Osa",
              bio: "",
              firstName: clean(p?.firstName),
              lastName: clean(p?.lastName),
              email: clean(me?.email),
              phone: clean(p?.phoneNumber),
              lookingFor: prefs?.lookingFor ?? "",
              propertyTypeId: prefs?.propertyTypeId,
              bedrooms: prefs?.bedrooms,
              minPrice: prefs?.minPrice,
              maxPrice: prefs?.maxPrice,
              preferredLocations: (prefs?.preferredLocations ?? []).map((l) => l.name),
            }
          : {
              state: clean(p?.state) || "Lagos",
              city: clean(p?.city) || "Eti-Osa",
              bio: clean(p?.bio),
            }
      }
      propertyTypeOptions={propertyTypes.map((t) => ({ id: t.id, name: t.displayName }))}
      onSave={async (values) => {
        try {
          if (isAgency) {
            // Org-level fields land on the organization (reflected in GET /me).
            // Company name + reg number are set at provisioning (no edit endpoint).
            await updateMyOrganization({
              state: values.state,
              city: values.city,
              bio: values.bio,
              whatsappNumber: values.whatsappNumber || undefined,
            }).unwrap();
          } else if (isSeeker) {
            // Seeker profile fields (name/phone/state/city) + search preferences.
            await updateMyProfile({
              firstName: values.firstName,
              lastName: values.lastName,
              phoneNumber: values.phone,
              state: values.state,
              city: values.city,
            }).unwrap();
            await updateSeekerPreferences({
              lookingFor: values.lookingFor as "RENT" | "BUY" | "SHORTLET" | undefined,
              propertyTypeId: values.propertyTypeId,
              bedrooms: values.bedrooms,
              minPrice: values.minPrice,
              maxPrice: values.maxPrice,
              currency: prefs?.currency || "NGN",
              // Locations aren't edited in the form yet; keep the saved set.
              preferredLocations: (prefs?.preferredLocations ?? []).map((l) => l.id),
            }).unwrap();
          } else {
            await updateMyProfile(values).unwrap();
          }
          toast("Profile updated", "success");
        } catch (e) {
          toast(unwrapApiError(e)?.message ?? "Couldn’t update your profile.", "error");
          throw e; // keep the modal open on failure
        }
      }}
    />
    </>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex flex-col ${className ?? ""}`} style={{ gap: "8px" }}>
      <span
        style={{
          fontSize: "12px",
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
          fontSize: "14px",
          lineHeight: "24px",
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
      <h2 style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#305E82" }}>
        Property Preferences
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "24px" }}>
        <Field label="Looking for" value={lookingFor} />
        <Field label="Property Type" value={propertyType} />
        <Field label="Bedroom" value={bedrooms} />
        <Field label="Min. Price" value={minPrice} />
        <Field label="Max. Price" value={maxPrice} />
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E", letterSpacing: "-0.02em" }}>
            Preferred Locations
          </span>
          {locations.length === 0 ? (
            <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>{DASH}</span>
          ) : (
            <div className="flex flex-wrap" style={{ gap: "8px" }}>
              {locations.map((l) => (
                <span
                  key={l.id}
                  className="inline-flex items-center justify-center"
                  style={{ padding: "4px 12px", background: "rgba(120,158,187,0.1)", color: "#305E82", borderRadius: "8px", fontSize: "12px", lineHeight: "24px", fontWeight: 500, whiteSpace: "nowrap" }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
