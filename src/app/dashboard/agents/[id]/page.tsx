"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import SeekerPropertyCard, { type SeekerListing } from "@/components/SeekerPropertyCard";

type Tab = "All Properties" | "Agents" | "Reviews";

type AgentProfile = {
  id: string;
  name: string;
  avatar: string;
  affiliatedWith?: string;
  affiliatedLogo?: string;
  location: string;
  listings: number;
  rating: string;
  joined: string;
  description: string;
  verified: boolean;
};

const AGENT_PROFILES: Record<string, AgentProfile> = {
  "agent-1": {
    id: "agent-1",
    name: "Ibrahim Fashola",
    avatar: "/images/agents/ibrahim-fashola.png",
    affiliatedWith: "Urban Nest Realty",
    affiliatedLogo: "/images/agencies/sydney-realtors.png",
    location: "Surulere, Lagos",
    listings: 37,
    rating: "4.8",
    joined: "Joined 1 year ago",
    description:
      "Senior real estate professional with 9+ years of experience in Lagos residential and commercial property. Specialising in Lekki, Victoria Island, Ikoyi, and Ikeja. ESVARBON licensed. Over 200 successful deals closed.",
    verified: true,
  },
  "agent-2": {
    id: "agent-2",
    name: "Pascaline Okonkwo",
    avatar: "/images/agents/pascaline-okonkwo.png",
    affiliatedWith: "Prime Realty & Co.",
    affiliatedLogo: "/images/agencies/sydney-realtors.png",
    location: "Abuja",
    listings: 24,
    rating: "4.9",
    joined: "Joined 2 years ago",
    description:
      "Specialising in luxury serviced apartments and short-term lets across Abuja. Known for transparent dealings and a sharp eye for high-value property.",
    verified: true,
  },
};

type AgencyProfile = {
  id: string;
  name: string;
  logo: string;
  location: string;
  listings: number;
  rating: string;
  joined: string;
  description: string;
  verified: boolean;
};

type MiniAgent = {
  id: string;
  name: string;
  avatar: string;
  company: string;
  location: string;
  rating: string;
  listings: string;
  verified: boolean;
};

type Review = {
  id: string;
  reviewer: string;
  avatar: string;
  rating: number;
  ago: string;
  body: string;
};

const PROFILES: Record<string, AgencyProfile> = {
  "agency-2": {
    id: "agency-2",
    name: "Urban Nest Realty",
    logo: "/images/agencies/sydney-realtors.png",
    location: "Lekki Phase 1, Lagos",
    listings: 28,
    rating: "4.3",
    joined: "Joined 3 months ago",
    description:
      "Urban Nest Realty, founded in 2018, is a trusted real estate company with properties across Lagos, Abuja, Ogun, and Ibadan. We specialize in both residential and commercial spaces, delivering expert service and successful deals to our clients.",
    verified: true,
  },
  "agency-1": {
    id: "agency-1",
    name: "Sydney Realtors",
    logo: "/images/agencies/sydney-realtors.png",
    location: "Port-Harcourt",
    listings: 27,
    rating: "4.7",
    joined: "Joined 1 year ago",
    description:
      "Sydney Realtors is a trusted name in the Port-Harcourt real estate market, helping clients buy, rent, and invest in premium properties since 2020.",
    verified: true,
  },
};

