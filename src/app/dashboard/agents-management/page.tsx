"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useGetMeQuery } from "@/services/meApi";
import {
  useGetAgencyStaffQuery,
  useGetInvitationsQuery,
  useInviteStaffMutation,
  useCancelInvitationMutation,
} from "@/services/organizationApi";
import { unwrapApiError } from "@/services/api";
import { useToast } from "@/components/Toast";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { DEFAULT_COUNTRY, type Country } from "@/lib/countries";
import type { AgencyStaffItem, InvitationResponse } from "@/services/types";

export type Agent = {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: string;
  listings: string;
  verified: boolean;
};

/** Card model shared by accepted staff and pending invitations. */
type CardAgent = {
  id: string;
  name: string;
  avatarUrl?: string;
  location: string;
  rating?: string;
  listings?: string;
  verified: boolean;
  pending?: boolean;
  invitationId?: string;
};

// Placeholder until the backend adds agent ratings to the staff/agent DTO.
const DEFAULT_RATING = "5.0";

function staffToCard(s: AgencyStaffItem): CardAgent {
  const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email || "Agent";
  return {
    id: s.userId,
    name,
    avatarUrl: s.avatarUrl,
    location: [s.city, s.state].filter(Boolean).join(", ") || "—",
    rating: DEFAULT_RATING,
    verified: s.status?.toUpperCase() === "ACTIVE",
  };
}

function invitationToCard(i: InvitationResponse): CardAgent {
  return {
    id: i.id,
    name: i.fullName,
    location: i.city || "—",
    verified: false,
    pending: true,
    invitationId: i.id,
  };
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "AG";
}

export const AGENTS: Agent[] = [
  { id: "a1", name: "Amara Nwosu", avatar: "/images/agents/amara-nwosu.png", location: "Abuja", rating: "4.8", listings: "12 listings", verified: true },
  { id: "a2", name: "Emeka Okafor", avatar: "/images/agents/emeka-okafor.png", location: "Port Harcourt", rating: "4.9", listings: "7 listings", verified: true },
  { id: "a3", name: "Zainab Bello", avatar: "/images/agents/zainab-bello.png", location: "Kaduna", rating: "4.7", listings: "15 listings", verified: true },
  { id: "a4", name: "Chinedu Umeh", avatar: "/images/agents/chinedu-umeh.png", location: "Enugu", rating: "5.0", listings: "10 listings", verified: true },
  { id: "a5", name: "Fatima Yusuf", avatar: "/images/agents/fatima-yusuf.png", location: "Kano", rating: "4.6", listings: "8 listings", verified: true },
  { id: "a6", name: "Tunde Balogun", avatar: "/images/agents/tunde-balogun.png", location: "Ibadan", rating: "4.9", listings: "11 listings", verified: true },
  { id: "a7", name: "Ngozi Eze", avatar: "/images/agents/ngozi-eze.png", location: "Owerri", rating: "4.8", listings: "9 listings", verified: true },
  { id: "a8", name: "Ifeanyi Sandra", avatar: "/images/agents/ifeanyi-sandra.png", location: "Benin City", rating: "4.7", listings: "13 listings", verified: true },
];

