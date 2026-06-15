"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import PropertyForm, { type PropertyFormInitial } from "@/components/PropertyForm";
import { useGetMyPropertiesQuery } from "@/services/propertyApi";
import type { ListingType, PriceFrequency } from "@/services/types";
import { getProperty as getLocalProperty, type Property as LocalProperty } from "@/lib/properties";

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

function fromLocal(p: LocalProperty): PropertyFormInitial {
  const suffixToFreq: Record<string, string> = {
    "/yr": "per year",
    "/mo": "per month",
    "/wk": "per week",
    "/night": "per night",
    "": "outright sale",
  };
  return {
    title: p.title,
    propertyType: "Apartment and Flat",
    listingType: p.tag,
    price: p.price.replace(/[^\d.]/g, ""),
    frequency: suffixToFreq[p.priceSuffix ?? ""] ?? "",
    state: (p.location.split(",")[1] ?? "Lagos").trim(),
    city: (p.location.split(",")[0] ?? "").trim(),
    address: p.location,
    description: p.description,
    amenities: p.amenities,
    bedrooms: p.beds,
    bathrooms: p.baths,
    totalArea: Number(p.sqft.replace(/[^\d]/g, "")) || 0,
    yearBuilt: "",
    existingPhotos: p.images.map(img => ({ id: img, url: img })),
    charges: [
      { id: "service", title: "Service Charge", amount: p.serviceCharge.replace(/[^\d.]/g, "") },
      { id: "booking", title: "Booking Charge", amount: p.bookingCharge.replace(/[^\d.]/g, "") },
    ],
    assignedAgentId: "kuku-adebanjo",
  };
}

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
    const localFallback = getLocalProperty(id);
    if (localFallback) {
      return <PropertyForm mode="edit" propertyId={id} initial={fromLocal(localFallback)} />;
    }
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
    existingPhotos: (property.photos ?? [])
      .filter((p): p is { id: string; url: string } => typeof p.id === "string")
      .map((p) => ({ id: p.id, url: p.url })),
    charges: (property.charges ?? []).map((c, i) => ({
      id: c.id ?? `c${i}`,
      title: c.title,
      amount: String(c.amount),
    })),
  };

  return <PropertyForm mode="edit" propertyId={id} initial={initial} />;
}