const AGENCY_LISTINGS: SeekerListing[] = [
  {
    id: "u1",
    title: "3-Bedroom Flat, Lekki Phase 1",
    location: "Lekki Phase 1, Lagos",
    price: "₦2,800,000",
    priceSuffix: "/yr",
    tag: "FOR RENT",
    sqft: "3500 sqft",
    beds: 3,
    baths: 4,
    image: "/images/prop1.jpg",
    amenities: ["Newly Built", "24/7 Security", "Parking", "Air Conditioning"],
    seller: { name: "Emeka Nwafor", initials: "EN", verified: true, avatarUrl: "/images/seekers/emeka-nwafor.png" },
  },
  {
    id: "u2",
    title: "2-Bedroom Apartment, Victoria Island",
    location: "Victoria Island, Lagos",
    price: "₦450,000",
    priceSuffix: "/night",
    tag: "SHORTLET",
    sqft: "1800 sqft",
    beds: 3,
    baths: 2,
    image: "/images/prop2.jpg",
    amenities: ["Newly Built", "24/7 Security", "Furnished", "Swimming Pool"],
    seller: { name: "Dare Okoye", initials: "DO", verified: true, avatarUrl: "/images/seekers/dare-okoye.png" },
  },
  {
    id: "u3",
    title: "Office Space, Ikeja GRA",
    location: "Ikeja GRA, Lagos",
    price: "₦3,400,000",
    priceSuffix: "/yr",
    tag: "FOR RENT",
    sqft: "1200 sqft",
    beds: 2,
    baths: 1,
    image: "/images/prop3.jpg",
    amenities: ["Newly Built", "24/7 Security", "Backup Generator", "High Speed Internet"],
    seller: { name: "Stanley Alabi", initials: "SA", verified: true },
  },
  {
    id: "u4",
    title: "Luxury Penthouse, Eko Atlantic",
    location: "Eko Atlantic City, Lagos",
    price: "₦1,200,000,000",
    tag: "FOR SALE",
    sqft: "4200 sqft",
    beds: 4,
    baths: 5,
    image: "/images/prop1.jpg",
    amenities: ["Newly Built", "24/7 Security", "Swimming Pool", "Gym"],
    seller: { name: "Gabriel Okechukwu", initials: "GO", verified: true },
  },
  {
    id: "u5",
    title: "2-Bedroom Flat, Surulere",
    location: "Surulere, Lagos",
    price: "₦170,000,000",
    tag: "FOR SALE",
    sqft: "4250 sqft",
    beds: 4,
    baths: 5,
    image: "/images/prop4.jpg",
    amenities: ["Newly Built", "24/7 Security", "Parking", "Air Conditioning"],
    seller: { name: "Kuku Adebanjo", initials: "KA", verified: true },
  },
  {
    id: "u6",
    title: "4-bedroom Duplex Apartment, Magodo Phase 1",
    location: "Magodo Phase 1, Lagos",
    price: "₦13,000,000",
    priceSuffix: "/year",
    tag: "FOR RENT",
    sqft: "5000 sqft",
    beds: 5,
    baths: 6,
    image: "/images/prop2.jpg",
    amenities: ["Newly Built", "24/7 Security", "Parking", "Swimming Pool"],
    seller: { name: "Bayo Lawal", initials: "BL", verified: true, avatarUrl: "/images/seekers/bayo-lawal.png" },
  },
];

const AGENT_PRIMARY: Omit<MiniAgent, "id"> = {
  name: "Chukwudi Okafor",
  avatar: "/images/agents/ibrahim-fashola.png",
  company: "Zen Realty Group",
  location: "Ikeja",
  rating: "5.0",
  listings: "22 listings",
  verified: true,
};

const AGENT_SECONDARY: Omit<MiniAgent, "id"> = {
  name: "Amina Bello",
  avatar: "/images/agents/pascaline-okonkwo.png",
  company: "City Gate Realty",
  location: "Kano",
  rating: "4.9",
  listings: "26 listings",
  verified: true,
};

const AGENCY_AGENTS: MiniAgent[] = [
  { id: "a1", ...AGENT_PRIMARY },
  { id: "a2", ...AGENT_SECONDARY },
  { id: "a3", ...AGENT_PRIMARY },
  { id: "a4", ...AGENT_SECONDARY },
  { id: "a5", ...AGENT_PRIMARY },
  { id: "a6", ...AGENT_SECONDARY },
];

const REVIEWS: Review[] = [
  {
    id: "r1",
    reviewer: "Alexa Henry",
    avatar: "/images/seekers/aishat-dada.png",
    rating: 5,
    ago: "2 days ago",
    body:
      "Ibrahim is a lifesaver! After months of searching, he helped me find an amazing apartment in Yaba with 24/7 security and stable power. Moving to Lagos was daunting, but Ibrahim made the process smooth and stress-free. Highly recommend his services!",
  },
  {
    id: "r2",
    reviewer: "Chinedu Okafor",
    avatar: "/images/seekers/dare-okoye.png",
    rating: 4,
    ago: "5 hours ago",
    body:
      "Working with Ibrahim was a breeze. He found me a cozy studio near Lekki with great amenities and a friendly neighborhood.",
  },
  {
    id: "r3",
    reviewer: "Sade Ajayi",
    avatar: "/images/seekers/olaide-batifeori.png",
    rating: 5,
    ago: "1 week ago",
    body:
      "Ibrahim's expertise helped me secure a beautiful family home in Ikeja. The entire process was transparent, and he was always available to answer my questions. I felt supported every step of the way.",
  },
];