export default function AgentsManagementPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"new" | "success" | null>(null);
  const [invitedName, setInvitedName] = useState("");
  const { toast } = useToast();

  const { data: me } = useGetMeQuery();
  const orgId = me?.organizationId;
  const { data: staffPage, isLoading: loadingStaff } = useGetAgencyStaffQuery(
    { orgId: orgId as string },
    { skip: !orgId }
  );
  const { data: invitations } = useGetInvitationsQuery(orgId as string, { skip: !orgId });
  const [cancelInvitation] = useCancelInvitationMutation();

  // Accepted staff first, then still-pending invitations.
  const staffCards = (staffPage?.content ?? []).map(staffToCard);
  const pendingCards = (invitations ?? [])
    .filter((i) => i.status?.toUpperCase() === "PENDING")
    .map(invitationToCard);
  const all: CardAgent[] = [...staffCards, ...pendingCards];

  const visible = all.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCancel(invitationId: string) {
    if (!orgId) return;
    try {
      await cancelInvitation({ orgId, invitationId }).unwrap();
      toast("Invitation cancelled", "success");
    } catch (e) {
      toast(unwrapApiError(e)?.message ?? "Couldn’t cancel the invitation.", "error");
    }
  }

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="flex items-center justify-between" style={{ gap: "16px" }}>
        <p style={{ fontSize: "14px", lineHeight: "24px", color: "#807E7E" }}>
          See all your agents and their assigned properties
        </p>

        <div className="flex items-center" style={{ gap: "16px" }}>
          <div
            className="flex items-center"
            style={{
              width: "320px",
              height: "40px",
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
              placeholder="Enter agent name, area or keyword..."
              className="flex-1 outline-none bg-transparent"
              style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#121212" }}
            />
          </div>

          <button
            type="button"
            onClick={() => setModal("new")}
            className="inline-flex items-center justify-center text-white hover:opacity-90"
            style={{
              height: "40px",
              padding: "8px 20px",
              gap: "8px",
              background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
              border: "1px solid rgba(120,158,187,0.5)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
            Add New Agent
          </button>
        </div>
      </div>

      {loadingStaff && all.length === 0 ? (
        <div
          className="bg-white flex items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}
        >
          Loading your agents…
        </div>
      ) : visible.length === 0 ? (
        <div
          className="bg-white flex items-center justify-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}
        >
          {all.length === 0
            ? "No agents yet — invite your first agent to get started."
            : "No agents match your search."}
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
          {visible.map((a) => (
            <AgentCard key={a.id} agent={a} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {modal === "new" && orgId && (
        <NewAgentModal
          orgId={orgId}
          onClose={() => setModal(null)}
          onSent={(name) => {
            setInvitedName(name);
            setModal("success");
          }}
        />
      )}

      {modal === "success" && (
        <SuccessModal name={invitedName} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function AgentCard({ agent, onCancel }: { agent: CardAgent; onCancel?: (invitationId: string) => void }) {
  return (
    <div
      className="bg-white"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div className="flex items-center" style={{ gap: "12px" }}>
        <div
          className="rounded-full relative overflow-hidden shrink-0 flex items-center justify-center"
          style={{ width: "48px", height: "48px", background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: "16px", fontWeight: 600 }}
        >
          {agent.avatarUrl ? (
            <Image src={agent.avatarUrl} alt={agent.name} fill sizes="48px" unoptimized style={{ objectFit: "cover" }} />
          ) : (
            initialsOf(agent.name)
          )}
        </div>
        <div className="flex flex-col" style={{ gap: "4px", flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
              {agent.name}
            </span>
            {agent.verified && (
              <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
            )}
            {agent.pending && (
              <span style={{ padding: "2px 8px", background: "#FFF7E9", color: "#EA651A", borderRadius: "16px", fontSize: "11px", fontWeight: 500 }}>
                Pending
              </span>
            )}
          </div>
          <div className="flex items-center" style={{ gap: "6px" }}>
            <Image src="/icons/dash/detail-location.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "#305E82" }}>
              {agent.location}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between"
        style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}
      >
        {agent.pending ? (
          <span style={{ fontSize: "12px", color: "#807E7E" }}>Invitation sent</span>
        ) : (
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div className="flex items-center" style={{ gap: "6px" }}>
              <Image src="/icons/dash/icon-star.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", color: "#807E7E" }}>{agent.rating ?? "—"}</span>
            </div>
            <div style={{ width: "1px", height: "12px", background: "#F6F6F6" }} />
            <div className="flex items-center" style={{ gap: "6px" }}>
              <Image src="/icons/dash/icon-buildings.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", color: "#807E7E" }}>{agent.listings ?? "—"}</span>
            </div>
          </div>
        )}

        {agent.pending ? (
          <button
            type="button"
            onClick={() => agent.invitationId && onCancel?.(agent.invitationId)}
            className="hover:underline"
            style={{ fontSize: "14px", fontWeight: 500, color: "#E30045", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Cancel
          </button>
        ) : (
          <Link
            href={`/dashboard/agents-management/${agent.id}`}
            className="hover:underline"
            style={{ fontSize: "14px", fontWeight: 500, color: "#305E82" }}
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}

const CITIES = ["Eti-Osa", "Ikeja", "Surulere", "Yaba", "Lekki", "Victoria Island", "Abuja Central", "Port Harcourt"];

function NewAgentModal({
  orgId,
  onClose,
  onSent,
}: {
  orgId: string;
  onClose: () => void;
  onSent: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [error, setError] = useState<string | null>(null);
  const [inviteStaff, { isLoading: sending }] = useInviteStaffMutation();
  const canSend = !!(name.trim() && email.trim()) && !sending;

  async function handleSend() {
    if (!canSend) return;
    setError(null);
    const digits = phone.replace(/\D/g, "");
    try {
      await inviteStaff({
        orgId,
        body: {
          fullName: name.trim(),
          email: email.trim(),
          phoneNumber: digits ? `${country.dial}${digits}` : undefined,
          city,
        },
      }).unwrap();
      onSent(name.trim());
    } catch (e) {
      setError(unwrapApiError(e)?.message ?? "Couldn’t send the invitation. Please try again.");
    }
  }

  return (
    <ModalShell onClose={onClose} width="640px">
      <div className="flex items-center justify-between" style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
          New Agent
        </h2>
        <CloseButton onClose={onClose} />
      </div>

      <div className="flex flex-col" style={{ gap: "24px" }}>
        <Field label="Agent Full Name">
          <Input value={name} onChange={setName} placeholder="Enter agent name" />
        </Field>

        <Field label="Email Address">
          <Input value={email} onChange={setEmail} placeholder="Enter agent email address" />
        </Field>

        <Field label="Phone Number">
          <PhoneNumberInput
            country={country}
            onCountryChange={setCountry}
            value={phone}
            onChange={setPhone}
          />
        </Field>

        <Field label="City/LGA">
          <div
            className="flex items-center"
            style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
          >
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full outline-none bg-transparent appearance-none"
              style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 400, color: "#121212" }}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} />
          </div>
        </Field>

        <div
          className="flex flex-col"
          style={{ background: "#FAFAFA", borderRadius: "12px", padding: "16px", gap: "8px" }}
        >
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Image src="/icons/dash/info-circle.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>
              Important Notice
            </span>
          </div>
          <p style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>
            An invitation email will be sent with a secure sign-up link. The agent will be
            automatically linked to Urban Nest Realty upon registration and you can assign properties
            to them afterwards.
          </p>
        </div>

        {error && (
          <p role="alert" style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#E30045" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="flex items-center justify-center text-white hover:opacity-90"
          style={{
            width: "100%",
            height: "56px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 500,
            cursor: canSend ? "pointer" : "not-allowed",
            opacity: canSend ? 1 : 0.5,
          }}
        >
          {sending ? "Sending…" : "Send Invitation"}
        </button>
      </div>
    </ModalShell>
  );
}

function SuccessModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} width="503px">
      <div className="flex justify-end" style={{ marginBottom: "8px" }}>
        <CloseButton onClose={onClose} />
      </div>
      <div className="flex flex-col items-center" style={{ gap: "24px", padding: "16px 24px 24px" }}>
        <Image src="/icons/noti-success.svg" alt="" width={120} height={120} />
        <div className="flex flex-col items-center text-center" style={{ gap: "12px" }}>
          <h2 style={{ fontSize: "20px", lineHeight: "30px", fontWeight: 600, color: "#121212" }}>
            Invitation Sent
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "24px", color: "#807E7E", maxWidth: "400px" }}>
            You&rsquo;ve successfully sent an invitation to {name || "Adaora Nwachukwu"} as agent.
            Agent will receive an email with sign up link.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center text-white hover:opacity-90"
          style={{
            width: "100%",
            height: "56px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          View All Agents
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  children,
  onClose,
  width,
}: {
  children: React.ReactNode;
  onClose: () => void;
  width: string;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(18,18,18,0.5)", zIndex: 50, padding: "24px" }}
      onClick={onClose}
    >
      <div
        className="bg-white relative overflow-y-auto"
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "90vh",
          borderRadius: "24px",
          padding: "32px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
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
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      <label
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 500,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      className="flex items-center"
      style={{ background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px" }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full outline-none bg-transparent"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
        }}
      />
    </div>
  );
}
