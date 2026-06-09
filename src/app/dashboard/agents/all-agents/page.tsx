"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Agent = {
  id: string;
  name: string;
  avatar: string;
  company: string;
  location: string;
  rating: string;
  listings: string;
  verified: boolean;
};

const A1 = "/images/agents/ibrahim-fashola.png";
const A2 = "/images/agents/pascaline-okonkwo.png";

const ALL_AGENTS: Agent[] = [
  { id: "agent-1", name: "Ibrahim Fashola", avatar: A1, company: "Jaskaro Properties", location: "Lagos", rating: "5.0", listings: "9 listings", verified: true },
  { id: "agent-2", name: "Pascaline Okonkwo", avatar: A2, company: "Prime Realty & Co.", location: "Abuja", rating: "4.9", listings: "24 listings", verified: true },
  { id: "agent-3", name: "Ayo Mustapha", avatar: A1, company: "Anchor Realty Group", location: "Lagos", rating: "4.6", listings: "18 listings", verified: true },
  { id: "agent-4", name: "Amaka Nze", avatar: A2, company: "City Gate Realty", location: "Enugu", rating: "4.7", listings: "12 listings", verified: true },
  { id: "agent-5", name: "Bello Kolade", avatar: A1, company: "Five Estate", location: "Abuja", rating: "4.4", listings: "21 listings", verified: true },
  { id: "agent-6", name: "Eze James", avatar: A2, company: "Prime Realty & Co.", location: "Port-Harcourt", rating: "4.8", listings: "14 listings", verified: true },
  { id: "agent-7", name: "Ayo Mustapha", avatar: A1, company: "Anchor Realty Group", location: "Lagos", rating: "4.6", listings: "18 listings", verified: true },
  { id: "agent-8", name: "Amaka Nze", avatar: A2, company: "City Gate Realty", location: "Enugu", rating: "4.7", listings: "12 listings", verified: true },
  { id: "agent-9", name: "Bello Kolade", avatar: A1, company: "Five Estate", location: "Abuja", rating: "4.4", listings: "21 listings", verified: true },
  { id: "agent-10", name: "Eze James", avatar: A2, company: "Prime Realty & Co.", location: "Port-Harcourt", rating: "4.8", listings: "14 listings", verified: true },
];

const VERIFIED_OPTIONS = ["Verified", "Unverified", "All"];
const RATING_OPTIONS = ["All Ratings", "4.5+", "4.0+", "3.5+"];
const LOCATIONS = ["All Location", "Lagos", "Abuja", "Port-Harcourt", "Enugu"];

export default function AllAgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [verifiedFilter, setVerifiedFilter] = useState(VERIFIED_OPTIONS[0]);
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
          <h1 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212", letterSpacing: "-0.02em" }}>
            All Agents
          </h1>
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>
            Showing 12 of 250
          </span>
        </div>

        <div className="flex items-center" style={{ gap: "16px" }}>
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>Filter:</span>
          <SmallDropdown value={verifiedFilter} onChange={setVerifiedFilter} options={VERIFIED_OPTIONS} />
          <SmallDropdown value={rating} onChange={setRating} options={RATING_OPTIONS} />
        </div>
      </div>

      <div className="flex items-center" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="outline-none bg-transparent appearance-none"
            style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212", paddingRight: "8px" }}
          >
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ pointerEvents: "none" }} />
        </div>

        <div className="flex items-center" style={{ flex: 1, height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}>
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
            width: "160px", height: "48px", padding: "8px 24px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}
        >
          Search
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{
            height: "48px", padding: "8px 16px", gap: "8px",
            background: "#F6F6F6", border: "none", borderRadius: "12px",
            fontSize: "14px", fontWeight: 400, color: "#121212", cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/filter-setting.svg" alt="" width={16} height={16} />
          Filter
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "24px" }}>
        {ALL_AGENTS.map((a) => (
          <AgentRowCard key={a.id} agent={a} />
        ))}
      </div>

      <Pagination current={page} total={5} onChange={setPage} />
    </div>
  );
}

function SmallDropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center" style={{ height: "40px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="outline-none bg-transparent appearance-none" style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ pointerEvents: "none" }} />
    </div>
  );
}

function AgentRowCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="block bg-white hover:shadow-md transition-shadow"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px" }}
    >
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div className="rounded-full relative overflow-hidden shrink-0" style={{ width: "48px", height: "48px", background: "rgba(48,94,130,0.05)" }}>
            <Image src={agent.avatar} alt={agent.name} fill sizes="48px" style={{ objectFit: "cover" }} />
          </div>
          <div className="flex flex-col" style={{ gap: "4px", flex: 1, minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
                {agent.name}
              </span>
              {agent.verified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
            </div>
            <span style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>{agent.company}</span>
            <div className="flex items-center" style={{ gap: "8px", marginTop: "4px" }}>
              <Image src="/icons/dash/detail-location.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", lineHeight: "20px", color: "#305E82" }}>{agent.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>{agent.rating}</span>
            </div>
            <div style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/icon-buildings.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>{agent.listings}</span>
            </div>
          </div>
          <span className="hover:underline" style={{ fontSize: "14px", fontWeight: 500, color: "#305E82" }}>
            View all Properties
          </span>
        </div>

        <div className="flex items-center" style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="inline-flex items-center justify-center hover:opacity-80"
            style={{
              flex: 1, height: "48px", padding: "8px 24px", gap: "8px",
              background: "#FFFFFF", border: "1px solid #F6F6F6", borderRadius: "12px",
              fontSize: "14px", fontWeight: 500, color: "#121212", cursor: "pointer",
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
              flex: 1, height: "48px", padding: "8px 24px", gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px", fontWeight: 500, cursor: "pointer",
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

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center" style={{ gap: "40px" }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none", border: "none", padding: "8px", gap: "8px",
          color: "#305E82", fontSize: "14px", fontWeight: 500,
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
              background: "none", border: "none", padding: 0,
              fontSize: "16px", fontWeight: 500,
              color: p === current ? "#305E82" : "#807E7E",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
        <span style={{ fontSize: "16px", color: "#807E7E" }}>...</span>
      </div>

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none", border: "none", padding: "8px", gap: "8px",
          color: "#305E82", fontSize: "14px", fontWeight: 500, cursor: "pointer",
        }}
      >
        Next
        <Image src="/icons/dash/pag-arrow-right.svg" alt="" width={20} height={20} />
      </button>
    </div>
  );
}