export default function AgentOrAgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const isAgent = id.startsWith("agent-");
  const agencyProfile = PROFILES[id];
  const agentProfile = AGENT_PROFILES[id];
  const profile = isAgent
    ? agentProfile ?? AGENT_PROFILES["agent-1"]
    : agencyProfile ?? PROFILES["agency-2"];
  const agentTabs: Tab[] = ["All Properties", "Reviews"];
  const agencyTabs: Tab[] = ["All Properties", "Agents", "Reviews"];
  const tabs = isAgent ? agentTabs : agencyTabs;
  const [activeTab, setActiveTab] = useState<Tab>("All Properties");

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

      {isAgent ? (
        <AgentProfileHeader profile={profile as AgentProfile} />
      ) : (
        <ProfileHeader profile={profile as AgencyProfile} />
      )}

      <p
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
        }}
      >
        {profile.description}
      </p>

      <TabsBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "All Properties" && <AllPropertiesGrid />}
      {activeTab === "Agents" && <AgentsGrid />}
      {activeTab === "Reviews" && <ReviewsList />}
    </div>
  );
}

function ProfileHeader({ profile }: { profile: AgencyProfile }) {
  return (
    <div className="flex items-start justify-between" style={{ gap: "16px" }}>
      <div className="flex items-center" style={{ gap: "16px", flex: 1, minWidth: 0 }}>
        <div
          className="relative overflow-hidden shrink-0"
          style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#F0F4FA" }}
        >
          <Image src={profile.logo} alt={profile.name} fill style={{ objectFit: "cover" }} sizes="56px" />
        </div>

        <div className="flex flex-col" style={{ gap: "8px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <h1 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212" }}>
              {profile.name}
            </h1>
            {profile.verified && (
              <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
            )}
          </div>

          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                {profile.location}
              </span>
            </div>
            <span
              className="inline-flex items-center justify-center"
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
              {profile.listings} Listings
            </span>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                {profile.rating}
              </span>
            </div>
            <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
              {profile.joined}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center shrink-0" style={{ gap: "12px" }}>
        <button
          type="button"
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{
            height: "40px",
            padding: "8px 16px",
            gap: "8px",
            background: "transparent",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#D80027",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/flag-red.svg" alt="" width={20} height={20} />
          Report Agency
        </button>
        <button
          type="button"
          aria-label="Call"
          className="inline-flex items-center justify-center hover:opacity-90"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/call.svg" alt="" width={20} height={20} />
        </button>
        <button
          type="button"
          aria-label="Message"
          className="inline-flex items-center justify-center hover:opacity-90"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

function AgentProfileHeader({ profile }: { profile: AgentProfile }) {
  return (
    <div className="flex items-start justify-between" style={{ gap: "16px" }}>
      <div className="flex items-center" style={{ gap: "16px", flex: 1, minWidth: 0 }}>
        <div
          className="rounded-full relative overflow-hidden shrink-0"
          style={{ width: "56px", height: "56px", background: "rgba(48,94,130,0.05)" }}
        >
          <Image src={profile.avatar} alt={profile.name} fill sizes="56px" style={{ objectFit: "cover" }} />
        </div>

        <div className="flex flex-col" style={{ gap: "8px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212" }}>
              {profile.name}
            </h1>
            {profile.verified && (
              <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
            )}
            {profile.affiliatedWith && (
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span style={{ fontSize: "13px", lineHeight: "20px", color: "#807E7E" }}>
                  Affiliated with
                </span>
                <span
                  className="inline-flex items-center"
                  style={{
                    gap: "6px",
                    height: "24px",
                    padding: "0 8px",
                    background: "rgba(48,94,130,0.08)",
                    color: "#305E82",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {profile.affiliatedLogo && (
                    <div
                      className="relative overflow-hidden shrink-0"
                      style={{ width: "16px", height: "16px", borderRadius: "4px" }}
                    >
                      <Image
                        src={profile.affiliatedLogo}
                        alt={profile.affiliatedWith}
                        fill
                        sizes="16px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  {profile.affiliatedWith}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                {profile.location}
              </span>
            </div>
            <span
              className="inline-flex items-center justify-center"
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
              {profile.listings} Listings
            </span>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
                {profile.rating}
              </span>
            </div>
            <span style={{ fontSize: "13px", lineHeight: "24px", color: "#807E7E" }}>
              {profile.joined}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center shrink-0" style={{ gap: "12px" }}>
        <button
          type="button"
          className="inline-flex items-center justify-center hover:opacity-80"
          style={{
            height: "40px",
            padding: "8px 16px",
            gap: "8px",
            background: "transparent",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#D80027",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/flag-red.svg" alt="" width={20} height={20} />
          Report Agency
        </button>
        <button
          type="button"
          aria-label="Call"
          className="inline-flex items-center justify-center hover:opacity-90"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/call.svg" alt="" width={20} height={20} />
        </button>
        <button
          type="button"
          aria-label="Message"
          className="inline-flex items-center justify-center hover:opacity-90"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/messages-2.svg" alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

function TabsBar({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Tab[];
  activeTab: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="flex items-center" style={{ borderBottom: "1px solid #F6F6F6" }}>
      {tabs.map((t) => {
        const active = t === activeTab;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            style={{
              padding: "12px 16px",
              background: "transparent",
              color: active ? "#305E82" : "#807E7E",
              border: "none",
              borderBottom: active ? "1.5px solid #305E82" : "1.5px solid transparent",
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

function AllPropertiesGrid() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px 16px" }}>
      {AGENCY_LISTINGS.map((listing) => (
        <SeekerPropertyCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

function AgentsGrid() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "24px" }}>
      {AGENCY_AGENTS.map((a) => (
        <MiniAgentCard key={a.id} agent={a} />
      ))}
    </div>
  );
}

function MiniAgentCard({ agent }: { agent: MiniAgent }) {
  return (
    <div
      className="bg-white"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div className="flex items-center" style={{ gap: "16px" }}>
        <div
          className="rounded-full relative overflow-hidden shrink-0"
          style={{ width: "48px", height: "48px", background: "rgba(48,94,130,0.05)" }}
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
          <div className="flex items-center" style={{ gap: "8px", marginTop: "4px" }}>
            <Image src="/icons/dash/detail-location.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "#305E82" }}>
              {agent.location}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>
              {agent.rating}
            </span>
          </div>
          <div style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/icon-buildings.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>
              {agent.listings}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="hover:underline"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: "14px",
            fontWeight: 500,
            color: "#305E82",
            cursor: "pointer",
          }}
        >
          View all Properties
        </button>
      </div>

      <div className="flex items-center" style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
        <button
          type="button"
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
  );
}

function ReviewsList() {
  const [expanded, setExpanded] = useState(true);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {REVIEWS.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center self-start hover:opacity-80"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            gap: "4px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#305E82",
            cursor: "pointer",
          }}
        >
          {expanded ? "Show less" : "Show more"}
          <span style={{ fontSize: "16px", lineHeight: "16px" }}>
            {expanded ? "▾" : "▸"}
          </span>
        </button>
      </div>

      <div className="flex flex-col" style={{ gap: "16px" }}>
        <h3 style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
          Write a review
        </h3>
        <div className="flex items-center" style={{ gap: "8px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} stars`}
              className="hover:opacity-80"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <Image
                src={star <= rating ? "/icons/dash/icon-star-solid.svg" : "/icons/dash/icon-star-empty.svg"}
                alt=""
                width={24}
                height={24}
              />
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write something about the agent"
          rows={4}
          className="outline-none resize-none w-full"
          style={{
            background: "#F6F6F6",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 400,
            color: "#121212",
            letterSpacing: "-0.02em",
          }}
        />
        <button
          type="button"
          className="inline-flex items-center justify-center text-white hover:opacity-90 self-start"
          style={{
            width: "120px",
            height: "40px",
            padding: "8px 24px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="flex flex-col" style={{ gap: "12px" }}>
      <div className="flex items-center" style={{ gap: "12px" }}>
        <div
          className="rounded-full relative overflow-hidden shrink-0"
          style={{ width: "40px", height: "40px", background: "rgba(48,94,130,0.05)" }}
        >
          <Image src={review.avatar} alt={review.reviewer} fill sizes="40px" style={{ objectFit: "cover" }} />
        </div>
        <div className="flex flex-col" style={{ gap: "2px" }}>
          <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: "#121212" }}>
            {review.reviewer}
          </span>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <div className="flex items-center" style={{ gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Image
                  key={star}
                  src={star <= review.rating ? "/icons/dash/icon-star-solid.svg" : "/icons/dash/icon-star-empty.svg"}
                  alt=""
                  width={14}
                  height={14}
                />
              ))}
            </div>
            <span style={{ fontSize: "12px", lineHeight: "16px", color: "#807E7E" }}>
              {review.ago}
            </span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: "14px", lineHeight: "24px", color: "#121212" }}>
        {review.body}
      </p>
    </div>
  );
}
