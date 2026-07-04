"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import SeekerPropertyCard from "@/components/SeekerPropertyCard";
import type { SeekerListing } from "@/components/SeekerPropertyCard";
import {
  useGetPropertyQuery,
  useGetActivePropertiesQuery,
  useGetSavedPropertiesQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} from "@/services/propertyApi";
import { useOpenDirectConversationMutation } from "@/services/conversationApi";
import { toSeekerListing } from "@/lib/property";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import ScheduleInspectionModal from "@/components/ScheduleInspectionModal";

const FALLBACK_GALLERY = [
  "/images/prop1.jpg",
  "/images/prop2.jpg",
  "/images/prop3.jpg",
  "/images/prop4.jpg",
  "/images/prop5.jpg",
];

export default function BrowsePropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data, isLoading, isError } = useGetPropertyQuery(id);
  const { data: savedPage } = useGetSavedPropertiesQuery({ page: 0, size: 100 });
  const [saveProperty] = useSavePropertyMutation();
  const [unsaveProperty] = useUnsavePropertyMutation();
  const { toast } = useToast();

  async function toggleSave(currentlySaved: boolean) {
    try {
      if (currentlySaved) {
        await unsaveProperty(id).unwrap();
        toast("Removed from saved", "info");
      } else {
        await saveProperty(id).unwrap();
        toast("Saved to your list", "success");
      }
    } catch (e) {
      toast(unwrapApiError(e)?.message ?? "Couldn’t update your saved list.", "error");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh", color: "#807E7E", fontSize: "14px" }}>
        Loading property…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: "60vh", gap: "16px" }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#121212" }}>Listing not found</h2>
        <button
          type="button"
          onClick={() => router.push("/dashboard/browse")}
          style={{
            padding: "8px 24px",
            height: "48px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const listing = toSeekerListing(data);
  const isSaved = (savedPage?.content ?? []).some((p) => p.id === id);
  const galleryImages = data.photos?.length ? data.photos.map((ph) => ph.url) : undefined;

  const tagLabel =
    listing.tag === "FOR SALE"
      ? "Sale"
      : listing.tag === "FOR RENT"
        ? "Rent"
        : "Shortlet";
  const displayTitle = `${listing.title} for ${tagLabel} in ${listing.location}`;
  const listedAgo = listing.listedOn ? `Listed ${listing.listedOn}` : "Listed 3 months ago";

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="flex items-center justify-between" style={{ gap: "16px" }}>
        <div className="flex flex-col" style={{ justifyContent: "center", gap: "16px", flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center self-start hover:opacity-80"
            style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image src="/icons/dash/detail-back.svg" alt="" width={24} height={24} />
            <span
              style={{
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 400,
                color: "#525252",
              }}
            >
              Back
            </span>
          </button>

          <div className="flex flex-col" style={{ justifyContent: "center", gap: "8px" }}>
            <h1
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#121212",
                textTransform: "capitalize",
              }}
            >
              {displayTitle}
            </h1>
            <div className="flex items-center" style={{ gap: "16px" }}>
              <div className="flex items-center" style={{ gap: "8px", height: "24px" }}>
                <Image
                  src="/icons/dash/detail-location.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                    fontSize: "14px",
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: "#807E7E",
                    whiteSpace: "nowrap",
                  }}
                >
                  {listing.location}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  fontSize: "14px",
                  lineHeight: "24px",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "#807E7E",
                }}
              >
                {listedAgo}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{
            width: "137.74px",
            height: "48px",
            padding: "8px 16px",
            gap: "8px",
            background: "transparent",
            border: "none",
            borderRadius: "12px",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 500,
            color: "#D80027",
            cursor: "pointer",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          <Image src="/icons/dash/flag-red.svg" alt="" width={24} height={24} />
          Report Listing
        </button>
      </div>

      <PhotoGallery
        title={listing.title}
        images={galleryImages ?? [listing.image, ...FALLBACK_GALLERY.filter((i) => i !== listing.image)]}
      />

      <PriceSpecsRow listing={listing} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_393px]" style={{ gap: "32px", alignItems: "start" }}>
        <div className="flex flex-col" style={{ gap: "40px" }}>
          <DescriptionBlock listing={listing} />
          <AmenitiesBlock listing={listing} />
          <PropertyDetailsBlock listing={listing} />
          <ViewMapBlock listing={listing} />
        </div>

        <div className="flex flex-col" style={{ gap: "24px" }}>
          <InterestedCard saved={isSaved} onToggleSave={() => toggleSave(isSaved)} hostUserId={data.assignedAgentUserId ?? data.ownerUserId} />
          <ListedByCard listing={listing} />
        </div>
      </div>

      <RelatedListings currentId={listing.id} />
    </div>
  );
}

