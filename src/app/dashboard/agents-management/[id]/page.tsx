"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { AGENTS } from "../page";

type AgentProperty = {
  id: string;
  title: string;
  location: string;
  price: string;
  priceSuffix?: string;
  tag: "FOR RENT" | "FOR SALE" | "SHORTLET";
  status: "Active" | "Awaiting Approval" | "Archived";
  sqft: string;
  beds: number;
  baths: number;
  image: string;
};

const AGENT_PROPERTIES: AgentProperty[] = [
  {
    id: "p1",
    title: "3-Bedroom Flat, Lekki Phase 1",
    location: "Lekki Phase 1, Lagos",
    price: "₦2,800,000",
    priceSuffix: "/yr",
    tag: "FOR RENT",
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
    tag: "SHORTLET",
    status: "Active",
    sqft: "1800 sqft",
    beds: 3,
    baths: 2,
    image: "/images/prop2.jpg",
  },
  {
    id: "p4",
    title: "4-bedroom Duplex, Ikoyi",
    location: "Ikoyi, Lagos",
    price: "₦260,000,000",
    tag: "FOR SALE",
    status: "Awaiting Approval",
    sqft: "5000 sqft",
    beds: 5,
    baths: 6,
    image: "/images/prop4.jpg",
  },
];

const STATUS_COLORS: Record<AgentProperty["status"], { bg: string; color: string }> = {
  Active: { bg: "#ECFDF3", color: "#027A48" },
  "Awaiting Approval": { bg: "#FFF7E9", color: "#EA651A" },
  Archived: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
};

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const agent = AGENTS.find((a) => a.id === id) ?? AGENTS[0];
  const [showSuspend, setShowSuspend] = useState(false);

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

      <div className="flex items-start justify-between" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px", flex: 1, minWidth: 0 }}>
          <div
            className="rounded-full relative overflow-hidden shrink-0"
            style={{ width: "56px", height: "56px", background: "rgba(48,94,130,0.05)" }}
          >
            <Image src={agent.avatar} alt={agent.name} fill sizes="56px" style={{ objectFit: "cover" }} />
          </div>

          <div className="flex flex-col" style={{ gap: "8px", minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <h1 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212" }}>
                {agent.name}
              </h1>
              {agent.verified && (
                <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
              )}
            </div>

            <div className="flex items-center" style={{ gap: "16px" }}>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
                <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                  Surulere, Lagos
                </span>
              </div>
              <span
                className="inline-flex items-center"
                style={{
                  gap: "8px",
                  height: "24px",
                  padding: "0 12px",
                  background: "rgba(48,94,130,0.08)",
                  color: "#305E82",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                <Image src="/icons/dash/icon-buildings.svg" alt="" width={16} height={16} />
                3 Listings
              </span>
              <div className="flex items-center" style={{ gap: "8px" }}>
                <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
                <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                  {agent.rating}
                </span>
              </div>
              <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                Added 8 months ago
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSuspend(true)}
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{
            height: "40px",
            padding: "8px 16px",
            gap: "8px",
            background: "transparent",
            border: "none",
            fontSize: "14px",
            fontWeight: 500,
            color: "#D80027",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/flag-red.svg" alt="" width={20} height={20} />
          Suspend Agent
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
        {AGENT_PROPERTIES.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {showSuspend && (
        <SuspendAgentModal
          agentName={agent.name}
          onClose={() => setShowSuspend(false)}
          onConfirm={() => {
            setShowSuspend(false);
            router.push("/dashboard/agents-management");
          }}
        />
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: AgentProperty }) {
  const status = STATUS_COLORS[property.status];
  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div className="relative" style={{ width: "100%", height: "180px", background: "#EDEDED" }}>
        <Image src={property.image} alt={property.title} fill style={{ objectFit: "cover" }} sizes="352px" />
        <span
          className="absolute"
          style={{
            right: "12px",
            bottom: "12px",
            padding: "4px 12px",
            background: "#FFAE00",
            color: "#FFFFFF",
            borderRadius: "50px",
            fontSize: "11px",
            lineHeight: "16px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {property.tag}
        </span>
      </div>

      <div className="flex flex-col" style={{ padding: "16px", gap: "12px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 600, color: "#305E82" }}>
              {property.price}
              {property.priceSuffix && (
                <span style={{ fontSize: "12px", fontWeight: 400, color: "#807E7E" }}>
                  {property.priceSuffix}
                </span>
              )}
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "12px",
                background: status.bg,
                color: status.color,
                fontSize: "10px",
                lineHeight: "16px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {property.status}
            </span>
          </div>
          <span className="shrink-0" style={{ width: "20px", height: "20px" }}>
            <Image src="/icons/dash/edit-blue.svg" alt="" width={20} height={20} />
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h3 style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
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
          style={{ gap: "12px", paddingTop: "12px", borderTop: "1px solid #F6F6F6", fontSize: "12px", color: "#807E7E" }}
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

function SuspendAgentModal({
  agentName,
  onClose,
  onConfirm,
}: {
  agentName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 50, padding: "24px" }}
      onClick={onClose}
    >
      <div
        className="bg-white relative"
        style={{ width: "503px", maxWidth: "100%", borderRadius: "24px", padding: "32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end" style={{ marginBottom: "8px" }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:opacity-70"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              width: "24px",
              height: "24px",
              cursor: "pointer",
              color: "#807E7E",
              fontSize: "24px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div className="flex flex-col items-center" style={{ gap: "24px", padding: "0 24px 8px" }}>
          <Image src="/icons/dash/noti-warning.svg" alt="" width={120} height={120} />
          <div className="flex flex-col items-center text-center" style={{ gap: "12px" }}>
            <h2 style={{ fontSize: "20px", lineHeight: "30px", fontWeight: 600, color: "#121212" }}>
              Suspend Agent?
            </h2>
            <p style={{ fontSize: "16px", lineHeight: "24px", color: "#807E7E", maxWidth: "400px" }}>
              Are you sure you want to suspend {agentName ? `${agentName} as an` : "this"} agent? This
              action cannot be undone, and the agent will not be able to perform any action anymore.
            </p>
          </div>
          <div className="flex flex-col items-center" style={{ gap: "16px", width: "100%" }}>
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center justify-center text-white hover:opacity-90"
              style={{
                width: "100%",
                height: "56px",
                background: "#E30045",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Suspend Agent
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: "8px",
                fontSize: "16px",
                fontWeight: 500,
                color: "#121212",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
