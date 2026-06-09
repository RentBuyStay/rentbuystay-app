"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Agency = {
  id: string;
  name: string;
  banner: string;
  location: string;
  rating: string;
  listings: string;
  verified: boolean;
};

const AGENCIES: Agency[] = [
  {
    id: "agency-1",
    name: "Sydney Realtors",
    banner: "/images/agencies/sydney-realtors.png",
    location: "Port-Harcourt",
    rating: "4.7",
    listings: "27 listings",
    verified: true,
  },
  {
    id: "agency-2",
    name: "Urban Nest Realty",
    banner: "/images/agencies/urban-nest-realty.png",
    location: "Lagos",
    rating: "4.5",
    listings: "15 listings",
    verified: true,
  },
  {
    id: "agency-3",
    name: "Sydney Realtors",
    banner: "/images/agencies/sydney-realtors.png",
    location: "Port-Harcourt",
    rating: "4.7",
    listings: "27 listings",
    verified: true,
  },
  {
    id: "agency-4",
    name: "Urban Nest Realty",
    banner: "/images/agencies/urban-nest-realty.png",
    location: "Lagos",
    rating: "4.5",
    listings: "15 listings",
    verified: true,
  },
  {
    id: "agency-5",
    name: "Sydney Realtors",
    banner: "/images/agencies/sydney-realtors.png",
    location: "Port-Harcourt",
    rating: "4.7",
    listings: "27 listings",
    verified: true,
  },
  {
    id: "agency-6",
    name: "Urban Nest Realty",
    banner: "/images/agencies/urban-nest-realty.png",
    location: "Lagos",
    rating: "4.5",
    listings: "15 listings",
    verified: true,
  },
  {
    id: "agency-7",
    name: "Sydney Realtors",
    banner: "/images/agencies/sydney-realtors.png",
    location: "Port-Harcourt",
    rating: "4.7",
    listings: "27 listings",
    verified: true,
  },
  {
    id: "agency-8",
    name: "Urban Nest Realty",
    banner: "/images/agencies/urban-nest-realty.png",
    location: "Lagos",
    rating: "4.5",
    listings: "15 listings",
    verified: true,
  },
];

const PLAN_OPTIONS = ["All Plans", "Free", "Standard", "Premium"];
const RATING_OPTIONS = ["All Ratings", "4.5+", "4.0+", "3.5+"];
const LOCATIONS = ["All Location", "Lagos", "Abuja", "Port-Harcourt", "Kano"];

export default function AllAgenciesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [plan, setPlan] = useState(PLAN_OPTIONS[0]);
  const [rating, setRating] = useState(RATING_OPTIONS[0]);
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center self-start hover:opacity-80"
        style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <Image src="/icons/dash/detail-back.svg" alt="" width={24} height={24} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#525252" }}>
          Back
        </span>
      </button>

      <div className="flex items-end justify-between" style={{ gap: "16px" }}>
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h1
            style={{
              fontSize: "20px",
              lineHeight: "32px",
              fontWeight: 600,
              color: "#121212",
              letterSpacing: "-0.02em",
            }}
          >
            All Agencies & Developers
          </h1>
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>
            Showing {AGENCIES.length} of {AGENCIES.length}
          </span>
        </div>

        <div className="flex items-center" style={{ gap: "16px" }}>
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>Filter:</span>
          <SmallDropdown label="Plan" value={plan} onChange={setPlan} options={PLAN_OPTIONS} />
          <SmallDropdown label="Ratings" value={rating} onChange={setRating} options={RATING_OPTIONS} />
        </div>
      </div>

      <div className="flex items-center" style={{ gap: "16px" }}>
        <div
          className="flex items-center"
          style={{
            height: "48px",
            background: "#F6F6F6",
            borderRadius: "12px",
            padding: "8px 16px",
            gap: "8px",
          }}
        >
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="outline-none bg-transparent appearance-none"
            style={{
              fontSize: "14px",
              lineHeight: "24px",
              fontWeight: 400,
              color: "#121212",
              letterSpacing: "-0.02em",
              paddingRight: "8px",
            }}
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ pointerEvents: "none" }} />
        </div>

        <div
          className="flex items-center"
          style={{
            flex: 1,
            height: "48px",
            background: "#F6F6F6",
            borderRadius: "12px",
            padding: "8px 16px",
            gap: "8px",
          }}
        >
          <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter agency or agent name..."
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#121212" }}
          />
        </div>

        <button
          type="button"
          className="flex items-center justify-center text-white hover:opacity-90"
          style={{
            width: "160px",
            height: "48px",
            padding: "8px 24px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Search
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{
            height: "48px",
            padding: "8px 16px",
            gap: "8px",
            background: "#F6F6F6",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#121212",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/filter-setting.svg" alt="" width={16} height={16} />
          Filter
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "24px" }}>
        {AGENCIES.map((a) => (
          <AgencyCard key={a.id} agency={a} />
        ))}
      </div>

      <Pagination current={page} total={4} onChange={setPage} />
    </div>
  );
}

