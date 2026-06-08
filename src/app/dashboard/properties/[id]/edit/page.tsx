"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import PropertyForm, { type PropertyFormInitial } from "@/components/PropertyForm";
import { useGetMyPropertiesQuery } from "@/services/propertyApi";
import type { ListingType, PriceFrequency } from "@/services/types";

const TAG_BY_LISTING: Record<ListingType, string> = {
  RENT: "For Rent",
  BUY: "For Sale",
  SHORTLET: "Shortlet",
};

const FREQUENCY_LABEL: Record<PriceFrequency, string> = {
  PER_NIGHT: "per night",
  PER_WEEK: "per week",
  PER_MONTH: "per month",
  PER_YEAR: "per year",
  OUTRIGHT: "outright sale",
};

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  // Source from the owner's list (all statuses) — GET /properties/{id} is
  // approved-only and 404s on pending listings.
  const { data: property, isLoading, isError } = useGetMyPropertiesQuery(
    { page: 0, size: 100 },
    {
      selectFromResult: ({ data, isLoading, isError }) => ({
        data: data?.content.find((p) => p.id === id),
        isLoading,
        isError,
      }),
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh", color: "#807E7E", fontSize: "14px" }}>
        Loading property…
      </div>
    );
  }

  if (isError || !property) {
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

  const initial: PropertyFormInitial = {
    title: property.title,
    // PropertyForm's Property Type dropdown matches on displayName, which equals
    // propertyTypeName from the backend.
    propertyType: property.propertyTypeName ?? "",
    listingType: TAG_BY_LISTING[property.listingType],
    price: String(property.price ?? ""),
    frequency: FREQUENCY_LABEL[property.priceFrequency],
    state: property.state ?? "",
    city: property.city ?? "",
    address: property.address ?? "",
    description: property.description ?? "",
    amenities: (property.amenities ?? []).map((a) => a.name),
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    parking: property.parkingSpaces ?? 0,
    totalArea: property.totalAreaSqm ?? 0,
    yearBuilt: property.yearBuilt ? String(property.yearBuilt) : "",
    existingPhotos: (property.photos ?? []).map((p) => p.url),
    charges: (property.charges ?? []).map((c, i) => ({
      id: c.id ?? `c${i}`,
      title: c.title,
      amount: String(c.amount),
    })),
  };

  return <PropertyForm mode="edit" propertyId={id} initial={initial} />;
}
