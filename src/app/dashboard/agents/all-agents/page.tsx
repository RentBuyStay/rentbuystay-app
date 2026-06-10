"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetAgentsQuery } from "@/services/agentApi";
import { useOpenDirectConversationMutation } from "@/services/conversationApi";
import type { AgentListItem } from "@/services/types";

type AgentVM = {
  userId: string;
  name: string;
  initials: string;
  avatar: string;
  company: string;
  rating: string;
  ratingValue: number;
  listings: string;
  verified: boolean;
};

function toVM(a: AgentListItem): AgentVM {
  const name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || "Agent";
  const count = a.listingCount ?? 0;
  return {
    userId: a.userId,
    name,
    initials: ((a.firstName?.[0] ?? "") + (a.lastName?.[0] ?? "")).toUpperCase() || "A",
    avatar: a.avatarUrl ?? "",
    company: a.organizationName ?? "Independent",
    rating: a.averageRating && a.averageRating > 0 ? a.averageRating.toFixed(1) : "New",
    ratingValue: a.averageRating ?? 0,
    listings: `${count} ${count === 1 ? "listing" : "listings"}`,
    verified: !!a.identityVerified,
  };
}

const VERIFIED_OPTIONS = ["All", "Verified", "Unverified"];
const RATING_OPTIONS = ["All Ratings", "4.5+", "4.0+", "3.5+"];
const LISTING_TYPES = ["Sale", "Rent", "Shortlet"];
const PAGE_SIZE = 12;

export default function AllAgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState(VERIFIED_OPTIONS[0]);
  const [rating, setRating] = useState(RATING_OPTIONS[0]);
  // Listing-type pill beside the search box (Figma). Agents carry no listing
  // type on the backend, so this is a UI control only.
  const [listingType, setListingType] = useState(LISTING_TYPES[0]);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useGetAgentsQuery({
    page,
    size: PAGE_SIZE,
    q: query || undefined,
  });

  const minRating = rating === "4.5+" ? 4.5 : rating === "4.0+" ? 4.0 : rating === "3.5+" ? 3.5 : 0;
  const all = (data?.content ?? []).map(toVM);
  const agents = all.filter((a) => {
    if (verifiedFilter === "Verified" && !a.verified) return false;
    if (verifiedFilter === "Unverified" && a.verified) return false;
    if (minRating > 0 && a.ratingValue < minRating) return false;
    return true;
  });

  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  function runSearch() {
    setQuery(search);
    setPage(0);
  }

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center self-start hover:opacity-80"
        style={{ gap: "12px", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <Image src="/icons/dash/detail-back.svg" alt="" width={24} height={24} />
        <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 400, color: "#525252" }}>Back</span>
      </button>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h1 className="text-[16px] md:text-[20px]" style={{ lineHeight: "32px", fontWeight: 600, color: "#121212", letterSpacing: "-0.02em" }}>
            All Agents
          </h1>
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>
            Showing {agents.length} of {total}
          </span>
        </div>

        <div className="flex items-center flex-wrap" style={{ gap: "12px" }}>
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>Filter:</span>
          <SmallDropdown value={verifiedFilter} onChange={setVerifiedFilter} options={VERIFIED_OPTIONS} />
          <SmallDropdown value={rating} onChange={setRating} options={RATING_OPTIONS} />
        </div>
      </div>

      {/* Search bar — two rows on mobile (type + search / filter-icon + wide Search) */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-2 md:contents">
          <div className="flex items-center shrink-0" style={{ height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="outline-none bg-transparent appearance-none"
              style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em", paddingRight: "4px" }}
            >
              {LISTING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ pointerEvents: "none" }} />
          </div>

          <div className="flex items-center min-w-0 flex-1" style={{ height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}>
            <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Enter agent name..."
              className="flex-1 min-w-0 outline-none bg-transparent"
              style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#121212" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:contents">
          <button
            type="button"
            onClick={runSearch}
            aria-label="Filter"
            className="md:hidden inline-flex items-center justify-center shrink-0 w-12 hover:opacity-80"
            style={{ height: "48px", background: "#F6F6F6", border: "none", borderRadius: "12px", cursor: "pointer" }}
          >
            <Image src="/icons/dash/filter-setting.svg" alt="" width={16} height={16} />
          </button>

          <button
            type="button"
            onClick={runSearch}
            className="flex items-center justify-center text-white hover:opacity-90 flex-1 md:flex-none md:w-[160px]"
            style={{
              height: "48px", padding: "8px 24px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {isLoading ? (
        <EmptyBox>Loading agents…</EmptyBox>
      ) : agents.length === 0 ? (
        <EmptyBox>No agents found.</EmptyBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
          {agents.map((a) => (
            <AgentRowCard key={a.userId} agent={a} />
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination current={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white flex items-center justify-center"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "48px", color: "#807E7E", fontSize: "14px" }}
    >
      {children}
    </div>
  );
}

function SmallDropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center" style={{ height: "40px", background: "#F6F6F6", borderRadius: "12px", padding: "4px 8px", gap: "16px" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="outline-none bg-transparent appearance-none" style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ pointerEvents: "none" }} />
    </div>
  );
}

function AgentRowCard({ agent }: { agent: AgentVM }) {
  const router = useRouter();
  const [openDirect] = useOpenDirectConversationMutation();
  const contact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openDirect(agent.userId)
      .unwrap()
      .then((c) => router.push(`/dashboard/messages?c=${c.id}`))
      .catch(() => {});
  };
  return (
    <Link
      href={`/dashboard/agents/${agent.userId}`}
      className="block bg-white hover:shadow-md transition-shadow"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px" }}
    >
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div className="rounded-full relative overflow-hidden shrink-0 flex items-center justify-center" style={{ width: "48px", height: "48px", background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: "16px", fontWeight: 600 }}>
            {agent.avatar ? (
              <Image src={agent.avatar} alt={agent.name} fill unoptimized sizes="48px" style={{ objectFit: "cover" }} />
            ) : (
              agent.initials
            )}
          </div>
          <div className="flex flex-col" style={{ gap: "4px", flex: 1, minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>{agent.name}</span>
              {agent.verified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
            </div>
            <span style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>{agent.company}</span>
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
            View Profile
          </span>
        </div>

        <div className="flex items-center" style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <button
            type="button"
            onClick={contact}
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
            onClick={contact}
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

function Pagination({ current, totalPages, onChange }: { current: number; totalPages: number; onChange: (p: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  return (
    <div className="flex items-center justify-center" style={{ gap: "40px" }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, current - 1))}
        disabled={current === 0}
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none", border: "none", padding: "8px", gap: "8px",
          color: "#305E82", fontSize: "14px", fontWeight: 500,
          cursor: current === 0 ? "not-allowed" : "pointer",
          opacity: current === 0 ? 0.4 : 1,
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
            {p + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages - 1, current + 1))}
        disabled={current >= totalPages - 1}
        className="inline-flex items-center hover:opacity-80"
        style={{
          background: "none", border: "none", padding: "8px", gap: "8px",
          color: "#305E82", fontSize: "14px", fontWeight: 500,
          cursor: current >= totalPages - 1 ? "not-allowed" : "pointer",
          opacity: current >= totalPages - 1 ? 0.4 : 1,
        }}
      >
        Next
        <Image src="/icons/dash/pag-arrow-right.svg" alt="" width={20} height={20} />
      </button>
    </div>
  );
}
