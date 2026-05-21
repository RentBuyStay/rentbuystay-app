"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import PropertyForm, { type PropertyFormInitial } from "@/components/PropertyForm";
import { getProperty } from "@/lib/properties";

const PROPERTY_TYPE_BY_KIND: Record<string, string> = {
  "Apartment and Flat": "Flat/Apartment",
  Apartment: "Flat/Apartment",
  Duplex: "Duplex",
  Commercial: "Office Space",
  House: "House",
  Bungalow: "Bungalow",
  Land: "Land",
};

const KNOWN_AMENITIES = new Set([
  "24/7 Security",
  "Gated Estate",
  "Generator",
  "Air Conditioning",
  "CCTV",
  "Parking Space",
  "Swimming Pool",
  "Gym",
  "Borehole Water",
  "Tiled Floor",
  "Internet/WiFi",
]);

const SUFFIX_TO_FREQUENCY: Record<string, string> = {
  "/yr": "per year",
  "/mo": "per month",
  "/wk": "per week",
  "/night": "per night",
  "": "outright sale",
};

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const property = getProperty(id);

  if (!property) {
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

  const [city, stateName] = property.location.split(",").map((s) => s.trim());
  const matchedAmenities = property.amenities.filter((a) => KNOWN_AMENITIES.has(a));
  const otherAmenities = property.amenities.filter((a) => !KNOWN_AMENITIES.has(a));

  const initial: PropertyFormInitial = {
    title: property.title,
    propertyType: PROPERTY_TYPE_BY_KIND[property.type] ?? "Other",
    listingType: property.tag,
    price: property.price.replace(/[^\d.]/g, ""),
    frequency: SUFFIX_TO_FREQUENCY[property.priceSuffix ?? ""] ?? "",
    state: stateName ?? "Lagos",
    city: city ?? "",
    address: property.location,
    description: property.description,
    amenities: [...matchedAmenities, ...otherAmenities],
    otherAmenities,
    bedrooms: property.beds,
    bathrooms: property.baths,
    parking: 0,
    totalArea: Number(property.sqft.replace(/[^\d]/g, "")) || 0,
    yearBuilt: "",
    existingPhotos: property.images,
    charges: [
      { id: "service", title: "Service Charge", amount: property.serviceCharge.replace(/[^\d.]/g, "") },
      { id: "booking", title: "Booking Charge", amount: property.bookingCharge.replace(/[^\d.]/g, "") },
    ],
  };

  return <PropertyForm mode="edit" initial={initial} />;
}
