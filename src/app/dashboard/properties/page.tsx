"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Status = "Active" | "Awaiting Approval" | "Archived" | "Rejected";
type Tag = "For Rent" | "For Sale" | "Shortlet";

type Property = {
  id: string;
  title: string;
  location: string;
  price: string;
  priceSuffix?: string;
  tag: Tag;
  status: Status;
  sqft: string;
  beds: number;
  baths: number;
  image: string;
};

const PROPERTIES: Property[] = [
  {
    id: "p1",
    title: "3-Bedroom Flat, Lekki Phase 1",
    location: "Lekki Phase 1, Lagos",
    price: "₦2,800,000",
    priceSuffix: "/yr",
    tag: "For Rent",
    status: "Active",
    sqft: "3500 sqft",
    beds: 3,
    baths: 4,
    image: "/images/prop1.jpg",
  },
  {
    id: "p2",
    title: "2-Bedroom Apartment, Victoria Island",
    location: "Victoria Island, Lagos",
    price: "₦450,000",
    priceSuffix: "/night",
    tag: "Shortlet",
    status: "Active",
    sqft: "1800 sqft",
    beds: 3,
    baths: 2,
    image: "/images/prop2.jpg",
  },
  {
    id: "p3",
    title: "Office Space, Ikeja GRA",
    location: "Ikeja GRA, Lagos",
    price: "₦3,400,000",
    priceSuffix: "/yr",
    tag: "For Rent",
    status: "Archived",
    sqft: "1200 sqft",
    beds: 2,
    baths: 1,
    image: "/images/prop3.jpg",
  },
  {
    id: "p4",
    title: "4-bedroom Duplex, Ikoyi",
    location: "Ikoyi, Lagos",
    price: "₦260,000,000",
    tag: "For Sale",
    status: "Awaiting Approval",
    sqft: "5000 sqft",
    beds: 5,
    baths: 6,
    image: "/images/prop4.jpg",
  },
  {
    id: "p5",
    title: "2-Bedroom Flat, Jibowu, Yaba",
    location: "Yaba, Lagos",
    price: "₦1,800,000",
    priceSuffix: "/yr",
    tag: "For Rent",
    status: "Active",
    sqft: "2000 sqft",
    beds: 3,
    baths: 3,
    image: "/images/prop5.jpg",
  },
];

const TABS = ["All", "Active", "Awaiting Approval", "Archived", "Rejected"] as const;
type Tab = (typeof TABS)[number];

function statusStyles(status: Status) {
  switch (status) {
    case "Active":
      // fill_7TWS8R bg / fill_NYWKLY text
      return { bg: "#ECFDF3", color: "#027A48" };
    case "Awaiting Approval":
      // fill_7AVJNK bg / fill_4SPYRU text
      return { bg: "#FFF7E9", color: "#EA651A" };
    case "Archived":
      // fill_EI6ECX bg / fill_R8LIWJ text
      return { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" };
    case "Rejected":
      return { bg: "#FEF3F2", color: "#B42318" };
  }
}

export default function MyPropertiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");

  const visible = PROPERTIES.filter((p) => {
    if (activeTab !== "All" && p.status !== activeTab) return false;
    if (search && !`${p.title} ${p.location}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    All: PROPERTIES.length,
    Active: PROPERTIES.filter((p) => p.status === "Active").length,
    "Awaiting Approval": PROPERTIES.filter((p) => p.status === "Awaiting Approval").length,
    Archived: PROPERTIES.filter((p) => p.status === "Archived").length,
    Rejected: PROPERTIES.filter((p) => p.status === "Rejected").length,
  };

  return (
    <div className="flex flex-col" style={{ gap: "24px", maxWidth: "1088px" }}>
      

      
      <div className="flex items-center justify-between" style={{ gap: "16px" }}>
        
        <div className="flex items-center" style={{ gap: "0" }}>
          {TABS.map((t) => {
            const active = t === activeTab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: active ? "#305E82" : "#807E7E",
                  border: "none",
                  borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t} ({counts[t]})
              </button>
            );
          })}
        </div>

        <div className="flex items-center" style={{ gap: "16px" }}>
          
          <div
            className="flex items-center"
            style={{
              background: "#F6F6F6",
              borderRadius: "12px",
              padding: "8px 16px",
              gap: "8px",
              width: "320px",
              height: "40px",
            }}
          >
            <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter location, area or keyword..."
              className="flex-1 outline-none bg-transparent"
              style={{
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#121212",
              }}
            />
          </div>

          
          <Link
            href="/dashboard/properties/new"
            className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{
              height: "40px",
              padding: "8px 20px",
              gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "16px" }}>+</span>
            Add Property
          </Link>
        </div>
      </div>

      
      {visible.length === 0 ? (
        <div
          className="bg-white flex items-center justify-center"
          style={{
            border: "1px solid #F6F6F6",
            borderRadius: "20px",
            padding: "80px",
            fontSize: "14px",
            color: "#807E7E",
          }}
        >
          No properties found.
        </div>
      ) : (
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, 352px)", gap: "24px 16px" }}
        >
          {visible.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const status = statusStyles(property.status);
  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{
        width: "352px",
        height: "414px",
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      
      <div className="relative" style={{ width: "352px", height: "218px", background: "#EDEDED" }}>
        <Image src={property.image} alt={property.title} fill style={{ objectFit: "cover" }} sizes="352px" />
        
        <span
          className="absolute"
          style={{
            right: "16px",
            bottom: "16px",
            padding: "4px 12px",
            background: "#FFAE00",
            color: "#FFFFFF",
            borderRadius: "50px",
            fontSize: "12px",
            lineHeight: "20px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {property.tag}
        </span>
      </div>

      
      <div
        className="absolute flex flex-col"
        style={{ left: "16px", top: "242px", width: "320px", gap: "8px" }}
      >
        
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "8px" }}>
            
            <span
              style={{
                fontSize: "20px",
                lineHeight: "28px",
                fontWeight: 600,
                color: "#305E82",
                letterSpacing: "-0.02em",
              }}
            >
              {property.price}
              {property.priceSuffix && (
                <span style={{ fontSize: "14px", fontWeight: 400, color: "#807E7E" }}>
                  {property.priceSuffix}
                </span>
              )}
            </span>
            {/* Status badge */}
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "16px",
                background: status.bg,
                color: status.color,
                fontSize: "11px",
                lineHeight: "16px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {property.status}
            </span>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: open card actions menu (Edit / Archive / Delete / Share)
            }}
            aria-label="Property actions"
            className="shrink-0 hover:opacity-70"
            style={{ background: "none", border: "none", padding: 0, width: "24px", height: "24px" }}
          >
            <Image src="/icons/dash/card-menu.svg" alt="" width={24} height={24} />
          </button>
        </div>

        
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h3
            style={{
              fontSize: "16px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#121212",
              letterSpacing: "-0.02em",
            }}
          >
            {property.title}
          </h3>
          <div className="flex items-center" style={{ gap: "4px" }}>
            <Image src="/icons/dash/card-location.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "#807E7E" }}>
              {property.location}
            </span>
          </div>
        </div>

        
        <div
          className="flex items-center"
          style={{
            gap: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #F6F6F6",
            marginTop: "4px",
            fontSize: "12px",
            color: "#807E7E",
          }}
        >
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-maximize.svg" alt="" width={16} height={16} />
            {property.sqft}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bed.svg" alt="" width={16} height={16} />
            {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
          </span>
          <span style={{ color: "#EDEDED" }}>|</span>
          <span className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/card-bath.svg" alt="" width={16} height={16} />
            {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
          </span>
        </div>
      </div>
    </Link>
  );
}