function SmallDropdown({
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div
      className="flex items-center"
      style={{
        height: "40px",
        background: "#F6F6F6",
        borderRadius: "12px",
        padding: "8px 16px",
        gap: "8px",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none bg-transparent appearance-none"
        style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ pointerEvents: "none" }} />
    </div>
  );
}

function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <Link
      href={`/dashboard/agents/${agency.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}
    >
      <div className="relative" style={{ width: "100%", height: "200px", background: "#EDEDED" }}>
        <Image src={agency.banner} alt={agency.name} fill style={{ objectFit: "cover" }} sizes="532px" />
      </div>

      <div className="flex flex-col" style={{ padding: "24px", gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "8px" }}>
          <h3 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
            {agency.name}
          </h3>
          {agency.verified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
        </div>

        <div className="flex items-center" style={{ gap: "8px" }}>
          <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#305E82" }}>
            {agency.location}
          </span>
        </div>

        <div
          className="flex items-center justify-between"
          style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}
        >
          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>
                {agency.rating}
              </span>
            </div>
            <div style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/icon-buildings.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>
                {agency.listings}
              </span>
            </div>
          </div>
          <span
            className="hover:underline"
            style={{ fontSize: "14px", fontWeight: 500, color: "#305E82" }}
          >
            View all Properties
          </span>
        </div>

        <div
          className="flex items-center"
          style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}
        >
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="inline-flex items-center justify-center hover:opacity-80"
            style={{
              flex: 1,
              height: "48px",
              padding: "8px 24px",
              gap: "8px",
              background: "#FFFFFF",
              border: "1px solid #F6F6F6",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#121212",
              cursor: "pointer",
            }}
          >
            <Image src="/icons/dash/call-dark.svg" alt="" width={20} height={20} />
            Call
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="inline-flex items-center justify-center text-white hover:opacity-90"
            style={{
              flex: 1,
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
            <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
            Message
          </button>
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center" style={{ gap: "40px" }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        aria-label="Previous page"
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none",
          border: "none",
          padding: "8px",
          gap: "8px",
          color: "#305E82",
          fontSize: "14px",
          fontWeight: 500,
          cursor: current === 1 ? "not-allowed" : "pointer",
          opacity: current === 1 ? 0.4 : 1,
        }}
      >
        <Image src="/icons/dash/pag-arrow-left.svg" alt="" width={20} height={20} />
      </button>

      <div className="flex items-center" style={{ gap: "40px" }}>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className="hover:opacity-80"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "16px",
              fontWeight: 500,
              color: p === current ? "#305E82" : "#807E7E",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        aria-label="Next page"
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none",
          border: "none",
          padding: "8px",
          gap: "8px",
          color: "#305E82",
          fontSize: "14px",
          fontWeight: 500,
          cursor: current === total ? "not-allowed" : "pointer",
          opacity: current === total ? 0.4 : 1,
        }}
      >
        Next
        <Image src="/icons/dash/pag-arrow-right.svg" alt="" width={20} height={20} />
      </button>
    </div>
  );
}