function DescriptionBlock({ listing }: { listing: SeekerListing }) {
  const [expanded, setExpanded] = useState(false);
  const body =
    listing.description ??
    "This stunning property is situated in a prime location with top-tier finishes throughout. Open-plan living, fully fitted kitchen, and spacious bedrooms with built-in wardrobes.";

  return (
    <div className="flex flex-col items-stretch" style={{ gap: "16px" }}>
      <h2
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          fontSize: "20px",
          lineHeight: "32px",
          fontWeight: 600,
          color: "#305E82",
        }}
      >
        Description
      </h2>
      <div className="flex flex-col items-stretch" style={{ gap: "8px" }}>
        <p
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#121212",
            display: expanded ? "block" : "-webkit-box",
            WebkitLineClamp: expanded ? "unset" : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {body}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start hover:underline"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#305E82",
            cursor: "pointer",
          }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_AMENITIES = [
  "Gated Compound",
  "24/7 Security",
  "Air Conditioning",
  "Parking Space",
  "Water Treatment",
  "Furnished",
  "Gym Facility",
  "Underground Parking",
  "Smart Home System",
  "Swimming Pool",
  "Solar Panels",
  "Pet Friendly",
  "Community Hall",
  "Backup Generator",
  "High-Speed Internet",
];

function AmenitiesBlock({ listing }: { listing: SeekerListing }) {
  const amenities = listing.amenities.length >= 9 ? listing.amenities : DEFAULT_AMENITIES;
  return (
    <div className="flex flex-col items-stretch" style={{ gap: "16px" }}>
      <h2
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          fontSize: "20px",
          lineHeight: "32px",
          fontWeight: 600,
          color: "#305E82",
        }}
      >
        Amenities &amp; Features
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "24px 32px" }}>
        {amenities.map((a) => (
          <div key={a} className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/tick-circle.svg" alt="" width={24} height={24} />
            <span
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "#121212",
              }}
            >
              {a}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyDetailsBlock({ listing }: { listing: SeekerListing }) {
  const rows: { label: string; value: string }[][] = [
    [
      { label: "PROPERTY ID", value: `RBS-L-00${listing.id.replace(/\D/g, "").padStart(4, "0")}` },
      { label: "TYPE", value: inferType(listing) },
    ],
    [
      { label: "Status", value: "Active" },
      { label: "LISTED ON", value: listing.listedOn ?? "28 Mar 2025" },
    ],
  ];

  return (
    <div className="flex flex-col items-stretch" style={{ gap: "16px" }}>
      <h2
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          fontSize: "20px",
          lineHeight: "32px",
          fontWeight: 600,
          color: "#305E82",
        }}
      >
        Property Details
      </h2>
      <div className="flex flex-col items-stretch" style={{ gap: "24px" }}>
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            {row.map((cell) => (
              <div
                key={cell.label}
                className="flex flex-col"
                style={{ width: "319.5px", gap: "8px", justifyContent: "center" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    color: "#807E7E",
                  }}
                >
                  {cell.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    color: "#121212",
                  }}
                >
                  {cell.value}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function inferType(listing: SeekerListing): string {
  if (/duplex/i.test(listing.title)) return "Duplex";
  if (/office/i.test(listing.title)) return "Office Space";
  if (/penthouse/i.test(listing.title)) return "Penthouse";
  if (/mansion/i.test(listing.title)) return "House";
  return "Apartment and Flat";
}

function ViewMapBlock({ listing }: { listing: SeekerListing }) {
  const lat = listing.lat ?? 6.5;
  const lng = listing.lng ?? 3.4;
  const bboxPad = 0.01;
  const bbox = `${lng - bboxPad}%2C${lat - bboxPad}%2C${lng + bboxPad}%2C${lat + bboxPad}`;

  return (
    <div className="flex flex-col items-stretch" style={{ gap: "16px" }}>
      <h2
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          fontSize: "20px",
          lineHeight: "32px",
          fontWeight: 600,
          color: "#305E82",
        }}
      >
        View Map
      </h2>
      <div
        className="relative"
        style={{ height: "400px", borderRadius: "20px", background: "#F6F6F6", overflow: "hidden" }}
      >
        <iframe
          title="Property location"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          loading="lazy"
        />
        <div
          className="absolute flex items-center justify-between"
          style={{ left: "24px", top: "24px", right: "calc(100% - 24px - 623px)" }}
        >
          <div
            className="inline-flex items-center justify-center"
            style={{
              width: "149px",
              height: "32px",
              padding: "0 24px",
              gap: "16px",
              background: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <span style={{ fontSize: "16px", color: "#121212", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
              Map
            </span>
            <span style={{ width: "1px", height: "16px", background: "#807E7E", opacity: 0.75 }} />
            <span style={{ fontSize: "16px", color: "#121212", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
              Satellite
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Open map fullscreen"
          className="absolute inline-flex items-center justify-center hover:opacity-80"
          style={{
            right: "24px",
            top: "24px",
            width: "32px",
            height: "32px",
            background: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <Image src="/icons/dash/maximize-2.svg" alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

function InterestedCard({ saved, onToggleSave, hostUserId }: { saved: boolean; onToggleSave: () => void; hostUserId?: string }) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  return (
    <div className="bg-white w-full flex flex-col" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px", gap: "24px" }}>
      <h3 style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
        Interested in this Property?
      </h3>

      <div className="flex flex-col" style={{ gap: "16px" }}>
        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          className="w-full inline-flex items-center justify-center text-white hover:opacity-90"
          style={{ height: "56px", padding: "16px 24px", gap: "8px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          <Image src="/icons/dash/detail-calendar.svg" alt="" width={24} height={24} />
          Request Inspection
        </button>

        <button
          type="button"
          onClick={onToggleSave}
          className="w-full inline-flex items-center justify-center hover:opacity-80"
          style={{ height: "56px", padding: "16px 24px", gap: "8px", background: saved ? "rgba(120,158,187,0.08)" : "transparent", border: "1px solid #F6F6F6", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: "#305E82", cursor: "pointer" }}
        >
          <Image src="/icons/dash/detail-heart.svg" alt="" width={24} height={24} />
          {saved ? "Saved" : "Save Property"}
        </button>
      </div>

      <ScheduleInspectionModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} hostUserId={hostUserId} />
    </div>
  );
}

function ListedByCard({ listing }: { listing: SeekerListing }) {
  const router = useRouter();
  const [openDirect] = useOpenDirectConversationMutation();

  function contactOwner() {
    if (!listing.ownerUserId) return;
    openDirect(listing.ownerUserId)
      .unwrap()
      .then((conv) => router.push(`/dashboard/messages?c=${conv.id}`))
      .catch(() => {});
  }

  return (
    <div className="bg-white w-full flex flex-col" style={{ border: "1px solid #F6F6F6", borderRadius: "20px" }}>
      <div className="flex flex-col" style={{ padding: "24px", gap: "16px" }}>
        <h3 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>Listed by</h3>

        <div className="flex items-center" style={{ gap: "16px" }}>
          <div
            className="rounded-full relative overflow-hidden flex items-center justify-center shrink-0"
            style={{ width: "64px", height: "64px", background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: "20px", fontWeight: 600 }}
          >
            {listing.seller.avatarUrl ? (
              <Image src={listing.seller.avatarUrl} alt={listing.seller.name} fill sizes="64px" style={{ objectFit: "cover" }} />
            ) : (
              listing.seller.initials
            )}
          </div>
          <div className="flex flex-col min-w-0" style={{ gap: "8px" }}>
            <div className="flex items-center flex-wrap" style={{ gap: "8px" }}>
              <span className="truncate" style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
                {listing.seller.name}
              </span>
              {listing.seller.verified && <Image src="/icons/dash/verify.svg" alt="verified" width={20} height={20} className="shrink-0" />}
            </div>
            <div className="flex items-center flex-wrap" style={{ gap: "12px" }}>
              <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#807E7E" }}>Propper.</span>
              <span className="inline-flex items-center justify-center" style={{ padding: "3px 12px", background: "#305E82", borderRadius: "100px", fontSize: "12px", fontWeight: 500, color: "#FFFFFF" }}>
                AGENT
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/icon-location-sm.svg" alt="" width={20} height={20} className="shrink-0" />
            <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>19, Ogundana Street, Allen Avenue, Ikeja, Lagos</span>
          </div>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/icon-profile.svg" alt="" width={20} height={20} className="shrink-0" />
            <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>Joined 2 years ago</span>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", background: "#F6F6F6" }} />
      <div className="flex items-center justify-between flex-wrap" style={{ padding: "16px 24px", gap: "12px" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "12px", fontWeight: 400, color: "#807E7E" }}>4.3</span>
          </div>
          <span style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/icon-buildings.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "12px", fontWeight: 400, color: "#807E7E" }}>8 listings</span>
          </div>
        </div>
        <Link href="#" className="hover:underline" style={{ fontSize: "14px", fontWeight: 500, color: "#305E82", textDecoration: "none" }}>
          View all Properties
        </Link>
      </div>
      <div style={{ height: "1px", background: "#F6F6F6" }} />

      <div className="flex items-center" style={{ padding: "16px 24px", gap: "16px" }}>
        <button
          type="button"
          onClick={contactOwner}
          className="flex-1 inline-flex items-center justify-center hover:opacity-80"
          style={{ height: "48px", padding: "8px 24px", gap: "8px", background: "#FFFFFF", border: "1px solid #F6F6F6", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: "#121212", cursor: "pointer" }}
        >
          <Image src="/icons/dash/call-dark.svg" alt="" width={20} height={20} />
          Call
        </button>
        <button
          type="button"
          onClick={contactOwner}
          className="flex-1 inline-flex items-center justify-center text-white hover:opacity-90"
          style={{ height: "48px", padding: "8px 24px", gap: "8px", background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", borderRadius: "12px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
          Message
        </button>
      </div>
    </div>
  );
}

function RelatedListings({ currentId }: { currentId: string }) {
  const { data: propPage } = useGetActivePropertiesQuery({ page: 0, size: 12 });
  const others = (propPage?.content ?? [])
    .filter((p) => p.id !== currentId)
    .slice(0, 3)
    .map(toSeekerListing);
  if (others.length === 0) return null;
  return (
    <div className="flex flex-col" style={{ gap: "24px", width: "100%" }}>
      <div className="flex flex-col max-w-full" style={{ width: "411px", gap: "8px" }}>
        <h2
          className="text-[20px] leading-[28px] md:text-[24px] md:leading-[32px]"
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 600,
            color: "#121212",
          }}
        >
          Related Listings
        </h2>
        <p
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#807E7E",
          }}
        >
          See similar property listings that you might like
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "16px" }}>
        {others.map((l) => (
          <SeekerPropertyCard key={l.id} listing={l} />
        ))}
      </div>
    </div>
  );
}

function PriceSpecsRow({
  listing,
}: {
  listing: { price: string; priceSuffix?: string; sqft: string; beds: number; baths: number };
}) {
  return (
    <div className="flex flex-col items-stretch" style={{ gap: "16px" }}>
      <div style={{ height: "1px", background: "#F6F6F6", width: "100%" }} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ alignSelf: "stretch", gap: "12px" }}>
        <span
          className="text-[24px] leading-[36px] md:text-[32px] md:leading-[56px]"
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#305E82",
          }}
        >
          {listing.price}
          {listing.priceSuffix && (
            <span style={{ fontSize: "16px", fontWeight: 400, color: "#121212" }}>
              {listing.priceSuffix}
            </span>
          )}
        </span>

        <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
          <SpecGroup icon="/icons/dash/detail-maximize.svg" label={listing.sqft} />
          <SpecSeparator />
          <SpecGroup icon="/icons/dash/detail-bed.svg" label={`${listing.beds} Beds`} />
          <SpecSeparator />
          <SpecGroup
            icon="/icons/dash/detail-bath.svg"
            label={`${listing.baths} ${listing.baths === 1 ? "Bath" : "Baths"}`}
          />
        </div>
      </div>

      <div style={{ height: "1px", background: "#F6F6F6", width: "100%" }} />
    </div>
  );
}

function SpecGroup({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center justify-center" style={{ gap: "8px" }}>
      <Image src={icon} alt="" width={24} height={24} />
      <span
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          fontSize: "16px",
          lineHeight: "24px",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "#121212",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SpecSeparator() {
  return <div style={{ width: "1px", height: "14px", background: "#F4F4F4" }} />;
}

function PhotoGallery({ title, images }: { title: string; images: string[] }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  function prev() {
    setIndex((i) => (i - 1 + total) % total);
  }
  function next() {
    setIndex((i) => (i + 1) % total);
  }

  return (
    <div
      className="relative"
      style={{
        width: "100%",
        height: "482px",
        background: "#F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <Image
        key={index}
        src={images[index]}
        alt={`${title} — photo ${index + 1}`}
        fill
        style={{ objectFit: "cover" }}
        sizes="1088px"
        priority
      />

      <button
        type="button"
        onClick={prev}
        aria-label="Previous photo"
        className="absolute inline-flex items-center justify-center hover:opacity-90"
        style={{
          left: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "34px",
          height: "34px",
          borderRadius: "100%",
          background: "rgba(18,18,18,0.25)",
          border: "none",
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 4L6.5 10L12.5 16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Next photo"
        className="absolute inline-flex items-center justify-center hover:opacity-90"
        style={{
          right: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "34px",
          height: "34px",
          borderRadius: "100%",
          background: "rgba(18,18,18,0.25)",
          border: "none",
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M7.5 4L13.5 10L7.5 16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className="absolute inline-flex items-center justify-center"
        style={{
          left: "24px",
          bottom: "24px",
          height: "32px",
          padding: "0 12px",
          gap: "5px",
          background: "rgba(18,18,18,0.5)",
          borderRadius: "8px",
          color: "#FFFFFF",
        }}
      >
        <Image src="/icons/dash/detail-gallery.svg" alt="" width={16} height={16} />
        <span style={{ fontSize: "15px", lineHeight: 1, fontWeight: 400 }}>
          {index + 1}/{total}
        </span>
      </div>
    </div>
  );
}
