"use client";

import Image from "next/image";
import Link from "next/link";
import type { SeekerListing, SeekerListingTag } from "./SeekerPropertyCard";
import { PropertyCardImage } from "@/components/PropertyGallery";

const TAG_COLORS: Record<SeekerListingTag, string> = {
  "FOR SALE": "#FFAE00",
  "FOR RENT": "#FFAE00",
  SHORTLET: "#FFAE00",
};

export default function SeekerPropertyRow({ listing }: { listing: SeekerListing }) {
  const chips = listing.amenities.slice(0, 3);

  return (
    <Link
      href={`/dashboard/browse/${listing.id}`}
      className="block bg-white hover:shadow-md transition-shadow relative"
      style={{
        width: "100%",
        height: "304px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
      }}
    >
      <div
        className="absolute overflow-hidden"
        style={{
          left: "24px",
          top: "24px",
          width: "184px",
          height: "184px",
          background: "#EDEDED",
          borderRadius: "15px",
        }}
      >
        <PropertyCardImage media={listing.media} images={listing.images ?? [listing.image]} alt={listing.title} sizes="184px" intervalMs={4600} />
        <span
          className="absolute inline-flex items-center justify-center"
          style={{
            left: "9px",
            top: "8px",
            height: "24px",
            padding: "4px 8px",
            background: TAG_COLORS[listing.tag],
            color: "#FFFFFF",
            borderRadius: "50px",
            fontSize: "10px",
            lineHeight: "20px",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {listing.tag}
        </span>
        {listing.galleryCount && listing.galleryCount > 1 && (
          <span
            className="absolute inline-flex items-center justify-center"
            style={{
              left: "8px",
              bottom: "8px",
              height: "24px",
              padding: "0 8px",
              gap: "5px",
              background: "rgba(18,18,18,0.5)",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            <Image src="/icons/dash/detail-gallery.svg" alt="" width={16} height={16} />
            {listing.galleryCount}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label={`Save ${listing.title}`}
          className="absolute inline-flex items-center justify-center hover:opacity-90"
          style={{
            right: "8px",
            bottom: "8px",
            width: "24px",
            height: "24px",
            padding: "4px",
            background: "rgba(18,18,18,0.5)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/nav-saved.svg" alt="" width={16} height={16} style={{ filter: "invert(1)" }} />
        </button>
      </div>

      <div
        className="absolute flex flex-col"
        style={{ left: "240px", top: "24px", right: "180px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <h3
            style={{
              fontSize: "18px",
              lineHeight: "24px",
              fontWeight: 500,
              color: "#121212",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {listing.title}
          </h3>
          <div className="flex items-center" style={{ gap: "24px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/card-location.svg" alt="" width={24} height={24} />
              <span style={{ fontSize: "13px", lineHeight: "24px", color: "#305E82" }}>
                {listing.location}
              </span>
            </div>
            {listing.listedOn && (
              <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#305E82" }}>
                Listed on {listing.listedOn}
              </span>
            )}
          </div>
        </div>

        {listing.description && (
          <p
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              color: "#807E7E",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {listing.description}
          </p>
        )}

        <div className="flex items-center" style={{ gap: "8px" }}>
          {chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center justify-center"
              style={{
                height: "32px",
                padding: "0 16px",
                background: "rgba(120,158,187,0.1)",
                color: "#305E82",
                borderRadius: "8px",
                fontSize: "14px",
                lineHeight: "32px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <span
        className="absolute"
        style={{
          right: "24px",
          top: "24px",
          fontSize: "20px",
          lineHeight: "40px",
          fontWeight: 700,
          color: "#305E82",
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {listing.price}
        {listing.priceSuffix && (
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#807E7E" }}>
            {listing.priceSuffix}
          </span>
        )}
      </span>

      <div
        className="absolute"
        style={{ left: 0, right: 0, top: "232px", height: "1px", background: "#F6F6F6" }}
      />

      <div
        className="absolute flex items-center"
        style={{ left: "24px", top: "248px", gap: "16px" }}
      >
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
        <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: "#121212" }}>
          {listing.seller.name}
        </span>
        {listing.seller.verified && (
          <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
        )}
        <IconButton icon="/icons/dash/call-dark.svg" label={`Call ${listing.seller.name}`} size={24} />
        <IconButton icon="/icons/dash/messages-2-dark.svg" label={`Message ${listing.seller.name}`} size={24} />
      </div>

      <div
        className="absolute flex items-center"
        style={{ right: "24px", top: "256px", gap: "16px" }}
      >
        <SpecItem icon="/icons/dash/card-maximize.svg" label={listing.sqft} />
        <Separator />
        <SpecItem icon="/icons/dash/card-bed.svg" label={`${listing.beds} Beds`} />
        <Separator />
        <SpecItem icon="/icons/dash/card-bath.svg" label={`${listing.baths} ${listing.baths === 1 ? "Bath" : "Baths"}`} />
      </div>
    </Link>
  );
}

function SpecItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      <Image src={icon} alt="" width={20} height={20} />
      <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <div style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />;
}

function IconButton({ icon, label, size }: { icon: string; label: string; size: number }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      aria-label={label}
      className="hover:opacity-70 inline-flex items-center justify-center"
      style={{
        background: "none",
        border: "none",
        padding: 0,
        width: `${size}px`,
        height: `${size}px`,
        cursor: "pointer",
      }}
    >
      <Image src={icon} alt="" width={size} height={size} />
    </button>
  );
}
