"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOpenDirectConversationMutation } from "@/services/conversationApi";
import { PropertyCardImage, type MediaItem } from "@/components/PropertyGallery";

export type SeekerListingTag = "FOR SALE" | "FOR RENT" | "SHORTLET";

export type SeekerListing = {
  id: string;
  title: string;
  location: string;
  price: string;
  priceSuffix?: string;
  tag: SeekerListingTag;
  sqft: string;
  beds: number;
  baths: number;
  image: string;
  images?: string[];
  media?: MediaItem[];
  amenities: string[];
  seller: { name: string; initials: string; verified: boolean; avatarUrl?: string };
  ownerUserId?: string; // host to contact (agent if assigned, else owner)
  description?: string;
  listedOn?: string;
  galleryCount?: number;
  lat?: number;
  lng?: number;
};

const TAG_COLORS: Record<SeekerListingTag, string> = {
  "FOR SALE": "#FFAE00",
  "FOR RENT": "#FFAE00",
  SHORTLET: "#FFAE00",
};

export default function SeekerPropertyCard({
  listing,
  saved = false,
  onToggleSave,
}: {
  listing: SeekerListing;
  saved?: boolean;
  onToggleSave?: (id: string, saved: boolean) => void;
}) {
  const router = useRouter();
  const [openDirect] = useOpenDirectConversationMutation();
  const extraCount = Math.max(0, listing.amenities.length - 2);
  const firstChips = listing.amenities.slice(0, 2);

  function contactOwner(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!listing.ownerUserId) return;
    openDirect(listing.ownerUserId)
      .unwrap()
      .then((conv) => router.push(`/dashboard/messages?c=${conv.id}`))
      .catch(() => {});
  }
  const heartIcon = saved ? "/icons/dash/heart-filled.svg" : "/icons/dash/card-heart.svg";

  return (
    <Link
      href={`/dashboard/browse/${listing.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow w-full"
      style={{
        height: "534px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div className="relative" style={{ width: "100%", height: "218px", background: "#EDEDED" }}>
        <PropertyCardImage media={listing.media} images={listing.images ?? [listing.image]} alt={listing.title} sizes="352px" />
        <span
          className="absolute inline-flex items-center justify-center"
          style={{
            left: "16px",
            top: "16px",
            height: "32px",
            padding: "8px",
            background: TAG_COLORS[listing.tag],
            color: "#FFFFFF",
            borderRadius: "50px",
            fontSize: "12px",
            lineHeight: "20px",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {listing.tag}
        </span>
      </div>

      <div
        className="absolute flex flex-col"
        style={{ left: "16px", right: "16px", top: "242px", gap: "8px" }}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 700, color: "#305E82" }}>
            {listing.price}
            {listing.priceSuffix && (
              <span style={{ fontSize: "14px", fontWeight: 400, color: "#807E7E" }}>
                {listing.priceSuffix}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave?.(listing.id, saved);
            }}
            aria-label={saved ? `Unsave ${listing.title}` : `Save ${listing.title}`}
            className="shrink-0 hover:opacity-70"
            style={{ background: "none", border: "none", padding: 0, width: "20px", height: "20px", cursor: "pointer" }}
          >
            <Image src={heartIcon} alt="" width={20} height={20} />
          </button>
        </div>

        <h3 style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>
          {listing.title}
        </h3>

        <div className="flex items-center" style={{ gap: "8px" }}>
          <Image src="/icons/dash/card-location.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "12px", lineHeight: "20px", color: "#305E82" }}>
            {listing.location}
          </span>
        </div>
      </div>

      <div
        className="absolute flex items-center"
        style={{ left: "16px", top: "350px", gap: "8px" }}
      >
        {firstChips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center justify-center"
            style={{
              height: "32px",
              padding: "12px 16px",
              background: "rgba(120,158,187,0.1)",
              color: "#305E82",
              borderRadius: "8px",
              fontSize: "12px",
              lineHeight: "24px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {chip}
          </span>
        ))}
        {extraCount > 0 && (
          <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}>
            &amp; {extraCount} more ...
          </span>
        )}
      </div>

      <div
        className="absolute"
        style={{ left: 0, right: 0, top: "406px", height: "1px", background: "#F6F6F6" }}
      />

      <div
        className="absolute flex items-center"
        style={{ left: "16px", top: "422px", gap: "16px" }}
      >
        <SpecItem icon="/icons/dash/card-maximize.svg" label={listing.sqft} />
        <Separator />
        <SpecItem icon="/icons/dash/card-bed.svg" label={`${listing.beds} Beds`} />
        <Separator />
        <SpecItem icon="/icons/dash/card-bath.svg" label={`${listing.baths} ${listing.baths === 1 ? "Bath" : "Baths"}`} />
      </div>

      <div
        className="absolute"
        style={{ left: 0, right: 0, top: "462px", height: "1px", background: "#F6F6F6" }}
      />

      <div
        className="absolute flex items-center justify-between"
        style={{ left: "16px", right: "16px", top: "478px", height: "40px" }}
      >
        <div className="flex items-center" style={{ gap: "12px" }}>
          <div
            className="rounded-full flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(48,94,130,0.05)",
              color: "#305E82",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {listing.seller.avatarUrl ? (
              <Image
                src={listing.seller.avatarUrl}
                alt={listing.seller.name}
                fill
                sizes="40px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              listing.seller.initials
            )}
          </div>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: "#121212" }}>
              {listing.seller.name}
            </span>
            {listing.seller.verified && (
              <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
            )}
          </div>
        </div>

        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={contactOwner}
            aria-label={`Call ${listing.seller.name}`}
            className="hover:opacity-70"
            style={{ background: "none", border: "none", padding: 0, width: "20px", height: "20px", cursor: "pointer" }}
          >
            <Image src="/icons/dash/call-dark.svg" alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            onClick={contactOwner}
            aria-label={`Message ${listing.seller.name}`}
            className="hover:opacity-70"
            style={{ background: "none", border: "none", padding: 0, width: "18px", height: "18px", cursor: "pointer" }}
          >
            <Image src="/icons/dash/messages-2-dark.svg" alt="" width={18} height={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}

function SpecItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      <Image src={icon} alt="" width={20} height={20} />
      <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>{label}</span>
    </div>
  );
}

function Separator() {
  return <div style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />;
}
