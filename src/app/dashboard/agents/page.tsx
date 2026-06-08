"use client";

import Image from "next/image";
import Link from "next/link";
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
];

const AGENT_PRIMARY: Omit<Agent, "id"> = {
  name: "Ibrahim Fashola",
  avatar: "/images/agents/ibrahim-fashola.png",
  company: "Jaskaro Properties",
  location: "Lagos",
  rating: "5.0",
  listings: "9 listings",
  verified: true,
};

const AGENT_SECONDARY: Omit<Agent, "id"> = {
  name: "Pascaline Okonkwo",
  avatar: "/images/agents/pascaline-okonkwo.png",
  company: "Prime Realty & Co.",
  location: "Abuja",
  rating: "4.9",
  listings: "24 listings",
  verified: true,
};

const AGENTS: Agent[] = [
  { id: "agent-1", ...AGENT_PRIMARY },
  { id: "agent-2", ...AGENT_SECONDARY },
  { id: "agent-3", ...AGENT_PRIMARY },
  { id: "agent-4", ...AGENT_SECONDARY },
  { id: "agent-5", ...AGENT_PRIMARY },
  { id: "agent-6", ...AGENT_SECONDARY },
];

const LOCATIONS = ["All Location", "Lagos", "Abuja", "Port-Harcourt", "Kano"];

export default function DiscoverAgentsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);

  return (
    <div className="flex flex-col" style={{ gap: "40px" }}>
      <FilterBar
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
      />

      <Section title="All Agencies & Developers" viewAllHref="#">
        <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "24px" }}>
          {AGENCIES.map((a) => (
            <AgencyCard key={a.id} agency={a} />
          ))}
        </div>
      </Section>

      <Section title="All Agents" viewAllHref="#">
        <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "24px" }}>
          {AGENTS.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function FilterBar({
  search,
  setSearch,
  location,
  setLocation,
}: {
  search: string;
  setSearch: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      <p style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>
        Find agents and agencies to talk to about your needs.
      </p>

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
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 400,
              color: "#121212",
              letterSpacing: "-0.02em",
            }}
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
    </div>
  );
}

function Section({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      <div className="flex items-center justify-between">
        <h2
          style={{
            fontSize: "20px",
            lineHeight: "32px",
            fontWeight: 600,
            color: "#121212",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="inline-flex items-center hover:opacity-80"
          style={{
            gap: "8px",
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 500,
            color: "#305E82",
          }}
        >
          View All
          <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
        </Link>
      </div>
      {children}
    </div>
  );
}

function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <Link
      href={`/dashboard/agents/${agency.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div
        className="relative"
        style={{ width: "100%", height: "200px", background: "#EDEDED" }}
      >
        <Image src={agency.banner} alt={agency.name} fill style={{ objectFit: "cover" }} sizes="532px" />
      </div>

      <div className="flex flex-col" style={{ padding: "24px", gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "8px" }}>
          <h3 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
            {agency.name}
          </h3>
          {agency.verified && (
            <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
          )}
        </div>

        <div className="flex items-center" style={{ gap: "8px" }}>
          <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#305E82" }}>
            {agency.location}
          </span>
        </div>

        <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <div className="flex items-center" style={{ gap: "16px" }}>
            <SpecItem icon="/icons/dash/icon-star.svg" label={agency.rating} />
            <Separator />
            <SpecItem icon="/icons/dash/icon-buildings.svg" label={agency.listings} />
          </div>

          <Link
            href={`/dashboard/agents/${agency.id}`}
            className="hover:underline"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#305E82",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            View all Properties
          </Link>
        </div>

        <div
          className="flex items-center"
          style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}
        >
          <ContactButton variant="outline" icon="/icons/dash/call-dark.svg" label="Call" />
          <ContactButton variant="filled" icon="/icons/dash/messages-2.svg" label="Message" />
        </div>
      </div>
    </Link>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div
            className="rounded-full relative overflow-hidden shrink-0"
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(48,94,130,0.05)",
            }}
          >
            <Image src={agent.avatar} alt={agent.name} fill sizes="48px" style={{ objectFit: "cover" }} />
          </div>

          <div className="flex flex-col" style={{ gap: "4px", flex: 1, minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
                {agent.name}
              </span>
              {agent.verified && (
                <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
              )}
            </div>
            <span style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>
              {agent.company}
            </span>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: "8px" }}>
          <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#305E82" }}>
            {agent.location}
          </span>
        </div>

        <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <div className="flex items-center" style={{ gap: "16px" }}>
            <SpecItem icon="/icons/dash/icon-star.svg" label={agent.rating} />
            <Separator />
            <SpecItem icon="/icons/dash/icon-buildings.svg" label={agent.listings} />
          </div>

          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="hover:underline"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#305E82",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            View all Properties
          </Link>
        </div>

        <div
          className="flex items-center"
          style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}
        >
          <ContactButton variant="outline" icon="/icons/dash/call-dark.svg" label="Call" />
          <ContactButton variant="filled" icon="/icons/dash/messages-2.svg" label="Message" />
        </div>
      </div>
    </Link>
  );
}

function SpecItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      <Image src={icon} alt="" width={20} height={20} />
      <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>{label}</span>
    </div>
  );
}

function Separator() {
  return <div style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />;
}

function ContactButton({
  variant,
  icon,
  label,
}: {
  variant: "outline" | "filled";
  icon: string;
  label: string;
}) {
  const filled = variant === "filled";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`inline-flex items-center justify-center hover:opacity-90 ${filled ? "text-white" : ""}`}
      style={{
        flex: 1,
        height: "48px",
        padding: "8px 24px",
        gap: "8px",
        background: filled ? "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" : "#FFFFFF",
        border: filled ? "1px solid rgba(120,158,187,0.5)" : "1px solid #F6F6F6",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        color: filled ? "#FFFFFF" : "#121212",
        cursor: "pointer",
      }}
    >
      <Image src={icon} alt="" width={20} height={20} />
      {label}
    </button>
  );
}
