"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useGetMyPropertiesQuery, useDeletePropertyMutation } from "@/services/propertyApi";
import { toPropertyDetailVM } from "@/lib/property";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  // The public GET /properties/{id} only returns APPROVED listings, so source
  // from the owner's own list (all statuses) and pick this one out.
  const { data, isLoading, isError } = useGetMyPropertiesQuery(
    { page: 0, size: 100 },
    {
      selectFromResult: ({ data, isLoading, isError }) => ({
        data: data?.content.find((p) => p.id === id),
        isLoading,
        isError,
      }),
    }
  );
  const [deleteProperty, { isLoading: deleting }] = useDeletePropertyMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh", color: "#807E7E", fontSize: "14px" }}>
        Loading property…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh", gap: "16px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#121212" }}>Property not found</h2>
        <button
          type="button"
          onClick={() => router.push("/dashboard/properties")}
          style={{
            padding: "8px 24px",
            height: "48px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Back to My Properties
        </button>
      </div>
    );
  }

  const property = toPropertyDetailVM(data);

  function handleDelete() {
    if (window.confirm(`Delete "${property.title}"? This can't be undone.`)) {
      deleteProperty(id)
        .unwrap()
        .then(() => router.push("/dashboard/properties"))
        .catch(() => {});
    }
  }

  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>

      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center self-start hover:opacity-80"
        style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "16px", lineHeight: "24px", color: "#121212" }}>Back</span>
      </button>


      <div className="flex items-start justify-between" style={{ gap: "16px" }}>
        <div className="flex flex-col" style={{ gap: "16px", flex: 1, minWidth: 0 }}>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h1
              style={{
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: 600,
                color: "#121212",
                letterSpacing: "-0.02em",
                textTransform: "capitalize",
              }}
            >
              {property.title} for {property.tag === "For Sale" ? "Sale" : property.tag === "For Rent" ? "Rent" : "Shortlet"} in {property.location}
            </h1>
            <div className="flex items-center" style={{ gap: "16px" }}>
              <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>
                {property.location} · {property.listedAgo}
              </span>
            </div>
          </div>

          <div className="flex items-center" style={{ gap: "24px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/metric-eye.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>
                {property.viewCount} views
              </span>
            </div>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>
                Move to:
              </span>
              <span
                className="inline-flex items-center justify-center"
                style={{
                  padding: "4px 12px",
                  background: "#ECFDF3",
                  color: "#027A48",
                  borderRadius: "20px",
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 500,
                }}
              >
                {property.status}
              </span>
            </div>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/detail-question.svg" alt="" width={24} height={24} />
              <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#EA651A" }}>
                Has this property been {property.tag === "For Sale" ? "sold" : "rented"}?
              </span>
            </div>
          </div>
        </div>


        <div className="flex items-center shrink-0" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center hover:opacity-80"
            style={{
              height: "48px",
              padding: "8px 24px",
              gap: "8px",
              background: "transparent",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#E30045",
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.6 : 1,
            }}
          >
            <Image
              src="/icons/dash/trash.svg"
              alt=""
              width={20}
              height={20}
            />
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
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
            Edit Property
          </button>
        </div>
      </div>


      <ImageSlider images={property.images} title={property.title} />


      <div className="flex items-center justify-between" style={{ padding: "16px 0", borderBottom: "1px solid #F6F6F6" }}>
        <span
          style={{
            fontSize: "32px",
            lineHeight: "56px",
            fontWeight: 700,
            color: "#305E82",
            letterSpacing: "-0.02em",
          }}
        >
          {property.price}{property.priceSuffix}
        </span>
        <div className="flex items-center" style={{ gap: "24px" }}>
          <SpecItem icon="/icons/dash/card-maximize.svg" label={property.sqft} />
          <SpecItem icon="/icons/dash/card-bed.svg" label={`${property.beds} Beds`} />
          <SpecItem icon="/icons/dash/card-bath.svg" label={`${property.baths} Baths`} />
        </div>
      </div>


      <Section title="Description">
        <p style={{ fontSize: "14px", lineHeight: "24px", color: "#121212" }}>
          {property.description}
        </p>
      </Section>


      <Section title="Amenities & Features">
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px 24px" }}>
          {property.amenities.map((a) => (
            <div key={a} className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/check-circle-current.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "14px", lineHeight: "24px", color: "#121212" }}>{a}</span>
            </div>
          ))}
        </div>
      </Section>


      <Section title="Property Details">
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <DetailItem label="Property ID" value={property.referenceCode} />
          <DetailItem label="Type" value={property.type} />
          <DetailItem label="Status" value={property.status} />
          <DetailItem label="Listed on" value={property.listedOn} />
        </div>
      </Section>


      {property.charges.length > 0 && (
        <Section title="Additional Charges">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {property.charges.map((c, i) => (
              <DetailItem key={`${c.title}-${i}`} label={c.title} value={c.amount} />
            ))}
          </div>
        </Section>
      )}


      {property.map && (
        <Section title="View Map">
          <div
            style={{
              width: "100%",
              height: "424px",
              background: "#F6F6F6",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid #F6F6F6",
            }}
          >
            <iframe
              title={`Map of ${property.location}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.map.bbox}&layer=mapnik&marker=${property.map.marker}`}
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
              loading="lazy"
            />
          </div>
        </Section>
      )}
    </div>
  );
}


function ImageSlider({ images, title }: { images: string[]; title: string }) {
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
        height: "450px",
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
        unoptimized
        style={{ objectFit: "cover" }}
        priority
      />


      <button
        type="button"
        onClick={prev}
        aria-label="Previous photo"
        className="absolute flex items-center justify-center hover:opacity-90"
        style={{
          left: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "40px",
          height: "40px",
          borderRadius: "100%",
          background: "rgba(18,18,18,0.5)",
          border: "none",
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next photo"
        className="absolute flex items-center justify-center hover:opacity-90"
        style={{
          right: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "40px",
          height: "40px",
          borderRadius: "100%",
          background: "rgba(18,18,18,0.5)",
          border: "none",
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>


      <div
        className="absolute flex items-center"
        style={{
          left: "24px",
          bottom: "24px",
          padding: "10px 16px",
          background: "rgba(18,18,18,0.5)",
          borderRadius: "10px",
          gap: "6px",
        }}
      >
        <Image src="/icons/dash/detail-gallery.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 500 }}>
          {index + 1}/{total}
        </span>
      </div>


      <div
        className="absolute flex items-center"
        style={{ left: "50%", bottom: "24px", transform: "translateX(-50%)", gap: "6px" }}
      >
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
            style={{
              width: i === index ? "20px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === index ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 0.15s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SpecItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      <Image src={icon} alt="" width={20} height={20} />
      <span style={{ fontSize: "14px", lineHeight: "24px", color: "#121212" }}>{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "16px", paddingTop: "24px" }}>
      <h2 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#305E82" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col" style={{ gap: "4px" }}>
      <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>{label}</span>
      <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#121212" }}>{value}</span>
    </div>
  );
}
